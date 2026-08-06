'use client';

import { useContext } from 'react';
import { LocaleContext } from './LocaleProvider';

export function useTranslation() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useTranslation must be used within LocaleProvider');
  }
  return context;
}
