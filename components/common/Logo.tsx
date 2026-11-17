import { siteLongName, siteName } from "@/lib/site";

/**
 * PAHSSION logo: a stethoscope shaped like a "P" (earpieces, joint, tube, chest piece),
 * plus a wordmark whose "O" is a chest piece with a heart inside.
 * Strokes use `currentColor`; set `accent` / `heart` for the coloured parts.
 */

const HEART_PATH =
  "M50 72 C33 62 26 53 27 44 C28 35 37 31 44 35 C47 37 49 39 50 41 C51 39 53 37 56 35 C63 31 72 35 73 44 C74 53 67 62 50 72 Z";

export function LogoMark({
  className,
  accent = "#007fa3",
}: {
  className?: string;
  accent?: string;
}) {
  return (
    <svg viewBox="0 -4 100 104" className={className} aria-hidden fill="currentColor">
      <path d="M32 30 L17 7" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="15" cy="4" rx="7.5" ry="5" transform="rotate(57 15 4)" />
      <path
        d="M32 30 C32 16 40 8 52 8 C66 8 76 18 76 30 C76 42 66 50 56 50"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <ellipse cx="50" cy="50" rx="7.5" ry="5" />
      <circle cx="32" cy="32" r="6" />
      <path d="M32 36 L32 70" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
      <rect x="28" y="67" width="8" height="7" rx="1" />
      <circle cx="32" cy="84" r="13" />
      <circle cx="32" cy="84" r="8" fill={accent} />
    </svg>
  );
}

/** "PAHSSION" with the O drawn as a chest piece holding a heart. Inherits font size and colour. */
export function LogoWordmark({
  className,
  heart = "#dc4633",
}: {
  className?: string;
  heart?: string;
}) {
  return (
    <span className={className}>
      <span className="sr-only">{siteName}</span>
      <span aria-hidden className="whitespace-nowrap">
        PAHSSI
        <svg
          viewBox="0 -14 100 114"
          fill="currentColor"
          className="mx-[0.02em] inline-block h-[0.866em] w-[0.76em] align-[-0.03em]"
        >
          <rect x="43" y="-14" width="14" height="13" rx="3" />
          <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="15" />
          <path d={HEART_PATH} fill={heart} />
        </svg>
        N
      </span>
    </span>
  );
}

/** The long name with each acronym letter emphasised (skips "and"). */
export function LogoLongName({ className, letterClassName }: { className?: string; letterClassName?: string }) {
  const words = siteLongName.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={i}>
          {i > 0 && " "}
          {word.toLowerCase() === "and" ? (
            word
          ) : (
            <>
              <strong className={letterClassName}>{word[0]}</strong>
              {word.slice(1)}
            </>
          )}
        </span>
      ))}
    </span>
  );
}
