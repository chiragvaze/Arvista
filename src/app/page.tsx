import { galleryLayout } from "@/lib/museum/galleryLayout";
import { MuseumExperience } from "@/components/museum/MuseumExperience";
import { ArtworkDetails } from "@/components/gallery/ArtworkDetails";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#collection">
        Skip the 3D walkthrough
      </a>
      <main>
        <MuseumExperience />
        <ArtworkDetails paintings={galleryLayout.map((l) => l.painting)} />
      </main>
    </>
  );
}
