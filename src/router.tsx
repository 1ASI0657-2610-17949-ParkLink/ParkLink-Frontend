import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AuthGuard } from '@/guards/AuthGuard';
import { RoleGuard } from '@/guards/RoleGuard';
import { USER_ROLES } from '@/lib/types';
import { useAuthStore } from '@/store/auth-store';

// Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { LogoutPage } from '@/pages/auth/LogoutPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { MyReservationsPage } from '@/pages/dashboard/MyReservationsPage';
import { ReservationDetailPage } from '@/pages/dashboard/ReservationDetailPage';
import { NotificationsPage } from '@/pages/dashboard/NotificationsPage';
import { MyParkingSpacesPage } from '@/pages/dashboard/owner/MyParkingSpacesPage';
import { NewParkingSpacePage } from '@/pages/dashboard/owner/NewParkingSpacePage';
import { EditParkingSpacePage } from '@/pages/dashboard/owner/EditParkingSpacePage';
import { OwnerReservationsPage } from '@/pages/dashboard/owner/OwnerReservationsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

function EntryRedirect() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  return <Navigate to={token && user ? '/dashboard' : '/auth/login'} replace />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <EntryRedirect />,
      },
      {
        path: 'auth',
        element: <AuthLayout />,
        children: [
          { index: true, element: <Navigate to="/auth/login" replace /> },
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
          { path: 'logout', element: <LogoutPage /> },
        ],
      },
      {
        path: 'dashboard',
        element: (
          <AuthGuard>
            <DashboardLayout />
          </AuthGuard>
        ),
        children: [
          { index: true, element: <DashboardPage /> },
          {
            path: 'reservations',
            children: [
              { index: true, element: <MyReservationsPage /> },
              { path: ':id', element: <ReservationDetailPage /> },
            ],
          },
          {
            path: 'parking-spaces',
            children: [
              {
                index: true,
                element: (
                  <RoleGuard role={USER_ROLES.OWNER}>
                    <MyParkingSpacesPage />
                  </RoleGuard>
                ),
              },
              {
                path: 'new',
                element: (
                  <RoleGuard role={USER_ROLES.OWNER}>
                    <NewParkingSpacePage />
                  </RoleGuard>
                ),
              },
              {
                path: ':id/edit',
                element: (
                  <RoleGuard role={USER_ROLES.OWNER}>
                    <EditParkingSpacePage />
                  </RoleGuard>
                ),
              },
            ],
          },
          {
            path: 'notifications',
            element: (
              <AuthGuard>
                <NotificationsPage />
              </AuthGuard>
            ),
          },
        ],
      },
      {
        path: 'owner/reservations',
        element: (
          <AuthGuard>
            <DashboardLayout />
          </AuthGuard>
        ),
        children: [
          {
            index: true,
            element: (
              <RoleGuard role={USER_ROLES.OWNER}>
                <OwnerReservationsPage />
              </RoleGuard>
            ),
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
