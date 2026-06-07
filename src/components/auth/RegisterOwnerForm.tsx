import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Phone, User as UserIcon, Lock, CreditCard } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth-store';
import { extractErrorMessage } from '@/lib/api';

const ownerSchema = z.object({
  fullName: z.string().min(3, { error: 'Ingresa tu nombre completo' }),
  email: z.email({ error: 'Email inválido' }),
  password: z.string().min(8, { error: 'Mínimo 8 caracteres' }),
  phone: z.string().min(9, { error: 'Ingresa un teléfono válido' }),
  ownerType: z.string().min(2, { error: 'Particular o Empresa' }),
  bankAccount: z
    .string()
    .min(8, { error: 'Cuenta bancaria inválida' })
    .max(30, { error: 'Cuenta demasiado larga' }),
});

type RegisterOwnerFormValues = z.infer<typeof ownerSchema>;

const OWNER_TYPES = ['Particular', 'Empresa'] as const;

export function RegisterOwnerForm() {
  const navigate = useNavigate();
  const registerOwner = useAuthStore((s) => s.registerOwner);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterOwnerFormValues>({
    resolver: zodResolver(ownerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      phone: '',
      ownerType: 'Particular',
      bankAccount: '',
    },
  });

  async function onSubmit(values: RegisterOwnerFormValues) {
    setSubmitError(null);
    try {
      await registerOwner(values);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setSubmitError(extractErrorMessage(err, 'No pudimos crear tu cuenta'));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Nombre completo"
        placeholder="Juan Pérez"
        leftIcon={<UserIcon className="size-4" />}
        error={errors.fullName?.message}
        {...register('fullName')}
      />
      <Input
        label="Email"
        type="email"
        placeholder="tu@email.com"
        autoComplete="email"
        leftIcon={<Mail className="size-4" />}
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Contraseña"
        type="password"
        placeholder="Mínimo 8 caracteres"
        autoComplete="new-password"
        leftIcon={<Lock className="size-4" />}
        error={errors.password?.message}
        {...register('password')}
      />
      <Input
        label="Teléfono"
        type="tel"
        placeholder="+51 999 999 999"
        leftIcon={<Phone className="size-4" />}
        error={errors.phone?.message}
        {...register('phone')}
      />

      {/* Tipo de propietario */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-fg">
          Tipo de propietario <span className="text-danger">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {OWNER_TYPES.map((type) => (
            <label
              key={type}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-bg-elevated cursor-pointer hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/10 transition-colors"
            >
              <input
                type="radio"
                value={type}
                {...register('ownerType')}
                className="sr-only"
              />
              {type === 'Empresa' ? (
                <Building2 className="size-4 text-fg-muted" />
              ) : (
                <UserIcon className="size-4 text-fg-muted" />
              )}
              <span className="text-sm font-medium">{type}</span>
            </label>
          ))}
        </div>
        {errors.ownerType?.message && (
          <span className="text-xs text-danger">{errors.ownerType.message}</span>
        )}
      </div>

      <Input
        label="Cuenta bancaria"
        placeholder="0011-1234-5678901234"
        leftIcon={<CreditCard className="size-4" />}
        error={errors.bankAccount?.message}
        {...register('bankAccount')}
        hint="Para recibir los pagos de tus reservas"
      />

      {submitError && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {submitError}
        </div>
      )}

      <Button type="submit" fullWidth isLoading={isSubmitting}>
        Crear cuenta de propietario
      </Button>
    </form>
  );
}
