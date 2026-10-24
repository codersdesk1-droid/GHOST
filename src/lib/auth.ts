import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

/** Emails allowed into /admin, from ADMIN_EMAILS (comma separated). */
function adminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function isAdmin() {
  const { isAuthenticated } = await auth();
  if (!isAuthenticated) return false;
  const user = await currentUser();
  const allowed = adminEmails();
  return !!user?.emailAddresses.some(
    (e) => e.verification?.status === "verified" && allowed.includes(e.emailAddress.toLowerCase()),
  );
}

/**
 * Gate for every admin page and server action. Signed-out visitors go to sign-in;
 * signed-in non-admins get a 404 so the admin area stays invisible.
 */
export async function requireAdmin() {
  const { isAuthenticated, redirectToSignIn } = await auth();
  if (!isAuthenticated) return redirectToSignIn();
  if (!(await isAdmin())) notFound();
}
