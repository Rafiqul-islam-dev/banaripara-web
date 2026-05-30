'use client';

import { useEffect, useMemo, useState } from 'react';

export default function BannerSlider({ images = [], heightClass = 'h-56 md:h-72', roundedClass = 'rounded-[28px]' }) {
  const cleanImages = useMemo(() => images.filter(Boolean), [images]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (cleanImages.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % cleanImages.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [cleanImages.length]);

  useEffect(() => {
    if (index >= cleanImages.length) setIndex(0);
  }, [cleanImages.length, index]);

  if (!cleanImages.length) return null;

  const goNext = () => setIndex((current) => (current + 1) % cleanImages.length);
  const goPrev = () => setIndex((current) => (current - 1 + cleanImages.length) % cleanImages.length);

  return (
    <div className={`relative overflow-hidden ${roundedClass} bg-emerald-50 shadow-soft`}>
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {cleanImages.map((src, imageIndex) => (
          <div key={`${src}-${imageIndex}`} className="min-w-full">
            <img
              src={src}
              alt={`Banaripara banner ${imageIndex + 1}`}
              className={`${heightClass} w-full object-cover`}
              onError={(event) => {
                event.currentTarget.src = '/images/banaripara1.jpg';
              }}
            />
          </div>
        ))}
      </div>

      {cleanImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous banner"
            className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 rounded-full bg-white/85 text-xl font-black text-emerald-700 shadow-lg backdrop-blur transition hover:bg-white md:grid md:place-items-center"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next banner"
            className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 rounded-full bg-white/85 text-xl font-black text-emerald-700 shadow-lg backdrop-blur transition hover:bg-white md:grid md:place-items-center"
          >
            ›
          </button>
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
            {cleanImages.map((_, dotIndex) => (
              <button
                key={dotIndex}
                type="button"
                onClick={() => setIndex(dotIndex)}
                aria-label={`Go to banner ${dotIndex + 1}`}
                className={`h-2.5 rounded-full transition-all ${dotIndex === index ? 'w-8 bg-white' : 'w-2.5 bg-white/55'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
