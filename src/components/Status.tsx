import type { TripStatus } from '../types/types';

const STEPS: { key: TripStatus; label: string }[] = [
  { key: 'PENDING', label: 'Solicitado' },
  { key: 'IN_PROGRESS', label: 'En camino' },
  { key: 'COMPLETED', label: 'Completado' },
];

export default function Status({ status }: { status: TripStatus }) {
  const activeIndex = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="route-line" role="img" aria-label={`Estado del viaje: ${status}`}>
      <span className="route-line__pin route-line__pin--origin" />
      <div className="route-line__track">
        <div
          className="route-line__fill"
          style={{ width: `${(activeIndex / (STEPS.length - 1)) * 100}%` }}
        />
      </div>
      <span className="route-line__pin route-line__pin--dest" />
      <div className="route-line__labels">
        {STEPS.map((step, i) => (
          <span
            key={step.key}
            className={
              'route-line__label' + (i <= activeIndex ? ' route-line__label--active' : '')
            }
          >
            {step.label}
          </span>
        ))}
      </div>
    </div>
  );
}
