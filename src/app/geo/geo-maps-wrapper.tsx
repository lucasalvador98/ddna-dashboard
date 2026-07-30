'use client';

import dynamic from 'next/dynamic';

const GeoMaps = dynamic(() => import('@/components/geo-maps'), { ssr: false });

export default GeoMaps;
