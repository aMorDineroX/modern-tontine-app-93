import React, { Suspense, lazy, ComponentType, LazyExoticComponent } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyLoadProps<T> {
  component: LazyExoticComponent<ComponentType<T>>;
  props: T;
  fallback?: React.ReactNode;
}

/**
 * Composant pour charger paresseusement un composant
 * 
 * @component
 * @template T - Type des propriétés du composant
 * @param {LazyLoadProps<T>} props - Propriétés du composant
 * @returns {JSX.Element} Composant LazyLoad
 */
function LazyLoad<T>({ component: Component, props, fallback }: LazyLoadProps<T>): JSX.Element {
  return (
    <Suspense fallback={fallback || <DefaultFallback />}>
      <Component {...props} />
    </Suspense>
  );
}

/**
 * Composant de chargement par défaut
 * 
 * @component
 * @returns {JSX.Element} Composant DefaultFallback
 */
const DefaultFallback: React.FC = () => (
  <div className="w-full space-y-4 p-4">
    <Skeleton className="h-8 w-3/4" />
    <Skeleton className="h-32 w-full" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  </div>
);

/**
 * Fonction pour créer un composant chargé paresseusement
 * 
 * @template T - Type des propriétés du composant
 * @param {() => Promise<{ default: ComponentType<T> }>} importFn - Fonction d'importation du composant
 * @returns {LazyExoticComponent<ComponentType<T>>} Composant chargé paresseusement
 */
export function createLazyComponent<T>(
  importFn: () => Promise<{ default: ComponentType<T> }>
): LazyExoticComponent<ComponentType<T>> {
  return lazy(importFn);
}

export default LazyLoad;
