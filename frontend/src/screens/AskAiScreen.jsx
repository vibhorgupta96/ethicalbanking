import { useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import { Card } from '../components/common/Card';
import { Api } from '../lib/api';

const DEFAULT_USER_ID = 'user_001';
const DEFAULT_FEATURE_SNAPSHOT = {
  MARITALSTATUS: 'Married',
  EDUCATION: 'Graduate',
  GENDER: 'F',
  CC_Flag: 'Y',
  PL_Flag: 'N',
  HL_Flag: 'Y',
  GL_Flag: 'N',
  last_prod_enq2: 'PL',
  first_prod_enq2: 'CC',
  AGE: 34,
  NETMONTHLYINCOME: 9500,
  Credit_Score: 742,
  num_times_delinquent: 1,
  num_times_60p_dpd: 0,
  num_std: 2,
  num_sub: 0,
  num_dbt: 0,
  CC_utilization: 0.28,
  PL_utilization: 0.12,
  time_since_recent_payment: 32,
  time_since_recent_enq: 58
};

export default function AskAiScreen() {
  const [question, setQuestion] = useState('Why was my loan rejected?');
  const [decisionSummary, setDecisionSummary] = useState('');
  const [response, setResponse] = useState('Mistral explanation pending submission.');
  const [shapValues, setShapValues] = useState([]);
  const [fairGuardStatus, setFairGuardStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const sanitizedResponse = useMemo(
    () => DOMPurify.sanitize(response ?? ''),
    [response]
  );

  const handleSubmit = async () => {
    if (!question.trim()) {
      setError('AskAI needs a question to submit.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setDecisionSummary('');
    setResponse('Sending question to the gateway...');
    setShapValues([]);
    setFairGuardStatus(null);

    try {
      await Api.setConsent(DEFAULT_USER_ID, { consentPayload: question });
      const { data } = await Api.askAi({
        userId: DEFAULT_USER_ID,
        question,
        featureSnapshot: DEFAULT_FEATURE_SNAPSHOT
      });

      setDecisionSummary(data?.decisionSummary ?? 'Decision summary unavailable.');
      setResponse(
        data?.explanation ??
          'The Hugging Face client responded without an explanation payload.'
      );
      setFairGuardStatus(data?.fairGuard ?? null);

      const sortedShap = Object.entries(data?.shapValues ?? {}).sort(
        (a, b) => Math.abs(b[1]) - Math.abs(a[1])
      );
      setShapValues(sortedShap);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Unable to reach the AskAI endpoint.';
      setError(message);
      setResponse('Mistral explanation unavailable.');
      setFairGuardStatus(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card
        title="AskAI"
        subtitle="Routes through Java gateway → Python SHAP → Hugging Face (Mistral-7B-Instruct-v0.2)."
        actions={
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Submitting…' : 'Submit Question'}
          </button>
        }
      >
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={4}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-primary focus:outline-none"
        />
        <p className="text-xs text-slate-500">
          Uses `user_001` with a fixed feature snapshot so the backend and Hugging Face can
          return a deterministic explanation.
        </p>
      </Card>
      <Card title="FairGuardAI Oversight">
        {!fairGuardStatus && (
          <p className="text-sm text-slate-500">
            Submit a question to view the real-time guardrail response.
          </p>
        )}
        {fairGuardStatus && (
          <div className="space-y-3 text-sm">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-slate-500">Status</span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  fairGuardStatus.status === 'ALERT'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {fairGuardStatus.status}
              </span>
            </div>
            {fairGuardStatus.alerts?.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5 text-red-600">
                {fairGuardStatus.alerts.map((alert, index) => (
                  <li key={`${alert}-${index}`}>{alert}</li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-600">
                All guardrails are within tolerance. This decision can be auto-released.
              </p>
            )}
          </div>
        )}
      </Card>
      <Card title="LLM Response Preview">
        {error && <p className="text-sm text-red-600">{error}</p>}
        {decisionSummary && (
          <p className="text-sm font-semibold text-slate-800">{decisionSummary}</p>
        )}
        <div
          className="askai-response text-sm text-slate-700"
          dangerouslySetInnerHTML={{ __html: sanitizedResponse }}
        />
      </Card>
      <Card title="Top SHAP Drivers">
        {shapValues.length === 0 && (
          <p className="text-sm text-slate-500">Submit a question to view SHAP weights.</p>
        )}
        {shapValues.length > 0 && (
          <ul className="space-y-2 text-sm text-slate-700">
            {shapValues.map(([feature, value]) => (
              <li
                key={feature}
                className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3"
              >
                <span className="font-medium text-slate-800">{feature}</span>
                <span
                  className={`font-mono text-xs ${
                    value >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {value.toFixed(4)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
