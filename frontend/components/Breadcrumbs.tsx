'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSongs } from '@/lib/SongsContext';
import { useMemo } from 'react';

export function Breadcrumbs() {
  const pathname = usePathname();
  const { songs } = useSongs();
  const pathSegments = pathname.split('/').filter(segment => segment);

  const breadcrumbs = useMemo(() => {
    const crumbs = [{ label: 'Home', href: '/' }];

    pathSegments.forEach((segment, index) => {
      const href = '/' + pathSegments.slice(0, index + 1).join('/');
      let label = segment.replace(/_/g, ' ').replace(/-/g, ' ');

      // Special handling for songs route
      if (pathSegments[0] === 'songs') {
        if (index === 1) {
          // Artist slug
          const song = songs.find(s => s.artistSlug === segment);
          label =
            song?.artist ||
            label
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
        } else if (index === 2) {
          // Song slug
          const artistSlug = pathSegments[1];
          const song = songs.find(s => s.artistSlug === artistSlug && s.songSlug === segment);
          label =
            song?.title ||
            label
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
        } else {
          label = label
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }
      } else {
        label = label
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }

      crumbs.push({ label, href });
    });

    return crumbs;
  }, [pathname, songs]);

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.href} className="inline-flex items-center">
            {index > 0 && (
              <svg
                className="w-3 h-3 text-muted-foreground/50 mx-1.5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
            )}
            {index === breadcrumbs.length - 1 ? (
              <span className="text-xs font-medium text-foreground">{breadcrumb.label}</span>
            ) : (
              <Link
                href={breadcrumb.href}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {breadcrumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
