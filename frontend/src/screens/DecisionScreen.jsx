import { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Api } from '../lib/api';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

function DriverBar({ driver }) {
  const impact = Number(driver?.impact ?? 0);
  const width = Math.min(100, Math.max(8, Math.abs(Math.round(impact * 100))));
  const positive = impact >= 0;

  return (
    <div className="space-y-2 rounded-2xl border border-slate-100 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">{driver.label}</p>
          <p className="text-xs text-slate-500">{driver.value}</p>
        </div>
        <span
          className={`text-sm font-semibold ${
            positive ? 'text-emerald-600' : 'text-red-600'
          }`}
        >
          {positive ? '+' : ''}
          {impact.toFixed(2)}
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${
            positive ? 'bg-emerald-500' : 'bg-red-500'
          }`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export default function DecisionScreen({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [insight, setInsight] = useState(null);
  const [rosterError, setRosterError] = useState('');
  const [insightError, setInsightError] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      setRosterError('');
      try {
        const { data } = await Api.listUsers();
        if (!isMounted) {
          return;
        }
        setUsers(data);
        setSelectedUserId((current) => current || data[0]?.externalId || '');
      } catch (err) {
        if (!isMounted) {
          return;
        }
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Unable to load users from the gateway.';
        setRosterError(message);
      } finally {
        if (isMounted) {
          setIsLoadingUsers(false);
        }
      }
    };

    fetchUsers();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedUserId) {
      return;
    }

    let isMounted = true;

    const fetchInsight = async () => {
      setIsLoadingInsight(true);
      setInsightError('');
      try {
        const { data } = await Api.getDecisionInsight(selectedUserId);
        if (!isMounted) {
          return;
        }
        setInsight(data);
      } catch (err) {
        if (!isMounted) {
          return;
        }
        const message =
          err?.response?.status === 404
            ? 'No decision record was found for this user.'
            : err?.response?.data?.message ||
              err?.message ||
              'Unable to load decision insight.';
        setInsight(null);
        setInsightError(message);
      } finally {
        if (isMounted) {
          setIsLoadingInsight(false);
        }
      }
    };

    fetchInsight();
    return () => {
      isMounted = false;
    };
  }, [selectedUserId]);

  const selectedUser = users.find((user) => user.externalId === selectedUserId);

  if (currentUser?.role !== 'admin') {
    return (
      <Card title="Decision Console">
        <p className="text-sm text-slate-600">
          This console is reserved for admin reviewers. Please sign in as an admin user to view
          decision intelligence.
        </p>
      </Card>
    );
  }

  const formatCurrency = (value) => {
    if (value === null || value === undefined) {
      return 'n/a';
    }
    return currencyFormatter.format(Number(value));
  };

  return (
    <div className="space-y-6">
      <Card
        title="Decision Workbench"
        subtitle="Select any customer to inspect the latest automated credit decision."
      >
        {rosterError && <p className="text-sm text-red-600">{rosterError}</p>}
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
          Customer
          <select
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:border-primary focus:outline-none"
            value={selectedUserId}
            disabled={isLoadingUsers || users.length === 0}
            onChange={(event) => setSelectedUserId(event.target.value)}
          >
            {users.map((user) => (
              <option key={user.externalId} value={user.externalId}>
                {user.fullName} ({user.externalId})
              </option>
            ))}
          </select>
        </label>
        {isLoadingUsers && (
          <p className="text-xs text-slate-500">Loading customer roster from the gateway…</p>
        )}
        {selectedUser && (
          <dl className="grid gap-4 rounded-2xl border border-slate-100 p-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase text-slate-400">Segment</dt>
              <dd className="text-sm font-semibold text-slate-900">{selectedUser.segment}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-slate-400">Credit Score</dt>
              <dd className="text-sm font-semibold text-slate-900">
                {selectedUser.creditScore ?? 'n/a'}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-slate-400">Net Monthly Income</dt>
              <dd className="text-sm font-semibold text-slate-900">
                {formatCurrency(selectedUser.netMonthlyIncome)}
              </dd>
            </div>
          </dl>
        )}
      </Card>

      <Card
        title="Decision Snapshot"
      >
        {isLoadingInsight && (
          <p className="text-sm text-slate-500">Loading the latest decision…</p>
        )}
        {insightError && <p className="text-sm text-red-600">{insightError}</p>}
        {!isLoadingInsight && !insight && !insightError && (
          <p className="text-sm text-slate-500">Select a customer to view their decision.</p>
        )}
        {insight && (
          <div className="space-y-4 text-sm text-slate-700">
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-xs uppercase text-slate-400">User</p>
                <p className="text-base font-semibold text-slate-900">{insight.userId}</p>
                <p className="text-xs text-slate-500">{insight.fullName}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Decision</p>
                <p
                  className={`text-base font-semibold ${
                    insight.decision.decision === 'Approved'
                      ? 'text-emerald-600'
                      : 'text-red-600'
                  }`}
                >
                  {insight.decision.decision}
                </p>
                <p className="text-xs text-slate-500">
                  {insight.decision.decisionDate}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Product</p>
                <p className="text-base font-semibold text-slate-900">
                  {insight.decision.productType}
                </p>
                <p className="text-xs text-slate-500">
                  {formatCurrency(insight.decision.requestedAmount)}
                </p>
              </div>
            </div>
            <p className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-700">
              {insight.decision.rationale}
            </p>
          </div>
        )}
      </Card>

      <Card
        title="Decision Drivers"
        subtitle="Normalized contributions calculated from the credit file and loan request."
      >
        {isLoadingInsight && (
          <p className="text-sm text-slate-500">Calculating SHAP-like drivers…</p>
        )}
        {!isLoadingInsight && insight?.drivers?.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2">
            {insight.drivers.map((driver) => (
              <DriverBar key={driver.key} driver={driver} />
            ))}
          </div>
        )}
        {!isLoadingInsight && (!insight || insight.drivers?.length === 0) && (
          <p className="text-sm text-slate-500">
            Select a customer to visualize the factors that influenced their decision.
          </p>
        )}
      </Card>

      <Card
        title="Counterfactual Insight"
        subtitle="Model-generated what-if scenario the admin can share with the applicant."
      >
        {isLoadingInsight && (
          <p className="text-sm text-slate-500">Simulating alternative strategies…</p>
        )}
        {!isLoadingInsight && insight?.counterfactual && (
          <p className="text-sm text-slate-700">{insight.counterfactual}</p>
        )}
        {!isLoadingInsight && !insight?.counterfactual && (
          <p className="text-sm text-slate-500">
            Select a customer to surface a personalized counterfactual explanation.
          </p>
        )}
      </Card>
    </div>
  );
}

