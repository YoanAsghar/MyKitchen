'use client';
import Login from './Login';
import { useGlobalContext } from '../../GlobalContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { isAuthenticated, restaurantId } = useGlobalContext();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push(`/kitchen/${restaurantId || 1}/mesas`);
    }
  }, [isAuthenticated, restaurantId, router]);

  return <Login />;
}
