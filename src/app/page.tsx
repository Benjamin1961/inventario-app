import { AuthProvider } from '@/contexts/AuthContext';
import AppWrapper from '@/components/AppWrapper';

export default function Home() {
  return (
    <AuthProvider>
      <AppWrapper />
    </AuthProvider>
  );
}
