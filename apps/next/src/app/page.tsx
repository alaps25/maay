'use client';

import { BabyApp } from '@baby/app';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', width: '100%' }}>
      <BabyApp locale="en" />
    </main>
  );
}
