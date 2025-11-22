import { useState } from 'react';
import './App.css';
import LoginScreen from './screens/LoginScreen';
import DecisionScreen from './screens/DecisionScreen';
import TrustVaultScreen from './screens/TrustVaultScreen';
import AskAiScreen from './screens/AskAiScreen';

const viewConfig = [
  { id: 'decision', label: 'XBox', roles: ['admin'] },
  { id: 'trustvault', label: 'TrustVault', roles: ['customer'] },
  { id: 'askai', label: 'AskAI', roles: ['admin', 'customer'] }
];

const screenMap = {
  decision: DecisionScreen,
  trustvault: TrustVaultScreen,
  askai: AskAiScreen
};

function App() {
  const [activeView, setActiveView] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);

  const accessibleViews = currentUser
    ? viewConfig.filter((view) => view.roles.includes(currentUser.role))
    : [];

  const handleLogin = (userProfile) => {
    setCurrentUser(userProfile);
    const nextView =
      viewConfig.find((view) => view.roles.includes(userProfile.role))?.id ??
      'login';
    setActiveView(nextView);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView('login');
  };

  let mainContent = <LoginScreen onLogin={handleLogin} />;
  if (currentUser) {
    const ScreenComponent = screenMap[activeView] ?? TrustVaultScreen;
    mainContent = <ScreenComponent currentUser={currentUser} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary">
              Ethical Banking Hackathon
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              Layer 3 • AskAI + TrustVault
            </h1>
          </div>
          {currentUser ? (
            <div className="flex flex-col gap-3 lg:items-end">
              {accessibleViews.length > 0 && (
                <nav className="flex flex-wrap justify-end gap-2">
                  {accessibleViews.map((view) => (
                    <button
                      key={view.id}
                      type="button"
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
              )}
              <div className="flex flex-wrap items-center justify-end gap-3">
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Signed in as
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {currentUser.profile?.fullName ||
                      currentUser.displayName ||
                      currentUser.id}
                  </p>
                  <p className="text-xs text-slate-500">
                    {currentUser.role === 'admin'
                      ? 'Admin user'
                      : 'Bank customer'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              Please log in to unlock AskAI, TrustVault, and Decision tabs.
            </p>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        {mainContent}
      </main>
    </div>
  );
}

export default App;
