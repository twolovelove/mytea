"use client";

import { useEffect, useState } from "react";
import { TeapotIcon } from "./icons";

export function usePhotoUrl(photo: Blob | null): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!photo) {
      setUrl(null);
      return;
    }
    const next = URL.createObjectURL(photo);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [photo]);
  return url;
}

export function PhotoThumb({ photo, alt }: { photo: Blob | null; alt: string }) {
  const url = usePhotoUrl(photo);
  if (!url) {
    return (
      <span className="thumb thumb-empty" aria-hidden="true">
        <TeapotIcon />
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element -- local blob URL
  return <img className="thumb" src={url} alt={alt} />;
}
