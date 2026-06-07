import { ParkingCard } from './ParkingCard';
import type { ParkingSpaceWithDistance } from '@/lib/types';

interface ParkingListProps {
  spaces: ParkingSpaceWithDistance[];
  compact?: boolean;
}

export function ParkingList({ spaces, compact = false }: ParkingListProps) {
  return (
    <div
      className={
        compact
          ? 'flex flex-col gap-3'
          : 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
      }
    >
      {spaces.map((space) => (
        <ParkingCard key={space.id} space={space} variant={compact ? 'compact' : 'default'} />
      ))}
    </div>
  );
}
