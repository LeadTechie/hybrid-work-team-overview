import { useState } from 'react';
import { setApiKey } from '../services/geocodingService';

interface AccurateGeocodingModalProps {
  pendingCount: number; // Number of items that would be geocoded
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * GDPR-compliant consent modal for accurate geocoding.
 *
 * Key requirements:
 * - Equal button prominence (same size, similar visual weight)
 * - Explicit consent checkbox with links to T&C and Privacy Policy
 * - Clear warning about data transfer to external service
 * - User must provide their own API key (never bundled)
 */
export function AccurateGeocodingModal({
  pendingCount,
  onConfirm,
  onCancel,
}: AccurateGeocodingModalProps) {
  const [apiKeyValue, setApiKeyValue] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleConfirm = () => {
    if (apiKeyValue && agreed) {
      setApiKey(apiKeyValue);
      onConfirm();
    }
  };

  const canConfirm = apiKeyValue.length > 0 && agreed;

  // Styles for GDPR-compliant equal button prominence
  const buttonBase: React.CSSProperties = {
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 500,
    cursor: 'pointer',
    minWidth: '120px',
    border: 'none',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="geocoding-modal-title"
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        }}
      >
        <h2
          id="geocoding-modal-title"
          style={{ margin: '0 0 16px', fontSize: '20px' }}
        >
          Enable Accurate Geocoding
        </h2>

        <div
          style={{
            backgroundColor: '#fff3e0',
            border: '1px solid #ffcc80',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
          }}
        >
          <p style={{ margin: '0 0 8px', fontWeight: 500 }}>
            <span aria-hidden="true">&#9888;&#65039;</span> Privacy Notice
          </p>
          <p style={{ margin: '0 0 8px', fontSize: '14px' }}>
            This will send <strong>{pendingCount} street addresses</strong> to
            Geoapify's geocoding service to get precise coordinates.
          </p>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
            Currently, distances use postcode centroids (~5km accuracy).
            Accurate mode provides street-level precision.
          </p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="apiKey"
            style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}
          >
            Your Geoapify API Key:
          </label>
          <input
            id="apiKey"
            type="password"
            value={apiKeyValue}
            onChange={(e) => setApiKeyValue(e.target.value)}
            placeholder="Enter your API key..."
            autoComplete="off"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
          <div
            style={{
              marginTop: '12px',
              padding: '12px',
              backgroundColor: '#f5f5f5',
              borderRadius: '6px',
              fontSize: '13px',
            }}
          >
            <p style={{ margin: '0 0 8px', fontWeight: 500 }}>
              To get your own free key (takes ~2 minutes):
            </p>
            <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: 1.6 }}>
              <li>
                Go to{' '}
                <a
                  href="https://myprojects.geoapify.com/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#1976d2' }}
                >
                  myprojects.geoapify.com/register
                </a>
              </li>
              <li>Sign up (email or Google/GitHub)</li>
              <li>Create a project</li>
              <li>Copy your API key</li>
            </ol>
            <p style={{ margin: '8px 0 0', color: '#666' }}>
              Free tier: 3,000 requests/day
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ marginTop: '2px' }}
            />
            <span>
              I understand that address data will be sent to Geoapify and agree
              to their{' '}
              <a
                href="https://www.geoapify.com/terms-of-service"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href="https://www.geoapify.com/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>
            </span>
          </label>
        </div>

        {/* GDPR: Equal button prominence - same size, similar visual weight */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onCancel}
            style={{
              ...buttonBase,
              backgroundColor: '#f0f0f0',
              color: '#333',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            style={{
              ...buttonBase,
              backgroundColor: canConfirm ? '#4a90d9' : '#ccc',
              color: 'white',
              cursor: canConfirm ? 'pointer' : 'not-allowed',
            }}
          >
            Geocode {pendingCount} addresses
          </button>
        </div>
      </div>
    </div>
  );
}
