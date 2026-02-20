import { jsxs as V, jsx as B } from "react/jsx-runtime";
import { useSettings as X, useNetwork as tt, useSettingsActions as et } from "@mywallpaper/sdk-react";
import { useState as j, useRef as S, useEffect as k, useCallback as nt, useMemo as v } from "react";
const ot = {
  100: "Thin (100)",
  200: "Extra-Light (200)",
  300: "Light (300)",
  400: "Regular (400)",
  500: "Medium (500)",
  600: "Semi-Bold (600)",
  700: "Bold (700)",
  800: "Extra-Bold (800)",
  900: "Black (900)"
}, st = {
  normal: "Normal",
  italic: "Italic",
  oblique: "Oblique"
}, rt = "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday", at = "January,February,March,April,May,June,July,August,September,October,November,December";
function i(t) {
  return t < 10 ? `0${t}` : t.toString();
}
function _(t, e) {
  return new Intl.DateTimeFormat(e, { weekday: "long" }).format(t);
}
function E(t, e, n = "long") {
  return new Intl.DateTimeFormat(e, { month: n }).format(t);
}
function ct(t, e) {
  if (e.languageMode === "custom") {
    const n = (e.customDays || rt).split(",").map((o) => o.trim());
    return n.length >= 7 ? n[t.getDay()] : _(t, "en");
  }
  return _(t, e.language || "en");
}
function it(t, e) {
  const n = t.getDate(), o = t.getMonth(), s = t.getFullYear(), a = e.languageMode === "custom" ? "en" : e.language || "en", d = e.dateFormat || "long";
  if (e.languageMode === "custom") {
    const g = (e.customMonths || at).split(",").map((b) => b.trim()), c = g.length >= 12 ? g[o] : E(t, "en"), f = c.substring(0, 3);
    switch (d) {
      case "long":
        return `${c} ${n}, ${s}`;
      case "short":
        return `${f} ${n}, ${s}`;
      case "numeric":
        return `${i(n)}/${i(o + 1)}/${s}`;
      case "numeric-us":
        return `${i(o + 1)}/${i(n)}/${s}`;
      case "iso":
        return `${s}-${i(o + 1)}-${i(n)}`;
      case "day-month":
        return `${n} ${c}`;
      case "month-day":
        return `${c} ${n}`;
      default:
        return `${c} ${n}, ${s}`;
    }
  }
  const u = E(t, a, "long"), $ = E(t, a, "short");
  switch (d) {
    case "long":
      return `${u} ${n}, ${s}`;
    case "short":
      return `${$} ${n}, ${s}`;
    case "numeric":
      return `${i(n)}/${i(o + 1)}/${s}`;
    case "numeric-us":
      return `${i(o + 1)}/${i(n)}/${s}`;
    case "iso":
      return `${s}-${i(o + 1)}-${i(n)}`;
    case "day-month":
      return `${n} ${u}`;
    case "month-day":
      return `${u} ${n}`;
    default:
      return `${u} ${n}, ${s}`;
  }
}
const lt = {
  thin: "100",
  hairline: "100",
  extralight: "200",
  "extra-light": "200",
  ultralight: "200",
  light: "300",
  normal: "400",
  regular: "400",
  medium: "500",
  semibold: "600",
  "semi-bold": "600",
  demibold: "600",
  bold: "700",
  extrabold: "800",
  "extra-bold": "800",
  ultrabold: "800",
  black: "900",
  heavy: "900"
}, ut = /* @__PURE__ */ new Set([
  "inherit",
  "initial",
  "unset",
  "serif",
  "sans-serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui"
]);
function ft(t) {
  const e = [], n = t.match(/@font-face\s*\{[^}]+\}/gi) || t.match(/@font-face\s*\{[\s\S]*?\}/gi) || [];
  for (const o of n) {
    const s = o.match(/font-family\s*:\s*(['"]?)([^;'"]+)\1/i);
    if (!s) continue;
    const a = s[2].trim().replace(/^['"]|['"]$/g, "").trim();
    if (!a || ut.has(a.toLowerCase())) continue;
    const d = o.match(/url\(\s*['"]?(https?:\/\/[^'")]+)['"]?\s*\)/i);
    if (!d) continue;
    let u = "400";
    const $ = o.match(/font-weight\s*:\s*([^;}\s]+)/i);
    if ($) {
      const f = $[1].trim().toLowerCase();
      u = lt[f] || f;
    }
    let g = "normal";
    const c = o.match(/font-style\s*:\s*([^;}\s]+)/i);
    c && (g = c[1].trim().toLowerCase()), e.push({ family: a, weight: u, style: g, url: d[1] });
  }
  return e;
}
function mt(t) {
  const e = { families: [], weights: {}, styles: {} }, n = /* @__PURE__ */ new Set();
  for (const { family: o, weight: s, style: a } of t)
    n.has(o) || (n.add(o), e.families.push(o), e.weights[o] = [], e.styles[o] = []), e.weights[o].includes(s) || e.weights[o].push(s), e.styles[o].includes(a) || e.styles[o].push(a);
  for (const o of Object.keys(e.weights))
    e.weights[o].sort((s, a) => parseInt(s) - parseInt(a));
  return e;
}
function pt() {
  const t = X(), { fetch: e, requestAccess: n } = tt(), { updateOptions: o } = et(), [s, a] = j(() => /* @__PURE__ */ new Date()), [d, u] = j(null), $ = S(null), g = S(null), c = S([]), f = S(e), b = S(n), M = S(o);
  f.current = e, b.current = n, M.current = o;
  const D = S(0), z = typeof e == "function" && typeof n == "function";
  k(() => {
    const r = setInterval(() => {
      const y = /* @__PURE__ */ new Date();
      y.getDate() !== s.getDate() && a(y);
    }, 6e4);
    return () => clearInterval(r);
  }, [s]), k(() => () => {
    for (const r of c.current) document.fonts.delete(r);
  }, []);
  const I = nt(
    async (r, y) => {
      if (!r || typeof b.current != "function" || typeof f.current != "function")
        return;
      const w = ++D.current;
      try {
        const T = new URL(r).hostname, { granted: K } = await b.current(T, `Load font from ${T}`);
        if (!K || D.current !== w) return;
        const O = await f.current(r);
        if (!O.ok || !O.data || D.current !== w) return;
        $.current = r;
        const Q = O.data, R = ft(Q);
        if (R.length === 0) return;
        for (const m of c.current) document.fonts.delete(m);
        c.current = [];
        const U = /* @__PURE__ */ new Set([T]);
        for (const m of R) {
          if (D.current !== w) return;
          try {
            const l = new URL(m.url).hostname;
            if (!U.has(l)) {
              const { granted: W } = await b.current(l, `Load font file from ${l}`);
              if (!W) continue;
              U.add(l);
            }
            const x = await f.current(m.url);
            if (!x.ok || !x.data) continue;
            const h = x.data;
            if (!h.base64) continue;
            const p = Uint8Array.from(atob(h.base64), (W) => W.charCodeAt(0)), F = new FontFace(m.family, p.buffer, {
              weight: m.weight,
              style: m.style
            });
            await F.load(), document.fonts.add(F), c.current.push(F);
          } catch {
          }
        }
        if (D.current !== w) return;
        const L = mt(R);
        g.current = L;
        const A = L.families[0];
        if (A && (u(A), !y)) {
          const m = L.families.map((h) => ({ label: h, value: h }));
          M.current("customFontFamily", m, A);
          const l = L.weights[A] || [];
          if (l.length > 0) {
            const h = l.map((F) => ({
              label: ot[F] || `Weight ${F}`,
              value: F
            })), p = l.includes("400") ? "400" : l.includes("500") ? "500" : l.includes("600") ? "600" : l[0];
            M.current("customFontWeight", h, p);
          }
          const x = L.styles[A] || [];
          if (x.length <= 1)
            M.current("customFontStyle", [{ label: "Normal", value: "normal" }], "normal");
          else {
            const h = x.map((p) => ({
              label: st[p] || p.charAt(0).toUpperCase() + p.slice(1),
              value: p
            }));
            M.current("customFontStyle", h, "normal");
          }
        }
      } catch {
      }
    },
    []
  );
  k(() => {
    if ($.current = null, t.fontMode === "custom" && t.customFontUrl) {
      let r = t.customFontUrl;
      if (!r.startsWith("http://") && !r.startsWith("https://")) return;
      try {
        if (new URL(r).hostname === "fonts.google.com") {
          const w = r.match(/family=([^&]+)/);
          if (w)
            r = `https://fonts.googleapis.com/css2?family=${w[1]}&display=swap`;
          else
            return;
        }
      } catch {
        return;
      }
      I(r);
    } else if (t.fontMode === "preset") {
      const y = `https://fonts.googleapis.com/css2?family=${(t.fontPreset || "Inter").replace(/ /g, "+")}:wght@300;400;500;600;700;800&display=swap`;
      I(y, !0);
    } else
      u(null), g.current = null;
  }, [t.fontMode, t.fontPreset, t.customFontUrl, z, I]);
  const P = v(
    () => ct(s, t),
    [s, t.languageMode, t.language, t.customDays]
  ), q = v(
    () => it(s, t),
    [s, t.languageMode, t.language, t.customMonths, t.dateFormat]
  ), N = v(() => t.fontMode === "custom" ? `"${d || t.customFontFamily || "sans-serif"}", sans-serif` : `"${t.fontPreset || "Inter"}", sans-serif`, [t.fontMode, t.fontPreset, t.customFontFamily, d]), H = t.fontMode === "custom" ? t.customFontWeight || t.fontWeight || "600" : t.fontWeight || "600", G = t.fontMode === "custom" && t.customFontStyle || "normal", J = {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: t.textAlign === "center" ? "center" : t.textAlign === "right" ? "flex-end" : "flex-start",
    padding: 20,
    boxSizing: "border-box",
    overflow: "hidden",
    fontFamily: N,
    textAlign: t.textAlign || "left"
  }, C = {
    fontFamily: N,
    fontWeight: H,
    fontStyle: G,
    color: t.textColor || "#ffffff",
    opacity: (t.textOpacity ?? 100) / 100,
    letterSpacing: `${t.letterSpacing ?? 0}px`,
    textTransform: t.textTransform || "none"
  }, Y = {
    ...C,
    fontSize: `${t.dayFontSize || 24}px`,
    marginBottom: 5
  }, Z = {
    ...C,
    fontSize: `${t.dateFontSize || 48}px`,
    lineHeight: 1.1
  };
  return /* @__PURE__ */ V("div", { style: J, children: [
    t.showDayOfWeek && /* @__PURE__ */ B("div", { style: Y, children: P }),
    t.showDate && /* @__PURE__ */ B("div", { style: Z, children: q })
  ] });
}
export {
  pt as default
};
