import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login, register } from '../api/auth';
import { getErrorMessage } from '../api/clients';
import type { Role } from '../types/types';
import { getMe } from '../api/users';
import trio from '../assets/trio.png';

type Mode = 'login' | 'register';

export default function Login() {
  const [mode, setMode] = useState<Mode>('login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('PASSENGER');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { setToken } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const token =
        mode === 'login'
          ? await login({ email, password })
          : await register({ firstName, lastName, email, password, role });

      await setToken(token);
      const me = await getMe();
      navigate(me.role === 'DRIVER' ? '/driver' : '/passenger', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-card__mark" aria-hidden="true">
          <span className="route-dot" />
          <span className="route-dash" />
          <span className="route-dot route-dot--filled" />
        </div>
        <h1 className="auth-card__title">Uber Barato :D</h1>
        <p className="auth-card__subtitle">
          {mode === 'login' ? 'Ingresa a tu cuenta' : 'Crea una cuenta nueva'}
        </p>

        <div className="auth-tabs">
          <button
            type="button"
            className={'auth-tab' + (mode === 'login' ? ' auth-tab--active' : '')}
            onClick={() => setMode('login')}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            className={'auth-tab' + (mode === 'register' ? ' auth-tab--active' : '')}
            onClick={() => setMode('register')}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          {mode === 'register' && (
            <>
              <div className="form__row">
                <label className="form__field">
                  <span>Nombre</span>
                  <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </label>
                <label className="form__field">
                  <span>Apellido</span>
                  <input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </label>
              </div>

              <label className="form__field">
                <span>Registrarse como</span>
                <div className="role-picker">
                  <button
                    type="button"
                    className={'role-picker__opt' + (role === 'PASSENGER' ? ' role-picker__opt--active' : '')}
                    onClick={() => setRole('PASSENGER')}
                  >
                    Pasajero
                  </button>
                  <button
                    type="button"
                    className={'role-picker__opt' + (role === 'DRIVER' ? ' role-picker__opt--active' : '')}
                    onClick={() => setRole('DRIVER')}
                  >
                    Conductor
                  </button>
                </div>
              </label>
            </>
          )}

          <label className="form__field">
            <span>Correo electrónico</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ana@uber.com"
              required
            />
          </label>

          <label className="form__field">
            <span>Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              placeholder="mínimo 6 caracteres"
              required
            />
          </label>

          {error && <p className="form__error">{error}</p>}

          <button className="btn btn--primary btn--full" type="submit" disabled={submitting}>
            {submitting ? 'Enviando...' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
          </button>
        </form>
      </div>
      <img src={trio} className='imagen2'/>
    </div>
  );
}
