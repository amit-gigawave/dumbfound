# Dumbfound Sculpture Showcase

A premium interactive sculpture showcase website built with Next.js 16, React Three Fiber, and GSAP animations.

## Features

- **Smooth Scroll Experience**: Lenis smooth scrolling for buttery-smooth navigation
- **3D Interactive Sculpture**: Three.js powered 3D model with scroll-linked animations
- **Cinematic Animations**: GSAP ScrollTrigger animations throughout
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Performance Optimized**: Dynamic imports, lazy loading, and SSR disabled for 3D content

## Tech Stack

- **Framework**: Next.js 16 (React 19)
- **3D Graphics**: Three.js, React Three Fiber, Drei
- **Animations**: GSAP, ScrollTrigger
- **Smooth Scroll**: Lenis
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript

## Getting Started

Install dependencies:

```bash
npm install --legacy-peer-deps
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with Navbar
│   ├── page.tsx            # Main page with Lenis integration
│   └── globals.css         # Global styles
├── components/
│   ├── Navbar.tsx          # Sticky navigation with glassmorphism
│   ├── Hero.tsx            # Hero section with GSAP text animations
│   ├── About.tsx           # About section with stats
│   ├── Gallery.tsx         # Gallery grid with hover effects
│   ├── Contact.tsx         # Contact form and info
│   ├── Scene.tsx           # Three.js 3D scene with scroll animations
│   └── SceneWrapper.tsx    # Dynamic import wrapper for Scene
└── public/
    └── sculpture.glb       # 3D sculpture model
```

## 3D Model

Place your sculpture model as `sculpture.glb` in the `public/` folder. The model should be:

- Format: GLB (optimized)
- Size: Under 10MB
- Optimized polygon count

## Sections

1. **Hero**: Eye-catching intro with 3D sculpture
2. **About**: Company story and achievements
3. **Gallery**: Sculpture showcase grid
4. **Contact**: Contact form and information

## Customization

- Update sculpture model in `/public/sculpture.glb`
- Modify colors in `globals.css` and component files
- Adjust animations in Scene.tsx ScrollTrigger configurations
- Update content in each component

## Performance Notes

- 3D Scene uses dynamic import with SSR disabled
- Lenis provides hardware-accelerated smooth scrolling
- GSAP ScrollTrigger syncs 3D animations with scroll position

## License

All Rights Reserved © 2026 Dumbfound Tech
