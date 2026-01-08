import { useAuth } from '@/hooks/useAuth';
import { LandingPage } from '@/components/LandingPage';
import { VoterDashboard } from '@/components/dashboard/VoterDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 text-center">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  if (isAdmin) {
    return <AdminDashboard />;
  }

  return <VoterDashboard />;
};

export default Index;
