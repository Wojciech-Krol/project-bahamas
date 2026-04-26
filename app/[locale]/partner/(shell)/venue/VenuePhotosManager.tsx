"use client";

import { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/app/components/Icon";

import {
  removeVenueGalleryPhoto,
  uploadVenueGalleryPhoto,
  uploadVenueHero,
} from "./actions";

export default function VenuePhotosManager({
  venueId,
  initialHero,
  initialGallery,
}: {
  venueId: string;
  initialHero: string | null;
  initialGallery: string[];
}) {
  const t = useTranslations("Partner.venue");
  const tField = useTranslations("Partner.venue.fields");
  const tErr = useTranslations("Partner.venue.uploadError");

  const [hero, setHero] = useState<string | null>(initialHero);
  const [gallery, setGallery] = useState<string[]>(initialGallery);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const heroInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);

  function onPickHero(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    setError(null);
    startTransition(async () => {
      const res = await uploadVenueHero(venueId, fd);
      if ("ok" in res && res.ok) {
        setHero(res.url);
      } else if ("error" in res) {
        setError(res.error);
      }
      if (heroInput.current) heroInput.current.value = "";
    });
  }

  function onPickGalleryPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    setError(null);
    startTransition(async () => {
      const res = await uploadVenueGalleryPhoto(venueId, fd);
      if ("ok" in res && res.ok) {
        setGallery((prev) => [...prev, res.url]);
      } else if ("error" in res) {
        setError(res.error);
      }
      if (galleryInput.current) galleryInput.current.value = "";
    });
  }

  function onRemoveGalleryPhoto(url: string) {
    setError(null);
    startTransition(async () => {
      const res = await removeVenueGalleryPhoto(venueId, url);
      if ("ok" in res && res.ok) {
        setGallery((prev) => prev.filter((u) => u !== url));
      } else if ("error" in res) {
        setError(res.error);
      }
    });
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-[#FAEEDA] p-5 space-y-5">
      <h3 className="font-headline font-bold text-lg flex items-center gap-2">
        <Icon name="photo_library" className="text-[20px] text-primary" />
        {t("sections.photos")}
      </h3>

      <div>
        <div className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-on-surface/50 mb-2">
          {tField("heroImage")}
        </div>
        <div className="flex items-center gap-4">
          <div className="w-40 h-24 bg-surface-container-low rounded-xl overflow-hidden border border-[#FAEEDA] shrink-0">
            {hero ? (
              <img src={hero} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-on-surface/30">
                <Icon name="image" className="text-[28px]" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <input
              ref={heroInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onPickHero}
              disabled={pending}
              className="block w-full text-sm text-on-surface/70 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary file:text-on-primary file:font-bold file:text-[0.7rem] file:uppercase file:tracking-widest file:cursor-pointer disabled:opacity-50"
            />
            <p className="text-[0.65rem] text-on-surface/50 mt-2">
              {t("upload.hint")}
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-on-surface/50 mb-2">
          {t("gallery.title")}
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {gallery.map((url) => (
            <div
              key={url}
              className="relative aspect-square rounded-xl overflow-hidden border border-[#FAEEDA] group"
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onRemoveGalleryPhoto(url)}
                disabled={pending}
                aria-label={t("gallery.remove")}
                className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              >
                <Icon name="close" className="text-[16px]" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => galleryInput.current?.click()}
            disabled={pending}
            className="aspect-square rounded-xl border-2 border-dashed border-on-surface/20 hover:border-primary/60 hover:bg-primary-fixed/20 flex flex-col items-center justify-center text-on-surface/50 hover:text-primary transition-colors disabled:opacity-50"
          >
            <Icon name="add_a_photo" className="text-[24px]" />
            <span className="text-[0.6rem] font-bold uppercase tracking-widest mt-1">
              {t("gallery.add")}
            </span>
          </button>
          <input
            ref={galleryInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onPickGalleryPhoto}
            className="hidden"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-error-container/40 px-3 py-2 text-sm text-on-error-container">
          {tErr.has(error) ? tErr(error as never) : tErr("internal")}
        </div>
      )}
    </div>
  );
}
