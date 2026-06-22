import { useUIStore } from './ui-store';

describe('useUIStore', () => {
  beforeEach(() => {
    useUIStore.setState({ isSidebarOpen: false, activeModal: null });
  });

  it('toggles the sidebar state', () => {
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().isSidebarOpen).toBe(true);

    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().isSidebarOpen).toBe(false);
  });

  it('opens and closes modal state', () => {
    useUIStore.getState().openModal({
      type: 'payment',
      reservationId: 'reservation-1',
      amount: 40,
      reservationCode: 'PKL-1',
    });

    expect(useUIStore.getState().activeModal).toMatchObject({ type: 'payment' });

    useUIStore.getState().closeModal();
    expect(useUIStore.getState().activeModal).toBeNull();
  });
});
