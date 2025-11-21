import { Card } from '../components/common/Card';

export default function LoginScreen() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card
        title="Welcome to Ethical Banking"
        subtitle="Authenticate to access AskAI and TrustVault insights."
      >
        <form className="flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
            User ID
            <input
              className="rounded-lg border border-slate-200 px-4 py-2 focus:border-primary focus:outline-none"
              placeholder="user_123"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
            Passphrase
            <input
              type="password"
              className="rounded-lg border border-slate-200 px-4 py-2 focus:border-primary focus:outline-none"
              placeholder="••••••••"
            />
          </label>
          <button
            type="button"
            className="mt-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow hover:bg-secondary"
          >
            Sign In
          </button>
        </form>
      </Card>
      <Card
        title="Hackathon Slice"
        subtitle="Layer 3 experience: AskAI + TrustVault"
      >
        <ul className="list-disc space-y-2 pl-6 text-sm text-slate-600">
          <li>Simulated consent ledger backed by SHA-256 hashes</li>
          <li>Explainable AI (SHAP) feed via Python microservice</li>
          <li>Gemini powered transparency explanations</li>
        </ul>
      </Card>
    </div>
  );
}

