import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyTripsAsPassenger } from '../api/trips';
import { getErrorMessage } from '../api/clients';
import type { Trip } from '../types/types';
import TripCard from '../components/TripInfo';
import triste from '../assets/triste.png';

export default function PassengerDashboard() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getMyTripsAsPassenger()
      .then((data) => mounted && setTrips(data))
      .catch((err) => mounted && setError(getErrorMessage(err)))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const active = trips.filter((t) => t.status !== 'COMPLETED');
  const recent = trips.filter((t) => t.status === 'COMPLETED').slice(0, 3);

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <p className="page__eyebrow">Hola, {user?.firstName}</p>
          <h1>¿A dónde deseas ir hoy?</h1>
        </div>
        <Link to="/passenger/request" className="btn btn--primary">
          Pedir un viaje
        </Link>
      </div>

      {loading && <p className="muted">Cargando tus viajes...</p>}
      {error && <p className="form__error">{error}</p>}

      {!loading && !error && (
        <>
          <section className="section">
            <h2 className="section__title">Viajes en curso</h2>
            {active.length === 0 ? (
              <p className='vacio'>
              <p className="empty-state">
                No tienes viajes activos. ¡Pide un viaje ahora!
              </p>
              <img src= {triste} className='imagen'/>
              </p>
            ) : (
              <div className="trip-grid">
                {active.map((trip) => (
                  <TripCard key={trip.id} trip={trip} perspective="PASSENGER" />
                ))}
              </div>
            )}
          </section>

          <section className="section">
            <div className="section__header-row">
              <h2 className="section__title">Últimos viajes completados</h2>
              <Link to="/history" className="link">
                Ver historial completo →
              </Link>
            </div>
            {recent.length === 0 ? (
              <p className="empty-state">Aún no se ha completado ningún viaje.</p>
            ) : (
              <div className="trip-grid">
                {recent.map((trip) => (
                  <TripCard key={trip.id} trip={trip} perspective="PASSENGER" />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
