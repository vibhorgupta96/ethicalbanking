import { Card } from '../components/common/Card';

const mockDecision = {
  userId: 'user_123',
  decision: 'Rejected',
  factors: [
    { label: 'Credit Utilization', value: '45%', impact: '-0.31' },
    { label: 'On-time Payments', value: '82%', impact: '+0.12' },
    { label: 'Debt-to-Income', value: '43%', impact: '-0.18' }
  ]
};

export default function DecisionScreen() {
  return (
    <div className="space-y-6">
      <Card
        title="Decision Snapshot"
        subtitle="Fetched from the Java gateway (H2 demo dataset)."
      >
        <div className="flex flex-wrap gap-6 text-sm text-slate-600">
          <div>
            <p className="text-xs uppercase text-slate-400">User</p>
            <p className="text-lg font-semibold text-slate-800">
              {mockDecision.userId}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-400">Decision</p>
            <p className="text-lg font-semibold text-red-600">
              {mockDecision.decision}
            </p>
          </div>
        </div>
      </Card>
      <Card title="Top SHAP Factors" subtitle="Placeholder data for Day 1.">
        <div className="space-y-2">
          {mockDecision.factors.map((factor) => (
            <div
              key={factor.label}
              className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {factor.label}
                </p>
                <p className="text-xs text-slate-500">{factor.value}</p>
              </div>
              <span
                className={`text-sm font-semibold ${
                  factor.impact.startsWith('-')
                    ? 'text-red-600'
                    : 'text-emerald-600'
                }`}
              >
                {factor.impact}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

