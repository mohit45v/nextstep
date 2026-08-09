import { signOut } from "@/lib/auth";

/**
 * Server component wrapping a POST form — sign-out must not be a GET link, or
 * a page prefetch or an <img> tag could log the user out.
 */
export function SignOutButton({ className }: { className?: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <button
        type="submit"
        className={
          className ??
          "cursor-pointer rounded-lg border border-[#262F40] px-3 py-1.5 text-sm text-slate-300 transition hover:border-red-800 hover:bg-red-950/40 hover:text-red-300"
        }
      >
        Sign out
      </button>
    </form>
  );
}
