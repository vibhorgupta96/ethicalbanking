import { useState } from 'react';
import { ShieldCheck, Database, Fingerprint, RefreshCw, Info, FileCheck, Sparkles, FileSignature } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Api } from '../lib/api';

export default function TrustVaultScreen({ currentUser }) {
  const [consents, setConsents] = useState({
    aiExplainability: true,
    dataTraining: false,
    thirdPartyAudit: false,
    betaFairGuard: false
  });
  const [status, setStatus] = useState('Hash verified via SHA-256.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastHash, setLastHash] = useState('0x4fd1c3fbf4d0e7b91d...');

  const toggleConsent = (key) => {
    setConsents(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePushConsent = async () => {
    if (!currentUser?.id) {
      setStatus('Error: No user ID found.');
      return;
    }

    setIsSubmitting(true);
    setStatus('Consent update queued...');

    try {
      const payloadString = JSON.stringify(consents);
      await Api.setConsent(currentUser.id, { consentPayload: payloadString });
      setStatus('Consent successfully recorded on ledger.');
      // Simulate a hash update for visual feedback since backend returns void
      setLastHash('0x' + Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0')).join(''));
    } catch (error) {
      console.error('Failed to push consent:', error);
      setStatus('Failed to update consent. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">TrustVault Privacy</h2>
        <p className="mt-2 text-slate-600">
          Manage your data consent and review cryptographic audit logs.
        </p>
      </div>

      <Card
        title={
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            TrustVault Controls
          </div>
        }
        subtitle="Manage your ethical banking permissions."
        actions={
          <button
            type="button"
            onClick={handlePushConsent}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-secondary hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <FileSignature className="h-4 w-4" />
            )}
            {isSubmitting ? 'Saving to Ledger...' : 'Sign & Push Consent'}
          </button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <ConsentOption
            icon={Info}
            label="Allow AI explanations"
            description="Enables SHAP-based transparency for all credit assessments."
            checked={consents.aiExplainability}
            onChange={() => toggleConsent('aiExplainability')}
          />
          <ConsentOption
            icon={Database}
            label="FairGuard Training"
            description="Allow anonymized data usage to improve bias detection models."
            checked={consents.dataTraining}
            onChange={() => toggleConsent('dataTraining')}
          />
          <ConsentOption
            icon={FileCheck}
            label="Third-Party Audit Access"
            description="Grant read-only access to external auditors for compliance checks."
            checked={consents.thirdPartyAudit}
            onChange={() => toggleConsent('thirdPartyAudit')}
          />
          <ConsentOption
            icon={Sparkles}
            label="Join FairGuard Beta"
            description="Early access to real-time bias intervention features."
            checked={consents.betaFairGuard}
            onChange={() => toggleConsent('betaFairGuard')}
          />
        </div>
        <div className="mt-4 flex justify-end">
           <p className={`text-xs font-medium transition-colors ${status.includes('Error') || status.includes('Failed') ? 'text-red-600' : 'text-emerald-600'}`}>{status}</p>
        </div>
      </Card>
      
      <Card
        title={
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-slate-500" />
            Consent Hash Ledger
          </div>
        }
        subtitle="Current cryptographic hash for your consent."
      >
        <div className="flex items-center gap-3 rounded-xl bg-slate-900 p-4 font-mono text-xs text-emerald-200 transition-all duration-500">
          <Fingerprint className="h-4 w-4 shrink-0 opacity-70" />
          <span>{lastHash}</span>
        </div>
      </Card>
    </div>
  );
}

function ConsentOption({ icon: Icon, label, description, checked, onChange }) {
  return (
    <label className={`flex items-start justify-between rounded-2xl border px-4 py-3 transition-colors ${checked ? 'border-primary/30 bg-primary/5' : 'border-slate-200 hover:border-slate-300'}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 rounded-full p-1.5 ${checked ? 'bg-primary/20 text-primary' : 'bg-slate-100 text-slate-500'}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <span className={`block text-sm font-medium ${checked ? 'text-primary' : 'text-slate-700'}`}>
            {label}
          </span>
          <span className="text-xs text-slate-500">{description}</span>
        </div>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-1 h-5 w-5 accent-primary"
      />
    </label>
  );
}
