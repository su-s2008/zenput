import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from 'zenput';
import type { TooltipSide } from 'zenput';
import { Section, Scenario } from './_shell';

export function TooltipSection() {
  const sides: TooltipSide[] = ['top', 'bottom', 'left', 'right'];

  return (
    <Section
      id="tooltip"
      name="Tooltip"
      description="Non-interactive tooltip triggered on hover/focus — delay customisation, placement, multiline content."
    >
      <TooltipProvider>
        <Scenario title="Basic placements">
          <div className="row">
            {sides.map((side) => (
              <Tooltip key={side}>
                <TooltipTrigger>
                  <button type="button" style={{ textTransform: 'capitalize' }}>
                    {side}
                  </button>
                </TooltipTrigger>
                <TooltipContent side={side}>
                  Tooltip on the {side}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </Scenario>

        <Scenario title="Short delay (100 ms)">
          <Tooltip openDelay={100}>
            <TooltipTrigger>
              <button type="button">Hover me (fast)</button>
            </TooltipTrigger>
            <TooltipContent>Opens after 100 ms</TooltipContent>
          </Tooltip>
        </Scenario>

        <Scenario title="Long delay (1 500 ms)">
          <Tooltip openDelay={1500}>
            <TooltipTrigger>
              <button type="button">Hover me (slow)</button>
            </TooltipTrigger>
            <TooltipContent>Opens after 1 500 ms</TooltipContent>
          </Tooltip>
        </Scenario>

        <Scenario title="Multiline content">
          <Tooltip>
            <TooltipTrigger>
              <button type="button">Long description</button>
            </TooltipTrigger>
            <TooltipContent style={{ maxWidth: '220px' }}>
              This tooltip contains a longer description that wraps onto multiple lines to
              demonstrate multiline tooltip content.
            </TooltipContent>
          </Tooltip>
        </Scenario>

        <Scenario title="On an icon button">
          <Tooltip>
            <TooltipTrigger>
              <button
                type="button"
                aria-label="Delete item"
                style={{
                  width: '36px',
                  height: '36px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--zp-color-border-default)',
                  borderRadius: 'var(--zp-radius-md)',
                  background: 'var(--zp-color-surface-default)',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >
                🗑
              </button>
            </TooltipTrigger>
            <TooltipContent>Delete item</TooltipContent>
          </Tooltip>
        </Scenario>
      </TooltipProvider>
    </Section>
  );
}
