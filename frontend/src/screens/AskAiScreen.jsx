import { useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import { 
  MessageSquare, 
  Bot, 
  Send, 
  Shield, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Api } from '../lib/api';

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

export default function AskAiScreen({ currentUser }) {
  const [question, setQuestion] = useState('Why was my loan rejected?');
  const [decisionSummary, setDecisionSummary] = useState('');
  const [response, setResponse] = useState('LLM explanation pending submission.');
  const [shapValues, setShapValues] = useState([]);
  const [fairGuardStatus, setFairGuardStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Use the logged-in user ID, fallback to 'user_001' if somehow not present
  const activeUserId = currentUser?.id || 'user_001';
  const activeUserName = currentUser?.profile?.fullName || currentUser?.displayName || activeUserId;

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
      // Push the question as a "consent" or context payload for the user
      await Api.setConsent(activeUserId, { consentPayload: question });
      
      const { data } = await Api.askAi({
        userId: activeUserId,
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
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Unable to reach the AskAI endpoint.';
      setError(message);
      setResponse('LLM explanation unavailable.');
      setFairGuardStatus(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Ask AI Assistant</h2>
        <p className="mt-2 text-slate-600">
          Get real-time explanations about your credit decisions, powered by transparent LLMs.
        </p>
      </div>

      <Card
        title={
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Submit Your Query
          </div>
        }
        actions={
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-secondary hover:shadow-primary/40 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              'Submitting…'
            ) : (
              <>
                <Send className="h-4 w-4" /> Submit Question
              </>
            )}
          </button>
        }
      >
        <div className="relative">
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            rows={4}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition-all focus:bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            placeholder="Type your question here..."
          />
          <div className="absolute bottom-3 right-3">
            <span className="text-[10px] font-medium uppercase text-slate-400">
               User: {activeUserName}
            </span>
          </div>
        </div>
        
        <div className="pt-3">
          <p className="mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Suggested Questions
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "Why was my loan rejected?",
              "How can I improve my chances next time?",
              "Was my application treated fairly?"
            ].map((recQuestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setQuestion(recQuestion)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition-all hover:border-primary hover:text-primary hover:shadow-sm active:bg-slate-50"
              >
                {recQuestion}
              </button>
            ))}
          </div>
        </div>
      </Card>
      
      {/* Response Area */}
      {(decisionSummary || response !== 'LLM explanation pending submission.') && (
      <div className="grid gap-6 md:grid-cols-2">
        <Card title={
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-indigo-600" />
            AI Response
          </div>
        }>
          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
          {decisionSummary && (
            <div className="mb-4 rounded-lg bg-indigo-50 p-3 text-sm font-medium text-indigo-900 border border-indigo-100">
              {decisionSummary}
            </div>
          )}
          <div
            className="askai-response text-sm leading-relaxed text-slate-700 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizedResponse }}
          />
        </Card>

        <div className="space-y-6">
            <Card title={
            <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-600" />
                FairGuardAI Oversight
            </div>
            }>
            {!fairGuardStatus && (
                <p className="text-sm text-slate-500 italic">
                Guardrails will activate upon submission.
                </p>
            )}
            {fairGuardStatus && (
                <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 border border-slate-100">
                    <span className="text-sm font-medium text-slate-600">Status</span>
                    <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                        fairGuardStatus.status === 'ALERT'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                    >
                    {fairGuardStatus.status}
                    </span>
                </div>
                {fairGuardStatus.alerts?.length > 0 ? (
                    <div className="rounded-lg bg-red-50 p-3 border border-red-100">
                        <p className="text-xs font-bold text-red-800 uppercase mb-2">Active Alerts</p>
                        <ul className="space-y-2 text-sm text-red-700">
                        {fairGuardStatus.alerts.map((alert, index) => (
                            <li key={`${alert}-${index}`} className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                            {alert}
                            </li>
                        ))}
                        </ul>
                    </div>
                ) : (
                    <p className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                    <CheckCircle2 className="h-4 w-4" />
                    All guardrails passed.
                    </p>
                )}
                </div>
            )}
            </Card>
            
            <Card title={
                <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-amber-600" />
                Key Factors
                </div>
            }>
                {shapValues.length === 0 && (
                <p className="text-sm text-slate-500 italic">Awaiting analysis...</p>
                )}
                {shapValues.length > 0 && (
                <div className="space-y-3">
                    {(() => {
                    const maxAbsVal = Math.max(...shapValues.map(([, v]) => Math.abs(v))) || 1;
                    
                    return shapValues.slice(0, 5).map(([feature, value]) => { // Show top 5
                        const isPositive = value >= 0;
                        const widthPct = (Math.abs(value) / maxAbsVal) * 100;

                        return (
                        <div key={feature} className="group">
                            <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-700 truncate pr-2" title={feature}>{feature}</span>
                            <span
                                className={`font-mono font-semibold ${
                                isPositive ? 'text-emerald-600' : 'text-red-600'
                                }`}
                            >
                                {value > 0 ? '+' : ''}{value.toFixed(3)}
                            </span>
                            </div>
                            <div className="relative h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                                className={`absolute h-full rounded-full transition-all duration-700 ease-out ${
                                isPositive ? 'bg-emerald-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${widthPct}%` }}
                            />
                            </div>
                        </div>
                        );
                    });
                    })()}
                </div>
                )}
            </Card>
        </div>
      </div>
      )}
    </div>
  );
}
