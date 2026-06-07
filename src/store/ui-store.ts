import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  /** Modal genérico — `{ type: null }` cuando está cerrado. */
  activeModal:
    | { type: 'payment'; reservationId: string; amount: number; reservationCode?: string }
    | { type: 'cancelReservation'; reservationId: string }
    | { type: 'extendReservation'; reservationId: string; currentEndTime: string }
    | { type: 'parkingDetail'; parkingId: string }
    | null;
  openModal: (modal: UIState['activeModal']) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),

  activeModal: null,
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
}));
