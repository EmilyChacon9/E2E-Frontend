import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyTripsAsPassenger, getMyTripsAsDriver } from '../api/trips';
import { getErrorMessage } from '../api/clients';
import type { Trip, TripStatus } from '../types/types';
import ir from '../assets/ir.png';

const FILTERS: Array<TripStatus | 'ALL'> = ['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'];

const STATUS_LABEL: Record<TripStatus, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En camino',
  COMPLETED: 'Completado',
};

export default function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TripStatus | 'ALL'>('ALL');

  useEffect(() => {
    if (!user) return;
    const loader = user.role === 'DRIVER' ? getMyTripsAsDriver : getMyTripsAsPassenger;
    loader()
      .then(setTrips)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = useMemo(
    () => (filter === 'ALL' ? trips : trips.filter((t) => t.status === filter)),
    [trips, filter]
  );

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <p className="page__eyebrow">Historial</p>
          <h1>Tus viajes</h1>
        </div>
      </div>

      <div className="filter-row">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={'filter-chip' + (filter === f ? ' filter-chip--active' : '')}
            onClick={() => setFilter(f)}
          >
            {f === 'ALL' ? 'Todos' : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      {loading && <p className="muted">Cargando historial...</p>}
      {error && <p className="form__error">{error}</p>}

      {!loading && !error && (
        filtered.length === 0 ? (
          <p className="empty-state">No hay viajes en el historial.</p>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Origen</th>
                <th>Destino</th>
                <th>Estado</th>
                <th>{user?.role === 'DRIVER' ? 'Pasajero' : 'Conductor'}</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const counterpart = user?.role === 'DRIVER' ? t.passenger : t.driver;
                return (
                  <tr key={t.id} onClick={() => navigate(`/trips/${t.id}`)}>
                    <td>#{t.id}</td>
                    <td>{t.pickupAddress}</td>
                    <td>{t.dropoffAddress}</td>
                    <td>
                      <span className={`badge badge--${t.status.toLowerCase()}`}>
                        {STATUS_LABEL[t.status]}
                      </span>
                    </td>
                    <td>{counterpart ? `${counterpart.firstName} ${counterpart.lastName}` : '—'}</td>
                    <td>{new Date(t.requestedAt).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )
      )}
      <img src={ir} className='imagen'/>
    </div>
  );
}
