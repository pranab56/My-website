'use client';

import { gsap } from 'gsap';
import { ArrowLeft, ArrowRight, Loader2, Mail } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    gsap.from(cardRef.current, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Request failed');
      }

      setSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-background p-4 md:p-6'>


      <div className="w-full max-w-lg bg-card p-6 md:p-10 lg:p-12 rounded-xl shadow-2xl border border-border space-y-6 md:space-y-8 relative z-10">
        <div className="space-y-3 md:space-y-4 text-center">

          <h2 className="text-2xl md:text-3xl font-medium tracking-tight">Forgot Password?</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Enter your email and we&apos;ll send you an OTP to reset your password securely.
          </p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none group-focus-within:text-primary transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 cursor-pointer transition-all shadow-lg shadow-primary/20 disabled:opacity-70 active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Send OTP <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-6 animate-in fade-in zoom-in-95">
            <div className="p-6 bg-primary/10 border border-primary/20 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground mx-auto mb-2">✓</div>
              <p className="text-primary font-semibold">OTP Sent Successfully!</p>
              <p className="text-sm text-muted-foreground">Please check your email for the verification code.</p>
            </div>

            <Link
              href={`/reset-password?email=${encodeURIComponent(email)}`}
              className="w-full bg-primary cursor-pointer text-primary-foreground py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              Proceed to Reset <ArrowRight size={18} />
            </Link>
          </div>
        )}

        <div className="text-center">
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center justify-center gap-2">
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}