import { sileo } from 'sileo';

/**
 * Wrapper sobre Sileo con API simple similar a Sonner.
 * Permite reemplazar el sistema de toasts sin tocar los call sites.
 *
 * Uso:
 *   toast.success('Pago aprobado', { description: 'Tu reserva está confirmada.' })
 *   toast.error('Error', { description: '...' })
 *   toast.info('Aviso', { description: '...' })
 *   toast.warning('Atención', { description: '...' })
 */

export interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number | null;
  button?: { title: string; onClick: () => void };
}

function show(options: ToastOptions & { type: 'success' | 'error' | 'info' | 'warning' }) {
  const { type, title, description, duration, button } = options;
  return sileo[type]({
    title,
    description,
    // null = persistente (nunca se descarta solo); undefined = 4s default
    duration: duration !== undefined ? duration : 4000,
    button,
  });
}

export const toast = {
  success: (title: string, options?: Omit<ToastOptions, 'type'>) =>
    show({ type: 'success', title, ...options }),
  error: (title: string, options?: Omit<ToastOptions, 'type'>) =>
    show({ type: 'error', title, ...options }),
  info: (title: string, options?: Omit<ToastOptions, 'type'>) =>
    show({ type: 'info', title, ...options }),
  warning: (title: string, options?: Omit<ToastOptions, 'type'>) =>
    show({ type: 'warning', title, ...options }),
  dismiss: (id: string) => sileo.dismiss(id),
  clear: () => sileo.clear(),
};
