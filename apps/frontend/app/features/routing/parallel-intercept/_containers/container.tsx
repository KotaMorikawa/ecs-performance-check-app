'use client';

import { useEffect, useState } from 'react';
import { ParallelInterceptPresentational } from './presentational';

export function ParallelInterceptContainer() {
  const [renderTime, setRenderTime] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);
  const [parallelContent, setParallelContent] = useState<'analytics' | 'team' | 'settings'>('analytics');

  useEffect(() => {
    const startTime = performance.now();
    const endTime = performance.now();
    setRenderTime(endTime - startTime);
  }, []);

  return (
    <ParallelInterceptPresentational
      renderTime={renderTime}
      showModal={showModal}
      parallelContent={parallelContent}
      onShowModal={setShowModal}
      onParallelContentChange={setParallelContent}
    />
  );
}