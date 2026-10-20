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

1. Put the original photograph in `public/artworks/paintings/<id>.jpeg` (it is never modified, and `.vercelignore` keeps it out of deployments).
2. Run `npm run artworks`. This writes resized WebP display copies to `public/artworks/display/` (2048 px and 1024 px, content-hashed file names so caches never serve an outdated image) and their sizes to `src/content/artwork-images.generated.json`. Images are only resized and converted to sRGB: no colour changes, sharpening or upscaling.
   - To remove unpainted canvas from a photograph, add a measured crop for that painting to `CROPS` in `scripts/optimize-artworks.mjs`. Crops are never detected automatically. *The Silent Ruler* uses one (see the comment there).
3. Add an entry to `paintings.ts` with the same `id`: title, medium, `creationDate` (YYYY-MM-DD), `dimensions` as written, `physicalSize` in cm, description and order.

Physical size sets each painting's size relative to the others (all share one display scale). Mats are a share of each painting's height, a little more for smaller canvases, so a small work reads as deliberately presented rather than enlarged, and the camera views each painting from a distance derived from its frame size, so a small work still fills the screen.

## Material textures

The limestone, marble and walnut textures in `public/textures/` come from [ambientCG](https://ambientcg.com), licensed CC0 1.0 (no attribution required; credited here anyway):

| Texture | ambientCG asset | Used for |
| --- | --- | --- |
| `marble-ivory-*` | [Marble014](https://ambientcg.com/a/Marble014) | pale floor marble |
| `marble-nero-*` | [Marble016](https://ambientcg.com/a/Marble016) | dark border, baseboards and plinths |
| `walnut-*` | [Wood051](https://ambientcg.com/a/Wood051) | doors, frames and bench |
| `limestone-*` | [Plaster001](https://ambientcg.com/a/Plaster001) | walls and stone mouldings (tinted ivory) |

To regenerate them, download each asset's `1K-JPG` pack, extract each into a folder named after the asset, and run `node scripts/optimize-textures.mjs <folder containing them>`. The script keeps only the colour, normal and roughness maps the scene uses and writes WebP (about 1.3 MB in total). The palms, fluting, linen, inscription and skylight glazing are still drawn procedurally.

## Structure

```
src/
  app/                      layout (metadata), page, global styles, robots, sitemap, share image (opengraph-image.jpg)
  content/site.ts           production URL (SITE_URL), gallery name, tagline, artist name and (draft) artist statement
  content/paintings.ts      artwork data
  content/artwork-images.generated.json  display image paths and sizes (npm run artworks)
  types/artwork.ts          Painting type
  lib/museum/
    layout.ts               architectural dimensions; corridor length from painting count
    galleryLayout.ts        wall, bay, position and frame/mat size for every painting
    cameraWaypoints.ts      camera route generated from the layout; spline/slerp camera rig
    scrollTimeline.ts       timeline plan, chapters and the GSAP timeline built from the route
    motion.ts               shared animation values (scroll → scene)
    geometry.ts, textures.ts  arch/frame builders; procedural textures (palm fronds, fluting, linen, glazing, inscription)
    lightmaps.ts            baked light and contact shadows (canvas light/AO maps) for walls, vault, facades and floor
    deviceTier.ts, clientEnvironment.ts  WebGL, quality tier, reduced motion
  components/museum/        3D scene (canvas, entrance, doors, corridor, planters, floor inlay, painting, camera, reflection probe)
  components/museum/overlay HTML overlays (attribution, painting labels, closing card, chapter nav, loader)
  components/gallery/       static, accessible collection and the closing artist section
```
