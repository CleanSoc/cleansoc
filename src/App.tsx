import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useSessionQuery, AppShell } from './components/AppShell';
import { Spinner } from './components/ui';
import { LogoMark } from './components/Logo';
import { WelcomePage } from './pages/Welcome';
import { DashboardPage } from './pages/Dashboard';
import { ActivityPage } from './pages/Activity';
import { CleanupPage } from './pages/Cleanup';
import { JobDetailPage } from './pages/JobDetail';
import { RulesPage } from './pages/Rules';
import { HistoryPage } from './pages/History';
import { ArchivePage } from './pages/Archive';
import { SettingsPage } from './pages/Settings';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';

function BootScreen() {
  return (
    <div className="grid min-h-full place-items-center bg-canvas">
      <div className="flex flex-col items-center gap-4">
        <LogoMark className="size-10 animate-pulse" />
        <div className="flex items-center gap-2 text-[13px] text-muted">
          <Spinner className="size-3.5" />
          Opening your workspace…
        </div>
      </div>
    </div>
  );
}

function ProtectedLayout() {
  const { data, isLoading, isError } = useSessionQuery();
  const location = useLocation();

  if (isLoading) return <BootScreen />;
  if (isError) {
    return (
      <div className="grid min-h-full place-items-center bg-canvas px-6">
        <div className="max-w-sm text-center">
          <h1 className="text-[17px] font-semibold text-ink">The API is unreachable</h1>
          <p className="mt-2 text-[13px] leading-5 text-muted">
            CleanSoc could not reach its backend. Make sure the server is running on port 8787, then reload.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 h-10 rounded-xl bg-accent px-4 text-[13.5px] font-medium text-accent-ink"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  if (!data?.authenticated) {
    return <Navigate to="/welcome" replace state={{ from: location.pathname + location.search }} />;
  }

  return (
    <AppShell session={data}>
      <Outlet context={{ session: data }} />
    </AppShell>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="/app" element={<ProtectedLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="cleanup" element={<CleanupPage />} />
        <Route path="cleanup/:jobId" element={<JobDetailPage />} />
        <Route path="rules" element={<RulesPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="archive" element={<ArchivePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}
