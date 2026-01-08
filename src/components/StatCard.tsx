import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon?: LucideIcon;
  value: string | number;
  label: string;
  change?: string;
  positive?: boolean;
  variant?: 'default' | 'compact';
}

export function StatCard({ icon: Icon, value, label, change, positive, variant = 'default' }: StatCardProps) {
  if (variant === 'compact') {
    return (
      <div className="flex flex-col items-center rounded-xl border border-border bg-card p-4 text-center animate-fade-in">
        <span className="text-2xl font-bold text-primary">{value}</span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md animate-fade-in">
      {Icon && (
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      )}
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-card-foreground">{value}</span>
        <span className="text-sm text-muted-foreground">{label}</span>
        {change && (
          <span className={`text-xs ${positive ? 'text-success' : 'text-muted-foreground'}`}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
}
