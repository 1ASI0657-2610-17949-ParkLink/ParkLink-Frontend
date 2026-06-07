import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock, ShieldCheck, X, CheckCircle2 } from 'lucide-react';
import { toast } from '@/lib/toast';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useUIStore } from '@/store/ui-store';
import { useReservationCacheStore } from '@/store/reservation-cache-store';
import { apiGet, apiPost } from '@/lib/api';
import { extractErrorMessage } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
  RESERVATION_STATUS,
  type CreatePaymentDto,
  type PaymentRecord,
  type PaymentStatus,
  type ReservationRecord,
} from '@/lib/types';

interface PaymentFormProps {
  onPaid?: (payment: PaymentRecord) => void;
}

export function PaymentForm({ onPaid }: PaymentFormProps) {
  const navigate = useNavigate();
  const activeModal = useUIStore((s) => s.activeModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const upsertReservation = useReservationCacheStore((s) => s.upsertReservation);
  const markReservationConfirmed = useReservationCacheStore((s) => s.markReservationConfirmed);
  const isOpen = activeModal?.type === 'payment';
  const reservationId = activeModal?.type === 'payment' ? activeModal.reservationId : null;
  const reservationCode = activeModal?.type === 'payment' ? activeModal.reservationCode : undefined;
  const amount = activeModal?.type === 'payment' ? activeModal.amount : 0;

  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('12/29');
  const [cardCvv, setCardCvv] = useState('123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<PaymentRecord | null>(null);

  // Reset cuando se cierra
  useEffect(() => {
    if (!isOpen) {
      setResult(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  function handleClose() {
    setResult(null);
    setIsSubmitting(false);
    closeModal();
  }

  async function handlePay(forceResult?: 'APPROVED' | 'REJECTED') {
    if (!reservationId) return;
    setIsSubmitting(true);
    try {
      const payload: CreatePaymentDto = {
        reservationId,
        amount,
        paymentMethod: 'mock-card',
        forceResult,
      };
      const payment = await apiPost<PaymentRecord>('/payments', payload);
      setResult(payment);
      if (payment.status === 'APPROVED') {
        await syncPaidReservation(reservationId);
        onPaid?.(payment);
      }
    } catch (err) {
      const msg = extractErrorMessage(err, 'No pudimos procesar el pago');
      toast.error('Error al pagar', { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleViewReservations() {
    closeModal();
    navigate('/dashboard/reservations');
  }

  async function syncPaidReservation(paidReservationId: string) {
    markReservationConfirmed(paidReservationId);

    try {
      const reservation = await apiGet<ReservationRecord>(`/reservations/${paidReservationId}`);
      upsertReservation({
        ...reservation,
        status:
          reservation.status === RESERVATION_STATUS.PENDING_PAYMENT
            ? RESERVATION_STATUS.CONFIRMED
            : reservation.status,
      });
    } catch {
      markReservationConfirmed(paidReservationId);
    }
  }

  if (!isOpen) return null;

  if (result) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        hideCloseButton
        title="Resultado del pago"
      >
        <PaymentResult
          result={result}
          onClose={handleClose}
          onViewReservations={handleViewReservations}
        />
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Confirmar pago"
      description="Estás a un paso de confirmar tu reserva"
    >
      <div className="space-y-5">
        <div className="rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm">
          <p className="font-semibold text-fg">Reserva creada</p>
          <p className="mt-1 text-fg-muted">
            {reservationCode
              ? `Código ${reservationCode}. Completá el pago para confirmarla.`
              : 'Completá el pago para confirmar tu reserva.'}
          </p>
        </div>

        {/* Resumen */}
        <div className="rounded-lg border border-border bg-bg p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-fg-subtle">Total a pagar</p>
            <p className="text-2xl font-display font-bold text-fg">{formatCurrency(amount)}</p>
          </div>
          <ShieldCheck className="size-8 text-primary" />
        </div>

        {/* Tarjeta (mock) */}
        <div className="space-y-3">
          <Input
            label="Número de tarjeta"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            leftIcon={<CreditCard className="size-4" />}
            maxLength={19}
          />
          <Input
            label="Nombre del titular"
            placeholder="Como aparece en la tarjeta"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Vencimiento"
              placeholder="MM/AA"
              value={cardExpiry}
              onChange={(e) => setCardExpiry(e.target.value)}
              maxLength={5}
            />
            <Input
              label="CVV"
              placeholder="123"
              value={cardCvv}
              onChange={(e) => setCardCvv(e.target.value)}
              type="password"
              maxLength={4}
            />
          </div>
        </div>

        <p className="text-xs text-fg-subtle flex items-center gap-1.5">
          <Lock className="size-3" />
          Modo prueba. No se realizan cargos reales. Usá los botones de abajo para forzar el resultado.
        </p>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => handlePay('REJECTED')}
            isLoading={isSubmitting}
          >
            Simular rechazo
          </Button>
          <Button onClick={() => handlePay('APPROVED')} isLoading={isSubmitting}>
            Pagar {formatCurrency(amount)}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

interface PaymentResultProps {
  result: PaymentRecord;
  onClose: () => void;
  onViewReservations: () => void;
}

function PaymentResult({ result, onClose, onViewReservations }: PaymentResultProps) {
  const isApproved = result.status === 'APPROVED';
  const config = STATUS_CONFIG[result.status as PaymentStatus];

  return (
    <div className="text-center space-y-4 py-2">
      <div
        className={
          'mx-auto size-16 rounded-full flex items-center justify-center border ' +
          (isApproved
            ? 'bg-bg border-success/40 text-success'
            : 'bg-bg border-danger/40 text-danger')
        }
      >
        {isApproved ? <CheckCircle2 className="size-8" /> : <X className="size-8" />}
      </div>

      <div>
        <h3 className="text-lg font-display font-semibold text-fg">
          {isApproved ? '¡Pago aprobado!' : 'Pago rechazado'}
        </h3>
        <p className="text-sm text-fg-muted mt-1">{config.label}</p>
      </div>

      {isApproved && (
        <div className="rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-left">
          <p className="text-sm font-semibold text-success">Reserva confirmada</p>
          <p className="mt-1 text-sm text-fg-muted">
            El pago se registró correctamente. Ya podés verla con su estado en Mis reservas.
          </p>
        </div>
      )}

      <div className="rounded-lg border border-border bg-bg p-4 text-left text-sm space-y-1.5">
        <div className="flex justify-between">
          <span className="text-fg-subtle">Recibo</span>
          <span className="font-mono text-fg">{result.receiptCode}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-fg-subtle">Monto</span>
          <span className="font-semibold text-fg">{formatCurrency(result.amount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-fg-subtle">Método</span>
          <span className="text-fg">{result.paymentMethod}</span>
        </div>
      </div>

      {isApproved ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button variant="outline" onClick={onClose} fullWidth>
            Cerrar
          </Button>
          <Button onClick={onViewReservations} fullWidth>
            Ver mis reservas
          </Button>
        </div>
      ) : (
        <Button onClick={onClose} fullWidth>
          Cerrar
        </Button>
      )}
    </div>
  );
}

const STATUS_CONFIG: Record<PaymentStatus, { label: string }> = {
  PENDING: { label: 'Procesando…' },
  APPROVED: { label: 'Tu reserva está confirmada' },
  REJECTED: { label: 'No pudimos procesar el pago. Probá nuevamente.' },
  REFUNDED: { label: 'El pago fue reembolsado.' },
};
