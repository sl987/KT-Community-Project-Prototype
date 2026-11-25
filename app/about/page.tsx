import type { Metadata } from "next";
import Link from "next/link";
import { FeedbackPanel } from "@/components/common/FeedbackPanel";
import { lastDataUpdate } from "@/lib/data";
import { formatDate } from "@/lib/format";
import {
  linkedinCommunityPoliciesUrl,
  linkedinUserAgreementUrl,
  partnerVerificationText,
  reportEmail,
  reportErrorHref,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "About, sources & methodology",
  description:
    "How programs are chosen, where the data comes from, terms of use, and how to report a problem.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto grid max-w-3xl gap-8 px-4 py-10 [&_h2]:text-xl [&_h2]:font-semibold [&_section]:grid [&_section]:gap-2">
      <header className="grid gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">About this site</h1>
        <p className="text-muted-foreground text-lg">
          PAHSSION (Professional Allied Health and Secondary Students in Ontario Network) helps
          Grade 11 and 12 students, and the adults helping them, find regulated health care careers
          you can start straight from high school, and connect with the professionals already
          working in them.
        </p>
      </header>

      <section aria-labelledby="who">
        <h2 id="who">Who built this</h2>
        <p>
          PAHSSION is a project developed by students of the{" "}
          <a href="https://trp.utoronto.ca" className="underline">
            Translational Research Program
          </a>{" "}
          at the University of Toronto, in partnership with allied health professionals who
          volunteer to talk with students.
        </p>
      </section>

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
          are shown separately. Results are listed in order, but we don&apos;t show a percentage or
          score: the list is a set of ideas to explore, not an instruction about what to pick. You
          can choose to see university programs (joint university–college programs count as
          university), college programs, or both. Prerequisites are checked against Grade 12
          courses. If you&apos;re in Grade 11, pick the Grade 12 courses you plan to take.
        </p>
      </section>

      <section aria-labelledby="privacy">
        <h2 id="privacy">Privacy</h2>
        <p>
          There are no accounts. Quiz answers stay on your device. They are stored in your browser
          and in the part of the results link after the <code>#</code>, which browsers never send to
          a server. We use cookieless analytics that count page views without identifying you. We
          also count anonymous clicks on LinkedIn, program, and coffee chat links, using a random ID
          that only lasts while your browser tab is open. We never store your IP address, name,
          email, or device details.
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

      <section aria-labelledby="terms-h" id="terms" className="scroll-mt-4">
        <h2 id="terms-h">Terms of use</h2>
        <p>By using this site, you agree to these terms.</p>
        <ol className="grid list-decimal gap-2 pl-5">
          <li>
            <strong>Information, not advice.</strong> Program details are a general guide. They are
            not academic, career, or medical advice. Always confirm with the school and your
            guidance counsellor.
          </li>
          <li>
            <strong>LinkedIn is a separate service.</strong> PAHSSION is not affiliated with or
            endorsed by LinkedIn. If you use LinkedIn to contact a partner, you must follow
            LinkedIn&apos;s{" "}
            <a href={linkedinUserAgreementUrl} className="underline">
              User Agreement
            </a>{" "}
            and{" "}
            <a href={linkedinCommunityPoliciesUrl} className="underline">
              Professional Community Policies
            </a>
            , including its minimum age of 16.
          </li>
          <li>
            <strong>Verified, volunteer partners.</strong> {partnerVerificationText} Partners
            volunteer their time, don&apos;t have to reply, and share their own views, not those of
            PAHSSION or the University of Toronto.
          </li>
          <li>
            <strong>All communication stays on LinkedIn.</strong> Every conversation with a partner,
            including coffee chats, must happen on LinkedIn. Students and partners must not exchange
            personal emails, phone numbers, or any other personal information. We don&apos;t host or
            monitor messages, and we aren&apos;t responsible for conversations on LinkedIn or
            elsewhere. Follow the{" "}
            <Link href="/connect#ground-rules" className="underline">
              ground rules
            </Link>{" "}
            and report anything that feels wrong.
          </li>
          <li>
            <strong>Use the directory respectfully.</strong> Don&apos;t use it to spam, harass,
            recruit, sell, or collect partners&apos; information.
          </li>
          <li>
            <strong>Changes.</strong> We may remove a listing, or update the site and these terms,
            at any time. Links to other websites are provided for convenience, and we aren&apos;t
            responsible for their content.
          </li>
        </ol>
      </section>

      <FeedbackPanel />

      <section aria-labelledby="report-h" id="report" className="scroll-mt-4">
        <h2 id="report-h">Report a problem</h2>
        <h3 className="text-lg font-semibold">An error on the site</h3>
        <p>
          Found something wrong or out of date? Tell us which page, what&apos;s wrong, and a link to
          the official source if you have one.
        </p>
        <h3 className="mt-2 text-lg font-semibold">A concern about a professional partner</h3>
        <p>
          If a partner made you uncomfortable, asked for personal information or money, asked to
          talk outside LinkedIn, or acted unprofessionally, tell us their name and what happened. We
          take every report seriously, and we may remove a partner from the directory while we look
          into it. You can also report the message or profile directly on LinkedIn. If you are ever
          in danger, call 911, and talk to a parent, guardian, or teacher you trust.
        </p>
        <p className="flex flex-wrap gap-x-6 gap-y-1">
          <a href={reportErrorHref("general")} className="underline">
            Report an error
          </a>
          <a
            href={reportErrorHref("partner", "Concern about a professional partner")}
            className="underline"
          >
            Report a concern about a partner
          </a>
        </p>
        <p className="text-muted-foreground">
          Or email us directly at{" "}
          <a href={`mailto:${reportEmail}`} className="underline">
            {reportEmail}
          </a>
          .
        </p>
        <p>
          <Link href="/" className="underline">
            Back to programs
          </Link>
        </p>
      </section>
    </div>
  );
}
