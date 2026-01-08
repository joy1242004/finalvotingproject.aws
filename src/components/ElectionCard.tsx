import { Vote, Calendar, Users, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Election } from '@/hooks/useElections';

interface ElectionCardProps {
  election: Election;
  onVote?: (electionId: string) => void;
  hasVoted?: boolean;
}

export function ElectionCard({ election, onVote, hasVoted = false }: ElectionCardProps) {
  const statusColors: Record<string, string> = {
    active: 'bg-success text-success-foreground',
    upcoming: 'bg-warning text-warning-foreground',
    completed: 'bg-muted text-muted-foreground',
  };

  const totalVotes = election.candidates?.reduce((sum, c) => sum + (c.votes_count || 0), 0) || 0;

  return (
    <div className="rounded-xl border border-border bg-card p-6 transition-all hover:shadow-md animate-fade-in">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">{election.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{election.description}</p>
        </div>
        <Badge className={statusColors[election.status] || 'bg-muted text-muted-foreground'}>
          {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
        </Badge>
      </div>

      <div className="mb-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>
            {new Date(election.start_date).toLocaleDateString()} - {new Date(election.end_date).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>{totalVotes} votes cast</span>
        </div>
      </div>

      {election.candidates && election.candidates.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-medium text-card-foreground">Candidates:</h4>
          <div className="space-y-2">
            {election.candidates.map((candidate, index) => {
              const colors = ['#1a9e9e', '#e67e22', '#9b59b6', '#3498db', '#e74c3c'];
              return (
                <div key={candidate.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    <span className="text-card-foreground">{candidate.name}</span>
                    {candidate.party && (
                      <span className="text-muted-foreground">({candidate.party})</span>
                    )}
                  </div>
                  <span className="font-medium text-card-foreground">{candidate.votes_count || 0} votes</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {election.status === 'active' && onVote && (
        hasVoted ? (
          <Button disabled className="w-full" variant="secondary">
            <CheckCircle className="mr-2 h-4 w-4" />
            Already Voted
          </Button>
        ) : (
          <Button onClick={() => onVote(election.id)} className="w-full">
            <Vote className="mr-2 h-4 w-4" />
            Cast Your Vote
          </Button>
        )
      )}
    </div>
  );
}
