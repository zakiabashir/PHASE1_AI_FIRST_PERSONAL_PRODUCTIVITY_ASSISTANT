'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { aiApi, tasksApi } from '@/lib/api';
// OpenAI SDK integration now available via openai-client.ts
import { streamChatCompletion, sendChatMessage } from '@/lib/openai-client';
import { Send, Loader2, Trash2, RefreshCw } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  intent?: string;
  timestamp?: string;
}

export default function AIChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [useStreaming, setUseStreaming] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const initialized = useRef(false);

  // Load chat history on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    loadChatHistory();
  }, [router]);

  const loadChatHistory = async () => {
    try {
      setHistoryLoading(true);
      const history = await aiApi.getHistory(50);
      setMessages(history);
    } catch (error: any) {
      console.error('Failed to load chat history:', error);
      setMessages([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setLoading(true);

    // Create an empty AI message that will be updated during streaming
    const aiMessageId = Date.now() + 1;
    const aiMessage: ChatMessage = {
      id: aiMessageId,
      role: 'assistant',
      content: ''
    };
    setMessages((prev) => [...prev, aiMessage]);

    if (useStreaming) {
      // Use streaming
      let streamedContent = '';

      await aiApi.sendMessageStream(
        userInput,
        // onChunk
        (chunk: string) => {
          streamedContent += chunk;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? { ...msg, content: streamedContent }
                : msg
            )
          );
        },
        // onDone
        (result: any) => {
          setLoading(false);
          // Reload history to get the persisted message
          setTimeout(() => loadChatHistory(), 500);
        },
        // onError
        (error: string) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? { ...msg, content: `Error: ${error}` }
                : msg
            )
          );
          setLoading(false);
        }
      );
    } else {
      // Use non-streaming (original method)
      try {
        const response = await aiApi.sendMessage(userInput);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  content: response.message || 'Something went wrong',
                  intent: response.intent
                }
              : msg
          )
        );

        if (response.success) {
          console.log('Task completed:', response);
        }

        // Reload history to get the persisted message
        setTimeout(() => loadChatHistory(), 500);
      } catch (error: any) {
        const errorMessage = error.response?.data?.detail || 'Failed to process message';
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, content: `Error: ${errorMessage}` }
              : msg
          )
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClearHistory = async () => {
    if (confirm('Are you sure you want to clear old chat history (older than 30 days)?')) {
      try {
        await aiApi.clearHistory(30);
        await loadChatHistory();
      } catch (error: any) {
        console.error('Failed to clear history:', error);
        alert('Failed to clear chat history');
      }
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

  // Convert DB messages to display format
  const displayMessages = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'ai' : 'user',
    content: msg.content,
    timestamp: msg.timestamp
  }));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 dark:from-primary dark:to-blue-400 bg-clip-text text-transparent">
              AI Assistant
            </h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/tasks" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Tasks
            </Link>
            <Link href="/ai-chat" className="text-sm font-medium text-primary hover:text-primary transition-colors">
              AI Chat
            </Link>
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUseStreaming(!useStreaming)}
              className="hover:bg-primary/10 hover:border-primary/50 transition-all"
            >
              {useStreaming ? '🌊 Streaming' : '📝 Standard'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="hover:bg-destructive hover:text-destructive-foreground transition-colors">
              Logout
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">AI Chat</h2>
            <p className="text-muted-foreground">Manage tasks using natural language {useStreaming && 'with streaming responses'}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadChatHistory}
              disabled={historyLoading || loading}
            >
              <RefreshCw size={16} className={`mr-2 ${historyLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearHistory}
              disabled={loading}
            >
              <Trash2 size={16} className="mr-2" />
              Clear Old History
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle>Chat</CardTitle>
                <CardDescription>
                  {historyLoading ? 'Loading chat history...' : `Chat history (${displayMessages.length} messages)`}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {historyLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <Loader2 size={24} className="animate-spin text-muted-foreground" />
                    </div>
                  ) : displayMessages.length === 0 ? (
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
                    displayMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}>
                          {msg.content === '' && loading ? (
                            <div className="flex items-center gap-2">
                              <Loader2 size={16} className="animate-spin" />
                              <span className="text-sm">Thinking...</span>
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  {loading && displayMessages.length > 0 && displayMessages[displayMessages.length - 1].content === '' && (
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

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant={useStreaming ? "default" : "outline"}
                  className="w-full mb-2"
                  onClick={() => setUseStreaming(true)}
                >
                  🌊 Streaming
                </Button>
                <Button
                  variant={!useStreaming ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setUseStreaming(false)}
                >
                  📝 Standard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
