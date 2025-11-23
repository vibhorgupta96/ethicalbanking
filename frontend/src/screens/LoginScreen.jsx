import { useState } from 'react';
import { User, KeyRound, LogIn, Shield, Cpu, Lock, ShieldCheck } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Api } from '../lib/api';

export default function LoginScreen({ onLogin = () => {} }) {
  const [userId, setUserId] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!userId.trim() || !passphrase.trim()) {
      setError('Please enter both your user ID and passphrase.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const normalizedId = userId.trim();

    try {
      const { data: profile } = await Api.login({
        userId: normalizedId,
        password: passphrase
      });
      const rawUserType = (profile?.userType ?? 'CUSTOMER').toString().toUpperCase();
      const resolvedRole = rawUserType === 'ADMIN' ? 'admin' : 'customer';

      onLogin({
        id: normalizedId,
        role: resolvedRole,
        profile,
        displayName:
          profile?.fullName ??
          (resolvedRole === 'admin' ? 'Administrator' : normalizedId.toUpperCase())
      });
    } catch (err) {
      const status = err?.response?.status;
      let message = err?.message || 'Unable to authenticate. Please retry.';
      if (status === 401) {
        message = 'Invalid credentials. Please double-check your password.';
      } else if (status === 404) {
        message = 'User not found. Try user_001 (customer) or admin_001 (admin).';
      }
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="grid min-h-[calc(100vh-12rem)] items-center gap-8 lg:grid-cols-2">
        <div className="flex flex-col justify-center space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
            <p className="mt-2 text-slate-600">Sign in to access your ethical banking dashboard.</p>
          </div>
          
          <Card className="shadow-lg shadow-slate-200/50">
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                User ID
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-10 py-3 transition-all focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
                    value={userId}
                    onChange={(event) => setUserId(event.target.value)}
                    placeholder="e.g. user_123"
                  />
                </div>
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                Password
                <div className="relative group">
                  <KeyRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-10 py-3 transition-all focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
                    value={passphrase}
                    onChange={(event) => setPassphrase(event.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </label>
              
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-600" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:translate-y-[-1px] active:translate-y-[0px] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  'Signing in…'
                ) : (
                  <>
                    <LogIn className="h-5 w-5" /> Sign In
                  </>
                )}
              </button>
            </form>
          </Card>
        </div>

        <div className="flex flex-col justify-center space-y-6 lg:pl-10">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Latest Features</h3>
            <p className="mt-1 text-slate-500">What's new in Ethical Banking</p>
          </div>
          
          <div className="grid gap-4">
            {[
              {
                icon: Lock,
                color: 'indigo',
                title: 'Consent Ledger',
                desc: 'Simulated consent ledger backed by SHA-256 hashes'
              },
              {
                icon: Cpu,
                color: 'emerald',
                title: 'Explainable AI',
                desc: 'SHAP feed via Python microservice'
              },
              {
                icon: Shield,
                color: 'amber',
                title: 'Transparency',
                desc: 'LLM transparency explanations'
              },
              {
                icon: ShieldCheck,
                color: 'rose',
                title: 'FairGuard',
                desc: 'Real-time bias detection and automated circuit breakers'
              }
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-slate-200">
                <div className={`rounded-xl bg-${feature.color}-50 p-3 text-${feature.color}-600`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">{feature.title}</h4>
                  <p className="text-sm text-slate-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

