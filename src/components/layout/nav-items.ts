/**
 * The single source of truth for app navigation.
 *
 * Every entry here must resolve to a route that exists. The previous drawer
 * listed sixteen destinations — mock interviews, alumni network, resume ATS and
 * so on — that all pointed at /dsa, so most clicks silently went to the wrong
 * page. If a feature is not built, it does not belong in this list.
 */
export interface NavItem {
  href: string;
  label: string;
  /** lucide-react icon name, resolved in NavDrawer. */
  icon: string;
}

export interface NavSection {
  heading: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    heading: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
      { href: "/profile", label: "Your profile", icon: "UserRound" },
    ],
  },
  {
    heading: "Aptitude",
    items: [
      { href: "/aptitude", label: "Overview", icon: "Compass" },
      { href: "/aptitude/practice", label: "Topic practice", icon: "BookOpen" },
      { href: "/aptitude/companies", label: "Company tests", icon: "Building2" },
      { href: "/aptitude/formulas", label: "Formula sheets", icon: "Sigma" },
      { href: "/aptitude/analytics", label: "Your progress", icon: "ChartBar" },
    ],
  },
  {
    heading: "Coding",
    items: [{ href: "/dsa", label: "DSA problems", icon: "Binary" }],
  },
];

/** Flat list, used for active-route matching. */
export const ALL_NAV_ITEMS = NAV_SECTIONS.flatMap((s) => s.items);
