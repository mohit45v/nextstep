import type { Metadata } from "next";
import DSAPage from "./DSAPage";

export const metadata: Metadata = {
  title: "DSA Practice Hub | Nextstep",
  description:
    "Data Structures & Algorithms problem browser for all engineering branches with live Codeforces API integration.",
};

export default function Page() {
  return <DSAPage />;
}
