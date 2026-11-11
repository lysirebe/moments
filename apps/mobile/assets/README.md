# Assets

This directory holds the app's static assets. The binary image files referenced
in `app.json` (`icon.png`, `splash.png`, `adaptive-icon.png`, `favicon.png`)
are placeholders and must be replaced with real artwork before building.

You can generate them with the Expo CLI:

```bash
npx expo prebuild --clean
```

Or drop in your own images. Recommended sizes:

| File                | Size        |
| ------------------- | ----------- |
| `icon.png`          | 1024 × 1024 |
| `adaptive-icon.png` | 1024 × 1024 |
| `splash.png`        | 1284 × 2778 |
| `favicon.png`       | 48 × 48     |
