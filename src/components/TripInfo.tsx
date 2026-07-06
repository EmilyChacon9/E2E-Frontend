import { Link } from 'react-router-dom';
import type { Trip } from '../types/types';

const STATUS_LABEL: Record<Trip['status'], string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En camino',
  COMPLETED: 'Completado',
};

export default function TripInfo({
  trip,
  perspective,
}: {
  trip: Trip;
  perspective: 'PASSENGER' | 'DRIVER';
}) {
  const counterpart = perspective === 'PASSENGER' ? trip.driver : trip.passenger;

  return (
    <Link to={`/trips/${trip.id}`} className="trip-card">
      <div className="trip-card__top">
        <span className={`badge badge--${trip.status.toLowerCase()}`}>
          {STATUS_LABEL[trip.status]}
        </span>
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
      <div className="trip-card__footer">
        {counterpart ? (
          <span>
            {perspective === 'PASSENGER' ? 'Conductor' : 'Pasajero'}: {counterpart.firstName}{' '}
            {counterpart.lastName}
          </span>
        ) : (
          <span className="muted">Buscando conductor...</span>
        )}
        {trip.passengerRating && <span className="trip-card__rating">★ {trip.passengerRating}</span>}
      </div>
    </Link>
  );
}
