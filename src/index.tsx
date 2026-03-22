import { useSettings, useSettingsActions } from '@mywallpaper/sdk-react'
import { useState, useEffect, useRef, useMemo, useCallback, type CSSProperties } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Settings {
  // Display
  showDayOfWeek: boolean
  showDate: boolean
  dateFormat: 'long' | 'short' | 'numeric' | 'numeric-us' | 'iso' | 'day-month' | 'month-day'

  // Language
  languageMode: 'preset' | 'custom'
  language: string
  customDays: string
  customMonths: string

  // Font
  fontMode: 'preset' | 'custom'
  fontPreset: string
  customFontUrl: string
  customFontFamily: string
  customFontWeight: string
  customFontStyle: string

  // Style
  dayFontSize: number
  dateFontSize: number
  fontWeight: string
  textColor: string
  textAlign: 'left' | 'center' | 'right'
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  textOpacity: number
  letterSpacing: number

}

interface FontData {
  families: string[]
  weights: Record<string, string[]>
  styles: Record<string, string[]>
}

// ---------------------------------------------------------------------------
// Weight / style labels
// ---------------------------------------------------------------------------

const WEIGHT_LABELS: Record<string, string> = {
  '100': 'Thin (100)',
  '200': 'Extra-Light (200)',
  '300': 'Light (300)',
  '400': 'Regular (400)',
  '500': 'Medium (500)',
  '600': 'Semi-Bold (600)',
  '700': 'Bold (700)',
  '800': 'Extra-Bold (800)',
  '900': 'Black (900)',
}

const STYLE_LABELS: Record<string, string> = {
  normal: 'Normal',
  italic: 'Italic',
  oblique: 'Oblique',
}

// Default custom day/month names (English fallback)
const DEFAULT_DAYS = 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday'
const DEFAULT_MONTHS = 'January,February,March,April,May,June,July,August,September,October,November,December'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function padZero(n: number): string {
  return n < 10 ? `0${n}` : n.toString()
}

function intlDay(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date)
}

function intlMonth(date: Date, locale: string, style: 'long' | 'short' = 'long'): string {
  return new Intl.DateTimeFormat(locale, { month: style }).format(date)
}

function getDayOfWeek(date: Date, settings: Settings): string {
  if (settings.languageMode === 'custom') {
    const parts = (settings.customDays || DEFAULT_DAYS).split(',').map((s) => s.trim())
    return parts.length >= 7 ? parts[date.getDay()] : intlDay(date, 'en')
  }
  return intlDay(date, settings.language || 'en')
}

function formatDate(date: Date, settings: Settings): string {
  const day = date.getDate()
  const month = date.getMonth()
  const year = date.getFullYear()
  const locale = settings.languageMode === 'custom' ? 'en' : (settings.language || 'en')
  const format = settings.dateFormat || 'long'

  if (settings.languageMode === 'custom') {
    const parts = (settings.customMonths || DEFAULT_MONTHS).split(',').map((s) => s.trim())
    const monthName = parts.length >= 12 ? parts[month] : intlMonth(date, 'en')
    const monthShort = monthName.substring(0, 3)

    switch (format) {
      case 'long':    return `${monthName} ${day}, ${year}`
      case 'short':   return `${monthShort} ${day}, ${year}`
      case 'numeric': return `${padZero(day)}/${padZero(month + 1)}/${year}`
      case 'numeric-us': return `${padZero(month + 1)}/${padZero(day)}/${year}`
      case 'iso':     return `${year}-${padZero(month + 1)}-${padZero(day)}`
      case 'day-month': return `${day} ${monthName}`
      case 'month-day': return `${monthName} ${day}`
      default:        return `${monthName} ${day}, ${year}`
    }
  }

  // Preset language: use Intl for month names
  const monthLong = intlMonth(date, locale, 'long')
  const monthShort = intlMonth(date, locale, 'short')

  switch (format) {
    case 'long':    return `${monthLong} ${day}, ${year}`
    case 'short':   return `${monthShort} ${day}, ${year}`
    case 'numeric': return `${padZero(day)}/${padZero(month + 1)}/${year}`
    case 'numeric-us': return `${padZero(month + 1)}/${padZero(day)}/${year}`
    case 'iso':     return `${year}-${padZero(month + 1)}-${padZero(day)}`
    case 'day-month': return `${day} ${monthLong}`
    case 'month-day': return `${monthLong} ${day}`
    default:        return `${monthLong} ${day}, ${year}`
  }
}

// ---------------------------------------------------------------------------
// Font CSS parsing
// ---------------------------------------------------------------------------

const WEIGHT_MAP: Record<string, string> = {
  thin: '100', hairline: '100',
  extralight: '200', 'extra-light': '200', ultralight: '200',
  light: '300',
  normal: '400', regular: '400',
  medium: '500',
  semibold: '600', 'semi-bold': '600', demibold: '600',
  bold: '700',
  extrabold: '800', 'extra-bold': '800', ultrabold: '800',
  black: '900', heavy: '900',
}

const GENERIC_FAMILIES = new Set([
  'inherit', 'initial', 'unset', 'serif', 'sans-serif',
  'monospace', 'cursive', 'fantasy', 'system-ui',
])

interface FontFaceEntry {
  family: string
  weight: string
  style: string
  url: string
}

/** Parse @font-face blocks and extract family, weight, style, and font file URL. */
function parseFontFaces(cssText: string): FontFaceEntry[] {
  const entries: FontFaceEntry[] = []
  const blocks = cssText.match(/@font-face\s*\{[^}]+\}/gi)
    || cssText.match(/@font-face\s*\{[\s\S]*?\}/gi)
    || []

  for (const block of blocks) {
    const familyMatch = block.match(/font-family\s*:\s*(['"]?)([^;'"]+)\1/i)
    if (!familyMatch) continue
    const family = familyMatch[2].trim().replace(/^['"]|['"]$/g, '').trim()
    if (!family || GENERIC_FAMILIES.has(family.toLowerCase())) continue

    const urlMatch = block.match(/url\(\s*['"]?(https?:\/\/[^'")]+)['"]?\s*\)/i)
    if (!urlMatch) continue

    let weight = '400'
    const weightMatch = block.match(/font-weight\s*:\s*([^;}\s]+)/i)
    if (weightMatch) {
      const w = weightMatch[1].trim().toLowerCase()
      weight = WEIGHT_MAP[w] || w
    }

    let style = 'normal'
    const styleMatch = block.match(/font-style\s*:\s*([^;}\s]+)/i)
    if (styleMatch) {
      style = styleMatch[1].trim().toLowerCase()
    }

    entries.push({ family, weight, style, url: urlMatch[1] })
  }

  return entries
}

/** Derive aggregated font metadata from parsed entries (for dropdown updates). */
function deriveFontData(entries: FontFaceEntry[]): FontData {
  const result: FontData = { families: [], weights: {}, styles: {} }
  const seen = new Set<string>()

  for (const { family, weight, style } of entries) {
    if (!seen.has(family)) {
      seen.add(family)
      result.families.push(family)
      result.weights[family] = []
      result.styles[family] = []
    }
    if (!result.weights[family].includes(weight)) result.weights[family].push(weight)
    if (!result.styles[family].includes(style)) result.styles[family].push(style)
  }

  for (const family of Object.keys(result.weights)) {
    result.weights[family].sort((a, b) => parseInt(a) - parseInt(b))
  }

  return result
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DateDisplay() {
  const settings = useSettings<Settings>()
  const { updateOptions } = useSettingsActions()

  const [now, setNow] = useState(() => new Date())

  // State to trigger re-render when custom font family is extracted
  const [loadedFontFamily, setLoadedFontFamily] = useState<string | null>(null)

  const loadedFontUrlRef = useRef<string | null>(null)
  const fontDataRef = useRef<FontData | null>(null)
  const addedFontsRef = useRef<FontFace[]>([])

  const updateOptionsRef = useRef(updateOptions)
  updateOptionsRef.current = updateOptions

  const loadIdRef = useRef(0)

  // -----------------------------------------------------------------------
  // Timer: check every minute, only re-render when the day changes
  // -----------------------------------------------------------------------
  useEffect(() => {
    const timer = setInterval(() => {
      const next = new Date()
      if (next.getDate() !== now.getDate()) setNow(next)
    }, 60_000)
    return () => clearInterval(timer)
  }, [now])

  // Remove previously loaded FontFace objects on unmount
  useEffect(() => {
    return () => {
      for (const f of addedFontsRef.current) document.fonts.delete(f)
    }
  }, [])

  // -----------------------------------------------------------------------
  // Font loading pipeline: proxy fetch CSS → parse @font-face entries →
  // proxy fetch binaries → register via FontFace API (no blob URLs needed).
  // -----------------------------------------------------------------------
  const loadFont = useCallback(
    async (cssUrl: string, skipDropdownUpdate?: boolean) => {
      if (!cssUrl) return

      const myLoadId = ++loadIdRef.current

      try {
        // 1. Fetch the CSS (transparent proxy handles domain allowlist)
        if (loadIdRef.current !== myLoadId) return
        const response = await fetch(cssUrl)
        if (!response.ok) return
        if (loadIdRef.current !== myLoadId) return

        loadedFontUrlRef.current = cssUrl
        const cssText = await response.text()

        // 2. Parse @font-face entries (family, weight, style, URL)
        const entries = parseFontFaces(cssText)
        if (entries.length === 0) return

        // 3. Remove previously registered fonts
        for (const f of addedFontsRef.current) document.fonts.delete(f)
        addedFontsRef.current = []

        // 4. Fetch each font binary and register via FontFace API
        for (const entry of entries) {
          if (loadIdRef.current !== myLoadId) return
          try {
            const fontResp = await fetch(entry.url)
            if (!fontResp.ok) continue

            const fontBuffer = await fontResp.arrayBuffer()
            const face = new FontFace(entry.family, fontBuffer, {
              weight: entry.weight,
              style: entry.style,
            })
            await face.load()
            document.fonts.add(face)
            addedFontsRef.current.push(face)
          } catch {
            // Skip individual font files that fail
          }
        }

        if (loadIdRef.current !== myLoadId) return

        // 5. Update metadata and dropdowns
        const fontData = deriveFontData(entries)
        fontDataRef.current = fontData

        const primaryFamily = fontData.families[0]
        if (primaryFamily) {
          setLoadedFontFamily(primaryFamily)

          if (!skipDropdownUpdate) {
            const familyOptions = fontData.families.map((f) => ({ label: f, value: f }))
            updateOptionsRef.current('customFontFamily', familyOptions, primaryFamily)

            const weights = fontData.weights[primaryFamily] || []
            if (weights.length > 0) {
              const weightOptions = weights.map((w) => ({
                label: WEIGHT_LABELS[w] || `Weight ${w}`,
                value: w,
              }))
              const defaultWeight = weights.includes('400') ? '400'
                : weights.includes('500') ? '500'
                : weights.includes('600') ? '600'
                : weights[0]
              updateOptionsRef.current('customFontWeight', weightOptions, defaultWeight)
            }

            const styles = fontData.styles[primaryFamily] || []
            if (styles.length <= 1) {
              updateOptionsRef.current('customFontStyle', [{ label: 'Normal', value: 'normal' }], 'normal')
            } else {
              const styleOptions = styles.map((s) => ({
                label: STYLE_LABELS[s] || s.charAt(0).toUpperCase() + s.slice(1),
                value: s,
              }))
              updateOptionsRef.current('customFontStyle', styleOptions, 'normal')
            }
          }
        }
      } catch {
        // Font loading failed silently
      }
    },
    [],
  )

  // -----------------------------------------------------------------------
  // Trigger font loading when settings change
  // -----------------------------------------------------------------------
  useEffect(() => {
    // Always reset cached URL so font changes trigger a fresh load.
    // The previous <style> may have been replaced by a different font.
    loadedFontUrlRef.current = null

    if (settings.fontMode === 'custom' && settings.customFontUrl) {
      let url = settings.customFontUrl
      if (!url.startsWith('http://') && !url.startsWith('https://')) return

      // Auto-correct fonts.google.com to fonts.googleapis.com
      try {
        const urlObj = new URL(url)
        if (urlObj.hostname === 'fonts.google.com') {
          const fontMatch = url.match(/family=([^&]+)/)
          if (fontMatch) {
            url = `https://fonts.googleapis.com/css2?family=${fontMatch[1]}&display=swap`
          } else {
            return
          }
        }
      } catch {
        return
      }

      loadFont(url)
    } else if (settings.fontMode === 'preset') {
      const fontName = settings.fontPreset || 'Inter'
      const fontUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@300;400;500;600;700;800&display=swap`
      loadFont(fontUrl, true)
    } else {
      // Reset font state
      setLoadedFontFamily(null)
      fontDataRef.current = null
    }
  }, [settings.fontMode, settings.fontPreset, settings.customFontUrl, loadFont])

  // -----------------------------------------------------------------------
  // Derived values
  // -----------------------------------------------------------------------
  const dayOfWeekText = useMemo(
    () => getDayOfWeek(now, settings),
    [now, settings.languageMode, settings.language, settings.customDays],
  )
  const dateText = useMemo(
    () => formatDate(now, settings),
    [now, settings.languageMode, settings.language, settings.customMonths, settings.dateFormat],
  )

  // Font family string
  const fontFamily = useMemo(() => {
    if (settings.fontMode === 'custom') {
      const actual = loadedFontFamily || settings.customFontFamily || 'sans-serif'
      return `"${actual}", sans-serif`
    }
    const preset = settings.fontPreset || 'Inter'
    return `"${preset}", sans-serif`
  }, [settings.fontMode, settings.fontPreset, settings.customFontFamily, loadedFontFamily])

  const fontWeight = settings.fontMode === 'custom'
    ? settings.customFontWeight || settings.fontWeight || '600'
    : settings.fontWeight || '600'

  const fontStyle = settings.fontMode === 'custom'
    ? settings.customFontStyle || 'normal'
    : 'normal'

  // Alignment mapping
  const alignItems = settings.textAlign === 'center'
    ? 'center'
    : settings.textAlign === 'right'
      ? 'flex-end'
      : 'flex-start'

  // -----------------------------------------------------------------------
  // Styles
  // -----------------------------------------------------------------------
  const containerStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems,
    padding: 20,
    boxSizing: 'border-box',
    overflow: 'hidden',
    fontFamily,
    textAlign: (settings.textAlign || 'left') as CSSProperties['textAlign'],
  }

  const sharedTextStyle: CSSProperties = {
    fontFamily,
    fontWeight,
    fontStyle,
    color: settings.textColor || '#ffffff',
    opacity: (settings.textOpacity ?? 100) / 100,
    letterSpacing: `${settings.letterSpacing ?? 0}px`,
    textTransform: (settings.textTransform || 'none') as CSSProperties['textTransform'],
  }

  const dayStyle: CSSProperties = {
    ...sharedTextStyle,
    fontSize: `${settings.dayFontSize || 24}px`,
    marginBottom: 5,
  }

  const dateStyle: CSSProperties = {
    ...sharedTextStyle,
    fontSize: `${settings.dateFontSize || 48}px`,
    lineHeight: 1.1,
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div style={containerStyle}>
      {settings.showDayOfWeek && (
        <div style={dayStyle}>{dayOfWeekText}</div>
      )}
      {settings.showDate && (
        <div style={dateStyle}>{dateText}</div>
      )}
    </div>
  )
}
