import { useState } from 'react';
import { Users, Vote, TrendingUp, CheckCircle, Plus, Edit, Trash2, Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { StatCard } from '@/components/StatCard';
import { ElectionModal } from '@/components/ElectionModal';
import { VoterUploadModal } from '@/components/VoterUploadModal';
import { PublicLedgerTable } from '@/components/PublicLedgerTable';
import { useElections, Election } from '@/hooks/useElections';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const votingActivityData = [
  { name: 'Mon', votes: 45 },
  { name: 'Tue', votes: 78 },
  { name: 'Wed', votes: 120 },
  { name: 'Thu', votes: 95 },
  { name: 'Fri', votes: 150 },
  { name: 'Sat', votes: 60 },
  { name: 'Sun', votes: 30 },
];

export function AdminDashboard() {
  const { elections, loading, createElection, updateElection, deleteElection } = useElections();
  const [activeView, setActiveView] = useState('home');
  const [showElectionModal, setShowElectionModal] = useState(false);
  const [showVoterUploadModal, setShowVoterUploadModal] = useState(false);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [electionToDelete, setElectionToDelete] = useState<Election | null>(null);

  const electionDistribution = [
    { name: 'Active', value: elections.filter(e => e.status === 'active').length, color: 'hsl(var(--primary))' },
    { name: 'Completed', value: elections.filter(e => e.status === 'completed').length, color: 'hsl(var(--warning))' },
    { name: 'Upcoming', value: elections.filter(e => e.status === 'upcoming').length, color: 'hsl(var(--info))' },
  ];

  const handleCreateElection = async (data: any, candidates: any[]) => {
    await createElection(data, candidates);
  };

  const handleUpdateElection = async (data: any, candidates: any[]) => {
    if (selectedElection) {
      await updateElection(selectedElection.id, data, candidates);
    }
  };

  const handleEditElection = (election: Election) => {
    setSelectedElection(election);
    setShowElectionModal(true);
  };

  const handleDeleteElection = async () => {
    if (electionToDelete) {
      await deleteElection(electionToDelete.id);
      setElectionToDelete(null);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'home':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">System overview and management</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={Users}
                value="524"
                label="Total Users"
                change="+12 this week"
                positive
              />
              <StatCard
                icon={Vote}
                value={elections.filter((e) => e.status === 'active').length}
                label="Active Elections"
                change="Currently running"
              />
              <StatCard
                icon={TrendingUp}
                value="1,245"
                label="Total Votes"
                change="+156 today"
                positive
              />
              <StatCard
                icon={CheckCircle}
                value="99.8%"
                label="Success Rate"
                change="System healthy"
                positive
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-4 font-semibold text-card-foreground">Real-time Voting Activity</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={votingActivityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip />
                      <Bar dataKey="votes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-4 font-semibold text-card-foreground">Election Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={electionDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {electionDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        );

      case 'manage-elections':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">Manage Elections</h1>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowVoterUploadModal(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Voters
                </Button>
                <Button onClick={() => { setSelectedElection(null); setShowElectionModal(true); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Election
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Election Title</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Candidates</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Start Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">End Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {elections.map((election) => (
                      <tr key={election.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 text-sm text-card-foreground">{election.title}</td>
                        <td className="px-4 py-3">
                          <Badge className={
                            election.status === 'active' ? 'bg-success text-success-foreground' : 
                            election.status === 'upcoming' ? 'bg-info text-info-foreground' : 
                            'bg-muted text-muted-foreground'
                          }>
                            {election.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-card-foreground">
                          {election.candidates?.length || 0}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {new Date(election.start_date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {new Date(election.end_date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditElection(election)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-destructive"
                              onClick={() => setElectionToDelete(election)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'ledger':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Public Ledger</h1>
              <p className="text-muted-foreground">Complete record of all voting transactions</p>
            </div>
            <PublicLedgerTable />
          </div>
        );

      case 'system':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">System Status</h1>
              <p className="text-muted-foreground">Blockchain and system health monitoring</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-card-foreground">Blockchain Network</h3>
                  <span className="h-3 w-3 rounded-full bg-success animate-pulse" />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Network:</span>
                    <span className="text-card-foreground">ACSCE Voting Network</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Block Height:</span>
                    <span className="text-card-foreground">15847</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Contracts:</span>
                    <span className="text-card-foreground">12</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-card-foreground">System Performance</h3>
                  <span className="h-3 w-3 rounded-full bg-success animate-pulse" />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uptime:</span>
                    <span className="text-card-foreground">99.9%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Response Time:</span>
                    <span className="text-card-foreground">145ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Users:</span>
                    <span className="text-card-foreground">24</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-card-foreground">Transaction Pool</h3>
                  <span className="h-3 w-3 rounded-full bg-success animate-pulse" />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pending:</span>
                    <span className="text-card-foreground">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Processing:</span>
                    <span className="text-card-foreground">1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg. Time:</span>
                    <span className="text-card-foreground">4.2s</span>
                  </div>
                </div>
              </div>
            </div>
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
        <Sidebar activeView={activeView} onViewChange={setActiveView} isAdmin />
        <main className="flex-1 p-6">{renderContent()}</main>
      </div>

      <ElectionModal
        open={showElectionModal}
        onClose={() => { setShowElectionModal(false); setSelectedElection(null); }}
        onSubmit={selectedElection ? handleUpdateElection : handleCreateElection}
        election={selectedElection}
      />

      <VoterUploadModal
        open={showVoterUploadModal}
        onClose={() => setShowVoterUploadModal(false)}
        elections={elections}
      />

      <AlertDialog open={!!electionToDelete} onOpenChange={() => setElectionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Election</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{electionToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteElection} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
