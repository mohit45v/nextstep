import type { Metadata } from "next";
import { requireProfileUser } from "@/lib/session";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { Card, Container, PageHeader } from "@/components/ui";
import { updateProfile } from "./actions";

export const metadata: Metadata = { title: "Your profile" };

/** Fields Google owns — shown read-only, because editing them here would just
 *  be overwritten at the next sign-in. */
const ROLE_LABELS: Record<string, string> = {
  STUDENT: "Student",
  FACULTY: "Faculty",
  TPO: "Placement officer",
  ADMIN: "Administrator",
};

export default async function ProfilePage() {
  const user = await requireProfileUser();

  return (
    <Container className="max-w-3xl">
      <PageHeader
        title="Your profile"
        description="Branch, graduation year and roll number. Your name and email come from your college Google account."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_16rem]">
        <Card className="p-6">
          <h2 className="text-base font-semibold">College details</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Changing your branch changes which DSA sheet and leaderboard you see.
          </p>

          <div className="mt-6">
            <ProfileForm
              action={updateProfile}
              initial={{
                branch: user.branch,
                gradYear: user.gradYear,
                rollNumber: user.rollNumber,
              }}
              submitLabel="Save changes"
              pendingLabel="Saving…"
            />
          </div>
        </Card>

        <aside className="space-y-4">
          <Card className="p-5">
            <h2 className="text-sm font-semibold">Account</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <Row label="Name" value={user.name ?? "—"} />
              <Row label="Email" value={user.email} />
              <Row label="Role" value={ROLE_LABELS[user.role] ?? user.role} />
              <Row label="AI credits" value={String(user.credits)} />
            </dl>
            <p className="mt-4 border-t border-line pt-3.5 text-xs leading-relaxed text-ink-subtle">
              Name and email are managed by Google Workspace. Ask IT to change
              them on your college account.
            </p>
          </Card>
        </aside>
      </div>
    </Container>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-subtle">{label}</dt>
      <dd className="mt-0.5 break-words font-medium text-ink">{value}</dd>
    </div>
  );
}
