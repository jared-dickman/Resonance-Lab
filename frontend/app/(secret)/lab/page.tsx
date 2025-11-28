'use client';

import { useEffect, useState } from 'react';
import { apiRoutes } from '@/app/config/apiRoutes';
import { env } from '@/app/config/env';
// eslint-disable-next-line boundaries/element-types -- package.json read for version display
import packageJson from '../../../package.json';

interface LabStatus {
  message: string;
  status: string;
  environment: string;
  backend: string;
  secret: string;
}

export default function ChordLabPage() {
  const [labStatus, setLabStatus] = useState<LabStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(apiRoutes.lab)
      .then((res) => res.json())
      .then(setLabStatus)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-black text-red-500 p-8 font-mono">
        <pre>ERROR: {error}</pre>
      </div>
    );
  }

  if (!labStatus) {
    return (
      <div className="min-h-screen bg-black text-green-500 p-8 font-mono">
        <pre>Connecting to the lab...</pre>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-500 p-8 font-mono">
      <pre className="text-xl mb-8">{labStatus.message}</pre>
      <div className="space-y-2 text-sm">
        <pre>┌────────────────────────────────────┐</pre>
        <pre>│ STATUS: {labStatus.status.padEnd(26)}│</pre>
        <pre>│ ENV:    {labStatus.environment.padEnd(26)}│</pre>
        <pre>│ {labStatus.backend.padEnd(35)}│</pre>
        <pre>├────────────────────────────────────┤</pre>
        <pre>│ {labStatus.secret.padEnd(35)}│</pre>
        <pre>├────────────────────────────────────┤</pre>
        <pre>│ VERSION: {`v${packageJson.version}`.padEnd(25)}│</pre>
        <pre>│ BUILD:   {(env.NEXT_PUBLIC_BUILD_TIME ?? 'dev').padEnd(25)}│</pre>
        <pre>└────────────────────────────────────┘</pre>
      </div>
      <div className="mt-12 text-gray-600 text-xs">
        <pre>// This page is not linked anywhere.</pre>
        <pre>// If you found it, you know what to do.</pre>
      </div>
    </div>
  );
}
