'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSongs } from '@/lib/SongsContext';
import { useMemo } from 'react';

/** Signal wave separator - audio wave transmitting left to right */
function SignalWave({ interactive = false }: { interactive?: boolean }) {
  const baseClasses = "inline-flex items-center justify-center mx-2.5";
  const interactiveClasses = interactive
    ? "opacity-50 hover:opacity-80 transition-opacity cursor-pointer"
    : "opacity-35";

  return (
    <span
      className={`${baseClasses} ${interactiveClasses}`}
      aria-hidden={!interactive}
    >
      <svg
        width="18"
        height="12"
        viewBox="0 0 18 12"
        fill="none"
        className="text-primary"
      >
        {/* Signal wave - perfectly centered, evenly spaced bars */}
        <line x1="1" y1="5" x2="1" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="5" y1="4" x2="5" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="9" y1="2" x2="9" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="13" y1="4" x2="13" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="17" y1="5" x2="17" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </span>
  );
}

/**
 * Agent-first navigation - minimal, mobile-optimized
 * Wave separator doubles as back button when on deep pages
 * Clean, futuristic, no clutter
 */
export function Breadcrumbs() {
  const pathname = usePathname();
  const { songs } = useSongs();
  const pathSegments = pathname.split('/').filter(segment => segment);

  const { currentLabel, parentHref, parentLabel } = useMemo(() => {
    if (pathSegments.length === 0) {
      return { currentLabel: 'Songs', parentHref: null, parentLabel: null };
    }

    let current = '';
    let parent: { href: string; label: string } | null = null;

    // Build parent info
    if (pathSegments.length > 1) {
      const parentPath = '/' + pathSegments.slice(0, -1).join('/');
      let pLabel = pathSegments[pathSegments.length - 2].replace(/_/g, ' ').replace(/-/g, ' ');

      // Resolve artist name
      if (pathSegments[0] === 'songs' && pathSegments.length === 3) {
        const artistSlug = pathSegments[1];
        const song = songs.find(s => s.artistSlug === artistSlug);
        pLabel = song?.artist || pLabel.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      } else {
        pLabel = pLabel.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      }

      parent = { href: parentPath, label: pLabel };
    } else {
      // Single segment - parent is home
      parent = { href: '/', label: 'Home' };
    }

    // Build current label
    const lastSegment = pathSegments[pathSegments.length - 1];
    current = lastSegment.replace(/_/g, ' ').replace(/-/g, ' ');

    if (pathSegments[0] === 'songs') {
      if (pathSegments.length === 2) {
        // Artist page
        const song = songs.find(s => s.artistSlug === lastSegment);
        current = song?.artist || current.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      } else if (pathSegments.length === 3) {
        // Song page
        const artistSlug = pathSegments[1];
        const song = songs.find(s => s.artistSlug === artistSlug && s.songSlug === lastSegment);
        current = song?.title || current.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      }
    } else {
      current = current.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    return {
      currentLabel: current,
      parentHref: parent?.href || null,
      parentLabel: parent?.label || null,
    };
  }, [pathname, songs, pathSegments]);

  // Home page - static wave, no navigation
  if (!parentHref) {
    return (
      <nav className="flex items-center min-w-0" aria-label="Navigation">
        <SignalWave />
        <span className="text-lg font-semibold text-foreground">Songs</span>
      </nav>
    );
  }

  // Deep page - wave is clickable back button
  return (
    <nav className="flex items-center min-w-0" aria-label="Navigation">
      <Link href={parentHref} aria-label={`Back to ${parentLabel}`}>
        <SignalWave interactive />
      </Link>
      <span className="text-lg font-semibold text-foreground truncate">
        {currentLabel}
      </span>
    </nav>
  );
}
