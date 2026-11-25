import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { TrackedLink } from "@/components/common/TrackedLink";
import { CommunityPanel } from "@/components/connect/CommunityPanel";
import { DirectoryBrowser } from "@/components/connect/DirectoryBrowser";
import { networkFields, professionals } from "@/lib/data";
import {
  linkedinCommunityPoliciesUrl,
  linkedinUserAgreementUrl,
  partnerVerificationText,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Professional directory",
  description:
    "Allied health professionals in Ontario who have agreed to answer questions from high school students on LinkedIn.",
};

export default function DirectoryPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10">
      <header className="grid gap-3">
        <nav aria-label="Breadcrumb" className="text-muted-foreground text-sm">
          <Link href="/connect" className="underline underline-offset-2">
            Connect
          </Link>{" "}
          / Directory
        </nav>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Talk to someone in the field
        </h1>
        <p className="text-muted-foreground max-w-3xl text-lg">
          Everyone here works or studies in allied health and has agreed to hear from students. Ask
          them what the job is really like, how they got in, and what they wish they had known.
        </p>
        <p className="text-muted-foreground max-w-3xl text-sm">{partnerVerificationText}</p>
        <p className="border-l-link bg-muted flex max-w-3xl items-start gap-2 rounded-md border-l-4 p-3 text-sm">
          <ShieldCheck className="text-link mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            First time reaching out? Read the{" "}
            <Link href="/connect#ground-rules" className="font-medium underline">
              LinkedIn ground rules
            </Link>{" "}
            and{" "}
            <TrackedLink
              href="/connect#coffee-chats"
              event="guide_open"
              internal
              className="font-medium underline"
            >
              how to ask for a coffee chat
            </TrackedLink>{" "}
            before you send a message. By connecting on LinkedIn, you agree to follow
            LinkedIn&apos;s{" "}
            <a
              href={linkedinUserAgreementUrl}
              className="font-medium underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              User Agreement
            </a>{" "}
            and{" "}
            <a
              href={linkedinCommunityPoliciesUrl}
              className="font-medium underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Professional Community Policies
            </a>
            . All communication, including coffee chats, must stay on LinkedIn: no exchanging
            personal emails or other personal information.
          </span>
        </p>
      </header>

      <Suspense fallback={<p className="text-muted-foreground">Loading directory…</p>}>
        <DirectoryBrowser fields={networkFields} people={professionals} />
      </Suspense>

      <CommunityPanel />
    </div>
  );
}
