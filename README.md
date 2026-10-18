# ARVISTA — The Art Gallery

A scroll-driven 3D museum presenting an artistic collection by Chirag Vaze. Visitors stand before a grand arched entrance, scroll to open the doors, walk into a barrel-vaulted gallery and turn to face each painting.

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
2. Run `npm run artworks`. This writes resized WebP display copies to `public/artworks/display/` (2048 px and 1024 px, content-hashed file names so caches never serve an outdated image) and their sizes to `src/content/artwork-images.generated.json`. Images are only resized and converted to sRGB: no colour changes, sharpening or upscaling.
   - To remove unpainted canvas from a photograph, add a measured crop for that painting to `CROPS` in `scripts/optimize-artworks.mjs`. Crops are never detected automatically. *The Silent Ruler* uses one (see the comment there).
3. Add an entry to `paintings.ts` with the same `id`: title, medium, `creationDate` (YYYY-MM-DD), `dimensions` as written, `physicalSize` in cm, description and order.

Physical size sets each painting's size relative to the others (all share one display scale). Every mat has the same absolute width, so a smaller canvas gets a proportionally wider mat rather than being enlarged, and the camera views each painting from a distance derived from its frame size, so a small work still fills the screen.

## Structure

```
src/
  app/                      layout, page, global styles
  content/site.ts           gallery name, tagline, artist name and (draft) artist statement
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
    lightmaps.ts            baked light and contact shadows (canvas light/AO maps) for walls, vault, facades and floor
    deviceTier.ts, clientEnvironment.ts  WebGL, quality tier, reduced motion
  components/museum/        3D scene (canvas, entrance, doors, corridor, planters, floor inlay, painting, camera)
  components/museum/overlay HTML overlays (attribution, painting labels, closing card, chapter nav, loader)
  components/gallery/       static, accessible collection and the closing artist section
```
