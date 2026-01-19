'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { aiApi } from '@/lib/api';
import { Send, Loader2, Plus, MessageSquare, Trash2, Edit2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  intent?: string;
  timestamp?: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

const CHAT_SESSIONS_KEY = 'ai_chat_sessions';
const CURRENT_SESSION_KEY = 'ai_chat_current_session';

// Generate a title from the first user message
function generateChatTitle(message: string): string {
  const maxLength = 30;
  const cleaned = message.trim()
    .replace(/^["'`]|["'`]$/g, '') // Remove quotes
    .replace(/[!?.,;:]$/, ''); // Remove trailing punctuation

  if (cleaned.length <= maxLength) return cleaned;

  // Try to break at word boundary
  const truncated = cleaned.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.5) {
    return truncated.substring(0, lastSpace) + '...';
  }

  return truncated + '...';
}

// Save sessions to localStorage
function saveSessions(sessions: ChatSession[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));
}

// Load sessions from localStorage
function loadSessions(): ChatSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(CHAT_SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Create a new session
function createNewSession(): ChatSession {
  return {
    id: Date.now().toString(),
    title: 'New Chat',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export default function AIChatPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const initialized = useRef(false);

  // Current session messages
  const currentMessages = currentSessionId
    ? sessions.find(s => s.id === currentSessionId)?.messages || []
    : [];

  // Initialize on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Load sessions
    const savedSessions = loadSessions();
    const savedCurrentId = localStorage.getItem(CURRENT_SESSION_KEY);

    if (savedSessions.length === 0) {
      // Create first session
      const newSession = createNewSession();
      const updated = [newSession];
      saveSessions(updated);
      setSessions(updated);
      setCurrentSessionId(newSession.id);
    } else {
      setSessions(savedSessions);
      // Restore current session or use the most recent
      const sessionId = savedCurrentId && savedSessions.find(s => s.id === savedCurrentId)
        ? savedCurrentId
        : savedSessions[0].id;
      setCurrentSessionId(sessionId);
    }
  }, [router]);

  // Save current session ID when it changes
  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem(CURRENT_SESSION_KEY, currentSessionId);
    }
  }, [currentSessionId]);

  // Load backend history into current session if empty
  useEffect(() => {
    if (!currentSessionId || currentMessages.length > 0) return;

    const loadBackendHistory = async () => {
      try {
        const history = await aiApi.getHistory(50);
        if (history.length > 0) {
          updateSession(currentSessionId, {
            messages: history,
            title: history.length > 0 && history[0].role === 'user'
              ? generateChatTitle(history[0].content)
              : 'Chat ' + new Date().toLocaleDateString(),
          });
        }
      } catch (error) {
        console.error('Failed to load backend history:', error);
      }
    };

    loadBackendHistory();
  }, [currentSessionId]);

  // Update a session
  const updateSession = useCallback((id: string, updates: Partial<ChatSession>) => {
    setSessions(prev => {
      const updated = prev.map(s =>
        s.id === id
          ? { ...s, ...updates, updatedAt: new Date().toISOString() }
          : s
      );
      saveSessions(updated);
      return updated;
    });
  }, []);

  // Create new chat
  const handleNewChat = useCallback(() => {
    const newSession = createNewSession();
    const updated = [newSession, ...sessions];
    saveSessions(updated);
    setSessions(updated);
    setCurrentSessionId(newSession.id);
    setInput('');
  }, [sessions]);

  // Switch chat
  const handleSwitchChat = useCallback((id: string) => {
    setCurrentSessionId(id);
    setInput('');
  }, []);

  // Delete chat
  const handleDeleteChat = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this chat?')) return;

    const updated = sessions.filter(s => s.id !== id);
    saveSessions(updated);
    setSessions(updated);

    if (currentSessionId === id) {
      if (updated.length === 0) {
        const newSession = createNewSession();
        const withNew = [newSession];
        saveSessions(withNew);
        setSessions(withNew);
        setCurrentSessionId(newSession.id);
      } else {
        setCurrentSessionId(updated[0].id);
      }
    }
  }, [sessions, currentSessionId]);

  // Start editing title
  const handleStartEditTitle = useCallback((session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTitleId(session.id);
    setEditingTitle(session.title);
  }, []);

  // Save edited title
  const handleSaveTitle = useCallback(() => {
    if (editingTitleId && editingTitle.trim()) {
      updateSession(editingTitleId, { title: editingTitle.trim() });
    }
    setEditingTitleId(null);
    setEditingTitle('');
  }, [editingTitleId, editingTitle, updateSession]);

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !currentSessionId) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    // Add user message
    const updatedMessages = [...currentMessages, userMessage];

    // Update title if this is the first message
    const isNewChat = currentMessages.length === 0;
    const titleUpdate = isNewChat
      ? { title: generateChatTitle(input) }
      : {};

    updateSession(currentSessionId, {
      messages: updatedMessages,
      ...titleUpdate
    });

    const userInput = input;
    setInput('');
    setLoading(true);

    // Create AI message
    const aiMessageId = Date.now() + 1;
    const aiMessage: ChatMessage = {
      id: aiMessageId,
      role: 'assistant',
      content: ''
    };

    // Add empty AI message immediately
    updateSession(currentSessionId, {
      messages: [...updatedMessages, aiMessage]
    });

    let streamedContent = '';

    try {
      await aiApi.sendMessageStream(
        userInput,
        // onChunk
        (chunk: string) => {
          streamedContent += chunk;
          const sessionMessages = currentSessionId
            ? sessions.find(s => s.id === currentSessionId)?.messages || []
            : [];
          updateSession(currentSessionId, {
            messages: [
              ...sessionMessages.slice(0, -1),
              { ...aiMessage, content: streamedContent }
            ]
          });
        },
        // onDone
        () => {
          setLoading(false);
        },
        // onError
        (error: string) => {
          updateSession(currentSessionId, {
            messages: [
              ...(currentSessionId
                ? sessions.find(s => s.id === currentSessionId)?.messages || []
                : []
              ).slice(0, -1),
              { ...aiMessage, content: `Error: ${error}` }
            ]
          });
          setLoading(false);
        }
      );
    } catch (error: any) {
      updateSession(currentSessionId, {
        messages: [
          ...(currentSessionId
            ? sessions.find(s => s.id === currentSessionId)?.messages || []
            : []
          ).slice(0, -1),
          { ...aiMessage, content: `Error: ${error.message || 'Failed to send message'}` }
        ]
      });
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const suggestions = [
    'Create a task to study React hooks',
    'Show my pending tasks',
    'What is my task summary?',
    'Complete task 1',
  ];

  // Convert messages to display format
  const displayMessages = currentMessages.map(msg => ({
    role: msg.role === 'assistant' ? 'ai' : 'user',
    content: msg.content,
    timestamp: msg.timestamp
  }));

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div
        className={cn(
          'fixed lg:relative inset-y-0 left-0 z-50 w-72 bg-muted/30 border-r border-border/50 transform transition-transform duration-200 ease-in-out',
          !sidebarOpen && '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border/50">
            <Button
              onClick={handleNewChat}
              className="w-full justify-start gap-2"
              variant="default"
            >
              <Plus size={18} />
              New Chat
            </Button>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleSwitchChat(session.id)}
                className={cn(
                  'group relative flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all',
                  'hover:bg-accent hover:shadow-sm',
                  currentSessionId === session.id
                    ? 'bg-accent border border-border/50'
                    : ''
                )}
              >
                <MessageSquare size={16} className="shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  {editingTitleId === session.id ? (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1"
                    >
                      <Input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveTitle();
                          if (e.key === 'Escape') {
                            setEditingTitleId(null);
                            setEditingTitle('');
                          }
                        }}
                        className="h-6 text-sm px-2"
                        autoFocus
                      />
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleSaveTitle}>
                        <Plus size={12} />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm font-medium truncate">{session.title}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(session.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={(e) => handleStartEditTitle(session, e)}
                  >
                    <Edit2 size={12} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={(e) => handleDeleteChat(session.id, e)}
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border/50">
            <Link href="/dashboard" className="block">
              <Button variant="ghost" className="w-full justify-start" size="sm">
                Dashboard
              </Button>
            </Link>
            <Link href="/tasks" className="block">
              <Button variant="ghost" className="w-full justify-start" size="sm">
                Tasks
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start"
              size="sm"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-xl">🤖</span>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  AI Assistant
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewChat}
                className="hidden sm:flex"
              >
                <Plus size={16} className="mr-2" />
                New Chat
              </Button>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {displayMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className="text-5xl mb-6">🤖</div>
                <h3 className="text-2xl font-bold mb-3">AI Productivity Assistant</h3>
                <p className="text-muted-foreground mb-8 max-w-md">
                  Manage tasks using natural language. Try commands like "create a task" or "show my tasks"
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                  {suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(suggestion)}
                      className="text-left p-4 rounded-xl border border-border/50 hover:bg-accent hover:border-primary/30 transition-all disabled:opacity-50"
                      disabled={loading}
                    >
                      <p className="text-sm font-medium">{suggestion}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              displayMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
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
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))
            )}
            {loading && displayMessages.length > 0 && displayMessages[displayMessages.length - 1].content === '' && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-4 py-2.5 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border/50">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={loading}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={loading || !input.trim()}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
