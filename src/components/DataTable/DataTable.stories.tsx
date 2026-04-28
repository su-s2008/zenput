import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DataTable } from './DataTable';
import type { DataTableColumn } from './DataTable.types';

const meta: Meta<typeof DataTable> = {
  title: 'Components/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  argTypes: {
    emptyMessage: { control: 'text' },
    density: { control: 'radio', options: ['compact', 'default', 'comfortable'] },
  },
};

export default meta;
type Story = StoryObj<typeof DataTable>;

interface Employee {
  id: number;
  name: string;
  department: string;
  role: string;
  status: string;
  salary: number;
}

const employees: Employee[] = [
  {
    id: 1,
    name: 'Alice Johnson',
    department: 'Engineering',
    role: 'Senior Engineer',
    status: 'Active',
    salary: 120000,
  },
  {
    id: 2,
    name: 'Bob Smith',
    department: 'Design',
    role: 'UX Designer',
    status: 'Active',
    salary: 95000,
  },
  {
    id: 3,
    name: 'Carol White',
    department: 'Engineering',
    role: 'Junior Engineer',
    status: 'Inactive',
    salary: 75000,
  },
  {
    id: 4,
    name: 'David Lee',
    department: 'Marketing',
    role: 'Marketing Manager',
    status: 'Active',
    salary: 105000,
  },
  {
    id: 5,
    name: 'Eve Martinez',
    department: 'Design',
    role: 'UI Designer',
    status: 'Active',
    salary: 90000,
  },
  {
    id: 6,
    name: 'Frank Brown',
    department: 'Engineering',
    role: 'Tech Lead',
    status: 'Active',
    salary: 140000,
  },
];

const basicColumns: DataTableColumn[] = [
  { key: 'id', header: 'ID', width: '60px' },
  { key: 'name', header: 'Name' },
  { key: 'department', header: 'Department' },
  { key: 'role', header: 'Role' },
  { key: 'status', header: 'Status' },
];

export const Default: Story = {
  args: {
    columns: basicColumns,
    data: employees,
    rowKey: (row) => row.id,
  },
};

export const WithFilterableColumns: Story = {
  render: () => {
    const filterableColumns: DataTableColumn<Employee>[] = [
      { key: 'id', header: 'ID', width: '60px' },
      { key: 'name', header: 'Name' },
      { key: 'department', header: 'Department', filterable: true },
      { key: 'role', header: 'Role' },
      { key: 'status', header: 'Status', filterable: true },
    ];

    return <DataTable columns={filterableColumns} data={employees} rowKey={(row) => row.id} />;
  },
};

export const WithSortableColumns: Story = {
  render: () => {
    const sortableColumns: DataTableColumn<Employee>[] = [
      { key: 'id', header: 'ID', width: '60px', sortable: true },
      { key: 'name', header: 'Name', sortable: true },
      { key: 'department', header: 'Department', filterable: true, sortable: true },
      { key: 'status', header: 'Status', filterable: true },
      { key: 'salary', header: 'Salary', sortable: true },
    ];

    return (
      <DataTable
        columns={sortableColumns}
        data={employees}
        rowKey={(row) => row.id}
        onSort={(key, dir) => console.log('Sort', key, dir)}
      />
    );
  },
};

export const WithLoading: Story = {
  args: {
    columns: basicColumns,
    data: [],
    loading: true,
    skeletonRowCount: 4,
  },
};

export const WithPagination: Story = {
  render: () => {
    const PaginatedTable = () => {
      const [currentPage, setCurrentPage] = useState(1);
      const pageSize = 3;
      const pagedData = employees.slice((currentPage - 1) * pageSize, currentPage * pageSize);

      return (
        <DataTable
          columns={basicColumns}
          data={pagedData}
          rowKey={(row) => row.id}
          pagination={{
            currentPage,
            pageSize,
            totalCount: employees.length,
            onPageChange: setCurrentPage,
          }}
        />
      );
    };
    return <PaginatedTable />;
  },
};

export const WithRowClickAndExpand: Story = {
  render: () => (
    <DataTable
      columns={basicColumns}
      data={employees}
      rowKey={(row) => row.id}
      onRowClick={(row) => console.log('Row clicked:', row)}
      expandedRowRender={(row) => (
        <div style={{ padding: '8px 0', fontSize: '0.875rem', color: '#374151' }}>
          <strong>{row.name}</strong> — {row.role} in {row.department}. Salary:{' '}
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
          }).format(row.salary)}
        </div>
      )}
    />
  ),
};

export const WithBulkSelection: Story = {
  render: () => {
    const SelectableTable = () => {
      const [selected, setSelected] = useState<Set<string | number>>(new Set());

      return (
        <DataTable
          columns={basicColumns}
          data={employees}
          rowKey={(row) => row.id}
          selectable
          selectedRows={selected}
          onSelectionChange={setSelected}
          bulkActions={
            <button
              style={{
                padding: '4px 12px',
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.8125rem',
              }}
              onClick={() => setSelected(new Set())}
            >
              Delete selected
            </button>
          }
        />
      );
    };
    return <SelectableTable />;
  },
};

export const WithCustomRenderers: Story = {
  render: () => {
    const columnsWithRender: DataTableColumn<Employee>[] = [
      { key: 'id', header: 'ID', width: '60px' },
      { key: 'name', header: 'Name' },
      { key: 'department', header: 'Department', filterable: true },
      {
        key: 'status',
        header: 'Status',
        filterable: true,
        render: (value) => {
          const isActive = value === 'Active';
          return (
            <span
              style={{
                display: 'inline-block',
                padding: '2px 10px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: isActive ? '#d1fae5' : '#fee2e2',
                color: isActive ? '#065f46' : '#991b1b',
              }}
            >
              {String(value)}
            </span>
          );
        },
      },
      {
        key: 'salary',
        header: 'Salary',
        render: (value) => (
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 0,
            }).format(Number(value))}
          </span>
        ),
      },
    ];

    return <DataTable columns={columnsWithRender} data={employees} rowKey={(row) => row.id} />;
  },
};

export const EmptyStateDefaultMessage: Story = {
  args: {
    columns: basicColumns,
    data: [],
    rowKey: (row) => row.id,
  },
};

export const EmptyStateCustomMessage: Story = {
  args: {
    columns: basicColumns,
    data: [],
    rowKey: (row) => row.id,
    emptyMessage: 'No records match the current criteria.',
  },
};

// ── New flagship feature stories ───────────────────────────────────────────

export const WithGlobalSearch: Story = {
  render: () => {
    const SearchableTable = () => {
      const [globalFilter, setGlobalFilter] = useState('');

      return (
        <DataTable
          columns={basicColumns}
          data={employees}
          rowKey={(row) => row.id}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
        />
      );
    };
    return <SearchableTable />;
  },
};

export const WithColumnVisibilityToggle: Story = {
  render: () => {
    const ColumnToggleTable = () => {
      const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);

      return (
        <DataTable
          columns={basicColumns}
          data={employees}
          rowKey={(row) => row.id}
          hiddenColumns={hiddenColumns}
          onColumnVisibilityChange={setHiddenColumns}
        />
      );
    };
    return <ColumnToggleTable />;
  },
};

export const WithExportCSV: Story = {
  render: () => {
    const ExportTable = () => {
      const handleExport = (rows: Employee[], cols: DataTableColumn<Employee>[]) => {
        const headers = cols.map((c) => c.header);
        const csvRows = rows.map((row) => cols.map((c) => String(row[c.key] ?? '')));
        const csv = [headers, ...csvRows]
          .map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(','))
          .join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'employees.csv';
        a.click();
        URL.revokeObjectURL(url);
      };

      return (
        <DataTable
          columns={basicColumns}
          data={employees}
          rowKey={(row) => row.id}
          onExportCSV={handleExport}
        />
      );
    };
    return <ExportTable />;
  },
};

export const CompactDensity: Story = {
  args: {
    columns: basicColumns,
    data: employees,
    rowKey: (row) => row.id,
    density: 'compact',
  },
};

export const ComfortableDensity: Story = {
  args: {
    columns: basicColumns,
    data: employees,
    rowKey: (row) => row.id,
    density: 'comfortable',
  },
};

export const WithStickyHeader: Story = {
  render: () => (
    <div
      style={{ height: 200, overflow: 'auto' }}
      role="region"
      aria-label="Sticky header demo scroll area"
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
    >
      <DataTable columns={basicColumns} data={employees} rowKey={(row) => row.id} stickyHeader />
    </div>
  ),
};

export const WithStickyColumn: Story = {
  render: () => {
    const stickyColumns: DataTableColumn<Employee>[] = [
      { key: 'name', header: 'Name', sticky: 'left', width: '160px' },
      { key: 'department', header: 'Department', width: '200px' },
      { key: 'role', header: 'Role', width: '200px' },
      { key: 'status', header: 'Status', width: '200px' },
      { key: 'salary', header: 'Salary', width: '200px' },
    ];
    return (
      <div
        style={{ width: 500, overflow: 'auto' }}
        role="region"
        aria-label="Sticky column demo scroll area"
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
      >
        <DataTable columns={stickyColumns} data={employees} rowKey={(row) => row.id} />
      </div>
    );
  },
};

export const FullFeatured: Story = {
  render: () => {
    const FullTable = () => {
      const [globalFilter, setGlobalFilter] = useState('');
      const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
      const [selected, setSelected] = useState<Set<string | number>>(new Set());

      const allColumns: DataTableColumn<Employee>[] = [
        { key: 'id', header: 'ID', width: '60px', sortable: true },
        { key: 'name', header: 'Name', sortable: true },
        { key: 'department', header: 'Department', filterable: true, sortable: true },
        { key: 'role', header: 'Role', filterable: true },
        {
          key: 'status',
          header: 'Status',
          filterable: true,
          align: 'center',
          render: (value) => {
            const isActive = value === 'Active';
            return (
              <span
                style={{
                  display: 'inline-block',
                  padding: '2px 10px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: isActive ? '#d1fae5' : '#fee2e2',
                  color: isActive ? '#065f46' : '#991b1b',
                }}
              >
                {String(value)}
              </span>
            );
          },
        },
        {
          key: 'salary',
          header: 'Salary',
          sortable: true,
          align: 'right',
          render: (value) => (
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 0,
              }).format(Number(value))}
            </span>
          ),
        },
      ];

      const handleExport = (rows: Employee[], cols: DataTableColumn<Employee>[]) => {
        console.log('Export', rows.length, 'rows,', cols.length, 'columns');
      };

      return (
        <DataTable
          columns={allColumns}
          data={employees}
          rowKey={(row) => row.id}
          selectable
          selectedRows={selected}
          onSelectionChange={setSelected}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          hiddenColumns={hiddenColumns}
          onColumnVisibilityChange={setHiddenColumns}
          onExportCSV={handleExport}
          stickyHeader
          density="default"
          bulkActions={
            <button
              style={{
                padding: '4px 12px',
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.8125rem',
              }}
              onClick={() => setSelected(new Set())}
            >
              Delete selected
            </button>
          }
        />
      );
    };
    return <FullTable />;
  },
};

export const ServerSideMode: Story = {
  render: () => {
    const ServerTable = () => {
      const [sortInfo, setSortInfo] = useState<{ key: string; dir: string } | null>(null);
      const [filterInfo, setFilterInfo] = useState<Record<string, string[]>>({});
      const [search, setSearch] = useState('');

      const allColumns: DataTableColumn<Employee>[] = [
        { key: 'id', header: 'ID', width: '60px', sortable: true },
        { key: 'name', header: 'Name', sortable: true },
        { key: 'department', header: 'Department', filterable: true },
        { key: 'status', header: 'Status', filterable: true },
      ];

      return (
        <div>
          <p style={{ fontSize: '0.8125rem', color: '#6b7280', marginBottom: 8 }}>
            Sort: {sortInfo ? `${sortInfo.key} ${sortInfo.dir}` : 'none'} | Filters:{' '}
            {JSON.stringify(filterInfo)} | Search: &quot;{search}&quot;
          </p>
          <DataTable
            columns={allColumns}
            data={employees}
            rowKey={(row) => row.id}
            serverSide
            onSortChange={(s) => setSortInfo(s ? { key: s.key, dir: s.direction } : null)}
            onFilterChange={setFilterInfo}
            onGlobalFilterChange={setSearch}
            globalFilter={search}
          />
        </div>
      );
    };
    return <ServerTable />;
  },
};

export const WithCustomHeaderRenderer: Story = {
  render: () => {
    const cols: DataTableColumn<Employee>[] = [
      {
        key: 'name',
        header: 'Name',
        headerRender: (col) => (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>👤 {col.header}</span>
        ),
      },
      { key: 'department', header: 'Department' },
      { key: 'status', header: 'Status' },
    ];
    return <DataTable columns={cols} data={employees} rowKey={(row) => row.id} />;
  },
};

export const WithControlledExpansion: Story = {
  render: () => {
    const ControlledExpandTable = () => {
      const [expandedRowKeys, setExpandedRowKeys] = useState<Set<string | number>>(new Set([1]));

      return (
        <DataTable
          columns={basicColumns}
          data={employees}
          rowKey={(row) => row.id}
          expandedRowKeys={expandedRowKeys}
          onExpansionChange={setExpandedRowKeys}
          expandedRowRender={(row) => (
            <div style={{ padding: '8px 0', fontSize: '0.875rem', color: '#374151' }}>
              <strong>{row.name}</strong> — {row.role} in {row.department}
            </div>
          )}
        />
      );
    };
    return <ControlledExpandTable />;
  },
};


export const RTL: StoryObj<typeof DataTable> = {
  name: 'RTL — right-to-left DataTable',
  globals: { direction: 'rtl' },
  render: () => {
    const rtlColumns: DataTableColumn<Employee>[] = [
      { key: 'id', header: 'المعرّف', width: '60px' },
      { key: 'name', header: 'الاسم', sortable: true },
      { key: 'department', header: 'القسم', filterable: true },
      { key: 'role', header: 'الدور' },
      { key: 'status', header: 'الحالة', filterable: true },
    ];
    const rtlEmployees = [
      { id: 1, name: 'أحمد علي', department: 'الهندسة', role: 'مهندس أول', status: 'نشط', salary: 120000 },
      { id: 2, name: 'فاطمة حسن', department: 'التصميم', role: 'مصمم UX', status: 'نشط', salary: 95000 },
      { id: 3, name: 'محمد إبراهيم', department: 'التسويق', role: 'مدير تسويق', status: 'غير نشط', salary: 105000 },
    ];
    return (
      <DataTable
        columns={rtlColumns}
        data={rtlEmployees}
        rowKey={(row) => row.id}
      />
    );
  },
};
