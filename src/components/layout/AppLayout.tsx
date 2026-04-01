import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dumbbell, LayoutDashboard, LineChart, Calendar, LogOut, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/workout', label: 'Workout', icon: Dumbbell },
  { path: '/history', label: 'History', icon: ClipboardList },
  { path: '/progress', label: 'Progress', icon: LineChart },
  { path: '/program', label: 'Program', icon: Calendar },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const showAuth = isSupabaseConfigured();

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:pl-64">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 flex-col bg-card border-r border-border p-6 z-50">
        <div className="flex items-center gap-3 mb-10">
          <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Dumbbell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Hyper-Trophy</h1>
            <p className="text-xs text-muted-foreground">Forge System</p>
          </div>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                location.pathname === item.path
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        
        {/* User info + Sign out */}
        {showAuth && user && (
          <div className="border-t border-border pt-4 mt-4">
            <div className="flex items-center gap-3 px-2 mb-3">
              {user.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="" 
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  {(user.email?.charAt(0) || 'U').toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium truncate">
                  {user.user_metadata?.full_name || user.user_metadata?.name || user.email}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-muted-foreground hover:text-destructive gap-2"
              onClick={signOut}
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </Button>
          </div>
        )}
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-bottom">
        <div className="flex items-center justify-around py-2">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs transition-all',
                location.pathname === item.path
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
          {/* Mobile sign out */}
          {showAuth && user && (
            <button
              onClick={signOut}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs text-muted-foreground transition-all"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign out</span>
            </button>
          )}
        </div>
      </nav>

      {/* Main content */}
      <main className="p-4 md:p-8 max-w-5xl mx-auto">{children}</main>
    </div>
  );
}
