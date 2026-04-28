import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  EmptyState,
  Pagination,
  Avatar,
} from 'zenput';
import { Section, Scenario } from './_shell';

// ---------------------------------------------------------------------------
// Pagination demo
// ---------------------------------------------------------------------------

function PaginationDemo() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const total = 243;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <p style={{ margin: 0, fontSize: '0.85em', color: 'var(--zp-color-text-muted)' }}>
        Page <strong>{page}</strong> of <strong>{Math.ceil(total / pageSize)}</strong> —{' '}
        {total} items, {pageSize} per page.
      </p>
      <Pagination
        currentPage={page}
        totalCount={total}
        pageSize={pageSize}
        onPageChange={setPage}
        showFirstLast
        showPageSize
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

export function ContentSection() {
  return (
    <Section
      id="content"
      name="Content (Card, EmptyState, Pagination)"
      description="Surface-level content containers, empty-state placeholders, and pagination controls."
    >
      <Scenario title="Card variants">
        <div className="row" style={{ flexWrap: 'wrap', gap: '12px' }}>
          {(['outlined', 'elevated', 'filled'] as const).map((variant) => (
            <Card key={variant} variant={variant} padding="md" style={{ minWidth: '160px' }}>
              <p style={{ margin: 0, fontWeight: 600, textTransform: 'capitalize' }}>{variant}</p>
              <p style={{ margin: '4px 0 0', fontSize: '0.85em' }}>Card body text.</p>
            </Card>
          ))}
        </div>
      </Scenario>

      <Scenario title="Card with header, body, footer">
        <div style={{ maxWidth: '360px' }}>
          <Card variant="elevated">
            <CardHeader
              title="Team member"
              description="Product designer at Acme"
              avatar={<Avatar name="Jane Doe" colorByName size="md" />}
              action={<button type="button" style={{ fontSize: '0.8em' }}>Edit</button>}
            />
            <CardBody>
              <p style={{ margin: 0, fontSize: '0.9em' }}>
                Jane has been leading design for the core checkout flow and the new onboarding
                experience.
              </p>
            </CardBody>
            <CardFooter>
              <button type="button">View profile</button>
            </CardFooter>
          </Card>
        </div>
      </Scenario>

      <Scenario title="Interactive card">
        <div className="row" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <Card
            variant="outlined"
            padding="md"
            interactive
            onClick={() => alert('Card clicked!')}
            style={{ minWidth: '160px', cursor: 'pointer' }}
          >
            <p style={{ margin: 0, fontWeight: 600 }}>Interactive</p>
            <p style={{ margin: '4px 0 0', fontSize: '0.85em' }}>Click or press Enter.</p>
          </Card>
          <Card
            variant="elevated"
            padding="md"
            interactive
            as="a"
            href="#content"
            style={{ minWidth: '160px' }}
          >
            <p style={{ margin: 0, fontWeight: 600 }}>Link card</p>
            <p style={{ margin: '4px 0 0', fontSize: '0.85em' }}>Rendered as &lt;a&gt;.</p>
          </Card>
        </div>
      </Scenario>

      <Scenario title="EmptyState — variants">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <EmptyState
            icon={<span style={{ fontSize: '32px' }}>📭</span>}
            title="No messages"
            description="You don't have any messages yet."
            primaryAction={{ label: 'Compose message', onClick: () => {} }}
          />
          <EmptyState
            variant="search"
            icon={<span style={{ fontSize: '32px' }}>🔍</span>}
            title="No results found"
            description="Try adjusting your search or filters."
            primaryAction={{ label: 'Clear filters', onClick: () => {} }}
            secondaryAction={{ label: 'Browse all', href: '#' }}
          />
          <EmptyState
            variant="error"
            icon={<span style={{ fontSize: '32px' }}>⚠️</span>}
            title="Something went wrong"
            description="Failed to load your data. Please try again."
            primaryAction={{ label: 'Retry', onClick: () => {} }}
          />
        </div>
      </Scenario>

      <Scenario title="Pagination">
        <PaginationDemo />
      </Scenario>
    </Section>
  );
}
