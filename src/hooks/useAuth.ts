import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  full_name: string | null;
  student_id: string | null;
  department: string | null;
  year: string | null;
  phone: string | null;
}

export interface UserRole {
  role: 'admin' | 'voter';
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<'admin' | 'voter' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Fetch profile and role when user changes
        if (session?.user) {
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setRole(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (roleData) {
        setRole(roleData.role as 'admin' | 'voter');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    // Disconnect MetaMask wallet if connected
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        // Clear any local wallet state - MetaMask doesn't have a programmatic disconnect
        // but we ensure clean state by clearing our app's wallet data
        console.log('Clearing wallet connection on logout');
      } catch (error) {
        console.log('Wallet disconnect handled');
      }
    }
    
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
    
    // Dispatch a custom event to notify wallet hook to reset
    window.dispatchEvent(new CustomEvent('wallet-disconnect'));
  };

  return {
    user,
    session,
    profile,
    role,
    loading,
    isAuthenticated: !!user,
    isAdmin: role === 'admin',
    signOut,
    refetchProfile: () => user && fetchUserData(user.id),
  };
}
