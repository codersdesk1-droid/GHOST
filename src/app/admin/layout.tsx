import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getRole } from "@/lib/auth";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false } };

const NAV = [
  { href: "/admin", label: "Overview", owner: false },
  { href: "/admin/products", label: "Products", owner: false },
  { href: "/admin/orders", label: "Orders", owner: false },
  { href: "/admin/settings", label: "Settings", owner: true },
  { href: "/admin/staff", label: "Staff", owner: true },
];

// Navigation only. Every admin page and server action checks access itself.
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="mx-auto max-w-[1280px] px-5 pt-32 sm:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <p className="eyebrow">Store admin</p>
        <Suspense fallback={<span />}>
          <Nav />
        </Suspense>
      </div>
      <div className="py-10">{children}</div>
    </div>
  );
}

async function Nav() {
  const role = await getRole();
  if (!role) return null;
  return (
    <nav className="flex flex-wrap gap-1" aria-label="Admin">
      {NAV.filter((n) => !n.owner || role === "owner").map((n) => (
        <Link key={n.href} href={n.href} className="rounded-full px-4 py-2 text-sm text-bone/70 transition hover:bg-white/5 hover:text-bone">
          {n.label}
        </Link>
      ))}
      <span className="ml-2 self-center rounded-full border border-line px-3 py-1 text-[0.65rem] tracking-[0.15em] text-mist uppercase">{role}</span>
    </nav>
  );
}
