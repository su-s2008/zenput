import { useState } from 'react';
import { Avatar, Tag, SegmentedControl, SegmentedControlItem } from 'zenput';
import { Section, Scenario } from './_shell';

export function ActionsExtSection() {
  const [sc, setSc] = useState('month');

  return (
    <Section
      id="actions-ext"
      name="Avatar / Tag / SegmentedControl"
      description="Additional action primitives — Avatar (image, initials, status), Tag (closable chip), and SegmentedControl (radio group)."
    >
      <Scenario title="Avatar — sizes">
        <div className="row" style={{ alignItems: 'center' }}>
          <Avatar size="xs" name="Alice Brown" colorByName />
          <Avatar size="sm" name="Bob Chen" colorByName />
          <Avatar size="md" name="Carol Davis" colorByName />
          <Avatar size="lg" name="David Evans" colorByName />
          <Avatar size="xl" name="Eve Ford" colorByName />
          <Avatar size="2xl" name="Frank Green" colorByName />
        </div>
      </Scenario>

      <Scenario title="Avatar — image with fallback">
        <div className="row" style={{ alignItems: 'center' }}>
          <Avatar
            size="lg"
            src="https://i.pravatar.cc/150?img=3"
            name="Jane Doe"
          />
          <Avatar size="lg" name="No Image" colorByName />
          <Avatar size="lg" fallbackIcon={<span>👤</span>} />
        </div>
      </Scenario>

      <Scenario title="Avatar — presence status">
        <div className="row" style={{ alignItems: 'center' }}>
          <Avatar size="lg" name="Online" colorByName status="online" />
          <Avatar size="lg" name="Away" colorByName status="away" />
          <Avatar size="lg" name="Busy" colorByName status="busy" />
          <Avatar size="lg" name="Offline" colorByName status="offline" />
        </div>
      </Scenario>

      <Scenario title="Avatar — shapes">
        <div className="row" style={{ alignItems: 'center' }}>
          <Avatar size="lg" name="Circle" colorByName shape="circle" />
          <Avatar size="lg" name="Square" colorByName shape="square" />
        </div>
      </Scenario>

      <Scenario title="Tag — colors and variants">
        <div className="row" style={{ flexWrap: 'wrap' }}>
          {(['brand', 'neutral', 'success', 'warning', 'error', 'info'] as const).map((color) => (
            <Tag key={color} color={color} style={{ textTransform: 'capitalize' }}>
              {color}
            </Tag>
          ))}
        </div>
        <div className="row" style={{ flexWrap: 'wrap', marginTop: '8px' }}>
          {(['solid', 'subtle', 'outline'] as const).map((variant) => (
            <Tag key={variant} color="brand" variant={variant} style={{ textTransform: 'capitalize' }}>
              {variant}
            </Tag>
          ))}
        </div>
      </Scenario>

      <Scenario title="Tag — closable">
        <ClosableTags />
      </Scenario>

      <Scenario title="SegmentedControl — uncontrolled">
        <SegmentedControl defaultValue="list" aria-label="View mode">
          <SegmentedControlItem value="list">List</SegmentedControlItem>
          <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
          <SegmentedControlItem value="table">Table</SegmentedControlItem>
        </SegmentedControl>
      </Scenario>

      <Scenario title="SegmentedControl — controlled & sizes">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <SegmentedControl
            value={sc}
            onChange={setSc}
            size="sm"
            aria-label="Time period (sm)"
          >
            <SegmentedControlItem value="week">Week</SegmentedControlItem>
            <SegmentedControlItem value="month">Month</SegmentedControlItem>
            <SegmentedControlItem value="year">Year</SegmentedControlItem>
          </SegmentedControl>
          <SegmentedControl
            value={sc}
            onChange={setSc}
            size="md"
            aria-label="Time period (md)"
          >
            <SegmentedControlItem value="week">Week</SegmentedControlItem>
            <SegmentedControlItem value="month">Month</SegmentedControlItem>
            <SegmentedControlItem value="year">Year</SegmentedControlItem>
          </SegmentedControl>
          <SegmentedControl
            value={sc}
            onChange={setSc}
            size="lg"
            aria-label="Time period (lg)"
          >
            <SegmentedControlItem value="week">Week</SegmentedControlItem>
            <SegmentedControlItem value="month">Month</SegmentedControlItem>
            <SegmentedControlItem value="year">Year</SegmentedControlItem>
          </SegmentedControl>
          <p style={{ fontSize: '0.85em', color: 'var(--zp-color-text-muted)', margin: 0 }}>
            Selected: <strong>{sc}</strong>
          </p>
        </div>
      </Scenario>

      <Scenario title="SegmentedControl — full width">
        <SegmentedControl defaultValue="a" aria-label="Full width example" fullWidth>
          <SegmentedControlItem value="a">Option A</SegmentedControlItem>
          <SegmentedControlItem value="b">Option B</SegmentedControlItem>
          <SegmentedControlItem value="c">Option C</SegmentedControlItem>
          <SegmentedControlItem value="d" disabled>
            Disabled
          </SegmentedControlItem>
        </SegmentedControl>
      </Scenario>
    </Section>
  );
}

function ClosableTags() {
  const initial = ['React', 'TypeScript', 'Design System', 'Accessibility', 'CSS'];
  const [tags, setTags] = useState(initial);

  return (
    <div className="row" style={{ flexWrap: 'wrap', gap: '8px' }}>
      {tags.map((tag) => (
        <Tag
          key={tag}
          color="brand"
          onRemove={() => setTags((t) => t.filter((x) => x !== tag))}
        >
          {tag}
        </Tag>
      ))}
      {tags.length === 0 && (
        <button type="button" onClick={() => setTags(initial)}>
          Reset tags
        </button>
      )}
    </div>
  );
}
