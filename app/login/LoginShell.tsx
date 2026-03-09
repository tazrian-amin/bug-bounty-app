"use client";

import { useState, useEffect } from "react";
import LoginForm from "./LoginForm";

export default function LoginShell() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Plain placeholder until after hydration so server and client match
  // and we avoid MUI/Emotion style injection order mismatch.
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-500">
        Loading…
      </div>
    );
  }

  return <LoginForm />;
}
