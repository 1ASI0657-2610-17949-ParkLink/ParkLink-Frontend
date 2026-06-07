import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, Mail } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth-store';
import { extractErrorMessage } from '@/lib/api';

const loginSchema = z.object({
  email: z.email({ error: 'Ingresa un email válido' }),
  password: z.string().min(8, { error: 'Mínimo 8 caracteres' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/dashboard';

  async function onSubmit(values: LoginFormValues) {
    setSubmitError(null);
    try {
      await login(values);
      navigate(from, { replace: true });
    } catch (err) {
      setSubmitError(extractErrorMessage(err, 'No pudimos iniciar sesión'));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        placeholder="••••••••"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />

      {submitError && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {submitError}
        </div>
      )}

      <Button
        type="submit"
        fullWidth
        isLoading={isSubmitting}
        leftIcon={<LogIn className="size-4" />}
      >
        Ingresar
      </Button>

      <p className="text-sm text-center text-fg-muted">
        ¿No tenés cuenta?{' '}
        <Link to="/auth/register" className="text-primary hover:underline font-medium">
          Crear cuenta
        </Link>
      </p>
    </form>
  );
}
