import { jsxs as P, jsx as E } from "react/jsx-runtime";
import { useSettings as H, useSettingsActions as G } from "@mywallpaper/sdk-react";
import { useState as k, useRef as x, useEffect as L, useCallback as J, useMemo as T } from "react";
const Y = {
  100: "Thin (100)",
  200: "Extra-Light (200)",
  300: "Light (300)",
  400: "Regular (400)",
  500: "Medium (500)",
  600: "Semi-Bold (600)",
  700: "Bold (700)",
  800: "Extra-Bold (800)",
  900: "Black (900)"
}, q = {
  normal: "Normal",
  italic: "Italic",
  oblique: "Oblique"
}, Z = "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday", K = "January,February,March,April,May,June,July,August,September,October,November,December";
function i(t) {
  return t < 10 ? `0${t}` : t.toString();
}
function R(t, n) {
  return new Intl.DateTimeFormat(n, { weekday: "long" }).format(t);
}
function A(t, n, e = "long") {
  return new Intl.DateTimeFormat(n, { month: e }).format(t);
}
function Q(t, n) {
  if (n.languageMode === "custom") {
    const e = (n.customDays || Z).split(",").map((o) => o.trim());
    return e.length >= 7 ? e[t.getDay()] : R(t, "en");
  }
  return R(t, n.language || "en");
}
function V(t, n) {
  const e = t.getDate(), o = t.getMonth(), s = t.getFullYear(), a = n.languageMode === "custom" ? "en" : n.language || "en", d = n.dateFormat || "long";
  if (n.languageMode === "custom") {
    const l = (n.customMonths || K).split(",").map((M) => M.trim()), c = l.length >= 12 ? l[o] : A(t, "en"), g = c.substring(0, 3);
    switch (d) {
      case "long":
        return `${c} ${e}, ${s}`;
      case "short":
        return `${g} ${e}, ${s}`;
      case "numeric":
        return `${i(e)}/${i(o + 1)}/${s}`;
      case "numeric-us":
        return `${i(o + 1)}/${i(e)}/${s}`;
      case "iso":
        return `${s}-${i(o + 1)}-${i(e)}`;
      case "day-month":
        return `${e} ${c}`;
      case "month-day":
        return `${c} ${e}`;
      default:
        return `${c} ${e}, ${s}`;
    }
  }
  const u = A(t, a, "long"), m = A(t, a, "short");
  switch (d) {
    case "long":
      return `${u} ${e}, ${s}`;
    case "short":
      return `${m} ${e}, ${s}`;
    case "numeric":
      return `${i(e)}/${i(o + 1)}/${s}`;
    case "numeric-us":
      return `${i(o + 1)}/${i(e)}/${s}`;
    case "iso":
      return `${s}-${i(o + 1)}-${i(e)}`;
    case "day-month":
      return `${e} ${u}`;
    case "month-day":
      return `${u} ${e}`;
    default:
      return `${u} ${e}, ${s}`;
  }
}
const X = {
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
}, tt = /* @__PURE__ */ new Set([
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
function et(t) {
  const n = [], e = t.match(/@font-face\s*\{[^}]+\}/gi) || t.match(/@font-face\s*\{[\s\S]*?\}/gi) || [];
  for (const o of e) {
    const s = o.match(/font-family\s*:\s*(['"]?)([^;'"]+)\1/i);
    if (!s) continue;
    const a = s[2].trim().replace(/^['"]|['"]$/g, "").trim();
    if (!a || tt.has(a.toLowerCase())) continue;
    const d = o.match(/url\(\s*['"]?(https?:\/\/[^'")]+)['"]?\s*\)/i);
    if (!d) continue;
    let u = "400";
    const m = o.match(/font-weight\s*:\s*([^;}\s]+)/i);
    if (m) {
      const g = m[1].trim().toLowerCase();
      u = X[g] || g;
    }
    let l = "normal";
    const c = o.match(/font-style\s*:\s*([^;}\s]+)/i);
    c && (l = c[1].trim().toLowerCase()), n.push({ family: a, weight: u, style: l, url: d[1] });
  }
  return n;
}
function nt(t) {
  const n = { families: [], weights: {}, styles: {} }, e = /* @__PURE__ */ new Set();
  for (const { family: o, weight: s, style: a } of t)
    e.has(o) || (e.add(o), n.families.push(o), n.weights[o] = [], n.styles[o] = []), n.weights[o].includes(s) || n.weights[o].push(s), n.styles[o].includes(a) || n.styles[o].push(a);
  for (const o of Object.keys(n.weights))
    n.weights[o].sort((s, a) => parseInt(s) - parseInt(a));
  return n;
}
function ct() {
  const t = H(), { updateOptions: n } = G(), [e, o] = k(() => /* @__PURE__ */ new Date()), [s, a] = k(null), d = x(null), u = x(null), m = x([]), l = x(n);
  l.current = n;
  const c = x(0);
  L(() => {
    const r = setInterval(() => {
      const y = /* @__PURE__ */ new Date();
      y.getDate() !== e.getDate() && o(y);
    }, 6e4);
    return () => clearInterval(r);
  }, [e]), L(() => () => {
    for (const r of m.current) document.fonts.delete(r);
  }, []);
  const g = J(
    async (r, y) => {
      if (!r) return;
      const $ = ++c.current;
      try {
        if (c.current !== $) return;
        const v = await fetch(r);
        if (!v.ok || c.current !== $) return;
        d.current = r;
        const z = await v.text(), D = et(z);
        if (D.length === 0) return;
        for (const p of m.current) document.fonts.delete(p);
        m.current = [];
        for (const p of D) {
          if (c.current !== $) return;
          try {
            const h = await fetch(p.url);
            if (!h.ok) continue;
            const b = await h.arrayBuffer(), f = new FontFace(p.family, b, {
              weight: p.weight,
              style: p.style
            });
            await f.load(), document.fonts.add(f), m.current.push(f);
          } catch {
          }
        }
        if (c.current !== $) return;
        const F = nt(D);
        u.current = F;
        const S = F.families[0];
        if (S && (a(S), !y)) {
          const p = F.families.map((f) => ({ label: f, value: f }));
          l.current("customFontFamily", p, S);
          const h = F.weights[S] || [];
          if (h.length > 0) {
            const f = h.map((I) => ({
              label: Y[I] || `Weight ${I}`,
              value: I
            })), w = h.includes("400") ? "400" : h.includes("500") ? "500" : h.includes("600") ? "600" : h[0];
            l.current("customFontWeight", f, w);
          }
          const b = F.styles[S] || [];
          if (b.length <= 1)
            l.current("customFontStyle", [{ label: "Normal", value: "normal" }], "normal");
          else {
            const f = b.map((w) => ({
              label: q[w] || w.charAt(0).toUpperCase() + w.slice(1),
              value: w
            }));
            l.current("customFontStyle", f, "normal");
          }
        }
      } catch {
      }
    },
    []
  );
  L(() => {
    if (d.current = null, t.fontMode === "custom" && t.customFontUrl) {
      let r = t.customFontUrl;
      if (!r.startsWith("http://") && !r.startsWith("https://")) return;
      try {
        if (new URL(r).hostname === "fonts.google.com") {
          const $ = r.match(/family=([^&]+)/);
          if ($)
            r = `https://fonts.googleapis.com/css2?family=${$[1]}&display=swap`;
          else
            return;
        }
      } catch {
        return;
      }
      g(r);
    } else if (t.fontMode === "preset") {
      const y = `https://fonts.googleapis.com/css2?family=${(t.fontPreset || "Inter").replace(/ /g, "+")}:wght@300;400;500;600;700;800&display=swap`;
      g(y, !0);
    } else
      a(null), u.current = null;
  }, [t.fontMode, t.fontPreset, t.customFontUrl, g]);
  const M = T(
    () => Q(e, t),
    [e, t.languageMode, t.language, t.customDays]
  ), B = T(
    () => V(e, t),
    [e, t.languageMode, t.language, t.customMonths, t.dateFormat]
  ), O = T(() => t.fontMode === "custom" ? `"${s || t.customFontFamily || "sans-serif"}", sans-serif` : `"${t.fontPreset || "Inter"}", sans-serif`, [t.fontMode, t.fontPreset, t.customFontFamily, s]), N = t.fontMode === "custom" ? t.customFontWeight || t.fontWeight || "600" : t.fontWeight || "600", C = t.fontMode === "custom" && t.customFontStyle || "normal", U = {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: t.textAlign === "center" ? "center" : t.textAlign === "right" ? "flex-end" : "flex-start",
    padding: 20,
    boxSizing: "border-box",
    overflow: "hidden",
    fontFamily: O,
    textAlign: t.textAlign || "left"
  }, W = {
    fontFamily: O,
    fontWeight: N,
    fontStyle: C,
    color: t.textColor || "#ffffff",
    opacity: (t.textOpacity ?? 100) / 100,
    letterSpacing: `${t.letterSpacing ?? 0}px`,
    textTransform: t.textTransform || "none"
  }, j = {
    ...W,
    fontSize: `${t.dayFontSize || 24}px`,
    marginBottom: 5
  }, _ = {
    ...W,
    fontSize: `${t.dateFontSize || 48}px`,
    lineHeight: 1.1
  };
  return /* @__PURE__ */ P("div", { style: U, children: [
    t.showDayOfWeek && /* @__PURE__ */ E("div", { style: j, children: M }),
    t.showDate && /* @__PURE__ */ E("div", { style: _, children: B })
  ] });
}
export {
  ct as default
};
