"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { PetAvatar } from "@/components/ui";
import { updatePetPhoto } from "@/app/actions";
import { useI18n } from "@/lib/i18n/client";

export function PetPhotoUpload({
  petId,
  species,
  name,
  photoUrl,
}: {
  petId: string;
  species: string;
  name: string;
  photoUrl: string | null;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const fd = new FormData();
    fd.set("photo", file);
    startTransition(async () => {
      const res = await updatePetPhoto(petId, fd);
      if (res?.error) setError(res.error);
      else router.refresh();
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <div className="shrink-0">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={pending}
        className="group relative block rounded-2xl"
        aria-label={t.photo.change}
        title={t.photo.change}
      >
        <PetAvatar species={species} name={name} size="lg" photoUrl={photoUrl} />
        <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/45 text-white opacity-0 transition group-hover:opacity-100">
          {pending ? (
            <span className="text-[10px] font-medium">{t.photo.uploading}</span>
          ) : (
            <Camera size={18} />
          )}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onPick}
        className="hidden"
      />
      {error && <p className="mt-1 text-[11px] text-rose-600">{error}</p>}
    </div>
  );
}
