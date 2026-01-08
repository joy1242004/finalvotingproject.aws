import { Header } from '@/components/Header';
import { ResultsView } from '@/components/ResultsView';

export default function Results() {
  return (
    <div className="min-h-screen bg-background">
      <Header showRegister={false} />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Election Results</h1>
          <p className="text-muted-foreground mt-2">
            Live vote counts and distribution charts for all elections
          </p>
        </div>
        <ResultsView />
      </main>
    </div>
  );
}
