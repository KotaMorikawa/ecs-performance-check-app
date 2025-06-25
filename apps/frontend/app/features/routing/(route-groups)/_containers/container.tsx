'use client';

import { useEffect, useState } from 'react';
import { PublicPresentational } from './presentational';

export function PublicContainer() {
  const [renderTime, setRenderTime] = useState<number>(0);

  useEffect(() => {
    const startTime = performance.now();
    const endTime = performance.now();
    setRenderTime(endTime - startTime);
  }, []);

  return <PublicPresentational renderTime={renderTime} />;
}