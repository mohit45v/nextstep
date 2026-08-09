import type { Metadata } from "next";
import DashboardMain from "@/components/dashboard/DashboardMain";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <DashboardMain
      user={{
        name: user.name ?? user.email ?? "Student",
        credits: user.credits,
      }}
    />
  );
}
