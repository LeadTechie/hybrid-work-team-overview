import { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import type { Office } from '../../types/office';
import { createOfficeIcon } from '../../utils/markerIcons';

interface OfficeMarkerProps {
  office: Office;
}

export function OfficeMarker({ office }: OfficeMarkerProps) {
  // Only render if office has valid coordinates
  if (!office.coords) {
    return null;
  }

  // Memoize icon - office icon is static, no dependencies needed
  const icon = useMemo(() => createOfficeIcon(), []);

  return (
    <Marker
      position={[office.coords.lat, office.coords.lon]}
      icon={icon}
    >
      <Popup>
        <div>
          <strong>{office.name}</strong>
          <br />
          {office.city}
        </div>
      </Popup>
    </Marker>
  );
}
