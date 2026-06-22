import { extractErrorMessage } from './api';

describe('extractErrorMessage', () => {
  it('joins backend validation messages from Axios responses', () => {
    const error = {
      isAxiosError: true,
      response: { data: { message: ['Email inválido', 'Password requerido'] } },
      message: 'Request failed',
    } as unknown;

    expect(extractErrorMessage(error)).toBe('Email inválido, Password requerido');
  });

  it('falls back for unknown errors', () => {
    expect(extractErrorMessage('unexpected', 'No se pudo completar')).toBe('No se pudo completar');
  });
});
