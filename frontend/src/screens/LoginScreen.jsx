import { useState } from 'react';
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
    <div className="grid gap-6 md:grid-cols-2">
      <Card
        title="Welcome to Ethical Banking"
        subtitle="Authenticate to access AskAI and TrustVault insights."
      >
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
            User ID
            <input
              className="rounded-lg border border-slate-200 px-4 py-2 focus:border-primary focus:outline-none"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              placeholder="user_123"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
            Passphrase
            <input
              type="password"
              className="rounded-lg border border-slate-200 px-4 py-2 focus:border-primary focus:outline-none"
              value={passphrase}
              onChange={(event) => setPassphrase(event.target.value)}
              placeholder="••••••••"
            />
          </label>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <p className="text-xs text-slate-500">
            Tip: demo credentials → user_001 / pass123 (customer) or admin_001 / admin123 (admin).
          </p>
        </form>
      </Card>
      <Card
        title="Hackathon Slice"
        subtitle="Layer 3 experience: AskAI + TrustVault"
      >
        <ul className="list-disc space-y-2 pl-6 text-sm text-slate-600">
          <li>Simulated consent ledger backed by SHA-256 hashes</li>
          <li>Explainable AI (SHAP) feed via Python microservice</li>
          <li>Hugging Face (Mistral-7B-Instruct-v0.2) transparency explanations</li>
        </ul>
      </Card>
    </div>
  );
}

