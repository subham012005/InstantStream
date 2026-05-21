# Open Graph Image Requirements

To ensure social sharing (Twitter, LinkedIn, Facebook, Discord, Replit, Reddit) looks highly professional, an optimized `og-image.png` is required in the `/public` folder.

## Technical Specifications
- **Path:** Place directly in `/public/og-image.png`
- **File format:** `.png` or `.jpg` (PNG highly recommended for sharp text)
- **Dimensions:** `1200 x 630 pixels` (Standard 1.91:1 ratio)
- **Size:** Under `1MB` for fast social unfurling.

## Design Requirements
To maximize Click-Through-Rate (CTR):

1. **Brand Dominance:** Keep the FluxPlays Logo and typography bold and legible.
2. **Text Hook:** Include a massive, high-contrast headline: "Stream Any Video Instantly" or "FluxPlays - The Modern Streaming Web App".
3. **UI Preview:** Layer a sleek screenshot or isometric render of the player UI behind the text to show the app in action.
4. **Dark Mode Aesthetic:** Align with the UI's dark/glassmorphic theme. Use dark backgrounds (gradient blacks/blues) and neon/cyan highlights.
5. **Safe Zones:** Keep all core text and logos within the center `800x400` pixel box so that square crops on platforms like WhatsApp do not cut off the context.

Once this image is saved to `/public/og-image.png`, the `layout.tsx` metadata config will automatically pick it up for all generic pages.
