# Sik AI — Demo Video

A cinematic 5-scene motion graphics video showcasing the key features of the Sik AI body scanning iOS app. Built with React, Framer Motion, and Tailwind CSS.

## Scenes

| Scene | Duration | Content |
|-------|----------|---------|
| 1 — Brand Open | 4s | Sik AI logo reveal with emerald particle dust and tagline |
| 2 — LiDAR Scanner | 6s | Body silhouette with 500+ glowing emerald dots filling top-to-bottom, scan beam, measurement brackets |
| 3 — Measurements Dashboard | 4.5s | 11 body metrics animating in — chest, waist, hips, arms, thighs, body fat %, muscle mass % |
| 4 — Progress & Analytics | 5s | 8-week trend charts, percentage change badges, before/after comparison |
| 5 — AI Coach + Close | 5s | AI coaching chat bubble, closing brand lockup with emerald glow |

Total runtime: ~24.5 seconds, loops continuously.

## Tech Stack

- **Framework**: React + Vite
- **Animation**: Framer Motion
- **Styling**: Tailwind CSS
- **Scene management**: Custom `useVideoPlayer` hook
- **Assets**: AI-generated body silhouette, UI textures, atmospheric particle video

## File Structure

```
demo-video/
├── src/
│   ├── VideoTemplate.tsx            # Main video component — scene routing, persistent layers
│   └── video_scenes/
│       ├── Scene1.tsx               # Brand open — logo reveal, particle dust
│       ├── Scene2.tsx               # LiDAR scanner — dot reveal, scan beam, HUD
│       ├── Scene3.tsx               # Measurements dashboard — metric cards, counting numbers
│       ├── Scene4.tsx               # Progress charts — trend lines, delta badges
│       └── Scene5.tsx               # AI Coach + closing brand lockup
└── public/
    ├── images/
    │   ├── body-silhouette.jpg      # AI-generated dark body silhouette with emerald glow
    │   └── ui-texture.jpg           # Futuristic scanning UI texture overlay
    └── videos/
        └── particles.mp4            # Atmospheric dark particle background loop
```

## Design Direction

**Aesthetic**: Premium Tech — dark, cinematic, precise. Apple × fitness technology.

**Color palette**:
- Background: `#0A0A0A`
- Emerald accent: `#10B981`
- Cards: `#1A1A1A`
- Text: white with emerald glows

**Typography**: Space Grotesk (display) + Plus Jakarta Sans (body)

**Motion**: Smooth ease-out reveals, emerald glow pulses, scan line sweeps, per-character kinetic typography
