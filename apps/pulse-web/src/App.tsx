import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { authApi } from './api/auth';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DataSources from './pages/DataSources';
import Settings from './pages/Settings';
import Team from './pages/Team';
import AthenaDashboard from './pages/AthenaDashboard';
import Scenarios from './pages/Scenarios';
import Competitors from './pages/Competitors';
import MarketIntelligence from './pages/MarketIntelligence';
import GovernAIDashboard from './pages/GovernAIDashboard';
import BoardMeetings from './pages/BoardMeetings';
import Investments from './pages/Investments';
import Compliance from './pages/Compliance';
import ESGMetrics from './pages/ESGMetrics';
import LandingPage from './pages/LandingPage';
import Pricing from './pages/Pricing';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminFeatureFlags from './pages/AdminFeatureFlags';
import AdminConfig from './pages/AdminConfig';
import AdminAuditLogs from './pages/AdminAuditLogs';
import AdminAnnouncements from './pages/AdminAnnouncements';
import AdminSystemHealth from './pages/AdminSystemHealth';
// Lean Six Sigma imports
import LeanSixSigmaDashboard from './pages/LeanSixSigmaDashboard';
import DMAICProjects from './pages/DMAICProjects';
import WasteTracking from './pages/WasteTracking';
import KaizenEvents from './pages/KaizenEvents';
import OEETracking from './pages/OEETracking';
import RootCauseAnalysis from './pages/RootCauseAnalysis';
// Advanced Analytics imports
import AdvancedAnalytics from './pages/AdvancedAnalytics';
import ProcessMapping from './pages/ProcessMapping';
import AIInsights from './pages/AIInsights';
// AI Meeting Assistant imports
import MeetingsDashboard from './pages/MeetingsDashboard';
import MeetingDetail from './pages/MeetingDetail';
import MeetingActionItems from './pages/MeetingActionItems';
import MeetingIntegrations from './pages/MeetingIntegrations';
// Document Management & Analytics imports
import DocumentManagement from './pages/DocumentManagement';
import PredictiveBI from './pages/PredictiveBI';
import MeetingAnalytics from './pages/MeetingAnalytics';
import ExecutiveReports from './pages/ExecutiveReports';
// Goal Tracking & OKRs imports
import OKRDashboard from './pages/OKRDashboard';
import GoalAlignment from './pages/GoalAlignment';
// White-Label & Localization imports
import WhiteLabelSettings from './pages/WhiteLabelSettings';
import LocalizationSettings from './pages/LocalizationSettings';
// Notifications & Workflow imports
import NotificationCenter from './pages/NotificationCenter';
import NotificationPreferences from './pages/NotificationPreferences';
import WorkflowDashboard from './pages/WorkflowDashboard';
import ScheduledTasks from './pages/ScheduledTasks';
import BillingSettings from './pages/BillingSettings';
// Super Admin Dashboard
import SuperAdminDashboard from './pages/SuperAdminDashboard';
// Auth pages
import ForgotPassword from './pages/ForgotPassword';
import PulseAIDashboard from './pages/PulseAIDashboard';
import ResetPassword from './pages/ResetPassword';
import Onboarding from './pages/Onboarding';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Admin Route - Only allows platform admins to access
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is platform admin
  if (!user?.is_platform_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400 mb-4">You don't have permission to access the Admin Dashboard.</p>
          <p className="text-slate-500 text-sm mb-6">This area is restricted to platform administrators only.</p>
          <a 
            href="/app/dashboard" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { accessToken, setUser, setOrganization, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      if (accessToken) {
        try {
          const user = await authApi.getCurrentUser();
          setUser(user);
          const org = await authApi.getCurrentOrganization();
          setOrganization(org);
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [accessToken, setUser, setOrganization, setLoading, logout]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/pricing" element={<Pricing />} />

      {/* Auth Routes */}
      <Route
        path="/login"
        element={
          <AuthRoute>
            <Login />
          </AuthRoute>
        }
      />
      <Route
        path="/register"
        element={
          <AuthRoute>
            <Register />
          </AuthRoute>
        }
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="data-sources" element={<DataSources />} />
        <Route path="briefings" element={<Dashboard />} />
        <Route path="analytics" element={<Dashboard />} />
        <Route path="alerts" element={<Dashboard />} />
        <Route path="settings" element={<Settings />} />
        <Route path="team" element={<Team />} />
        
        {/* Nova Pulse Routes */}
        <Route path="pulse" element={<PulseAIDashboard />} />
        <Route path="pulse/briefings" element={<PulseAIDashboard />} />
        <Route path="pulse/data-sources" element={<DataSources />} />
        <Route path="pulse/ask" element={<PulseAIDashboard />} />
        
        {/* Athena Routes */}
        <Route path="athena" element={<AthenaDashboard />} />
        <Route path="athena/scenarios" element={<Scenarios />} />
        <Route path="athena/scenarios/new" element={<Scenarios />} />
        <Route path="athena/competitors" element={<Competitors />} />
        <Route path="athena/competitors/new" element={<Competitors />} />
        <Route path="athena/intelligence" element={<MarketIntelligence />} />
        <Route path="athena/intelligence/new" element={<MarketIntelligence />} />
        <Route path="athena/recommendations" element={<MarketIntelligence />} />
        <Route path="athena/summaries" element={<AthenaDashboard />} />

        {/* GovernAI Routes */}
        <Route path="governai" element={<GovernAIDashboard />} />
        <Route path="governai/meetings" element={<BoardMeetings />} />
        <Route path="governai/investments" element={<Investments />} />
        <Route path="governai/compliance" element={<Compliance />} />
        <Route path="governai/esg" element={<ESGMetrics />} />

        {/* Lean Six Sigma Routes */}
        <Route path="lean" element={<LeanSixSigmaDashboard />} />
        <Route path="lean/dmaic" element={<DMAICProjects />} />
        <Route path="lean/waste" element={<WasteTracking />} />
        <Route path="lean/kaizen" element={<KaizenEvents />} />
        <Route path="lean/oee" element={<OEETracking />} />
        <Route path="lean/rca" element={<RootCauseAnalysis />} />
        {/* Advanced Analytics Routes */}
        <Route path="lean/analytics" element={<AdvancedAnalytics />} />
        <Route path="lean/process-mapping" element={<ProcessMapping />} />
        <Route path="lean/ai-insights" element={<AIInsights />} />

        {/* AI Meeting Assistant Routes */}
        <Route path="meetings" element={<MeetingsDashboard />} />
        <Route path="meetings/list" element={<MeetingsDashboard />} />
        <Route path="meetings/new" element={<MeetingsDashboard />} />
        <Route path="meetings/upload" element={<MeetingsDashboard />} />
        <Route path="meetings/:meetingId" element={<MeetingDetail />} />
        <Route path="meetings/action-items" element={<MeetingActionItems />} />
        <Route path="meetings/integrations" element={<MeetingIntegrations />} />
        <Route path="meetings/analytics" element={<MeetingAnalytics />} />

        {/* Document Management Routes */}
        <Route path="documents" element={<DocumentManagement />} />
        <Route path="documents/upload" element={<DocumentManagement />} />
        <Route path="documents/shared" element={<DocumentManagement />} />
        <Route path="documents/analysis" element={<DocumentManagement />} />

        {/* Predictive BI Routes */}
        <Route path="predictive-bi" element={<PredictiveBI />} />
        <Route path="predictive-bi/forecast" element={<PredictiveBI />} />
        <Route path="predictive-bi/anomalies" element={<PredictiveBI />} />
        <Route path="predictive-bi/churn" element={<PredictiveBI />} />
        <Route path="predictive-bi/trends" element={<PredictiveBI />} />

        {/* Executive Reports Routes */}
        <Route path="reports" element={<ExecutiveReports />} />
        <Route path="reports/generate" element={<ExecutiveReports />} />
        <Route path="reports/schedules" element={<ExecutiveReports />} />
        <Route path="reports/history" element={<ExecutiveReports />} />

        {/* Goal Tracking & OKRs Routes */}
        <Route path="okr" element={<OKRDashboard />} />
        <Route path="okr/goals" element={<OKRDashboard />} />
        <Route path="okr/goals/new" element={<OKRDashboard />} />
        <Route path="okr/alignment" element={<GoalAlignment />} />
        <Route path="okr/check-ins" element={<OKRDashboard />} />
        <Route path="okr/cycles" element={<OKRDashboard />} />

        {/* White-Label Settings Routes */}
        <Route path="white-label" element={<WhiteLabelSettings />} />
        <Route path="white-label/branding" element={<WhiteLabelSettings />} />
        <Route path="white-label/domains" element={<WhiteLabelSettings />} />
        <Route path="white-label/partner" element={<WhiteLabelSettings />} />

        {/* Localization Settings Routes */}
        <Route path="localization" element={<LocalizationSettings />} />
        <Route path="localization/languages" element={<LocalizationSettings />} />
        <Route path="localization/currencies" element={<LocalizationSettings />} />
        <Route path="localization/translate" element={<LocalizationSettings />} />

        {/* Notifications Routes */}
        <Route path="notifications" element={<NotificationCenter />} />
        <Route path="notification-preferences" element={<NotificationPreferences />} />

        {/* Billing Routes */}
        <Route path="billing" element={<BillingSettings />} />

        {/* Workflow Automation Routes */}
        <Route path="workflows" element={<WorkflowDashboard />} />
        <Route path="workflows/new" element={<WorkflowDashboard />} />
        <Route path="workflows/:workflowId" element={<WorkflowDashboard />} />
        <Route path="workflows/executions" element={<WorkflowDashboard />} />
        <Route path="scheduled-tasks" element={<ScheduledTasks />} />

        {/* Admin Routes - Protected by AdminRoute */}
        <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="admin/feature-flags" element={<AdminRoute><AdminFeatureFlags /></AdminRoute>} />
        <Route path="admin/config" element={<AdminRoute><AdminConfig /></AdminRoute>} />
        <Route path="admin/audit-logs" element={<AdminRoute><AdminAuditLogs /></AdminRoute>} />
        <Route path="admin/announcements" element={<AdminRoute><AdminAnnouncements /></AdminRoute>} />
        <Route path="admin/system-health" element={<AdminRoute><AdminSystemHealth /></AdminRoute>} />
      </Route>

      {/* Super Admin Dashboard - Standalone route */}
      <Route path="/super-admin" element={<AdminRoute><SuperAdminDashboard /></AdminRoute>} />

      {/* Legacy routes - redirect to /app */}
      <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="/data-sources" element={<Navigate to="/app/data-sources" replace />} />
      <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
      <Route path="/team" element={<Navigate to="/app/team" replace />} />
      <Route path="/athena" element={<Navigate to="/app/athena" replace />} />
      <Route path="/athena/*" element={<Navigate to="/app/athena" replace />} />
      <Route path="/governai" element={<Navigate to="/app/governai" replace />} />
      <Route path="/governai/*" element={<Navigate to="/app/governai" replace />} />
      <Route path="/lean" element={<Navigate to="/app/lean" replace />} />
      <Route path="/lean/*" element={<Navigate to="/app/lean" replace />} />
      <Route path="/admin" element={<Navigate to="/app/admin" replace />} />
      <Route path="/admin/*" element={<Navigate to="/app/admin" replace />} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
