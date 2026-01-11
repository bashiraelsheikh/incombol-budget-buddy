import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, PieChart, Target, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="gradient-hero text-primary-foreground">
        <nav className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="font-display text-2xl font-bold">InComBöl</span>
          </div>
          <Link to="/auth">
            <Button variant="secondary" className="font-semibold">
              Sign In
            </Button>
          </Link>
        </nav>

        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Take Control of Your{' '}
              <span className="text-accent">Financial Future</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 animate-slide-up">
              InComBöl helps you track income, manage expenses, set budgets, and achieve your savings goals — all in one beautiful app.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Link to="/auth">
                <Button size="lg" variant="secondary" className="font-semibold text-lg px-8">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Manage Your Money
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help you understand and control your finances.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card p-6 rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-success/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-7 h-7 text-success" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Track Income</h3>
              <p className="text-muted-foreground">
                Monitor all your income sources in one place with beautiful visualizations.
              </p>
            </div>

            <div className="bg-card p-6 rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
                <Wallet className="w-7 h-7 text-destructive" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Manage Expenses</h3>
              <p className="text-muted-foreground">
                Categorize and track every expense to understand your spending habits.
              </p>
            </div>

            <div className="bg-card p-6 rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-info/10 flex items-center justify-center mb-4">
                <PieChart className="w-7 h-7 text-info" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Budget Planning</h3>
              <p className="text-muted-foreground">
                Set budgets for each category and get alerts when you're overspending.
              </p>
            </div>

            <div className="bg-card p-6 rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <Target className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Savings Goals</h3>
              <p className="text-muted-foreground">
                Set financial goals and track your progress towards achieving them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-16">
              Why Choose InComBöl?
            </h2>

            <div className="space-y-6">
              {[
                'Beautiful, intuitive interface that makes finance management enjoyable',
                'Secure cloud sync — access your data from anywhere',
                'Detailed reports and analytics to understand your spending',
                'Custom categories to match your unique financial life',
                'Budget alerts to keep you on track',
                'Multiple currency support',
              ].map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-lg">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Take Control?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join thousands of users who are already managing their finances better with InComBöl.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="font-semibold text-lg px-8">
              Start Free Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sidebar py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
                <Wallet className="w-6 h-6 text-sidebar-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-sidebar-foreground">InComBöl</span>
            </div>
            <p className="text-sidebar-foreground/60 text-sm">
              © 2026 InComBöl. All rights reserved. Your personal finance companion.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
