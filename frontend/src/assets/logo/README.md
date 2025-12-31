# Logo Assets

Place your STASH logo and icon files in this folder.

## Required Files

### Logo Files (for full logo display):
- `logo.svg` (preferred - vector, scalable)
- `logo.png` (fallback)
- `logo.webp` (alternative fallback)

### Icon Files (for icon-only display):
- `icon.svg` (preferred - vector, scalable)
- `icon.png` (fallback)
- `icon.webp` (alternative fallback)

## Usage

The Logo component will automatically:
1. Try to load from `/src/assets/logo/` first
2. Fallback to `/public/` folder if assets not found
3. Try alternative formats (.svg → .png → .webp) on error
4. Show gradient fallback if all files fail

## File Requirements

- **Transparent background** (PNG/SVG with alpha channel)
- **No padding/margins** in the image file itself
- **Vector format preferred** (SVG) for scalability
- **Optimized file size** for web performance

## Notes

- Logo files are imported using Vite's static asset system
- Files in this folder are processed at build time
- If files don't exist, the component will gracefully fallback
