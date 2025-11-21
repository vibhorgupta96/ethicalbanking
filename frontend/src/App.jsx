import { useState } from 'react';
import './App.css';
import LoginScreen from './screens/LoginScreen';
import DecisionScreen from './screens/DecisionScreen';
import TrustVaultScreen from './screens/TrustVaultScreen';
import AskAiScreen from './screens/AskAiScreen';

const viewConfig = [
  { id: 'login', label: 'Login' },
  { id: 'decision', label: 'Decision' },
  { id: 'trustvault', label: 'TrustVault' },
  { id: 'askai', label: 'AskAI' }
];

const screenMap = {
  login: LoginScreen,
  decision: DecisionScreen,
  trustvault: TrustVaultScreen,
  askai: AskAiScreen
};

function App() {
  const [activeView, setActiveView] = useState('login');
  const CurrentScreen = screenMap[activeView];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary">
              Ethical Banking Hackathon
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              Layer 3 • AskAI + TrustVault
            </h1>
          </div>
          <nav className="flex flex-wrap gap-2">
            {viewConfig.map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeView === view.id
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {view.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <CurrentScreen />
      </main>
    </div>
  );
}

export default App;
