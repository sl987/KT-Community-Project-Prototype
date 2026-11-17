import { ArrowLeft, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CareerFacts } from "@/components/programs/CareerFacts";
import { buttonVariants } from "@/components/ui/button";
import { careerFields, getCareerField, professionalsInField } from "@/lib/data";

export const dynamicParams = false;

export function generateStaticParams() {
  return careerFields.map((f) => ({ slug: f.field }));
}

export async function generateMetadata({ params }: PageProps<"/careers/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const f = getCareerField(slug);
  return f ? { title: f.title, description: f.summary } : {};
}

/** Profession-level facts for one featured field: scope, title, licensing, pay, path, growth. */
export default async function CareerPage({ params }: PageProps<"/careers/[slug]">) {
  const { slug } = await params;
  const f = getCareerField(slug);
  if (!f?.career) notFound();
  const partners = professionalsInField(f.field).length;

  return (
    <article className="mx-auto grid max-w-5xl gap-8 px-4 py-8">
      <header className="grid gap-3">
        <Link
          href={`/#${f.field}`}
          className="text-muted-foreground inline-flex w-fit items-center gap-1 text-sm underline underline-offset-2"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to programs
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">{f.title}</h1>
        <p className="text-muted-foreground max-w-2xl text-lg">{f.summary}</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/#${f.field}`}
            className={buttonVariants({ variant: "default", className: "h-10 px-4" })}
          >
            See where to study ({f.programs.length})
          </Link>
          {partners > 0 && (
            <Link
              href={`/connect/directory?field=${f.field}`}
              className={buttonVariants({ variant: "outline", className: "h-10 px-4" })}
            >
              <MessageCircle aria-hidden />
              Talk to {partners === 1 ? "a" : partners} {f.title}
              {partners === 1 ? "" : "s"}
            </Link>
          )}
        </div>
      </header>
      <CareerFacts facts={f.career} title={f.title} />
    </article>
  );
}
