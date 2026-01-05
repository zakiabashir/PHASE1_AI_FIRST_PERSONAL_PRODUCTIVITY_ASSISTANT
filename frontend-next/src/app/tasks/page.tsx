'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { tasksApi } from '@/lib/api';
import { Plus, Check, Trash2, Loader2 } from 'lucide-react';

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'medium' });
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const authChecked = useRef(false);

  const fetchTasks = async () => {
    try {
      const filters: Record<string, string> = {};
      if (statusFilter) filters.status = statusFilter;
      if (priorityFilter) filters.priority = priorityFilter;
      const data = await tasksApi.list(filters);
      // Ensure we have an array of valid task objects
      const items = data?.items || [];
      setTasks(items.filter((t: any) => t && typeof t === 'object' && t.id));
    } catch (error: any) {
      console.error('Failed to fetch tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Auth check - runs once on mount
  useEffect(() => {
    if (authChecked.current) return;
    authChecked.current = true;

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    // Token exists, fetch tasks
    fetchTasks();
  }, []);

  // Fetch tasks when filters change
  useEffect(() => {
    if (authChecked.current && !loading) {
      fetchTasks();
    }
  }, [statusFilter, priorityFilter]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await tasksApi.create(formData);
      setShowCreateForm(false);
      setFormData({ title: '', description: '', priority: 'medium' });
      fetchTasks();
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail;
      const message = typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage || 'Failed to create task');
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async (id: number) => {
    await tasksApi.complete(id);
    fetchTasks();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await tasksApi.delete(id);
      fetchTasks();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">🤖 AI Assistant</h1>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary">Dashboard</Link>
            <Link href="/tasks" className="text-sm font-medium hover:text-primary">Tasks</Link>
            <Link href="/ai-chat" className="text-sm font-medium hover:text-primary">AI Chat</Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Tasks</h2>
            <p className="text-muted-foreground">Manage and track your tasks</p>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus size={20} className="mr-2" />
            New Task
          </Button>
        </div>

        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Task</CardTitle>
            </CardHeader>
            <form onSubmit={handleCreateTask}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="What do you need to do?"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add more details (optional)"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Task'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        )}

        <div className="space-y-3">
          {tasks.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground mb-2">No tasks found</p>
                <p className="text-sm text-muted-foreground">Create a task to get started!</p>
              </CardContent>
            </Card>
          ) : (
            tasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={`font-semibold ${String(task.status) === 'complete' ? 'line-through text-muted-foreground' : ''}`}>
                          {String(task.title || '')}
                        </h3>
                        <Badge variant={String(task.priority) === 'high' ? 'destructive' : String(task.priority) === 'medium' ? 'default' : 'secondary'}>
                          {String(task.priority || 'medium')}
                        </Badge>
                        <Badge variant={String(task.status) === 'complete' ? 'default' : 'secondary'}>
                          {String(task.status || 'pending')}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground">{String(task.description)}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {String(task.status) !== 'complete' && (
                        <Button size="sm" variant="outline" onClick={() => handleComplete(task.id)}>
                          <Check size={16} />
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleDelete(task.id)}>
                        <Trash2 size={16} className="text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
