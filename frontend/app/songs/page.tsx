import { redirect } from 'next/navigation';
import { pageRoutes } from '@/lib/routes';

export default function SongsPage() {
  redirect(pageRoutes.home);
}
