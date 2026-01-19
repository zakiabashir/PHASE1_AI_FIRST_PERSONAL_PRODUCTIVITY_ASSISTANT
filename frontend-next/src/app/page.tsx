'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, MessageSquare, CheckSquare, BarChart3 } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/10">
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
              AI Productivity Assistant
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" className="font-medium">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-24 md:py-32">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Powered by AI
          </div>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Manage Tasks with{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              AI Power
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            The simplest way to organize your tasks. Use natural language to create, manage,
            and track your tasks with our AI-powered assistant.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <Link href="/register">
              <Button size="lg" className="text-base px-8 py-6 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
                Start Free
                <ArrowRight size={20} className="ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-base px-8 py-6 border-2 hover:bg-accent transition-all hover:-translate-y-0.5">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          <Card className="group border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400">
            <CardContent className="p-8">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="text-blue-600 dark:text-blue-400" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Natural Language</h3>
              <p className="text-muted-foreground leading-relaxed">
                Just type what you want. Our AI understands commands like &quot;create a task to study
                React&quot; or &quot;show my pending tasks&quot;.
              </p>
            </CardContent>
          </Card>

          <Card className="group border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
            <CardContent className="p-8">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500/10 to-green-600/10 dark:from-green-500/20 dark:to-green-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <CheckSquare className="text-green-600 dark:text-green-400" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Simple & Fast</h3>
              <p className="text-muted-foreground leading-relaxed">
                No complex forms or workflows. Just enter your task and we&apos;ll handle the rest.
                Focus on what matters.
              </p>
            </CardContent>
          </Card>

          <Card className="group border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-600">
            <CardContent className="p-8">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500/10 to-purple-600/10 dark:from-purple-500/20 dark:to-purple-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="text-purple-600 dark:text-purple-400" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Stay Organized</h3>
              <p className="text-muted-foreground leading-relaxed">
                Track your progress with beautiful dashboards and summaries. See exactly what&apos;s
                pending and completed.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="container mx-auto px-6 py-8 border-t border-border/50">
        <p className="text-center text-sm text-muted-foreground">
          © 2025 AI Productivity Assistant. Built with Next.js & AI.
        </p>
      </footer>
    </div>
  );
}
