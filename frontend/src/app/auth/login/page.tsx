'use client';
import Login from './Login';
import { useGlobalContext } from '../../GlobalContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { restaurantSlug } from '../../../restaurantSlug';

export default function LoginPage() {
  const { isAuthenticated, restaurantId, restaurantName } = useGlobalContext();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      // Enter the app under the restaurant's own slug, e.g. /kitchen/la-parrilla/mesas.
      router.push(`/kitchen/${restaurantSlug(restaurantName, restaurantId)}/mesas`);
    }
  }, [isAuthenticated, restaurantName, restaurantId, router]);

  return <Login />;
}
