import { useNavigate } from 'react-router-dom';
import { Shield, Eye, Clock } from 'lucide-react';
import { Header } from '@/components/Header';
import { FeatureCard } from '@/components/FeatureCard';
import { StatCard } from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useStats } from '@/hooks/useStats';
import { Skeleton } from '@/components/ui/skeleton';

export function LandingPage() {
  const navigate = useNavigate();
  const { stats, loading } = useStats();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-12">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div>
              <h1 className="text-4xl font-bold leading-tight text-foreground lg:text-5xl">
                Secure Blockchain Voting System
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Experience the future of democratic participation with our transparent, secure, and tamper-proof blockchain-based voting platform designed for ACS College students.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <FeatureCard
                icon={Shield}
                title="Tamper-Proof"
                description="Votes secured on blockchain"
              />
              <FeatureCard
                icon={Eye}
                title="Transparent"
                description="Real-time public verification"
              />
              <FeatureCard
                icon={Clock}
                title="Real-Time"
                description="Instant vote counting"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {loading ? (
                <>
                  <Skeleton className="h-20 rounded-xl" />
                  <Skeleton className="h-20 rounded-xl" />
                  <Skeleton className="h-20 rounded-xl" />
                </>
              ) : (
                <>
                  <StatCard
                    value={stats.totalUsers}
                    label="Registered Users"
                    variant="compact"
                  />
                  <StatCard
                    value={stats.totalVotes}
                    label="Total Votes Cast"
                    variant="compact"
                  />
                  <StatCard
                    value={stats.activeElections}
                    label="Active Elections"
                    variant="compact"
                  />
                </>
              )}
            </div>
          </div>

          {/* Right Content - Login CTA */}
          <div className="lg:pl-8">
            <Card className="border-2">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Welcome to BlockVote</CardTitle>
                <CardDescription>
                  Secure, transparent, and verifiable voting for ACS College
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => navigate('/auth')}
                >
                  Login to Vote
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="lg"
                  onClick={() => navigate('/auth')}
                >
                  Create Account
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}