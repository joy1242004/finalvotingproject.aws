import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Users, Vote, Clock, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useElections, Election } from '@/hooks/useElections';
import { format } from 'date-fns';

const COLORS = ['#1a9e9e', '#e67e22', '#9b59b6', '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#1abc9c'];

interface ElectionResultCardProps {
  election: Election;
}

function ElectionResultCard({ election }: ElectionResultCardProps) {
  const candidates = election.candidates || [];
  const totalVotes = candidates.reduce((sum, c) => sum + (c.votes_count || 0), 0);
  
  const chartData = candidates.map((candidate, index) => ({
    name: candidate.name,
    votes: candidate.votes_count || 0,
    percentage: totalVotes > 0 ? ((candidate.votes_count || 0) / totalVotes * 100).toFixed(1) : '0',
    color: COLORS[index % COLORS.length],
    party: candidate.party,
  }));

  const winner = chartData.reduce((prev, current) => 
    (prev.votes > current.votes) ? prev : current, chartData[0]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{election.title}</CardTitle>
            <CardDescription className="mt-1">{election.description}</CardDescription>
          </div>
          <Badge
            variant={election.status === 'active' ? 'default' : election.status === 'completed' ? 'secondary' : 'outline'}
          >
            {election.status === 'active' && <Clock className="h-3 w-3 mr-1 animate-pulse" />}
            {election.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted">
            <Vote className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold text-foreground">{totalVotes}</p>
            <p className="text-xs text-muted-foreground">Total Votes</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted">
            <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold text-foreground">{candidates.length}</p>
            <p className="text-xs text-muted-foreground">Candidates</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted">
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-lg font-bold text-foreground truncate">{winner?.name || 'N/A'}</p>
            <p className="text-xs text-muted-foreground">Leading</p>
          </div>
        </div>

        <Tabs defaultValue="bar" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
            <TabsTrigger value="pie">Pie Chart</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bar" className="pt-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={100} 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--foreground))' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: number, name: string, props: any) => [
                      `${value} votes (${props.payload.percentage}%)`,
                      'Votes'
                    ]}
                  />
                  <Bar 
                    dataKey="votes" 
                    radius={[0, 4, 4, 0]}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="pie" className="pt-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="votes"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number, name: string, props: any) => [
                      `${value} votes (${props.payload.percentage}%)`,
                      props.payload.name
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-2">
          {chartData.map((candidate, index) => (
            <div key={index} className="flex items-center gap-3">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: candidate.color }}
              />
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{candidate.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {candidate.votes} votes ({candidate.percentage}%)
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${candidate.percentage}%`,
                      backgroundColor: candidate.color
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground pt-2 border-t border-border">
          <p>Started: {format(new Date(election.start_date), 'PPp')}</p>
          <p>Ends: {format(new Date(election.end_date), 'PPp')}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ResultsView() {
  const { elections, loading, refetch } = useElections();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredElections = elections.filter(e => {
    if (filter === 'all') return true;
    return e.status === filter;
  });

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map(i => (
          <Skeleton key={i} className="h-[500px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList>
            <TabsTrigger value="all">All Elections</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="outline" size="sm" onClick={refetch}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {filteredElections.length === 0 ? (
        <div className="text-center py-12">
          <Vote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No elections found</h3>
          <p className="text-muted-foreground">
            {filter === 'all' 
              ? 'No elections have been created yet.'
              : `No ${filter} elections at the moment.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {filteredElections.map(election => (
            <ElectionResultCard key={election.id} election={election} />
          ))}
        </div>
      )}
    </div>
  );
}
