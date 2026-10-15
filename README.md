<div align="center">

# ✳️ Glyph Blocks Background

### An interactive, animated geometric grid for Framer

**Generative glyphs · Magnetic cursor attraction · Jumping blocks · Five color presets**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Explore%20in%20Framer-C6FF00?style=for-the-badge&labelColor=111111)](https://glyphblocksbackground.framer.website/)
[![Framer](https://img.shields.io/badge/Built%20for-Framer-0055FF?style=for-the-badge)](https://www.framer.com/)
[![React](https://img.shields.io/badge/React-TSX-61DAFB?style=for-the-badge&labelColor=111111)](https://react.dev/)

**[▶ Explore Live Preview](https://glyphblocksbackground.framer.website/)** · **[✳ Source Component](./KarimSaifGlyphBlocksBackground.tsx)** · **[𝕏 Follow Karim](https://x.com/karimsaif0)**

Made with 💛 by **[Karim Saif](https://github.com/karimsaif0)**

</div>

---

## A background that reacts to you

**Glyph Blocks Background** transforms an ordinary section into a living field of geometric marks. A procedural grid cycles through targets, dots, crosses, rounded squares, and other shapes as bold rectangular blocks jump into new arrangements.

Move your pointer over the canvas and nearby glyphs are drawn toward it with gentle spring motion. As the pointer leaves, they ease back into place.

Built as a self-contained **Framer code component** with no third-party animation dependencies.

## ⚡ See it in action

### [glyphblocksbackground.framer.website →](https://glyphblocksbackground.framer.website/)

Use the live demo to explore the animation, visual presets, and pointer interaction.

## ✨ Highlights

| Feature | What it does |
| :-- | :-- |
| 🧲 **Cursor attraction** | Nearby glyphs react to pointer motion with spring-based displacement |
| ✳️ **Generative glyphs** | Procedural patterns mix dots, targets, crosses, squares, and clustered circles |
| ◼️ **Jumping blocks** | Solid geometric blocks periodically relocate across the grid |
| 🎨 **Five presets** | Acid Green, Matrix, Cyber Cyan, Amber, and Monochrome |
| 🎛️ **Custom styling** | Control colors, size, density, block scale, stroke, and opacity |
| ⚡ **Canvas rendering** | Responsive canvas with DPR clamping and grid cell budgeting |
| ♿ **Motion-aware** | Respects the visitor's reduced-motion preference |
| 🌙 **Smart pausing** | Stops animation when paused, offscreen, or the document is hidden |
| 🖼️ **Static rendering** | SVG fallback for Framer static rendering and previews |
| 🧩 **No external libraries** | Uses React, the Canvas API, and Framer property controls |

## 🚀 Installation in Framer

1. Open your **Framer** project.
2. In the **Assets** panel, create a new **Code Component**.
3. Name it `KarimSaifGlyphBlocksBackground.tsx`.
4. Copy the contents of **[KarimSaifGlyphBlocksBackground.tsx](./KarimSaifGlyphBlocksBackground.tsx)** into your new component.
5. Save and drag the component onto the canvas.
6. Resize it to fill your section and adjust the properties in Framer's right-hand panel.
7. Open **Preview** or publish the site to experience pointer interaction.

> **Tip:** Use it as a full-bleed hero background, then place content in a separate layer above the component. The background itself does not intercept pointer events.

## 🎛️ Customize the experience

The component exposes **14 Framer property controls**:

| Control | Purpose |
| :-- | :-- |
| **Preset** | Choose Acid Green, Matrix, Cyber Cyan, Amber, Monochrome, or Custom |
| **Glyph Color** | Set symbol and block colors when using Custom |
| **Background** | Set the canvas background color when using Custom |
| **Cell Size** | Adjust the geometric grid scale |
| **Blocks** | Change the number of rectangular jumping blocks |
| **Speed** | Control automatic animation speed; zero disables automatic motion |
| **Paused** | Freeze automatic animation and pointer response |
| **Density** | Increase or decrease glyph coverage |
| **Block Scale** | Resize the rectangular blocks |
| **Stroke** | Change glyph outline thickness |
| **Opacity** | Adjust glyph and block visibility |
| **Cursor** | Toggle pointer attraction |
| **Cursor Radius** | Set the attraction zone around the pointer |
| **Cursor Strength** | Control the intensity of the magnetic effect |

Every control includes an in-editor description. Cursor Radius and Cursor Strength appear when cursor interaction is enabled; custom color controls appear when the Custom preset is selected.

## 🎨 Preset palette

| Preset | Glyph | Background |
| :-- | :-- | :-- |
| Acid Green | `#C6FF00` | `#000000` |
| Matrix | `#00FF88` | `#030D08` |
| Cyber Cyan | `#00E5FF` | `#020A10` |
| Amber | `#FFB800` | `#100900` |
| Monochrome | `#FFFFFF` | `#080808` |
| Custom | Your choice | Your choice |

## 💡 Great for

Creative portfolios · Interactive landing pages · AI and SaaS websites · Digital agencies · Experimental typography and generative-art experiences · Developer portfolios · Futuristic interface concepts.

## 🛠️ Technical notes

- React + TypeScript code component for Framer.
- `useIsStaticRenderer` renders a deterministic SVG preview.
- Canvas adapts to its container via `ResizeObserver`.
- Uses `IntersectionObserver` and `visibilitychange` to suspend offscreen and hidden-page animation.
- Uses `prefers-reduced-motion` for motion-sensitive visitors.
- Cleans up timers, animation frames, observers, and pointer listeners on unmount.
- Limits device pixel ratio to 2 and adjusts grid cell size to keep cell count bounded.
- Does not require GSAP, WebGL, or another external animation package.

## 📁 Project structure

```text
.
├── KarimSaifGlyphBlocksBackground.tsx  # Complete Framer code component
└── README.md                            # Documentation and setup guide
```

## 💛 About the creator

Created by **Karim Saif**, a UI/UX and product designer exploring playful interactions, motion, and creative coding for the web.

**Live Demo:** https://glyphblocksbackground.framer.website/  
**GitHub:** https://github.com/karimsaif0  
**X / Twitter:** https://x.com/karimsaif0  
**Email:** [karimsaif010@gmail.com](mailto:karimsaif010@gmail.com)

Found a bug, have feedback, or want to suggest an enhancement? Get in touch through X or email.

---

<div align="center">

**Design beyond the static.**

[Explore the live component](https://glyphblocksbackground.framer.website/) · [View the source](./KarimSaifGlyphBlocksBackground.tsx) · [Follow @karimsaif0](https://x.com/karimsaif0)

**Made with 💛 by Karim Saif**

</div>
