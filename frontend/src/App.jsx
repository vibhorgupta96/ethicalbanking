import { useState } from 'react';
import { 
  Landmark, 
  LayoutDashboard, 
  ShieldCheck, 
  Lock, 
  MessageSquare, 
  LogOut, 
  User 
} from 'lucide-react';
import './App.css';
import LoginScreen from './screens/LoginScreen';
import DecisionScreen from './screens/DecisionScreen';
import TrustVaultScreen from './screens/TrustVaultScreen';
import AskAiScreen from './screens/AskAiScreen';
import FairGuardScreen from './screens/FairGuardScreen';

const viewConfig = [
  { id: 'decision', label: 'XBox', roles: ['admin'], icon: LayoutDashboard },
  { id: 'fairguard', label: 'FairGuard', roles: ['admin'], icon: ShieldCheck },
  { id: 'trustvault', label: 'TrustVault', roles: ['customer'], icon: Lock },
  { id: 'askai', label: 'AskAI', roles: ['admin', 'customer'], icon: MessageSquare }
];

const screenMap = {
  decision: DecisionScreen,
  fairguard: FairGuardScreen,
  trustvault: TrustVaultScreen,
  askai: AskAiScreen
};

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeView, setActiveView] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      const user = JSON.parse(saved);
      return viewConfig.find((view) => view.roles.includes(user.role))?.id ?? 'login';
    }
    return 'login';
  });

  const accessibleViews = currentUser
    ? viewConfig.filter((view) => view.roles.includes(currentUser.role))
    : [];

  const handleLogin = (userProfile) => {
    localStorage.setItem('currentUser', JSON.stringify(userProfile));
    setCurrentUser(userProfile);
    const nextView =
      viewConfig.find((view) => view.roles.includes(userProfile.role))?.id ??
      'login';
    setActiveView(nextView);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setActiveView('login');
  };

  let mainContent = <LoginScreen onLogin={handleLogin} />;
  if (currentUser) {
    const ScreenComponent = screenMap[activeView] ?? TrustVaultScreen;
    mainContent = <ScreenComponent currentUser={currentUser} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-primary/20">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/20">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900">GHCI Bank</h1>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Ethical AI Banking</p>
            </div>
          </div>
          {currentUser ? (
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              {accessibleViews.length > 0 && (
                <nav className="flex flex-wrap justify-center gap-1 rounded-full bg-slate-100/50 p-1">
                  {accessibleViews.map((view) => {
                    const Icon = view.icon;
                    const isActive = activeView === view.id;
                    return (
                      <button
                        key={view.id}
                        type="button"
                        onClick={() => setActiveView(view.id)}
                        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200'
                            : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                        {view.label}
                      </button>
                    );
                  })}
                </nav>
              )}
              <div className="flex items-center justify-end gap-4 border-l border-slate-200 pl-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 ring-2 ring-white">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-semibold text-slate-900">
                      {currentUser.profile?.fullName ||
                        currentUser.displayName ||
                        currentUser.id}
                    </p>
                    <p className="text-xs font-medium text-slate-500">
                      {currentUser.role === 'admin'
                        ? 'Administrator'
                        : 'Customer'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="group flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8 animate-in fade-in duration-500 slide-in-from-bottom-4">
        {mainContent}
      </main>
    </div>
  );
}

export default App;
