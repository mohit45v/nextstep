import type { Metadata } from "next";
import { Playground } from "@/components/playground/Playground";
import { getCodeRunner } from "@/lib/code-runner";
import { requireProfileUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Playground",
  description: "Write and run code in a sandboxed judge.",
};

/**
 * Whether a runner exists is decided on the server and passed down, so the
 * screen can explain the setup instead of letting a student press Run and get a
 * confusing failure.
 */
export default async function PlaygroundPage() {
  await requireProfileUser();
  const runner = getCodeRunner();

  return <Playground configured={runner.configured} runnerName={runner.name} />;
}
