import React from 'react';
import { render, screen } from '@testing-library/react';
import { Icon } from './Icon';
import { CheckIcon, CloseIcon } from './icons';

describe('Icon', () => {
  it('renders decoratively (aria-hidden) when no label is provided', () => {
    const { container } = render(
      <Icon>
        <path d="M0 0h24v24H0z" />
      </Icon>
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).not.toHaveAttribute('role');
  });

  it('sets role="img" and aria-label when label is provided', () => {
    render(
      <Icon label="Close">
        <path d="M0 0h24v24H0z" />
      </Icon>
    );
    const svg = screen.getByRole('img', { name: 'Close' });
    expect(svg).toBeInTheDocument();
    expect(svg).not.toHaveAttribute('aria-hidden');
  });

  it('applies size to width and height', () => {
    const { container } = render(
      <Icon size={32}>
        <path d="M0 0h24v24H0z" />
      </Icon>
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
  });

  it('renders built-in icons', () => {
    const { container: closeContainer } = render(<CloseIcon />);
    const { container: checkContainer } = render(<CheckIcon />);
    expect(closeContainer.querySelector('svg')).toBeInTheDocument();
    expect(checkContainer.querySelector('svg')).toBeInTheDocument();
  });

  it('passes label through on built-in icons', () => {
    render(<CheckIcon label="Done" />);
    expect(screen.getByRole('img', { name: 'Done' })).toBeInTheDocument();
  });
});
