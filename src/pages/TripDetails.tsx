import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTripById, completeTrip, rateTrip } from '../api/trips';
import { getErrorMessage } from '../api/clients';
import type { Trip } from '../types/types';
import Status from '../components/Status';
import flores from '../assets/flores.png';

const POLL_INTERVAL_MS = 4000;

export default function TripDetails() {
  const { id } = useParams<{ id: string }>();
  const tripId = Number(id);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const intervalRef = useRef<number | null>(null);

  const fetchTrip = useCallback(async () => {
    try {
      const data = await getTripById(tripId);
      setTrip(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchTrip();
  }, [fetchTrip]);

  useEffect(() => {
    if (!trip) return;
    if (trip.status === 'COMPLETED') {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = window.setInterval(fetchTrip, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [trip, fetchTrip]);

  async function handleComplete() {
    if (!trip) return;
    setBusy(true);
    setActionError(null);
    try {
      const updated = await completeTrip(trip.id);
      setTrip(updated);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleRate(e: React.FormEvent) {
    e.preventDefault();
    if (!trip) return;
    setBusy(true);
    setActionError(null);
    try {
      const updated = await rateTrip(trip.id, { rating, comment: comment || undefined });
      setTrip(updated);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="page">Cargando viaje...</div>;
  if (error || !trip) return <div className="page"><p className="form__error">{error ?? 'Viaje no encontrado.'}</p></div>;

  const isPassengerView = user?.role === 'PASSENGER';
  const isMyTripAsDriver = user?.role === 'DRIVER' && trip.driver?.id === user.id;

  return (
    <div className="page page--narrow">
      <button className="link link--back" onClick={() => navigate(-1)}>
        ← Volver
      </button>

      <div className="page__header">
        <div>
          <p className="page__eyebrow">Viaje #{trip.id}</p>
          <h1>{trip.dropoffAddress}</h1>
        </div>
      </div>

      <Status status={trip.status} />

      <section className="detail-card">
        <div className="detail-card__row">
          <span className="detail-card__label">Origen</span>
          <span>{trip.pickupAddress}</span>
        </div>
        <div className="detail-card__row">
          <span className="detail-card__label">Destino</span>
          <span>{trip.dropoffAddress}</span>
        </div>
        <div className="detail-card__row">
          <span className="detail-card__label">Solicitado</span>
          <span>{new Date(trip.requestedAt).toLocaleString()}</span>
        </div>

        {isPassengerView && (
          <div className="detail-card__row">
            <span className="detail-card__label">Conductor</span>
            {trip.driver ? (
              <span>
                {trip.driver.firstName} {trip.driver.lastName} · ★ {trip.driver.rating.toFixed(1)}
              </span>
            ) : (
              <span className="muted">Buscando conductor...</span>
            )}
          </div>
        )}

        {!isPassengerView && (
          <div className="detail-card__row">
            <span className="detail-card__label">Pasajero</span>
            <span>
              {trip.passenger.firstName} {trip.passenger.lastName}
            </span>
          </div>
        )}
      </section>

      {actionError && <p className="form__error">{actionError}</p>}

      {isMyTripAsDriver && trip.status === 'IN_PROGRESS' && (
        <button className="btn btn--primary btn--full" onClick={handleComplete} disabled={busy}>
          {busy ? 'Completando...' : 'Completar viaje'}
        </button>
      )}

      {isMyTripAsDriver && trip.status === 'COMPLETED' && (
        <div className="summary-banner">
          Viaje completado el {trip.completedAt ? new Date(trip.completedAt).toLocaleString() : ''}.
        </div>
      )}

      {isPassengerView && trip.status === 'COMPLETED' && trip.passengerRating == null && (
        <form onSubmit={handleRate} className="form rate-form">
          <h2 className="section__title">Califica tu viaje</h2>
          <div className="star-picker">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                type="button"
                key={n}
                className={'star-picker__star' + (n <= rating ? ' star-picker__star--filled' : '')}
                onClick={() => setRating(n)}
                aria-label={`${n} estrellas`}
              >
                ★
              </button>
            ))}
          </div>
          <label className="form__field">
            <span>¿Deseas comentar algo sobre el viaje?</span>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
          </label>
          <button className="btn btn--primary btn--full" type="submit" disabled={busy}>
            {busy ? 'Enviando...' : 'Enviar calificación'}
          </button>
        </form>
      )}

      {isPassengerView && trip.status === 'COMPLETED' && trip.passengerRating != null && (
        <div className="summary-banner">
          Calificación: ★ {trip.passengerRating}
          {trip.ratingComment ? ` — "${trip.ratingComment}"` : ''}
        </div>
      )}
      <img src={flores} />
    </div>
  );
}
