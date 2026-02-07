/**
 * Privacy indicator component that shows users their data stays local.
 * Displays in sidebar to reinforce the privacy-first nature of the application.
 */
export function PrivacyBadge() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 12px',
        backgroundColor: '#e8f5e9',
        borderRadius: '6px',
        fontSize: '13px',
        color: '#2e7d32',
      }}
      title="All calculations performed locally in your browser. No data is sent to any server."
    >
      <span aria-hidden="true">&#128274;</span>
      <span>All data stays in your browser</span>
    </div>
  );
}
