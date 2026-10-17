# ARVISTA — The Art Gallery

A scroll-driven 3D museum for presenting original paintings. Visitors stand before a grand arched entrance, scroll to open the doors, walk into a barrel-vaulted gallery and turn to face each painting.

Built with Next.js (App Router), React Three Fiber, drei, three.js and GSAP ScrollTrigger.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
npm run build
```

## Adding your paintings

Paintings live in [`src/content/paintings.ts`](src/content/paintings.ts). Put the image in `public/artworks/` and edit the entry:

- `image.src`, `image.width`, `image.height`, `image.alt`: the frame is built around the image's real aspect ratio.
- `title`, `year`, `medium`, `dimensions`, `description`: shown in the information panel and the collection section.
- `wall` (`"left"` / `"right"`) and `order`: where it hangs. Order *n* hangs in corridor bay *n*.
- `displayHeight`: height of the painted surface in metres.

Remove `isPlaceholder` once the entry describes a real painting.

## Structure

```
src/
  app/                      layout, page, global styles
  content/paintings.ts      artwork data
  types/artwork.ts          Painting type
  lib/museum/
    layout.ts               architectural dimensions and painting placement
    cameraWaypoints.ts      camera poses and the spline/slerp camera rig
    scrollTimeline.ts       scroll phases, chapters and the GSAP timeline
    motion.ts               shared animation values (scroll → scene)
    geometry.ts, textures.ts  arch/frame builders, procedural surfaces
    deviceTier.ts, clientEnvironment.ts  WebGL, quality tier, reduced motion
  components/museum/        3D scene (canvas, entrance, doors, corridor, painting, camera)
  components/museum/overlay HTML overlays (branding, info panel, chapter nav, loader)
  components/gallery/       static, accessible collection section
```
