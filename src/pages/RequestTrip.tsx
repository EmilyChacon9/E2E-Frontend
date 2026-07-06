import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAvailableDrivers } from '../api/users';
import { requestTrip } from '../api/trips';
import { getErrorMessage } from '../api/clients';
import type { User } from '../types/types';

export default function RequestTripPage() {
  const [drivers, setDrivers] = useState<User[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getAvailableDrivers()
      .then(setDrivers)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoadingDrivers(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const trip = await requestTrip({ pickupAddress, dropoffAddress });
      navigate(`/trips/${trip.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page page--narrow">
      <div className="page__header">
        <div>
          <p className="page__eyebrow">Nuevo viaje</p>
          <h1>Pide tu viaje</h1>
        </div>
      </div>

      <section className="section">
        <h2 className="section__title">Conductores disponibles ahora</h2>
        {loadingDrivers ? (
          <p className="muted">Buscando conductores...</p>
        ) : drivers.length === 0 ? (
          <p className="empty-state">No hay conductores disponibles en este momento. Vuelve a intentar en unos segundos.</p>
        ) : (
          <div className="driver-list">
            {drivers.map((d) => (
              <div key={d.id} className="driver-chip">
                <span className="driver-chip__initial">{d.firstName[0]}</span>
                <div>
                  <p className="driver-chip__name">
                    {d.firstName} {d.lastName}
                  </p>
                  <p className="driver-chip__rating">★ {d.rating.toFixed(1)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <h2 className="section__title">Detalles del viaje</h2>
        <form onSubmit={handleSubmit} className="form">
          <label className="form__field">
            <span>Punto de partida</span>
            <input
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="¿Dónde quieres que te recogamos?"
              required
            />
          </label>
          <label className="form__field">
            <span>Punto destino</span>
            <input
              value={dropoffAddress}
              onChange={(e) => setDropoffAddress(e.target.value)}
              placeholder="¿A dónde quieres ir?"
              required
            />
          </label>

          {error && <p className="form__error">{error}</p>}

          <button className="btn btn--primary btn--full" type="submit" disabled={submitting}>
            {submitting ? 'Solicitando...' : 'Confirmar viaje'}
          </button>
        </form>
      </section>
    </div>
  );
}
