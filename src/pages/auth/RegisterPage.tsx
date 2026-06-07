import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardBody } from '@/components/ui/Card';
import { RegisterDriverForm } from '@/components/auth/RegisterDriverForm';
import { RegisterOwnerForm } from '@/components/auth/RegisterOwnerForm';

type Tab = 'driver' | 'owner';

const TABS: Array<{ id: Tab; label: string; icon: typeof Car; description: string }> = [
  {
    id: 'driver',
    label: 'Conductor',
    icon: Car,
    description: 'Busco y reservo estacionamientos',
  },
  {
    id: 'owner',
    label: 'Propietario',
    icon: Building2,
    description: 'Tengo espacios para alquilar',
  },
];

export function RegisterPage() {
  const [tab, setTab] = useState<Tab>('driver');

  return (
    <Card variant="elevated" className="animate-fade-in-scale">
      <CardBody className="p-7 sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-display font-semibold text-fg">
            Crear cuenta
          </h1>
          <p className="mt-1.5 text-sm text-fg-muted">
            Elegí cómo querés usar ParkLink
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex flex-col items-center gap-1.5 px-3 py-3 rounded-lg border transition-all',
                  isActive
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-bg-elevated text-fg-muted hover:border-border-strong',
                )}
              >
                <Icon className="size-5" />
                <span className="text-sm font-semibold">{t.label}</span>
                <span className="text-[10px] text-fg-subtle leading-tight text-center">
                  {t.description}
                </span>
              </button>
            );
          })}
        </div>

        {tab === 'driver' ? <RegisterDriverForm /> : <RegisterOwnerForm />}

        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-xs text-fg-subtle">
            ¿Ya tenés cuenta?{' '}
            <Link to="/auth/login" className="text-primary hover:underline font-medium">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
