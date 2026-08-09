import type { Metadata } from "next";
import DSAPage from "@/components/dsa/DSAPage";

export const metadata: Metadata = {
  title: "DSA problems",
  description:
    "Data Structures & Algorithms problem browser for all engineering branches with live Codeforces API integration.",
};

export default function Page() {
  return <DSAPage />;
}
