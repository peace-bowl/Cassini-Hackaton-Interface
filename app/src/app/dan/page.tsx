'use client';

import dynamic from 'next/dynamic';

const SatelliteDashboard = dynamic(() => import('@/components/SatelliteDashboard'), {
  ssr: false,
});

export default function DanPage() {
  return <SatelliteDashboard />;
}
