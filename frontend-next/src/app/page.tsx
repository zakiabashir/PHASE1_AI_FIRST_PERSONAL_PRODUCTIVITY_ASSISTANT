import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, MessageSquare, CheckSquare, BarChart3 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">AI Productivity Assistant</h1>
          <div className="space-x-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Manage Tasks with AI Power
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          The simplest way to organize your tasks. Use natural language to create, manage,
          and track your tasks with our AI-powered assistant.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/register">
            <Button size="lg">
              Start Free
              <ArrowRight size={20} className="ml-2" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Sign In
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Natural Language</h3>
              <p className="text-muted-foreground">
                Just type what you want. Our AI understands commands like "create a task to study
                React" or "show my pending tasks".
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <CheckSquare className="text-green-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Simple & Fast</h3>
              <p className="text-muted-foreground">
                No complex forms or workflows. Just enter your task and we'll handle the rest.
                Focus on what matters.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="text-purple-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Stay Organized</h3>
              <p className="text-muted-foreground">
                Track your progress with beautiful dashboards and summaries. See exactly what's
                pending and completed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
