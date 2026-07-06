import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPendingTrips, getMyTripsAsDriver, acceptTrip } from '../api/trips';
import { getErrorMessage } from '../api/clients';
import type { Trip } from '../types/types';
import TripCard from '../components/TripInfo';
import triste from '../assets/triste.png';
export default function DriverDashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [pending, setPending] = useState<Trip[]>([]);
  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [pendingTrips, mine] = await Promise.all([getPendingTrips(), getMyTripsAsDriver()]);
      setPending(pendingTrips);
      setMyTrips(mine);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const activeTrip = myTrips.find((t) => t.status === 'IN_PROGRESS');

  async function handleAccept(id: number) {
    setAcceptingId(id);
    setActionError(null);
    try {
      const trip = await acceptTrip(id);
      await refreshUser();
      navigate(`/trips/${trip.id}`);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setAcceptingId(null);
    }
  }

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <p className="page__eyebrow">Hola, {user?.firstName}</p>
          <h1>Panel de conductor</h1>
        </div>
        <div className="rating-pill">
          ★ {user?.rating.toFixed(1)}
          <span className="rating-pill__tag">{user?.available ? 'Disponible' : 'En viaje'}</span>
        </div>
      </div>

      {loading && <p className="muted">Cargando panel...</p>}
      {error && <p className="form__error">{error}</p>}
      {actionError && <p className="form__error">{actionError}</p>}

      {!loading && !error && (
        <>
          {activeTrip && (
            <section className="section">
              <h2 className="section__title">Viaje activo</h2>
              <div className="trip-grid">
                <TripCard trip={activeTrip} perspective="DRIVER" />
              </div>
            </section>
          )}

          <section className="section">
            <h2 className="section__title">Viajes pendientes</h2>
            {pending.length === 0 ? (
              <>
              <p className="empty-state">No hay viajes pendientes actuales</p>
              <img src= {triste} className='imagen'/>
              </>
            ) : (
              <div className="trip-grid">
                {pending.map((trip) => (
                  <div key={trip.id} className="trip-card trip-card--static">
                    <div className="trip-card__top">
                      <span className="badge badge--pending">Pendiente</span>
                      <span className="trip-card__id">#{trip.id}</span>
                    </div>
                    <div className="trip-card__addresses">
                      <div className="trip-card__addr">
                        <span className="trip-card__dot trip-card__dot--origin" />
                        {trip.pickupAddress}
                      </div>
                      <div className="trip-card__addr">
                        <span className="trip-card__dot trip-card__dot--dest" />
                        {trip.dropoffAddress}
                      </div>
                    </div>
                    <button
                      className="btn btn--primary btn--full"
                      disabled={!!activeTrip || acceptingId === trip.id}
                      onClick={() => handleAccept(trip.id)}
                    >
                      {acceptingId === trip.id ? 'Aceptando...' : 'Aceptar'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
