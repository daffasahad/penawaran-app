// app/(protected)/layout.tsx
import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import Footer from "@/components/Footer";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-light flex flex-col md:flex-row">

      {/* ========== MOBILE TOGGLE (MUST BE TOP LEVEL) ========== */}
      <input id="menu-toggle" type="checkbox" className="hidden peer" />

      {/* Mobile Header */}
      <label
        htmlFor="menu-toggle"
        className="md:hidden p-4 bg-primary text-white flex items-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
        Menu
      </label>

      {/* Mobile Drawer */}
      <div className="
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg
          -translate-x-full peer-checked:translate-x-0
          transition-transform md:hidden
      ">
        <Sidebar />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block border-r">
        <Sidebar />
      </div>

      {/* Content */}
      <main className="flex-1 flex flex-col p-4 md:p-6">
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
}
