'use client';

import { useAuth } from '@/contexts/AuthContext';
import InventarioApp from '@/components/InventarioApp';
import LoginForm from '@/components/LoginForm';

export default function AppWrapper() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-lg font-medium text-gray-700">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <InventarioApp />;
}