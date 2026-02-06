interface ViewTabsProps {
  activeTab: 'map' | 'offices' | 'employees';
  onTabChange: (tab: 'map' | 'offices' | 'employees') => void;
}

export function ViewTabs({ activeTab, onTabChange }: ViewTabsProps) {
  const tabs = [
    { id: 'map' as const, label: 'Map View' },
    { id: 'offices' as const, label: 'Offices' },
    { id: 'employees' as const, label: 'Employees' },
  ];

  return (
    <div className="view-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`view-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
