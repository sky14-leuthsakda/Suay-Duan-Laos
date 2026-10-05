import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { CitizenLayout } from './CitizenLayout';
import { ControlLayout } from './ControlLayout';
import { CitizenHome } from '../features/citizen/CitizenHome';

const CitizenStatusTracker = lazy(() =>
  import('../features/citizen/CitizenStatusTracker').then((m) => ({ default: m.CitizenStatusTracker }))
);

const DispatchDashboard = lazy(() =>
  import('../features/control/DispatchDashboard').then((m) => ({ default: m.DispatchDashboard }))
);

const UnitsManagement = lazy(() =>
  import('../features/control/UnitsManagement').then((m) => ({ default: m.UnitsManagement }))
);

const NearbyServices = lazy(() =>
  import('../features/citizen/NearbyServices').then((m) => ({ default: m.NearbyServices }))
);

const FirstAidGuide = lazy(() =>
  import('../features/citizen/FirstAidGuide').then((m) => ({ default: m.FirstAidGuide }))
);

const Profile = lazy(() =>
  import('../features/citizen/Profile').then((m) => ({ default: m.Profile }))
);

const ControlLiveMapPage = lazy(() =>
  import('../features/control/ControlLiveMapPage').then((m) => ({ default: m.ControlLiveMapPage }))
);

const Statistics = lazy(() =>
  import('../features/control/Statistics').then((m) => ({ default: m.Statistics }))
);

const AuditLog = lazy(() =>
  import('../features/control/AuditLog').then((m) => ({ default: m.AuditLog }))
);

const LoadingFallback = () => (
  <div className="citizen-content flex items-center justify-center p-8 text-xs text-slate-400">
    <div className="flex items-center gap-2">
      <span className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      <span>ກຳລັງໂຫລດ...</span>
    </div>
  </div>
);

export const router = createBrowserRouter([
  // Citizen App Routes
  {
    path: '/',
    element: <CitizenLayout />,
    children: [
      {
        index: true,
        element: <CitizenHome />,
      },
      {
        path: 'track',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <CitizenStatusTracker />
          </Suspense>
        ),
      },
      {
        path: 'nearby',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <NearbyServices />
          </Suspense>
        ),
      },
      {
        path: 'guide',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <FirstAidGuide />
          </Suspense>
        ),
      },
      {
        path: 'profile',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Profile />
          </Suspense>
        ),
      },
    ],
  },

  // Dispatch Control Dashboard Routes
  {
    path: '/control',
    element: <ControlLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <DispatchDashboard />
          </Suspense>
        ),
      },
      {
        path: 'map',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ControlLiveMapPage />
          </Suspense>
        ),
      },
      {
        path: 'units',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <UnitsManagement />
          </Suspense>
        ),
      },
      {
        path: 'stats',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Statistics />
          </Suspense>
        ),
      },
      {
        path: 'audit',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AuditLog />
          </Suspense>
        ),
      },
    ],
  },

  // Fallback
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
