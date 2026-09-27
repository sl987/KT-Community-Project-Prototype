/**
 * Removes anything that could carry quiz answers from a URL before it is sent
 * to analytics: the fragment always, and the query string on quiz results pages.
 */
export function stripPrivateUrl(href: string): string {
  const url = new URL(href);
  url.hash = "";
  if (url.pathname.startsWith("/quiz/results")) url.search = "";
  return url.toString();
}
