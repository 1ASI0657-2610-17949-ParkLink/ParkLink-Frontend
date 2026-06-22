import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Button, LinkButton } from './Button';

describe('Button', () => {
  it('renders a disabled loading button with accessible text', () => {
    render(<Button isLoading>Guardar</Button>);

    const button = screen.getByRole('button', { name: /guardar/i });
    expect(button).toBeDisabled();
  });

  it('renders link buttons with the expected destination', () => {
    render(
      <MemoryRouter>
        <LinkButton to="/dashboard">Ir al dashboard</LinkButton>
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /ir al dashboard/i })).toHaveAttribute('href', '/dashboard');
  });
});
