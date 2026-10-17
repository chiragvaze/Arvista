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
npm run artworks   # regenerate display images after adding or replacing a photograph
```

## Paintings

Paintings are defined in [`src/content/paintings.ts`](src/content/paintings.ts) and hang in `order`, alternating left and right walls unless `wall` is set. The gallery layout, camera route, scroll timeline, chapter navigation and information panels are all generated from that list, and the corridor grows a bay per painting.

To add a painting:

1. Put the original photograph in `public/artworks/paintings/<id>.jpeg` (it is never modified).
2. Run `npm run artworks`. This writes resized WebP display copies to `public/artworks/display/` (2048 px and 1024 px) and their sizes to `src/content/artwork-images.generated.json`. Images are only resized and converted to sRGB: no cropping or colour changes.
3. Add an entry to `paintings.ts` with the same `id`: title, medium, `creationDate` (YYYY-MM-DD), `dimensions` as written, `physicalSize` in cm, description and order.

Physical size sets each painting's size relative to the others; frames are matted toward a common outer size, so a smaller canvas gets a wider mat rather than being enlarged.

## Structure

```
src/
  app/                      layout, page, global styles
  content/paintings.ts      artwork data
  content/artwork-images.generated.json  display image paths and sizes (npm run artworks)
  types/artwork.ts          Painting type
  lib/museum/
    layout.ts               architectural dimensions; corridor length from painting count
    galleryLayout.ts        wall, bay, position and frame/mat size for every painting
    cameraWaypoints.ts      camera route generated from the layout; spline/slerp camera rig
    scrollTimeline.ts       timeline plan, chapters and the GSAP timeline built from the route
    motion.ts               shared animation values (scroll → scene)
    geometry.ts, textures.ts  arch/frame builders, procedural surfaces
    deviceTier.ts, clientEnvironment.ts  WebGL, quality tier, reduced motion
  components/museum/        3D scene (canvas, entrance, doors, corridor, painting, camera)
  components/museum/overlay HTML overlays (branding, info panel, chapter nav, loader)
  components/gallery/       static, accessible collection section
```
