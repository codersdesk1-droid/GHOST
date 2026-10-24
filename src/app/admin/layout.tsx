import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin · Ghost™" }, robots: { index: false } };

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products & stock" },
  { href: "/admin/orders", label: "Orders" },
];

// Navigation only. Every admin page and server action checks access itself.
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="mx-auto max-w-[1280px] px-5 pt-32 sm:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <p className="eyebrow">Ghost™ admin</p>
        <nav className="flex flex-wrap gap-1" aria-label="Admin">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-full px-4 py-2 text-sm text-bone/70 transition hover:bg-white/5 hover:text-bone">
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="py-10">{children}</div>
    </div>
  );
}
