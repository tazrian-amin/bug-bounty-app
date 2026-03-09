"use client";

import type { Session } from "next-auth";
import DashboardNav from "./DashboardNav";

export default function DashboardShell({
  user,
  children,
}: {
  user: Session["user"];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <DashboardNav user={user} />
      <main className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto w-full box-border">{children}</main>
    </div>
  );
}
