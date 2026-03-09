"use client";

import { useState, useEffect } from "react";
import type { Session } from "next-auth";
import DashboardShell from "./DashboardShell";

function LoadingPlaceholder() {
  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <div className="h-14 bg-(--mining-sentry-black)" />
      <main className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto w-full">
        <div className="animate-pulse h-6 sm:h-8 bg-slate-200 rounded w-32 sm:w-48 mb-4 sm:mb-6" />
        <div className="animate-pulse h-4 bg-slate-200 rounded w-full max-w-xl" />
      </main>
    </div>
  );
}

export default function DashboardClient({
  user,
  children,
}: {
  user: Session["user"];
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!mounted) {
    return <LoadingPlaceholder />;
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
