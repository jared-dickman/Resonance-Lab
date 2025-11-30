import type { Metadata } from 'next';
import { APP_NAME } from '@/app/config/app';

export const metadata: Metadata = {
  title: APP_NAME,
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return children;
}
