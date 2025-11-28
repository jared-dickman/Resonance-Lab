'use client';

import { useEffect, useState } from 'react';

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
    fetch('/api/lab')
      .then((res) => res.json())
      .then(setLabStatus)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-black text-[#ef4444] p-8 font-mono">
        <pre className="transition-all duration-300">ERROR: {error}</pre>
      </div>
    );
  }

  if (!labStatus) {
    return (
      <div className="min-h-screen bg-black text-sapphire-400 p-8 font-mono">
        <pre className="transition-all duration-300 animate-pulse">Connecting to the lab...</pre>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-sapphire-400 p-8 font-mono">
      <pre className="text-xl mb-8 transition-all duration-200">{labStatus.message}</pre>
      <div className="space-y-2 text-sm border border-sapphire-500/10 rounded-lg p-6 bg-[#020924]/20 hover:border-sapphire-500/30 transition-all duration-200 hover:shadow-lg hover:shadow-sapphire-500/10">
        <pre>┌────────────────────────────────────┐</pre>
        <pre>│ STATUS: {labStatus.status.padEnd(26)}│</pre>
        <pre>│ ENV:    {labStatus.environment.padEnd(26)}│</pre>
        <pre>│ {labStatus.backend.padEnd(35)}│</pre>
        <pre>├────────────────────────────────────┤</pre>
        <pre>│ {labStatus.secret.padEnd(35)}│</pre>
        <pre>└────────────────────────────────────┘</pre>
      </div>
      <div className="mt-12 text-sapphire-300/40 text-xs">
        <pre>// This page is not linked anywhere.</pre>
        <pre>// If you found it, you know what to do.</pre>
      </div>
    </div>
  );
}
