# Date Display Widget for MyWallpaper

A customizable date display widget for [MyWallpaper](https://mywallpaper.app).

## Features

- **Multi-language support** - 11 preset languages via `Intl.DateTimeFormat` or custom day/month names
- **Customizable fonts** - Preset Google Fonts or any CSS font URL (loaded through proxy + blob URLs to bypass CSP)
- **Flexible date formats** - Long, short, numeric, ISO, and more
- **Full style control** - Font size, weight, color, opacity, letter spacing, text shadow

## Development

Built with `@mywallpaper/sdk-react` and Vite.

```bash
npm install
npm run dev        # vite watch (rebuilds on save)
npx serve dist --cors -l 5173  # serve the built widget
```

## License

MIT
