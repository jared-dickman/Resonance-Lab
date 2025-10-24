'use client';

import { Breadcrumbs } from '@/components/Breadcrumbs';

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="container mx-auto p-4">
        <Breadcrumbs />
      </div>
      {children}
    </>
  );
}
