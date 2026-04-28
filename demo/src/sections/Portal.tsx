import { useState } from 'react';
import { Portal } from 'zenput';
import { Section, Scenario } from './_shell';

export function PortalSection() {
  const [showPortal, setShowPortal] = useState(false);
  const [showInline, setShowInline] = useState(false);

  return (
    <Section
      id="portal"
      name="Portal"
      description="Renders children into a portal outside the current DOM hierarchy — SSR-safe, stacking-context escape."
    >
      <Scenario title="Portal to document.body">
        <div>
          <button type="button" onClick={() => setShowPortal((v) => !v)}>
            {showPortal ? 'Hide' : 'Show'} portal content
          </button>
          {showPortal && (
            <Portal>
              <div
                style={{
                  position: 'fixed',
                  bottom: '24px',
                  right: '24px',
                  background: 'var(--zp-color-brand)',
                  color: '#fff',
                  padding: '12px 20px',
                  borderRadius: 'var(--zp-radius-md)',
                  boxShadow: 'var(--zp-shadow-lg)',
                  zIndex: 9999,
                  pointerEvents: 'none',
                }}
              >
                I am rendered in a portal on document.body
              </div>
            </Portal>
          )}
          <p style={{ marginTop: '8px', fontSize: '0.85em', color: 'var(--zp-color-text-muted)' }}>
            Inspect the DOM — this element is a direct child of{' '}
            <code>document.body</code>, not of this section.
          </p>
        </div>
      </Scenario>

      <Scenario title="disabled=true (renders inline)">
        <div>
          <button type="button" onClick={() => setShowInline((v) => !v)}>
            {showInline ? 'Hide' : 'Show'} inline content
          </button>
          {showInline && (
            <Portal disabled>
              <div
                style={{
                  marginTop: '8px',
                  padding: '12px 20px',
                  background: 'var(--zp-color-surface-raised)',
                  border: '1px solid var(--zp-color-border-default)',
                  borderRadius: 'var(--zp-radius-md)',
                }}
              >
                I am rendered inline (Portal disabled — useful for SSR / tests).
              </div>
            </Portal>
          )}
        </div>
      </Scenario>

      <Scenario title="Custom container">
        <CustomContainerDemo />
      </Scenario>
    </Section>
  );
}

function CustomContainerDemo() {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [show, setShow] = useState(false);

  return (
    <div>
      <div
        ref={setContainer}
        style={{
          border: '2px dashed var(--zp-color-border-default)',
          borderRadius: 'var(--zp-radius-md)',
          padding: '12px',
          minHeight: '60px',
          marginBottom: '8px',
        }}
      >
        <em style={{ color: 'var(--zp-color-text-muted)', fontSize: '0.85em' }}>
          Custom portal container
        </em>
        {show && container && (
          <Portal container={container}>
            <p style={{ marginTop: '8px', fontWeight: 600 }}>
              Portalled into the dashed box above.
            </p>
          </Portal>
        )}
      </div>
      <button type="button" onClick={() => setShow((v) => !v)}>
        {show ? 'Remove' : 'Portal into custom container'}
      </button>
    </div>
  );
}
