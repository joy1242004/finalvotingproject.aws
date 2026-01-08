import { useNavigate } from 'react-router-dom';
import { Shield, UserPlus, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { WalletConnect } from '@/components/WalletConnect';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  showRegister?: boolean;
}

export function Header({ showRegister = true }: HeaderProps) {
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-primary">ACS BlockVote Pro</span>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated && <WalletConnect />}
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 mr-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{displayName}</span>
              </div>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            showRegister && (
              <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
                <UserPlus className="h-4 w-4 mr-2" />
                Login / Register
              </Button>
            )
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
