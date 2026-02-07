import { useState } from 'react';
import { AccurateGeocodingModal } from './AccurateGeocodingModal';
import { useEmployeeStore } from '../stores/employeeStore';
import { hasApiKey, batchGeocodeWithStoredKey } from '../services/geocodingService';

/**
 * Button to trigger accurate geocoding upgrade.
 * Shows modal for consent and API key, then geocodes employees with street addresses.
 */
export function AccurateGeocodingButton() {
  const [showModal, setShowModal] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const { employees, setEmployees } = useEmployeeStore();

  // Count employees that can be upgraded (have street address, not already at address accuracy)
  const upgradableEmployees = employees.filter(
    (emp) => emp.street && emp.geocodeAccuracy !== 'address'
  );

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  const handleConfirm = async () => {
    setShowModal(false);
    setIsGeocoding(true);

    try {
      // Build full addresses from street + postcode + city
      const addressesToGeocode = upgradableEmployees.map((emp) => {
        const parts = [emp.street, emp.postcode, emp.city].filter(Boolean);
        return parts.join(', ') + ', Germany';
      });

      // Call geocoding service
      const results = await batchGeocodeWithStoredKey(addressesToGeocode);

      // Update employees with new coordinates
      const updatedEmployees = employees.map((emp) => {
        const upgradeIndex = upgradableEmployees.findIndex((u) => u.id === emp.id);
        if (upgradeIndex === -1) return emp;

        const result = results[upgradeIndex];
        if (result.status === 'success' && result.coords) {
          return {
            ...emp,
            coords: result.coords,
            geocodeAccuracy: 'address' as const,
            geocodeStatus: 'success' as const,
          };
        }
        return emp;
      });

      setEmployees(updatedEmployees);

      const successCount = results.filter((r) => r.status === 'success').length;
      console.log(`Accurate geocoding complete: ${successCount}/${results.length} succeeded`);
    } catch (error) {
      console.error('Accurate geocoding failed:', error);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Don't show if no employees can be upgraded
  if (upgradableEmployees.length === 0) {
    return null;
  }

  // Show different state if already has API key
  const hasKey = hasApiKey();

  return (
    <>
      <button
        onClick={handleOpenModal}
        disabled={isGeocoding}
        style={{
          padding: '8px 16px',
          backgroundColor: isGeocoding ? '#e0e0e0' : '#fff3e0',
          color: isGeocoding ? '#999' : '#e65100',
          border: '1px solid #ffcc80',
          borderRadius: '6px',
          cursor: isGeocoding ? 'not-allowed' : 'pointer',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          width: '100%',
        }}
        title={`Upgrade ${upgradableEmployees.length} employees from postcode (~5km) to street-level accuracy`}
      >
        <span aria-hidden="true">{isGeocoding ? '⏳' : '📍'}</span>
        <span>
          {isGeocoding
            ? 'Geocoding...'
            : hasKey
            ? `Upgrade ${upgradableEmployees.length} locations`
            : `Enable accurate geocoding (${upgradableEmployees.length})`}
        </span>
      </button>

      {showModal && (
        <AccurateGeocodingModal
          pendingCount={upgradableEmployees.length}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  );
}
