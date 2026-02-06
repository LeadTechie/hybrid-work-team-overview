import { useOfficeStore } from '../../stores/officeStore';
import { SortableTable, type Column } from './SortableTable';
import type { Office } from '../../types/office';

const columns: Column<Office>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'city', label: 'City', sortable: true },
  { key: 'address', label: 'Address', sortable: true },
  {
    key: 'geocodeStatus',
    label: 'Status',
    sortable: true,
    render: (office) => (
      <span className={`status-badge status-${office.geocodeStatus}`}>
        {office.geocodeStatus}
      </span>
    ),
  },
  {
    key: 'coords',
    label: 'Coordinates',
    sortable: false,
    render: (office) =>
      office.coords
        ? `${office.coords.lat.toFixed(4)}, ${office.coords.lon.toFixed(4)}`
        : '—',
  },
];

export function OfficesTable() {
  const { offices } = useOfficeStore();

  return (
    <div className="data-table-view">
      <div className="table-header">
        <h2>Offices</h2>
        <span className="table-count">{offices.length} total</span>
      </div>
      <SortableTable
        data={offices}
        columns={columns}
        keyExtractor={(office) => office.id}
      />
    </div>
  );
}
