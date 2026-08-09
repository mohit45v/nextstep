import type { Metadata } from "next";

/**
 * The /aptitude index page is a client component, so its title lives here.
 *
 * The template has to be restated: a nested layout that sets a plain string
 * title does not pass the root template down to its own children, so
 * /aptitude/companies was rendering as "Company tests" with no suffix.
 */
export const metadata: Metadata = {
  title: { default: "Aptitude", template: "%s · NextStep" },
};

export default function AptitudeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
