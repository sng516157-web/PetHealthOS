import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { NewPetForm } from "@/components/NewPetForm";
import { getCandidateParents } from "@/lib/data";
import { getI18n } from "@/lib/i18n/server";

export default async function NewPetPage() {
  const { t } = await getI18n();
  const parents = await getCandidateParents();
  return (
    <div className="mx-auto max-w-2xl px-5 py-8 md:px-8">
      <Link
        href="/pets"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ChevronLeft size={16} /> {t.petDetail.back}
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
        {t.newPet.title}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {t.newPet.subtitle}
      </p>
      <div className="mt-6">
        <NewPetForm parents={parents} />
      </div>
    </div>
  );
}
