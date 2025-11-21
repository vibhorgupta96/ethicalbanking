import { useState } from 'react';
import { Card } from '../components/common/Card';

export default function TrustVaultScreen() {
  const [consent, setConsent] = useState(true);
  const [status, setStatus] = useState('Hash verified via SHA-256 placeholder.');

  return (
    <div className="space-y-6">
      <Card
        title="TrustVault Controls"
        subtitle="Simulated consent toggle stored in the Java gateway."
        actions={
          <button
            type="button"
            onClick={() => setStatus('Consent update queued...')}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white"
          >
            Push Consent
          </button>
        }
      >
        <label className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
          <span className="text-sm font-medium text-slate-700">
            Allow AI explanations for loan decisions
          </span>
          <input
            type="checkbox"
            checked={consent}
            onChange={() => setConsent(!consent)}
            className="h-5 w-5 accent-primary"
          />
        </label>
        <p className="text-xs text-slate-500">{status}</p>
      </Card>
      <Card
        title="Consent Hash Ledger"
        subtitle="Recent SHA-256 digests stored in H2."
      >
        <div className="rounded-xl bg-slate-900 p-4 font-mono text-xs text-emerald-200">
          0x4fd1c3fbf4d0e7b91d... (simulated)
        </div>
      </Card>
    </div>
  );
}

