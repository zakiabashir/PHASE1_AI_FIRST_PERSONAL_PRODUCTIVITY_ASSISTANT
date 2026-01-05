'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { aiApi, tasksApi } from '@/lib/api';
import { Send, Loader2 } from 'lucide-react';

export default function AIChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; content: string; timestamp?: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user' as const, content: input, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await aiApi.sendMessage(input);
      const aiMessage = { role: 'ai' as const, content: response.message || 'Something went wrong' };
      setMessages((prev) => [...prev, aiMessage]);
      setInput('');

      // Refresh tasks if a task was created/modified
      if (response.success) {
        // You could trigger a task refresh here if needed
      }
    } catch (error: any) {
      const errorMessage = { role: 'ai' as const, content: error.response?.data?.detail || 'Failed to process message' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    'Create a task to study React hooks',
    'Show my pending tasks',
    'What is my task summary?',
    'Complete task 1',
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

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
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">AI Chat</h2>
          <p className="text-muted-foreground">Manage tasks using natural language</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle>Chat</CardTitle>
                <CardDescription>Talk to AI to manage your tasks</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <div className="text-4xl mb-4">🤖</div>
                      <h3 className="font-semibold mb-2">AI Productivity Assistant</h3>
                      <p className="text-muted-foreground mb-4">
                        Try commands like "create a task" or "show my tasks"
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {suggestions.map((suggestion, i) => (
                          <button
                            key={i}
                            onClick={() => setInput(suggestion)}
                            className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20"
                            disabled={loading}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-2xl px-4 py-2 flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  )}
                </div>
                <form onSubmit={handleSubmit} className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type your message..."
                      disabled={loading}
                    />
                    <Button type="submit" size="icon" disabled={loading || !input.trim()}>
                      <Send size={18} />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Suggestions</CardTitle>
                <CardDescription>Quick commands to try</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(suggestion)}
                    className="w-full text-left p-3 rounded-lg border hover:bg-accent text-sm disabled:opacity-50"
                    disabled={loading}
                  >
                    {suggestion}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
