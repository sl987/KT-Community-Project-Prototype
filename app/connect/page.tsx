import { ArrowRight, Coffee, IdCard, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { CommunityPanel } from "@/components/connect/CommunityPanel";
import { buttonVariants } from "@/components/ui/button";
import { professionals } from "@/lib/data";
import {
  linkedinCommunityPoliciesUrl,
  linkedinUserAgreementUrl,
  partnerVerificationText,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Connect with professionals",
  description:
    "How to use LinkedIn to learn from allied health professionals: ground rules, coffee chats, and building your profile as a high school student.",
};

const GROUND_RULES: { title: string; body: ReactNode }[] = [
  {
    title: "Be 16 or older",
    body: "LinkedIn accounts are for people 16 and up. If you're younger, ask a parent, guardian or teacher to help you reach out.",
  },
  {
    title: "Introduce yourself every time",
    body: "Always add a short note to your connection request: who you are, why you're reaching out to them, and what you hope to learn.",
  },
  {
    title: "Respect their time",
    body: "Professionals are volunteering. Keep messages short, ask for 15–20 minutes at most, and don't follow up more than once if you don't hear back.",
  },
  {
    title: "Ask about their experience, not for favours",
    body: "Ask what the work is like and how they got there. Don't ask for a job, a placement, a reference or help with your application.",
  },
  {
    title: "Keep it professional",
    body: "Use a clear profile photo, proper spelling and a polite tone. Treat every message as if a future employer could read it.",
  },
  {
    title: "Follow LinkedIn's rules",
    body: (
      <>
        When you use LinkedIn, you must follow its{" "}
        <a
          href={linkedinUserAgreementUrl}
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          User Agreement
        </a>{" "}
        and{" "}
        <a
          href={linkedinCommunityPoliciesUrl}
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Professional Community Policies
        </a>
        . PAHSSION is not part of LinkedIn.
      </>
    ),
  },
  {
    title: "Keep everything on LinkedIn",
    body: "All communication, including coffee chats, must happen on LinkedIn. Don't exchange personal emails, phone numbers, social media accounts or any other personal information, and don't move the conversation to another app.",
  },
  {
    title: "Stay safe",
    body: "Never share your home address or passwords, and never send money. If a partner asks to talk somewhere other than LinkedIn, or anything feels wrong, stop replying, tell a trusted adult, and report it to us.",
  },
];

const COFFEE_QUESTIONS = [
  "What does a typical day look like for you?",
  "What surprised you most when you started working?",
  "Why did you choose your program, and would you choose it again?",
  "What helped you get accepted into your program?",
  "What do you find hardest about the job? What do you enjoy most?",
  "What should I be doing now, in high school, to prepare?",
];

const PROFILE_CHECKLIST = [
  {
    item: "Photo",
    tip: "A clear, friendly photo of your face. It doesn't need to be professional, just well lit.",
  },
  {
    item: "Headline",
    tip: "e.g. “Grade 12 student | Interested in radiation therapy and medical imaging”.",
  },
  {
    item: "About",
    tip: "Two or three sentences on what draws you to health care and what you're exploring.",
  },
  {
    item: "Education",
    tip: "Your high school, expected graduation year, and relevant courses like Biology or Chemistry.",
  },
  {
    item: "Experience",
    tip: "Part-time jobs, volunteering, clubs, sports and leadership roles all count.",
  },
  {
    item: "Skills",
    tip: "Add a few you can back up, like teamwork, communication, first aid/CPR or a second language.",
  },
];

function Section({
  id,
  icon,
  title,
  intro,
  children,
}: {
  id: string;
  icon: ReactNode;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="grid scroll-mt-4 gap-5">
      <div className="grid gap-2">
        <h2
          id={`${id}-h`}
          className="flex items-center gap-3 text-2xl font-semibold tracking-tight"
        >
          <span className="bg-muted text-primary dark:text-brand-accent grid size-10 place-items-center rounded-md">
            {icon}
          </span>
          {title}
        </h2>
        <p className="text-muted-foreground max-w-3xl text-lg">{intro}</p>
      </div>
      {children}
    </section>
  );
}

export default function ConnectPage() {
  return (
    <>
      <section className="bg-brand text-brand-foreground">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 pt-12 pb-14 sm:pt-14 sm:pb-16">
          <p className="text-brand-accent text-sm font-semibold tracking-widest uppercase">
            Connect
          </p>
          <h1 className="text-brand-foreground dark:text-brand-foreground max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl sm:leading-[1.1]">
            Learn the job from the people doing it
          </h1>
          <p className="text-brand-muted max-w-2xl text-lg">
            Course requirements only tell you how to get in. A 15-minute conversation with someone
            in the field tells you what the work is really like. Here&apos;s how to start that
            conversation on LinkedIn.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Link
              href="/connect/directory"
              className={buttonVariants({
                size: "lg",
                className:
                  "bg-brand-foreground text-brand hover:bg-brand-foreground/90 focus-visible:ring-brand-accent/60 h-11 px-5",
              })}
            >
              Browse {professionals.length} professionals
              <ArrowRight aria-hidden />
            </Link>
          </div>
          <nav aria-label="On this page" className="mt-4">
            <ul className="text-brand-muted flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {[
                ["#ground-rules", "Ground rules"],
                ["#coffee-chats", "Coffee chats"],
                ["#self-branding", "Your profile"],
                ["#community", "Community"],
              ].map(([href, label]) => (
                <li key={href}>
                  <a
                    href={href}
                    className="hover:text-brand-foreground decoration-brand-accent underline underline-offset-4"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-16 px-4 py-12">
        <Section
          id="ground-rules"
          icon={<ShieldCheck className="size-5" aria-hidden />}
          title="LinkedIn ground rules"
          intro="The professionals in our directory have agreed to hear from students. Follow these rules so it stays that way."
        >
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GROUND_RULES.map((r, i) => (
              <li key={r.title} className="bg-card flex gap-4 rounded-lg border p-5">
                <span className="text-link text-2xl leading-none font-bold tabular-nums">
                  {i + 1}
                </span>
                <div className="grid gap-1">
                  <h3 className="font-semibold">{r.title}</h3>
                  <p className="text-muted-foreground text-sm">{r.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="border-l-link bg-muted flex max-w-3xl items-start gap-2 rounded-md border-l-4 p-3 text-sm">
            <ShieldCheck className="text-link mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              {partnerVerificationText} Something go wrong?{" "}
              <Link href="/about#report" className="font-medium underline">
                Report a concern about a partner
              </Link>
              .
            </span>
          </p>
        </Section>

        <Section
          id="coffee-chats"
          icon={<Coffee className="size-5" aria-hidden />}
          title="Introduction to coffee chats"
          intro="A coffee chat is a short, informal conversation where you ask someone about their career. No coffee required. Every coffee chat happens on LinkedIn, through its messages or a call you set up there."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="grid content-start gap-3">
              <h3 className="text-lg font-semibold">1. Send a short request</h3>
              <p className="text-muted-foreground text-sm">
                Personalise this, and keep it under 300 characters so it fits in a LinkedIn
                connection note.
              </p>
              <blockquote className="border-l-link bg-muted rounded-md border-l-4 p-4 text-sm">
                Hi [Name], I&apos;m a Grade 12 student in [city] interested in [profession]. I found
                you through PAHSSION. Would you be open to a 15-minute chat about your path through
                [program]? Thank you!
              </blockquote>
              <h3 className="mt-3 text-lg font-semibold">2. Prepare and show up</h3>
              <p className="text-muted-foreground text-sm">
                Read their profile and the program page first. Have your questions ready, keep the
                chat on LinkedIn, and end when you said you would.
              </p>
              <h3 className="mt-3 text-lg font-semibold">3. Say thank you</h3>
              <p className="text-muted-foreground text-sm">
                Send a thank-you message within a day, mentioning one thing you learned.
              </p>
            </div>
            <div className="bg-card grid content-start gap-3 rounded-lg border p-5">
              <h3 className="text-lg font-semibold">Good questions to ask</h3>
              <ul className="grid gap-2 text-sm">
                {COFFEE_QUESTIONS.map((q) => (
                  <li key={q} className="flex gap-2">
                    <span className="text-link font-bold" aria-hidden>
                      ?
                    </span>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        <Section
          id="self-branding"
          icon={<IdCard className="size-5" aria-hidden />}
          title="Self-branding: your student profile"
          intro="Your profile is the first thing a professional sees when you reach out. You don't need work experience, just an honest, complete picture of who you are and where you're heading."
        >
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PROFILE_CHECKLIST.map((c) => (
              <li key={c.item} className="bg-card grid gap-1 rounded-lg border p-4">
                <h3 className="font-semibold">{c.item}</h3>
                <p className="text-muted-foreground text-sm">{c.tip}</p>
              </li>
            ))}
          </ul>
        </Section>

        <CommunityPanel id="community" />
      </div>
    </>
  );
}
