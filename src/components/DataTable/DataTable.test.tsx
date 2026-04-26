import { vi } from 'vitest';
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { DataTable } from './DataTable';
import { DataTableColumn } from './DataTable.types';
import { expectNoA11yViolations } from '../../test-utils/axe';

interface Person {
  id: number;
  name: string;
  role: string;
  status: string;
}

const columns: DataTableColumn<Person>[] = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Name' },
  { key: 'role', header: 'Role', filterable: true },
  { key: 'status', header: 'Status', filterable: true },
];

const data: Person[] = [
  { id: 1, name: 'Alice', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Bob', role: 'Editor', status: 'Inactive' },
  { id: 3, name: 'Carol', role: 'Admin', status: 'Active' },
  { id: 4, name: 'Dave', role: 'Viewer', status: 'Inactive' },
];

describe('DataTable', () => {
  it('renders without errors', () => {
    render(<DataTable columns={columns} data={data} />);
  });

  it('renders column headers', () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders all data rows', () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Carol')).toBeInTheDocument();
    expect(screen.getByText('Dave')).toBeInTheDocument();
  });

  it('shows empty message when data is empty', () => {
    render(<DataTable columns={columns} data={[]} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('shows custom empty message', () => {
    render(<DataTable columns={columns} data={[]} emptyMessage="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('renders emptyState slot when provided and takes precedence over emptyMessage', () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        emptyMessage="ignored"
        emptyState={<div data-testid="custom-empty">Custom empty</div>}
      />
    );
    expect(screen.getByTestId('custom-empty')).toBeInTheDocument();
    expect(screen.queryByText('ignored')).not.toBeInTheDocument();
  });

  it('renders a filter button only for filterable columns', () => {
    render(<DataTable columns={columns} data={data} />);
    const filterButtons = screen.getAllByRole('button', { name: /filter by/i });
    expect(filterButtons).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Filter by Role' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Filter by Status' })).toBeInTheDocument();
  });

  it('opens filter dropdown when filter button is clicked', async () => {
    render(<DataTable columns={columns} data={data} />);
    const filterBtn = screen.getByRole('button', { name: 'Filter by Role' });
    await userEvent.click(filterBtn);
    expect(screen.getByRole('dialog', { name: 'Filter options for Role' })).toBeInTheDocument();
  });

  it('shows unique values as checkboxes in the filter dropdown', async () => {
    render(<DataTable columns={columns} data={data} />);
    await userEvent.click(screen.getByRole('button', { name: 'Filter by Role' }));
    const dropdown = screen.getByRole('dialog', { name: 'Filter options for Role' });
    expect(within(dropdown).getByLabelText('Admin')).toBeInTheDocument();
    expect(within(dropdown).getByLabelText('Editor')).toBeInTheDocument();
    expect(within(dropdown).getByLabelText('Viewer')).toBeInTheDocument();
  });

  it('filters rows when a checkbox is selected', async () => {
    render(<DataTable columns={columns} data={data} />);
    await userEvent.click(screen.getByRole('button', { name: 'Filter by Role' }));
    const adminCheckbox = screen.getByLabelText('Admin');
    await userEvent.click(adminCheckbox);
    expect(adminCheckbox).toBeChecked();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Carol')).toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    expect(screen.queryByText('Dave')).not.toBeInTheDocument();
  });

  it('allows multiple values to be selected (OR logic within a column)', async () => {
    render(<DataTable columns={columns} data={data} />);
    await userEvent.click(screen.getByRole('button', { name: 'Filter by Role' }));
    await userEvent.click(screen.getByLabelText('Admin'));
    await userEvent.click(screen.getByLabelText('Editor'));
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Carol')).toBeInTheDocument();
    expect(screen.queryByText('Dave')).not.toBeInTheDocument();
  });

  it('applies AND logic across multiple filtered columns', async () => {
    render(<DataTable columns={columns} data={data} />);

    await userEvent.click(screen.getByRole('button', { name: 'Filter by Role' }));
    await userEvent.click(screen.getByLabelText('Admin'));

    await userEvent.click(screen.getByRole('button', { name: 'Filter by Status' }));
    await userEvent.click(screen.getByLabelText('Active'));

    // Only Alice and Carol are Admin + Active
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Carol')).toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    expect(screen.queryByText('Dave')).not.toBeInTheDocument();
  });

  it('deselecting a checkbox removes the filter', async () => {
    render(<DataTable columns={columns} data={data} />);
    await userEvent.click(screen.getByRole('button', { name: 'Filter by Role' }));
    await userEvent.click(screen.getByLabelText('Admin'));
    // Bob and Dave hidden
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Admin'));
    // All rows visible again
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Dave')).toBeInTheDocument();
  });

  it('shows a Clear button when filters are active and clicking it resets the filter', async () => {
    render(<DataTable columns={columns} data={data} />);
    await userEvent.click(screen.getByRole('button', { name: 'Filter by Role' }));
    await userEvent.click(screen.getByLabelText('Admin'));

    const clearBtn = screen.getByRole('button', { name: /clear/i });
    expect(clearBtn).toBeInTheDocument();

    await userEvent.click(clearBtn);
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Dave')).toBeInTheDocument();
  });

  it('closes dropdown when another filter button is clicked', async () => {
    render(<DataTable columns={columns} data={data} />);
    await userEvent.click(screen.getByRole('button', { name: 'Filter by Role' }));
    expect(screen.getByRole('dialog', { name: 'Filter options for Role' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Filter by Status' }));
    expect(
      screen.queryByRole('dialog', { name: 'Filter options for Role' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Filter options for Status' })).toBeInTheDocument();
  });

  it('closes dropdown when clicking the same filter button again', async () => {
    render(<DataTable columns={columns} data={data} />);
    const filterBtn = screen.getByRole('button', { name: 'Filter by Role' });
    await userEvent.click(filterBtn);
    expect(screen.getByRole('dialog', { name: 'Filter options for Role' })).toBeInTheDocument();

    await userEvent.click(filterBtn);
    expect(
      screen.queryByRole('dialog', { name: 'Filter options for Role' })
    ).not.toBeInTheDocument();
  });

  it('uses custom cell renderer when render prop is provided', () => {
    const columnsWithRender: DataTableColumn<Person>[] = [
      ...columns,
      {
        key: 'name',
        header: 'Custom Name',
        render: (value) => <strong data-testid="custom-cell">{String(value).toUpperCase()}</strong>,
      },
    ];
    render(<DataTable columns={columnsWithRender} data={data} />);
    const customCells = screen.getAllByTestId('custom-cell');
    expect(customCells[0]).toHaveTextContent('ALICE');
  });

  it('shows empty message when filters exclude all rows', async () => {
    // Use the full data set: filter Role=Viewer AND Status=Active.
    // Dave is the only Viewer but he is Inactive, so no row matches.
    render(<DataTable columns={columns} data={data} />);

    await userEvent.click(screen.getByRole('button', { name: 'Filter by Role' }));
    await userEvent.click(screen.getByLabelText('Viewer'));

    await userEvent.click(screen.getByRole('button', { name: 'Filter by Status' }));
    await userEvent.click(screen.getByLabelText('Active'));

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('applies className and style to wrapper', () => {
    const { container } = render(
      <DataTable columns={columns} data={data} className="my-table" style={{ padding: '16px' }} />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('my-table');
    expect(wrapper).toHaveStyle({ padding: '16px' });
  });

  it('uses rowKey prop for stable row keys', () => {
    render(<DataTable columns={columns} data={data} rowKey={(row) => row.id} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  // ── Sorting ───────────────────────────────────────────────────────────────

  it('renders sort button for sortable columns', () => {
    const sortableColumns: DataTableColumn<Person>[] = [
      { key: 'id', header: 'ID', sortable: true },
      ...columns.slice(1),
    ];
    render(<DataTable columns={sortableColumns} data={data} />);
    expect(screen.getByRole('button', { name: /Sort by ID/i })).toBeInTheDocument();
  });

  it('calls onSort when a sortable column header is clicked', async () => {
    const handleSort = vi.fn();
    const sortableColumns: DataTableColumn<Person>[] = [
      { key: 'name', header: 'Name', sortable: true },
      ...columns.slice(2),
    ];
    render(<DataTable columns={sortableColumns} data={data} onSort={handleSort} />);
    await userEvent.click(screen.getByRole('button', { name: /Sort by Name/i }));
    expect(handleSort).toHaveBeenCalledWith('name', 'asc');
  });

  it('toggles sort direction on second click', async () => {
    const handleSort = vi.fn();
    const sortableColumns: DataTableColumn<Person>[] = [
      { key: 'name', header: 'Name', sortable: true },
      ...columns.slice(2),
    ];
    render(<DataTable columns={sortableColumns} data={data} onSort={handleSort} />);
    const sortBtn = screen.getByRole('button', { name: /Sort by Name/i });
    await userEvent.click(sortBtn);
    await userEvent.click(sortBtn);
    expect(handleSort).toHaveBeenLastCalledWith('name', 'desc');
  });

  // ── Loading skeleton ──────────────────────────────────────────────────────

  it('renders skeleton rows when loading is true', () => {
    render(<DataTable columns={columns} data={[]} loading skeletonRowCount={3} />);
    // Data cells are replaced by skeleton cells; no real data shown
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    // The empty message should NOT appear during loading
    expect(screen.queryByText('No data available')).not.toBeInTheDocument();
  });

  // ── Row click / expand ────────────────────────────────────────────────────

  it('calls onRowClick when a row is clicked', async () => {
    const handleRowClick = vi.fn();
    render(
      <DataTable columns={columns} data={data} onRowClick={handleRowClick} rowKey={(r) => r.id} />
    );
    await userEvent.click(screen.getByText('Alice'));
    expect(handleRowClick).toHaveBeenCalledWith(data[0]);
  });

  it('expands row when expandedRowRender is provided and row is clicked', async () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        rowKey={(r) => r.id}
        expandedRowRender={(row) => <div data-testid="expanded">{row.name} details</div>}
      />
    );
    await userEvent.click(screen.getByText('Alice'));
    expect(screen.getByTestId('expanded')).toHaveTextContent('Alice details');
  });

  it('collapses expanded row on second click', async () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        rowKey={(r) => r.id}
        expandedRowRender={(row) => <div data-testid="expanded">{row.name} details</div>}
      />
    );
    await userEvent.click(screen.getByText('Alice'));
    expect(screen.getByTestId('expanded')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Alice'));
    expect(screen.queryByTestId('expanded')).not.toBeInTheDocument();
  });

  // ── Selection ─────────────────────────────────────────────────────────────

  it('renders checkbox column when selectable is true', () => {
    render(<DataTable columns={columns} data={data} selectable rowKey={(r) => r.id} />);
    expect(screen.getByLabelText('Select all rows')).toBeInTheDocument();
    const rowCheckboxes = screen.getAllByRole('checkbox', { name: /^Select row/ });
    expect(rowCheckboxes).toHaveLength(data.length);
  });

  it('calls onSelectionChange when a row checkbox is clicked', async () => {
    const handleSelectionChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={data}
        selectable
        rowKey={(r) => r.id}
        onSelectionChange={handleSelectionChange}
      />
    );
    const [firstCheckbox] = screen.getAllByRole('checkbox', { name: /^Select row/ });
    await userEvent.click(firstCheckbox);
    expect(handleSelectionChange).toHaveBeenCalledWith(new Set([1]));
  });

  it('selects all rows when select-all checkbox is clicked', async () => {
    const handleSelectionChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={data}
        selectable
        rowKey={(r) => r.id}
        onSelectionChange={handleSelectionChange}
      />
    );
    await userEvent.click(screen.getByLabelText('Select all rows'));
    expect(handleSelectionChange).toHaveBeenCalledWith(new Set([1, 2, 3, 4]));
  });

  it('shows bulkActions bar when rows are selected', async () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        selectable
        rowKey={(r) => r.id}
        bulkActions={<button>Delete</button>}
      />
    );
    const [firstCheckbox] = screen.getAllByRole('checkbox', { name: /^Select row/ });
    await userEvent.click(firstCheckbox);
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText(/1 selected/i)).toBeInTheDocument();
  });

  // ── Pagination ────────────────────────────────────────────────────────────

  it('renders pagination controls when pagination prop is provided', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        pagination={{ currentPage: 1, pageSize: 2, totalCount: 4, onPageChange: vi.fn() }}
      />
    );
    expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Next page')).toBeInTheDocument();
    expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Page 2')).toBeInTheDocument();
  });

  it('calls onPageChange when a page button is clicked', async () => {
    const handlePageChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={data}
        pagination={{ currentPage: 1, pageSize: 2, totalCount: 4, onPageChange: handlePageChange }}
      />
    );
    await userEvent.click(screen.getByLabelText('Page 2'));
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

  it('disables previous button on first page', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        pagination={{ currentPage: 1, pageSize: 2, totalCount: 4, onPageChange: vi.fn() }}
      />
    );
    expect(screen.getByLabelText('Previous page')).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        pagination={{ currentPage: 2, pageSize: 2, totalCount: 4, onPageChange: vi.fn() }}
      />
    );
    expect(screen.getByLabelText('Next page')).toBeDisabled();
  });

  it('renders pagination chrome while loading with all controls disabled', () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        loading
        pagination={{ currentPage: 1, pageSize: 2, totalCount: 4, onPageChange: vi.fn() }}
      />
    );
    expect(screen.getByLabelText('Previous page')).toBeDisabled();
    expect(screen.getByLabelText('Next page')).toBeDisabled();
  });

  it('displays 0–0 of 0 when totalCount is 0', () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        pagination={{ currentPage: 1, pageSize: 10, totalCount: 0, onPageChange: vi.fn() }}
      />
    );
    expect(screen.getByText('0–0 of 0')).toBeInTheDocument();
  });
});

// ── New flagship features ──────────────────────────────────────────────────

describe('DataTable – global filter', () => {
  it('renders a global search input when onGlobalFilterChange is provided', () => {
    render(<DataTable columns={columns} data={data} onGlobalFilterChange={vi.fn()} />);
    expect(screen.getByRole('searchbox', { name: /global search/i })).toBeInTheDocument();
  });

  it('filters rows client-side by global search term', async () => {
    render(<DataTable columns={columns} data={data} onGlobalFilterChange={vi.fn()} />);
    const input = screen.getByRole('searchbox', { name: /global search/i });
    await userEvent.clear(input);
    await userEvent.type(input, 'Alice');
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
  });

  it('renders controlled global filter value', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        globalFilter="Carol"
        onGlobalFilterChange={vi.fn()}
      />
    );
    const input = screen.getByRole('searchbox') as HTMLInputElement;
    expect(input.value).toBe('Carol');
    expect(screen.getByText('Carol')).toBeInTheDocument();
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
  });

  it('calls onGlobalFilterChange when user types in search input', async () => {
    const handleChange = vi.fn();
    render(<DataTable columns={columns} data={data} onGlobalFilterChange={handleChange} />);
    const input = screen.getByRole('searchbox', { name: /global search/i });
    await userEvent.clear(input);
    await userEvent.type(input, 'x');
    expect(handleChange).toHaveBeenCalled();
  });

  it('does NOT apply client-side global filter when serverSide is true', async () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        globalFilter="Alice"
        onGlobalFilterChange={vi.fn()}
        serverSide
      />
    );
    // All rows still visible because serverSide bypasses client filtering
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Carol')).toBeInTheDocument();
  });
});

describe('DataTable – controlled sort state', () => {
  it('reflects controlled sortState prop in the sort button label', () => {
    const sortableColumns: DataTableColumn<Person>[] = [
      { key: 'name', header: 'Name', sortable: true },
      ...columns.slice(2),
    ];
    render(
      <DataTable
        columns={sortableColumns}
        data={data}
        sortState={{ key: 'name', direction: 'asc' }}
        onSortChange={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: /currently asc/i })).toBeInTheDocument();
  });

  it('calls onSortChange when a sortable header is clicked', async () => {
    const handleSortChange = vi.fn();
    const sortableColumns: DataTableColumn<Person>[] = [
      { key: 'name', header: 'Name', sortable: true },
      ...columns.slice(2),
    ];
    render(<DataTable columns={sortableColumns} data={data} onSortChange={handleSortChange} />);
    await userEvent.click(screen.getByRole('button', { name: /Sort by Name/i }));
    expect(handleSortChange).toHaveBeenCalledWith({ key: 'name', direction: 'asc' });
  });
});

describe('DataTable – controlled filter state', () => {
  it('reflects filterState prop', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        filterState={{ role: ['Admin'] }}
        onFilterChange={vi.fn()}
      />
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Carol')).toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
  });

  it('calls onFilterChange when a filter checkbox is toggled', async () => {
    const handleFilterChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={data}
        filterState={{}}
        onFilterChange={handleFilterChange}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Filter by Role' }));
    await userEvent.click(screen.getByLabelText('Admin'));
    expect(handleFilterChange).toHaveBeenCalledWith({ role: ['Admin'] });
  });
});

describe('DataTable – controlled expansion', () => {
  it('respects expandedRowKeys prop', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        rowKey={(r) => r.id}
        expandedRowKeys={new Set([1])}
        onExpansionChange={vi.fn()}
        expandedRowRender={(row) => <div data-testid="expanded">{row.name} details</div>}
      />
    );
    expect(screen.getByTestId('expanded')).toHaveTextContent('Alice details');
    expect(screen.queryAllByTestId('expanded')).toHaveLength(1);
  });

  it('calls onExpansionChange when a row is clicked', async () => {
    const handleExpansionChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={data}
        rowKey={(r) => r.id}
        expandedRowKeys={new Set<string | number>()}
        onExpansionChange={handleExpansionChange}
        expandedRowRender={(row) => <div>{row.name} details</div>}
      />
    );
    await userEvent.click(screen.getByText('Alice'));
    expect(handleExpansionChange).toHaveBeenCalledWith(new Set([1]));
  });
});

describe('DataTable – column visibility', () => {
  it('renders a "Columns" toggle button when onColumnVisibilityChange is provided', () => {
    render(<DataTable columns={columns} data={data} onColumnVisibilityChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: /toggle column visibility/i })).toBeInTheDocument();
  });

  it('hides columns listed in hiddenColumns', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        hiddenColumns={['role']}
        onColumnVisibilityChange={vi.fn()}
      />
    );
    expect(screen.queryByText('Role')).not.toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('toggles column visibility via the dropdown', async () => {
    const handleChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={data}
        hiddenColumns={[]}
        onColumnVisibilityChange={handleChange}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: /toggle column visibility/i }));
    const dropdown = screen.getByRole('group', { name: /columns/i });
    // Uncheck "Role" column
    await userEvent.click(within(dropdown).getByLabelText('Role'));
    expect(handleChange).toHaveBeenCalledWith(['role']);
  });
});

describe('DataTable – density', () => {
  it('renders without errors in compact density', () => {
    const { container } = render(<DataTable columns={columns} data={data} density="compact" />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    const wrapper = container.firstChild as HTMLElement;
    // CSS-modules hash class names, so match by prefix instead of literal class.
    expect(Array.from(wrapper.classList).some((c) => c.includes('densityCompact'))).toBe(true);
  });

  it('renders without errors in comfortable density', () => {
    const { container } = render(<DataTable columns={columns} data={data} density="comfortable" />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    const wrapper = container.firstChild as HTMLElement;
    expect(Array.from(wrapper.classList).some((c) => c.includes('densityComfortable'))).toBe(true);
  });
});

describe('DataTable – toolbar slot', () => {
  it('renders custom toolbar content', () => {
    render(<DataTable columns={columns} data={data} toolbar={<button>Custom Action</button>} />);
    expect(screen.getByRole('button', { name: 'Custom Action' })).toBeInTheDocument();
  });
});

describe('DataTable – export CSV', () => {
  it('renders Export CSV button when onExportCSV is provided', () => {
    render(<DataTable columns={columns} data={data} onExportCSV={vi.fn()} />);
    expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument();
  });

  it('calls onExportCSV with filtered data and visible columns when button is clicked', async () => {
    const handleExport = vi.fn();
    render(<DataTable columns={columns} data={data} onExportCSV={handleExport} />);
    await userEvent.click(screen.getByRole('button', { name: /export csv/i }));
    expect(handleExport).toHaveBeenCalledWith(data, columns);
  });

  it('passes only filtered rows to onExportCSV when filters are active', async () => {
    const handleExport = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={data}
        filterState={{ role: ['Admin'] }}
        onFilterChange={vi.fn()}
        onExportCSV={handleExport}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: /export csv/i }));
    const exportedRows = handleExport.mock.calls[0][0] as Person[];
    expect(exportedRows.every((r) => r.role === 'Admin')).toBe(true);
  });
});

describe('DataTable – server-side mode', () => {
  it('bypasses client-side column filters when serverSide is true', async () => {
    render(<DataTable columns={columns} data={data} serverSide />);
    await userEvent.click(screen.getByRole('button', { name: 'Filter by Role' }));
    await userEvent.click(screen.getByLabelText('Admin'));
    // All rows still present because server-side
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Dave')).toBeInTheDocument();
  });
});

describe('DataTable – column features (sticky / align / headerRender)', () => {
  it('applies text-align style to cells when align is set', () => {
    const centeredCols: DataTableColumn<Person>[] = [
      { key: 'id', header: 'ID', align: 'center' },
      ...columns.slice(1),
    ];
    const { container } = render(<DataTable columns={centeredCols} data={data} />);
    const idHeader = container.querySelector('th[style*="text-align: center"]');
    expect(idHeader).toBeInTheDocument();
  });

  it('renders custom header via headerRender', () => {
    const customCols: DataTableColumn<Person>[] = [
      {
        key: 'id',
        header: 'ID',
        headerRender: () => <span data-testid="custom-header">Custom ID</span>,
      },
      ...columns.slice(1),
    ];
    render(<DataTable columns={customCols} data={data} />);
    expect(screen.getByTestId('custom-header')).toBeInTheDocument();
  });
});

describe('a11y (axe)', () => {
  it('has no detectable axe violations in default render', async () => {
    const { container } = render(<DataTable columns={columns} data={data} />);
    await expectNoA11yViolations(container);
  });
});
