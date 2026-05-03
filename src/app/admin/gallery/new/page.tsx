import { AlbumForm } from "../AlbumForm";

export const metadata = { title: "Νέο άλμπουμ" };

export default function NewAlbum() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">Νέο άλμπουμ</h1>
      <AlbumForm album={null} />
    </div>
  );
}
