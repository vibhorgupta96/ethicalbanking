import { useEffect, useMemo, useState } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Users, 
  Scale, 
  AlertTriangle, 
  CheckCircle2,
  Play
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Api } from '../lib/api';

const STATUS_BADGE = {
  ALERT: 'bg-red-100 text-red-700',
  NORMAL: 'bg-emerald-100 text-emerald-700'
};

export default function FairGuardScreen({ currentUser }) {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    let timerId;

    const fetchSummary = async () => {
      setIsLoading(true);
      setError('');
      try {
        const { data } = await Api.getFairGuardSummary();
        setSummary(data);
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Unable to reach FairGuardAI.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
    timerId = setInterval(fetchSummary, 15000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  const circuitBreakerActive = useMemo(
    () => Boolean(summary?.circuitBreaker?.active),
    [summary]
  );

  const handleSimulation = async () => {
    setIsSimulating(true);
    setError('');
    try {
      const { data } = await Api.simulateFairGuard();
      setSummary(data);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Simulation trigger failed.';
      setError(message);
    } finally {
      setIsSimulating(false);
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <Card title="FairGuardAI Oversight">
        <p className="text-sm text-slate-600">
          Only admin reviewers can access the governance console.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">FairGuard Intelligence</h2>
        <p className="mt-2 text-slate-600">
          Monitor algorithmic fairness and real-time bias intervention.
        </p>
      </div>

      <Card
        title={
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            Governance Status
          </div>
        }
        subtitle="Real-time bias detection, drift monitoring, and automated circuit breakers."
        headerAction={
          <button
            onClick={handleSimulation}
            disabled={isSimulating || isLoading}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSimulating ? (
              'Simulating...'
            ) : (
              <>
                <Play className="h-3 w-3" fill="currentColor" />
                Simulate 200 Txns
              </>
            )}
          </button>
        }
        actions={
          <span
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide shadow-sm ${
              circuitBreakerActive
                ? 'bg-red-100 text-red-700 ring-1 ring-red-200'
                : 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'
            }`}
          >
            {circuitBreakerActive ? (
              <>
                <AlertTriangle className="h-3.5 w-3.5" /> Circuit Breaker Active
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" /> Guardrails Normal
              </>
            )}
          </span>
        }
      >
        {error && <p className="text-sm text-red-600">{error}</p>}
        {isLoading && (
          <p className="text-sm text-slate-500 flex items-center gap-2">
            <Activity className="h-4 w-4 animate-pulse" /> Refreshing FairGuard telemetry…
          </p>
        )}
        {summary && !isLoading && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-xs font-bold uppercase text-slate-400">Sample Size</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {summary.windowSize}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <p className="flex items-center gap-1 text-xs font-bold uppercase text-slate-400">
                  <Activity className="h-3 w-3" /> Drift Score
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <p
                    className={`text-2xl font-bold ${
                      summary.drift?.status === 'ALERT'
                        ? 'text-red-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {summary.drift?.score?.toFixed(3) ?? '0.000'}
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    / {summary.drift?.threshold?.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-xs font-bold uppercase text-slate-400">Active Alerts</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {summary.alerts?.length ?? 0}
                </p>
                {summary.circuitBreaker?.reason && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    {summary.circuitBreaker.reason}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </Card>

      <Card
        title={
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            Demographic Parity Watchlist
          </div>
        }
        subtitle="Approval rate spread by protected attribute with automatic circuit breakers when gaps exceed policy."
      >
        {summary?.dimensions?.length === 0 && (
          <p className="text-sm text-slate-500">
            No protected attribute telemetry collected yet.
          </p>
        )}
        {summary?.dimensions?.length > 0 && (
          <div className="space-y-4">
            {summary.dimensions.map((dimension) => (
              <div
                key={dimension.attribute}
                className="rounded-2xl border border-slate-100 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {dimension.attribute}
                    </p>
                    <p className="text-xs text-slate-500">
                      Parity gap {dimension.parityGap?.toFixed(3)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      STATUS_BADGE[dimension.status] ?? STATUS_BADGE.NORMAL
                    }`}
                  >
                    {dimension.status}
                  </span>
                </div>
                <div className="mt-3 overflow-auto">
                  <table className="min-w-full table-fixed text-sm text-slate-600">
                    <thead>
                      <tr className="text-xs uppercase text-slate-400">
                        <th className="w-1/2 py-2 text-left">Group</th>
                        <th className="w-1/4 py-2 text-right">Sample size</th>
                        <th className="w-1/4 py-2 text-right">Approval rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dimension.groups?.map((group) => (
                        <tr key={`${dimension.attribute}-${group.value}`}>
                          <td className="py-1 font-semibold text-slate-800 text-left">
                            {group.value}
                          </td>
                          <td className="py-1 text-right font-medium text-slate-700">{group.count}</td>
                          <td className="py-1 text-right font-medium text-slate-700">
                            {(group.approvalRate * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card
        title={
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-amber-600" />
            Bias Watchlist
          </div>
        }
        subtitle="Top features contributing negatively to approvals over the rolling window."
      >
        {summary?.shapWatchlist?.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {summary.shapWatchlist.map((item) => (
              <li
                key={item.feature}
                className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3"
              >
                <span className="font-semibold text-slate-800">{item.feature}</span>
                <span className="font-mono text-xs text-red-600">
                  -{item.weight.toFixed(3)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No SHAP outliers detected.</p>
        )}
      </Card>
    </div>
  );
}

