import type { Metadata } from "next";
import Link from "next/link";
import { lastDataUpdate } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { reportErrorHref, reportErrorTarget } from "@/lib/site";

export const metadata: Metadata = {
  title: "About, sources & methodology",
  description: "How programs are chosen, where the data comes from, and how to report an error.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto grid max-w-3xl gap-8 px-4 py-10 [&_h2]:text-xl [&_h2]:font-semibold [&_section]:grid [&_section]:gap-2">
      <header className="grid gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">About this site</h1>
        <p className="text-lg text-muted-foreground">
          Ontario Healthcare Pathways helps Grade 11 and 12 students, and the adults helping them,
          find regulated health care careers you can start straight from high school.
        </p>
      </header>

      <section aria-labelledby="rules">
        <h2 id="rules">Which programs are listed</h2>
        <p>A program is listed only if all three of these are true:</p>
        <ol className="list-decimal pl-5">
          <li>
            <strong>Direct entry from high school.</strong> Ontario high school students can apply
            through OUAC or ontariocolleges.ca without any college or university first.
          </li>
          <li>
            <strong>One credential is enough.</strong> Finishing this one program meets the
            regulator&apos;s education requirement to register.
          </li>
          <li>
            <strong>No further education.</strong> No graduate, professional, or second degree or
            diploma is needed to work.
          </li>
        </ol>
        <p>
          Licensing exams, jurisprudence exams (tests on the laws for your profession), and
          registering with a regulatory college are allowed. They are shown on every program&apos;s
          pathway.
        </p>
        <p>
          We check this for each program, not each profession. A profession can have some programs
          that qualify and others that don&apos;t. Careers such as medicine, physiotherapy,
          occupational therapy, speech-language pathology, audiology, dietetics, pharmacy (the
          pharmacist role), optometry, dentistry, and chiropractic are not listed because they need
          more than one program. Unregulated roles, such as personal support worker, are also not
          listed.
        </p>
      </section>

      <section aria-labelledby="sources">
        <h2 id="sources">Where the data comes from</h2>
        <p>We only use official sources:</p>
        <ul className="list-disc pl-5">
          <li>College and university program pages</li>
          <li>OUAC and ontariocolleges.ca</li>
          <li>Ontario regulatory college websites</li>
          <li>Government of Canada Job Bank (wages and job outlook)</li>
          <li>CIHI and Statistics Canada</li>
        </ul>
        <p>
          Every fact links to its source. If we can&apos;t verify something, we don&apos;t guess. It
          shows as <em>“Not yet verified — check the official page.”</em> Admission averages are
          shown as ranges tied to a specific year, never as a guaranteed cut-off.
        </p>
        <p>
          Last data update:{" "}
          {lastDataUpdate ? formatDate(lastDataUpdate) : "no records have been verified yet"}.
          Records not checked in the last 90 days are flagged for review.
        </p>
      </section>

      <section aria-labelledby="quiz">
        <h2 id="quiz">How the quiz works</h2>
        <p>
          The quiz scores each eligible program on your interests (35%), your work-style comfort
          (30%), your practical preferences (20%), and how your average compares with the
          program&apos;s recent range (15%). Programs you&apos;re missing several prerequisites for
          are shown separately. Results are a starting point, not a prediction of admission.
        </p>
      </section>

      <section aria-labelledby="privacy">
        <h2 id="privacy">Privacy</h2>
        <p>
          There are no accounts. Quiz answers stay on your device. They are stored in your browser
          and in the part of the results link after the <code>#</code>, which browsers never send to
          a server. We use cookieless analytics that count page views without identifying you.
        </p>
      </section>

      <section aria-labelledby="disclaimer">
        <h2 id="disclaimer">Disclaimer</h2>
        <p>
          This site is a starting point, not advice. Requirements, averages, and fees change. Always
          confirm on the official program page and talk to your guidance counsellor before making
          decisions.
        </p>
      </section>

      <section aria-labelledby="report-h" id="report" className="scroll-mt-4">
        <h2 id="report-h">How to report an error</h2>
        <p>
          Found something wrong or out of date? Tell us which page, what&apos;s wrong, and a link to
          the official source if you have one.
        </p>
        {reportErrorTarget ? (
          <p>
            <a href={reportErrorHref("general")} className="underline">
              Report an error
            </a>
          </p>
        ) : (
          <p className="text-muted-foreground">
            The error reporting address hasn&apos;t been set up yet.
          </p>
        )}
        <p>
          <Link href="/" className="underline">
            Back to programs
          </Link>
        </p>
      </section>
    </div>
  );
}
