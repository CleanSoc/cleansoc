import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useSessionQuery, AppShell } from './components/AppShell';
import { Skeleton } from './components/ui';
import { WelcomePage } from './pages/Welcome';
import { DashboardPage } from './pages/Dashboard';
import { ActivityPage } from './pages/Activity';
import { CleanupPage } from './pages/Cleanup';
import { JobDetailPage } from './pages/JobDetail';
import { RulesPage } from './pages/Rules';
import { HistoryPage } from './pages/History';
import { ArchivePage } from './pages/Archive';
import { PublicLayout } from './components/PublicLayout';
import { NotFoundPage } from './pages/NotFoundPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { UseCasesPage } from './pages/UseCasesPage';
import { FaqPage } from './pages/FaqPage';
import { ContactPage } from './pages/ContactPage';
import { SettingsPage } from './pages/Settings';

function BootScreen() {
  return (
    <div className="min-h-full bg-canvas">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Skeleton className="size-8 rounded-lg" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="mx-auto mt-6 grid max-w-[1440px] gap-4 px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
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
      <Route element={<PublicLayout />}>
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/use-cases" element={<UseCasesPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/welcome" replace />} />
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
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
