import { useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from 'zenput';
import type { PopoverSide, PopoverAlign } from 'zenput';
import { Section, Scenario } from './_shell';

// ---------------------------------------------------------------------------
// Popover with form
// ---------------------------------------------------------------------------

function PopoverWithForm() {
  const [name, setName] = useState('');
  return (
    <Popover>
      <PopoverTrigger>Edit profile</PopoverTrigger>
      <PopoverContent style={{ padding: '16px', minWidth: '240px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ fontWeight: 600, marginBottom: '4px' }}>Edit profile</p>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.85em' }}>Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              style={{
                padding: '6px 10px',
                border: '1px solid var(--zp-color-border-default)',
                borderRadius: 'var(--zp-radius-md)',
                background: 'var(--zp-color-surface-input)',
                color: 'var(--zp-color-text-default)',
              }}
            />
          </label>
          {name && (
            <p style={{ fontSize: '0.85em', color: 'var(--zp-color-text-muted)' }}>
              Preview: <strong>{name}</strong>
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

export function PopoverSection() {
  const [open, setOpen] = useState(false);

  const sides: PopoverSide[] = ['top', 'bottom', 'left', 'right'];
  const aligns: PopoverAlign[] = ['start', 'center', 'end'];

  return (
    <Section
      id="popover"
      name="Popover"
      description="Floating panel anchored to its trigger — placements, controlled open state, and with-form example."
    >
      <Scenario title="Side placements">
        <div className="row">
          {sides.map((side) => (
            <Popover key={side}>
              <PopoverTrigger style={{ textTransform: 'capitalize' }}>{side}</PopoverTrigger>
              <PopoverContent
                side={side}
                style={{ padding: '12px 16px', minWidth: '160px' }}
              >
                <p>Popover on the <strong>{side}</strong> side.</p>
              </PopoverContent>
            </Popover>
          ))}
        </div>
      </Scenario>

      <Scenario title="Alignment variations (bottom side)">
        <div className="row">
          {aligns.map((align) => (
            <Popover key={align}>
              <PopoverTrigger style={{ textTransform: 'capitalize' }}>{align}</PopoverTrigger>
              <PopoverContent
                side="bottom"
                align={align}
                style={{ padding: '12px 16px', minWidth: '160px' }}
              >
                <p>Aligned: <strong>{align}</strong></p>
              </PopoverContent>
            </Popover>
          ))}
        </div>
      </Scenario>

      <Scenario title="Controlled">
        <div>
          <Popover open={open} onOpenChange={setOpen}>
            {/* PopoverTrigger provides the anchor element for positioning */}
            <PopoverTrigger onClick={() => setOpen((v) => !v)}>
              Toggle popover
            </PopoverTrigger>
            <PopoverContent style={{ padding: '12px 16px' }}>
              <p>Controlled popover — open: <strong>{String(open)}</strong></p>
              <div className="row" style={{ marginTop: '8px' }}>
                <button type="button" onClick={() => setOpen(false)}>
                  Close
                </button>
              </div>
            </PopoverContent>
          </Popover>
          <p style={{ marginTop: '8px', fontSize: '0.85em', color: 'var(--zp-color-text-muted)' }}>
            State is also managed externally — open: <strong>{String(open)}</strong>
          </p>
        </div>
      </Scenario>

      <Scenario title="With form">
        <PopoverWithForm />
      </Scenario>
    </Section>
  );
}
