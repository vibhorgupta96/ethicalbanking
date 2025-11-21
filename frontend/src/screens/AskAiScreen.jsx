import { useState } from 'react';
import { Card } from '../components/common/Card';

export default function AskAiScreen() {
  const [question, setQuestion] = useState('Why was my loan rejected?');
  const [response, setResponse] = useState(
    'Gemini explanation placeholder: awaiting backend wiring.'
  );

  return (
    <div className="space-y-6">
      <Card
        title="AskAI"
        subtitle="Routes through Java gateway → Python SHAP → Gemini."
        actions={
          <button
            type="button"
            onClick={() =>
              setResponse('Submitting to gateway... (stubbed response)')
            }
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-slate-900"
          >
            Submit Question
          </button>
        }
      >
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={4}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-primary focus:outline-none"
        />
      </Card>
      <Card title="LLM Response Preview">
        <p className="text-sm text-slate-700">{response}</p>
      </Card>
    </div>
  );
}

