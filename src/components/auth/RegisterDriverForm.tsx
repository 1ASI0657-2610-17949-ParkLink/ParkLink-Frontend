import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Car, Mail, Phone, User as UserIcon, Lock } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth-store';
import { extractErrorMessage } from '@/lib/api';

const driverSchema = z.object({
  fullName: z.string().min(3, { error: 'Ingresa tu nombre completo' }),
  email: z.email({ error: 'Email inválido' }),
  password: z.string().min(8, { error: 'Mínimo 8 caracteres' }),
  phone: z.string().min(9, { error: 'Ingresa un teléfono válido' }),
  plateNumber: z
    .string()
    .min(6, { error: 'Formato de placa: ABC-123' })
    .max(8, { error: 'Máximo 8 caracteres' })
    .transform((v) => v.toUpperCase()),
});

type RegisterDriverFormValues = z.infer<typeof driverSchema>;

export function RegisterDriverForm() {
  const navigate = useNavigate();
  const registerDriver = useAuthStore((s) => s.registerDriver);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterDriverFormValues>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      phone: '',
      plateNumber: '',
    },
  });

  async function onSubmit(values: RegisterDriverFormValues) {
    setSubmitError(null);
    try {
      await registerDriver(values);
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
      <Input
        label="Placa del vehículo"
        placeholder="ABC-123"
        leftIcon={<Car className="size-4" />}
        error={errors.plateNumber?.message}
        {...register('plateNumber')}
        hint="La usaremos para identificar tu reserva"
      />

      {submitError && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {submitError}
        </div>
      )}

      <Button type="submit" fullWidth isLoading={isSubmitting}>
        Crear cuenta de conductor
      </Button>
    </form>
  );
}
