'use client';

import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useRef, useState } from 'react';

function VerifyContent() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get('email');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);


  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpString }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
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

  if (!email) {
    return (
      <div className="text-center p-12 bg-card rounded-2xl border border-border shadow-2xl">
        <h2 className="text-xl font-bold mb-4">Invalid Access</h2>
        <Link href="/signup" className="text-primary hover:underline flex items-center justify-center gap-2">
          <ArrowLeft size={18} /> Back to Signup
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-card p-6 md:p-8 lg:p-12 rounded-[2rem] border border-border shadow-2xl space-y-6 md:space-y-8 relative overflow-hidden">

      <div className="text-center space-y-3 md:space-y-4">
        <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
          <ShieldCheck className="text-primary w-8 h-8 md:w-10 md:h-10" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Verify Email</h2>
        <p className="text-sm md:text-base text-muted-foreground">
          We sent a 6-digit code to <br />
          <span className="text-foreground font-semibold">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-primary/10 border border-primary/20 text-primary text-sm rounded-xl text-center animate-bounce">
            Verification successful! Redirecting...
          </div>
        )}

        <div className="flex justify-between gap-2 lg:gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className="w-full h-14 lg:h-16 text-center text-2xl font-bold bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || otp.join('').length !== 6 || success}
          className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 cursor-pointer transition-all shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-[0.98]"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Verify Account'}
        </button>
      </form>

      <div className="text-center">
        <p className="text-muted-foreground text-sm">
          Didn&apos;t receive the code?{' '}
          <button className="text-primary font-semibold hover:underline">Resend OTP</button>
        </p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-6 bg-[radial-gradient(circle_at_top_right,var(--accent),transparent_30%),radial-gradient(circle_at_bottom_left,var(--accent),transparent_30%)]">
      <Suspense fallback={<Loader2 className="animate-spin" />}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}