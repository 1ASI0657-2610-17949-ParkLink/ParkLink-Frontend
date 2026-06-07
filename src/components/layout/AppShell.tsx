import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster, sileo } from 'sileo';
import 'sileo/styles.css';
import { ParkingDetailModal } from '@/components/parking/ParkingDetailModal';
import { PaymentForm } from '@/components/payments/PaymentForm';
import { useUIStore } from '@/store/ui-store';

/**
 * Layout raíz de la app.
 *
 * Todo modal global vive acá —debajo del RouterProvider— porque varios hijos
 * usan hooks de React Router (`useNavigate`, `Link`, etc.). Montarlos como
 * siblings del RouterProvider rompe el contexto y deja la UI en overlay gris.
 */
export function AppShell() {
  useEffect(() => {
    const unsubscribe = useUIStore.subscribe((state, prev) => {
      if (prev.activeModal && !state.activeModal) {
        sileo.clear();
      }
    });

    return unsubscribe;
  }, []);

  return (
    <>
      <Outlet />
      {/* Modal global de detalle de estacionamiento — se abre desde el mapa */}
      <ParkingDetailModal />
      {/* Modal de pago global — se abre desde el store cuando se crea una reserva */}
      <PaymentForm />
      {/* Sistema de toasts (Sileo) — abajo porque la notificación de espacios disponibles va al fondo */}
      <Toaster position="bottom-center" theme="dark" />
    </>
  );
}
