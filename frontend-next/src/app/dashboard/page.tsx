'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { tasksApi } from '@/lib/api';
import { CheckCircle2, Clock, AlertCircle, ListTodo, MessageSquare, Plus } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function DashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    tasksApi.getSummary().then(setSummary).finally(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const stats = [
    { label: 'Total Tasks', value: summary?.total_count || 0, icon: ListTodo, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending', value: summary?.pending_count || 0, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Completed', value: summary?.complete_count || 0, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'High Priority', value: summary?.high_priority_pending || 0, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  const completionPercentage = summary?.total_count > 0
    ? Math.round((summary.complete_count / summary.total_count) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">🤖 AI Assistant</h1>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary">Dashboard</Link>
            <Link href="/tasks" className="text-sm font-medium hover:text-primary">Tasks</Link>
            <Link href="/ai-chat" className="text-sm font-medium hover:text-primary">AI Chat</Link>
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your tasks and productivity</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${stat.bg}`}>
                      <Icon className={stat.color} size={24} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
              <CardDescription>Task completion rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{completionPercentage}% complete</span>
                  <span className="text-muted-foreground">{summary?.complete_count || 0} of {summary?.total_count || 0}</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full transition-all" style={{ width: `${completionPercentage}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/tasks">
                <Button variant="outline" className="w-full justify-start">
                  <Plus size={18} className="mr-2" />
                  Create New Task
                </Button>
              </Link>
              <Link href="/tasks">
                <Button variant="outline" className="w-full justify-start">
                  <ListTodo size={18} className="mr-2" />
                  View All Tasks
                </Button>
              </Link>
              <Link href="/ai-chat">
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare size={18} className="mr-2" />
                  Open AI Chat
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
