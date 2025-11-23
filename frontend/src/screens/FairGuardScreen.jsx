import { useEffect, useMemo, useState } from 'react';
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
      <Card
        title="Governance Status"
        subtitle="Real-time bias detection, drift monitoring, and automated circuit breakers."
        actions={
          <span
            className={`rounded-full px-4 py-1 text-xs font-semibold ${
              circuitBreakerActive
                ? 'bg-red-600 text-white'
                : 'bg-emerald-500 text-white'
            }`}
          >
            {circuitBreakerActive ? 'Circuit Breaker Active' : 'Guardrails Normal'}
          </span>
        }
      >
        {error && <p className="text-sm text-red-600">{error}</p>}
        {isLoading && (
          <p className="text-sm text-slate-500">Refreshing FairGuard telemetry…</p>
        )}
        {summary && !isLoading && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-xs uppercase text-slate-400">Window Size</p>
                <p className="text-lg font-semibold text-slate-900">
                  {summary.windowSize}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Drift Score</p>
                <p
                  className={`text-lg font-semibold ${
                    summary.drift?.status === 'ALERT'
                      ? 'text-red-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {summary.drift?.score?.toFixed(3) ?? '0.000'}
                </p>
                <p className="text-xs text-slate-500">
                  Threshold {summary.drift?.threshold?.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Alerts</p>
                <p className="text-lg font-semibold text-slate-900">
                  {summary.alerts?.length ?? 0}
                </p>
                {summary.circuitBreaker?.reason && (
                  <p className="text-xs text-slate-500">
                    {summary.circuitBreaker.reason}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </Card>

      <Card
        title="Demographic Parity Watchlist"
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
                  <table className="min-w-full text-left text-sm text-slate-600">
                    <thead>
                      <tr className="text-xs uppercase text-slate-400">
                        <th className="py-2">Group</th>
                        <th className="py-2">Samples</th>
                        <th className="py-2">Approval rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dimension.groups?.map((group) => (
                        <tr key={`${dimension.attribute}-${group.value}`}>
                          <td className="py-1 font-semibold text-slate-800">
                            {group.value}
                          </td>
                          <td className="py-1">{group.count}</td>
                          <td className="py-1">
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
        title="SHAP Bias Watchlist"
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

