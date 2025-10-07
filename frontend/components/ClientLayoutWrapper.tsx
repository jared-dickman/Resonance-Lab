"use client";

import { Breadcrumbs } from "./Breadcrumbs";
import QueryProvider from "@/lib/QueryProvider";

export function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <div className="container mx-auto p-4">
        <Breadcrumbs />
      </div>
      {children}
    </QueryProvider>
  );
}
