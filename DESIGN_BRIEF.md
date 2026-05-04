# Design brief — Vow & Scroll (wedding-classic-v1)

**Intent:** Editorial, warm, asymmetric layouts—distinct from typical centered-hero wedding template marketplaces. No purple gradients; no Inter/Roboto default stack.

## Typography

- **Display / names:** Syne (700) — geometric, contemporary, not script cliché.
- **Body & UI:** Literata (400/600) — readable for elders; book-like for long copy.

## Color (CSS variables)

- Paper: `#f2ebe3`
- Ink: `#1a1814`
- Accent (rust/terracotta): `#c45c3e`
- Deep foliage (secondary): `#2d3b2e`
- Muted line: `rgba(26, 24, 20, 0.12)`

## Layout grammar

- Offset grids: hero image bleeds one edge; text column overlaps or sits in deliberate negative space.
- Section rhythm: large vertical gaps, thin horizontal rules, occasional numbered section labels (01, 02).
- Motion: subtle `prefers-reduced-motion`–safe fades on scroll; no busy parallax.

## Invite template chrome

- Single scroll column on mobile; on desktop optional split band for events.
- Buttons: outline + rust fill on hover; pill is avoided in favor of sharp or slight radius (`4px`).

This document informs the creator shell and `wedding-classic-v1` renderer only; marketing pages may extend the system later.
