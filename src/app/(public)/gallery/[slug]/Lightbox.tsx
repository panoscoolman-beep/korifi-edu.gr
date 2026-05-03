"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import type { GalleryPhoto } from "@/types/database";

export function Lightbox({ photos }: { photos: GalleryPhoto[] }) {
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const next  = useCallback(() => setActive((i) => i === null ? null : (i + 1) % photos.length), [photos.length]);
  const prev  = useCallback(() => setActive((i) => i === null ? null : (i - 1 + photos.length) % photos.length), [photos.length]);

  useEffect(() => {
    if (active === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft")  prev();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [active, close, next, prev]);

  return (
    <>
      <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((p, i) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => setActive(i)}
              className="group block w-full overflow-hidden rounded-lg bg-slate-100"
              aria-label={`Φωτογραφία ${i + 1}`}
            >
              <div className="relative aspect-square w-full">
                <Image
                  src={p.image_url}
                  alt={p.caption ?? ""}
                  fill
                  sizes="(min-width: 1024px) 250px, (min-width: 640px) 33vw, 50vw"
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
            </button>
          </li>
        ))}
      </ul>

      {active !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={close}
        >
          <button
            type="button" onClick={close}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Κλείσιμο"
          >✕</button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Προηγούμενη"
          >‹</button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Επόμενη"
          >›</button>

          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <div className="relative" style={{ width: "min(90vw, 1400px)", height: "min(90vh, 900px)" }}>
              <Image
                src={photos[active].image_url}
                alt={photos[active].caption ?? ""}
                fill
                sizes="90vw"
                className="object-contain"
                priority
              />
            </div>
            {photos[active].caption && (
              <p className="mt-3 text-center text-sm text-white/80">
                {photos[active].caption}
              </p>
            )}
            <p className="mt-1 text-center text-xs text-white/50">
              {active + 1} / {photos.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
