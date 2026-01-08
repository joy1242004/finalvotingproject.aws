import { useState } from 'react';
import { Vote, CheckCircle, Users, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { StatCard } from '@/components/StatCard';
import { BlockchainStatus } from '@/components/BlockchainStatus';
import { ElectionCard } from '@/components/ElectionCard';
import { ProfileForm } from '@/components/ProfileForm';
import { VotingModal } from '@/components/VotingModal';
import { PublicLedgerTable } from '@/components/PublicLedgerTable';
import { MyVoteVerification } from '@/components/MyVoteVerification';
import { OnChainVotesTable } from '@/components/OnChainVotesTable';
import { useAuth } from '@/hooks/useAuth';
import { useElections, Election } from '@/hooks/useElections';
import { useVotes } from '@/hooks/useVotes';
import { useWallet } from '@/hooks/useWallet';
import { Skeleton } from '@/components/ui/skeleton';

export function VoterDashboard() {
  const { user, profile } = useAuth();
  const { elections, loading: electionsLoading } = useElections();
  const { votes, hasVotedInElection } = useVotes(user?.id);
  const { isConnected, formatAddress, address } = useWallet();
  const [activeView, setActiveView] = useState('home');
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [showVotingModal, setShowVotingModal] = useState(false);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const activeElections = elections.filter(e => e.status === 'active');

  const handleVote = (electionId: string) => {
    const election = elections.find((e) => e.id === electionId);
    if (election) {
      setSelectedElection(election);
      setShowVotingModal(true);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'home':
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Welcome back, <span className="text-primary">{displayName}</span>!
                </h1>
                <p className="text-muted-foreground">Your secure blockchain voting dashboard</p>
              </div>
              <Button onClick={() => setActiveView('elections')}>
                <Vote className="mr-2 h-4 w-4" />
                Vote Now
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={Vote}
                value={activeElections.length}
                label="Active Elections"
                change="Available for voting"
              />
              <StatCard
                icon={CheckCircle}
                value={votes.length}
                label="Votes Cast"
                change="Your participation"
              />
              <StatCard
                icon={Users}
                value="496"
                label="Total Participants"
                change="Growing community"
                positive
              />
              <StatCard
                icon={Wallet}
                value={isConnected ? formatAddress(address) : 'Not Connected'}
                label="Wallet Status"
                change={isConnected ? 'Ready to vote' : 'Connect to verify'}
                positive={isConnected}
              />
            </div>

            <BlockchainStatus />
          </div>
        );

      case 'elections':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Active Elections</h1>
              <p className="text-muted-foreground">Participate in ongoing elections</p>
            </div>
            {electionsLoading ? (
              <div className="grid gap-6 lg:grid-cols-2">
                {[1, 2].map(i => <Skeleton key={i} className="h-64" />)}
              </div>
            ) : activeElections.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No active elections at the moment.
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                {activeElections.map((election) => (
                  <ElectionCard 
                    key={election.id} 
                    election={election} 
                    onVote={handleVote}
                    hasVoted={hasVotedInElection(election.id)}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case 'history':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Voting History</h1>
              <p className="text-muted-foreground">Your previous voting activities</p>
            </div>
            {votes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                You haven't cast any votes yet.
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Election</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Transaction</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Block</th>
                    </tr>
                  </thead>
                  <tbody>
                    {votes.map((vote) => {
                      const election = elections.find(e => e.id === vote.election_id);
                      return (
                        <tr key={vote.id} className="border-b border-border last:border-0">
                          <td className="px-4 py-3 text-sm text-card-foreground">
                            {new Date(vote.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-card-foreground">
                            {election?.title || 'Unknown Election'}
                          </td>
                          <td className="px-4 py-3">
                            <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                              {vote.transaction_hash?.slice(0, 16)}...
                            </code>
                          </td>
                          <td className="px-4 py-3 text-sm text-primary">
                            #{vote.block_number}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'results':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Election Results</h1>
              <p className="text-muted-foreground">Real-time election results and analytics</p>
            </div>
            {elections.filter(e => e.status === 'completed' || e.status === 'active').map(election => (
              <div key={election.id} className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-semibold text-lg mb-4">{election.title}</h3>
                <div className="space-y-3">
                  {election.candidates?.map(candidate => {
                    const totalVotes = election.candidates?.reduce((sum, c) => sum + (c.votes_count || 0), 0) || 1;
                    const percentage = totalVotes > 0 ? ((candidate.votes_count || 0) / totalVotes * 100) : 0;
                    return (
                      <div key={candidate.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{candidate.name}</span>
                          <span className="text-muted-foreground">{candidate.votes_count || 0} votes ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );

      case 'ledger':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Public Ledger</h1>
              <p className="text-muted-foreground">Transparent record of all voting transactions</p>
            </div>
            <MyVoteVerification />
            <OnChainVotesTable />
            <PublicLedgerTable />
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
              <p className="text-muted-foreground">Manage your account information</p>
            </div>
            <ProfileForm />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header showRegister={false} />
      <div className="flex flex-1">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        <main className="flex-1 p-6">{renderContent()}</main>
      </div>
      <VotingModal
        election={selectedElection}
        open={showVotingModal}
        onClose={() => setShowVotingModal(false)}
      />
    </div>
  );
}
