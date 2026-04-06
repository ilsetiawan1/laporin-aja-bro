"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  images: string[];
}

export default function ImageLightbox({ images }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-2  sm:grid-cols-3 gap-3">
        {images.map((url, i) => (
          <button
            key={i}
            onClick={() => setSelected(url)}
            className="block w-full text-left"
          >
            <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-100 hover:opacity-90 hover:scale-[1.02] transition-all duration-200">
              <Image src={url} alt={`Bukti ${i + 1}`} fill className="object-cover" />
              {/* Zoom hint */}
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox overlay */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <button
            onClick={() => setSelected(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div
            className="relative max-w-4xl max-h-[85vh] w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selected}
              alt="Bukti foto"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 80vw"
            />
          </div>

          {/* Navigation jika lebih dari 1 foto */}
          {images.length > 1 && (
            <div className="absolute bottom-4 flex gap-2">
              {images.map((url, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setSelected(url); }}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${selected === url ? "border-white" : "border-white/30 opacity-60 hover:opacity-100"}`}
                >
                  <div className="relative w-full h-full">
                    <Image src={url} alt={`Thumb ${i + 1}`} fill className="object-cover" sizes="48px" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}