// components/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", disabled: false },
  { label: "Penawaran", href: "/penawaran", disabled: false },
  { label: "Nota", href: "/nota", disabled: false },
  { label: "Produk", href: "/produk", disabled: true },
  { label: "Pengaturan", href: "/pengaturan", disabled: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="w-60 bg-white border-r border-muted flex flex-col print:hidden">
      <div className="px-4 py-5">
        <h1 className="text-lg font-semibold text-primary">
          Penawaran Harga
        </h1>
        <p className="text-xs text-primary/70">Kreasi Mandiri Glass</p>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          
          if (item.disabled) {
            return (
              <div
                key={item.href}
                className="flex items-center px-3 py-2 rounded-md text-sm 
                  text-primary/40 cursor-not-allowed opacity-50"
                title="Fitur belum tersedia"
              >
                {item.label}
              </div>
            );
          }
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-md text-sm 
                ${active
                  ? "bg-primary text-light"
                  : "text-primary hover:bg-light"
                }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4">
        <button
          onClick={() =>
            signOut({
              callbackUrl: "/login",
            })
          }
          className="w-full text-left text-sm px-3 py-2 rounded-md bg-muted/40 text-primary hover:bg-muted"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}