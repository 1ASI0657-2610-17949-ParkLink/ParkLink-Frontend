import { Link } from 'react-router-dom';
import { Card, CardBody } from '@/components/ui/Card';
import { LoginForm } from '@/components/auth/LoginForm';

export function LoginPage() {
  return (
    <Card variant="elevated" className="animate-fade-in-scale">
      <CardBody className="p-7 sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-display font-semibold text-fg">
            Bienvenido de vuelta
          </h1>
          <p className="mt-1.5 text-sm text-fg-muted">
            Ingresá a tu cuenta para gestionar tus reservas
          </p>
        </div>
        <LoginForm />
        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-xs text-fg-subtle">
            ¿Sos nuevo?{' '}
            <Link to="/auth/register" className="text-primary hover:underline font-medium">
              Crear cuenta gratis
            </Link>
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
