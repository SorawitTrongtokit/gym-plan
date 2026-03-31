import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dumbbell, LayoutDashboard, LineChart, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/workout', label: 'Workout', icon: Dumbbell },
  { path: '/progress', label: 'Progress', icon: LineChart },
  { path: '/program', label: 'Program', icon: Calendar },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:pl-64">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 flex-col bg-card border-r border-border p-6 z-50">
        <div className="flex items-center gap-3 mb-10">
          <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Dumbbell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">AI Workout</h1>
            <p className="text-xs text-muted-foreground">Hypertrophy System</p>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
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
        </div>
      </nav>

      {/* Main content */}
      <main className="p-4 md:p-8 max-w-5xl mx-auto">{children}</main>
    </div>
  );
}
