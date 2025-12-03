'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSongs } from '@/lib/SongsContext';
import { useMemo } from 'react';

function SignalWave() {
  return (
    <span className="inline-flex items-center justify-center mx-5 opacity-50" aria-hidden>
      <svg width="24" height="16" viewBox="0 0 18 12" fill="none" className="text-foreground">
        <line x1="1" y1="5" x2="1" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="5" y1="4" x2="5" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="9" y1="2" x2="9" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="13" y1="4" x2="13" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="17" y1="5" x2="17" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </span>
  );
}

interface Crumb {
  label: string;
  href: string;
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const { songs } = useSongs();

  const crumbs = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const result: Crumb[] = [];

    // Don't add Jamium - logo already shows it
    if (segments.length === 0) return result;

    // Map routes to friendly names
    const routeLabels: Record<string, string> = {
      songs: 'Repertoire',
      repertoire: 'Repertoire',
      artists: 'Repertoire',
      jam: 'Jam',
      studio: 'Studio',
      composer: 'Compose',
      'music-theory': 'Theory',
    };

    // Handle song paths: /songs/[artist]/[song]
    if (segments[0] === 'songs') {
      result.push({ label: 'Repertoire', href: '/repertoire' });

      const artistSlug = segments[1];
      if (artistSlug) {
        const song = songs.find(s => s.artistSlug === artistSlug);
        const artistName = song?.artist ?? artistSlug.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        result.push({ label: artistName, href: `/songs/${artistSlug}` });

        const songSlug = segments[2];
        if (songSlug) {
          const matchedSong = songs.find(s => s.artistSlug === artistSlug && s.songSlug === songSlug);
          const songTitle = matchedSong?.title ?? songSlug.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          result.push({ label: songTitle, href: `/songs/${artistSlug}/${songSlug}` });
        }
      }
    } else {
      // Other routes
      const firstSegment = segments[0];
      if (firstSegment) {
        const label = routeLabels[firstSegment] ?? firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1);
        result.push({ label, href: `/${firstSegment}` });
      }
    }

    return result;
  }, [pathname, songs]);

  const lastCrumb = crumbs[crumbs.length - 1];

  // Home page - no breadcrumb needed, logo is enough
  if (crumbs.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center min-w-0" aria-label="Navigation">
      {/* Desktop: Full breadcrumb path */}
      <div className="hidden md:flex items-center">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <span key={crumb.href} className="flex items-center">
              <SignalWave />
              {isLast ? (
                <span className="text-xl font-bold text-foreground/90">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="text-xl font-bold text-foreground/60 hover:text-foreground/80 transition-colors">
                  {crumb.label}
                </Link>
              )}
            </span>
          );
        })}
      </div>

      {/* Mobile: Last item only */}
      <div className="flex md:hidden items-center">
        <SignalWave />
        <span className="text-xl font-bold text-foreground/90">{lastCrumb?.label}</span>
      </div>
    </nav>
  );
}
