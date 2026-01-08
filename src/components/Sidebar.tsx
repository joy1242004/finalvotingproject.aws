import { 
  Home, 
  Vote, 
  History, 
  BarChart3, 
  User, 
  Settings,
  Activity,
  Shield,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isAdmin?: boolean;
}

const voterMenuItems = [
  { id: 'home', label: 'Dashboard', icon: Home },
  { id: 'elections', label: 'Active Elections', icon: Vote },
  { id: 'history', label: 'Voting History', icon: History },
  { id: 'results', label: 'Results', icon: BarChart3 },
  { id: 'ledger', label: 'Public Ledger', icon: FileText },
  { id: 'profile', label: 'My Profile', icon: User },
];

const adminMenuItems = [
  { id: 'home', label: 'Dashboard', icon: Home },
  { id: 'manage-elections', label: 'Manage Elections', icon: Vote },
  { id: 'ledger', label: 'Public Ledger', icon: FileText },
  { id: 'system', label: 'System Status', icon: Activity },
];

export function Sidebar({ activeView, onViewChange, isAdmin = false }: SidebarProps) {
  const menuItems = isAdmin ? adminMenuItems : voterMenuItems;

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 border-b border-sidebar-border p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <Shield className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <span className="font-semibold text-sidebar-foreground">
            {isAdmin ? 'Admin Panel' : 'Voter Panel'}
          </span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                activeView === item.id
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent">
            <Settings className="h-4 w-4" />
            Settings
          </button>
        </div>
      </div>
    </aside>
  );
}
