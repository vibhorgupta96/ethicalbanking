import { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  TrendingUp, 
  Zap, 
  Clock, 
  IndianRupee, 
  CreditCard 
} from 'lucide-react';
import { Combobox } from '../components/common/Combobox';
import { Card } from '../components/common/Card';
import { Api } from '../lib/api';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

const DRIVER_DETAILS = {
  'Credit Score': {
    description: 'A summary of credit risk based on credit history.',
    examples: 'Payment history (35%), Amounts owed (30%), Length of history (15%), New credit (10%).'
  },
  'Net Monthly Income': {
    description: 'Take-home pay available for debt repayment and living expenses.',
    examples: 'Base salary, overtime, bonuses, commissions, dividends (after tax deductions).'
  },
  'Credit Card Utilization': {
    description: 'Ratio of current revolving credit balances to credit limits.',
    examples: 'Total Balance / Total Limit (e.g. ₹2k / ₹10k = 20%).'
  },
  'Times Delinquent': {
    description: 'Frequency of past-due payments on credit accounts.',
    examples: 'Missed payments (30+ days), late fees, charge-offs in the last 24 months.'
  },
  'Age': {
    description: 'Applicant age, often correlated with credit history length.',
    examples: 'Years since birth (stability factor).'
  },
  'Recent Product Inquiry': {
     description: 'Frequency of new credit applications in the recent past.',
     examples: 'Hard inquiries from other lenders for credit cards, loans, or mortgages.'
  },
  'Loan Amount': {
      description: 'The total principal amount requested for the loan.',
      examples: 'Higher amounts may increase risk exposure.'
  }
};

function RadarChart({ data }) {
  if (!data || data.length < 3) return null;
  
  const size = 280;
  const center = size / 2;
  const radius = 90;
  
  // Take top 6 drivers by absolute impact
  const chartData = [...data]
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .slice(0, 6);
    
  const maxVal = Math.max(...chartData.map(d => Math.abs(Number(d.impact) || 0))) || 1;
  
  const getCoordinates = (value, index, total) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const r = (value / maxVal) * radius;
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
  };

  const points = chartData.map((d, i) => {
    const val = Math.abs(Number(d.impact) || 0);
    const [x, y] = getCoordinates(val, i, chartData.length);
    return `${x},${y}`;
  }).join(' ');
  
  const axes = chartData.map((_, i) => {
    const [x, y] = getCoordinates(maxVal, i, chartData.length);
    return (
      <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4" />
    );
  });

  return (
    <div className="flex flex-col items-center justify-center border-b border-slate-100 pb-6 mb-6">
        <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            Impact Magnitude (Top Factors)
        </h4>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Background circles */}
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <circle
            key={scale}
            cx={center}
            cy={center}
            r={radius * scale}
            fill="none"
            stroke="#e2e8f0"
          />
        ))}
        {/* Axes */}
        {axes}
        {/* Data Polygon */}
        <polygon points={points} fill="rgba(99, 102, 241, 0.1)" stroke="#6366f1" strokeWidth="2" />
        {/* Points */}
        {chartData.map((d, i) => {
           const val = Math.abs(Number(d.impact) || 0);
           const [x, y] = getCoordinates(val, i, chartData.length);
           return (
             <circle key={i} cx={x} cy={y} r="4" fill={Number(d.impact) >= 0 ? '#10b981' : '#ef4444'} stroke="white" strokeWidth="1.5" />
           );
        })}
        {/* Labels */}
         {chartData.map((d, i) => {
             const [refX, refY] = getCoordinates(maxVal * 1.2, i, chartData.length);
             return (
                 <text 
                    key={i} 
                    x={refX} 
                    y={refY} 
                    textAnchor="middle" 
                    dominantBaseline="middle"
                    className="text-[10px] font-medium fill-slate-600"
                    style={{ textTransform: 'capitalize' }}
                 >
                     {d.label}
                 </text>
             )
         })}
      </svg>
    </div>
  );
}

function DriverBar({ driver }) {
  const impact = Number(driver?.impact ?? 0);
  const width = Math.min(100, Math.max(8, Math.abs(Math.round(impact * 100))));
  const positive = impact >= 0;
  const details = DRIVER_DETAILS[driver.label] || {
      description: `Contribution of ${driver.label} to the decision score.`,
      examples: 'Historical patterns and correlation with default risk.'
  };

  return (
    <div className="group relative">
        {/* Tooltip */}
        <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden w-64 -translate-x-1/2 rounded-xl bg-slate-900/95 p-3 text-xs text-white opacity-0 shadow-xl backdrop-blur-sm transition-opacity duration-200 group-hover:block group-hover:opacity-100 z-20">
            <p className="mb-1 font-semibold text-emerald-300">{driver.label}</p>
            <p className="mb-2 leading-relaxed">{details.description}</p>
            <div className="border-t border-slate-700 pt-2">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Contributors</p>
                <p className="text-slate-300">{details.examples}</p>
            </div>
            <div className="absolute top-full left-1/2 -mt-1 h-2 w-2 -translate-x-1/2 rotate-45 bg-slate-900/95"></div>
        </div>

        <div className="space-y-2 rounded-2xl border border-slate-100 p-4 transition-colors hover:bg-slate-50 cursor-default">
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
    </div>
  );
}

export default function DecisionScreen({ currentUser }) {
  const [users, setUsers] = useState([]);
  // searchQuery removed as it is now internal to Combobox
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
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Explainable Banking Operations (XBox)</h2>
        <p className="mt-2 text-slate-600">
          Select a customer to reveal the logic behind their credit decision.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card
            title={
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-primary" />
                Customer Selection
              </div>
            }
          >
            {rosterError && <p className="text-sm text-red-600">{rosterError}</p>}
            
            <Combobox
              label="Customer"
              placeholder="Search by name or ID..."
              options={users.map(user => ({
                value: user.externalId,
                label: user.fullName,
                subtitle: user.externalId
              }))}
              value={selectedUserId}
              onChange={setSelectedUserId}
              disabled={isLoadingUsers || users.length === 0}
            />

            {isLoadingUsers && (
              <p className="text-xs text-slate-500 mt-2">Loading customer roster from the gateway…</p>
            )}
            {selectedUser && (
              <dl className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 border border-slate-100">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <dt className="text-xs font-medium uppercase text-slate-500">Segment</dt>
                  <dd className="text-sm font-bold text-slate-900">{selectedUser.segment}</dd>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <dt className="text-xs font-medium uppercase text-slate-500">Credit Score</dt>
                  <dd className="text-sm font-bold text-slate-900">
                    {selectedUser.creditScore ?? 'n/a'}
                  </dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-xs font-medium uppercase text-slate-500">Monthly Income</dt>
                  <dd className="text-sm font-bold text-slate-900">
                    {formatCurrency(selectedUser.netMonthlyIncome)}
                  </dd>
                </div>
              </dl>
            )}
          </Card>

          <Card
            title={
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Counterfactual
              </div>
            }
            subtitle="What-if scenario"
          >
            {isLoadingInsight && (
              <p className="text-sm text-slate-500">Simulating alternative strategies…</p>
            )}
            {!isLoadingInsight && insight?.counterfactual && (
              <p className="text-sm leading-relaxed text-slate-700">{insight.counterfactual}</p>
            )}
            {!isLoadingInsight && !insight?.counterfactual && (
              <p className="text-sm text-slate-500">
                Select a customer to surface a personalized counterfactual explanation.
              </p>
            )}
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card
            title={
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-600" />
                Decision Snapshot
              </div>
            }
          >
            {isLoadingInsight && (
              <div className="flex items-center justify-center py-8 text-slate-500">
                <Clock className="mr-2 h-5 w-5 animate-spin" /> Loading decision details...
              </div>
            )}
            {insightError && <p className="text-sm text-red-600">{insightError}</p>}
            {!isLoadingInsight && !insight && !insightError && (
              <p className="text-sm text-slate-500">Select a customer to view their decision.</p>
            )}
            {insight && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-100 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Decision</p>
                    <p
                      className={`text-xl font-bold ${
                        insight.decision.decision === 'Approved'
                          ? 'text-emerald-600'
                          : 'text-red-600'
                      }`}
                    >
                      {insight.decision.decision}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {insight.decision.decisionDate}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-100 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Product</p>
                    <p className="text-lg font-bold text-slate-900">
                      {insight.decision.productType}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-100 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Amount</p>
                    <p className="text-lg font-bold text-slate-900">
                      {formatCurrency(insight.decision.requestedAmount)}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Rationale</h4>
                  <p className="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 border border-slate-100">
                    {insight.decision.rationale}
                  </p>
                </div>
              </div>
            )}
          </Card>

          <Card
            title={
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Decision Drivers
              </div>
            }
            subtitle="Normalized contributions calculated from the credit file and loan request."
          >
            {isLoadingInsight && (
              <p className="text-sm text-slate-500">Calculating SHAP-like drivers…</p>
            )}
            {!isLoadingInsight && insight?.drivers?.length > 0 && (
              <div className="flex flex-col xl:flex-row gap-8">
                <div className="flex-shrink-0 flex justify-center xl:justify-start">
                   <RadarChart data={insight.drivers} />
                </div>
                <div className="flex-grow grid gap-3 md:grid-cols-2 xl:grid-cols-1 content-start">
                  {insight.drivers.map((driver) => (
                    <DriverBar key={driver.key} driver={driver} />
                  ))}
                </div>
              </div>
            )}
            {!isLoadingInsight && (!insight || insight.drivers?.length === 0) && (
              <p className="text-sm text-slate-500">
                Select a customer to visualize the factors that influenced their decision.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

