"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-slate-50">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-slate-950">Application error</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              The portal encountered a critical error. Reset the app state to continue.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button onClick={reset} className="bg-blue-600 text-white hover:bg-blue-700">
                Retry
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
