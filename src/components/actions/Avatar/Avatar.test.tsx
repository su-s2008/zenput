import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Avatar, AvatarGroup } from './Avatar';
import { expectNoA11yViolations } from '../../../test-utils/axe';

describe('Avatar', () => {
  it('renders initials from name', () => {
    render(<Avatar name="Ada Lovelace" />);
    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it('renders single-word name with one initial', () => {
    render(<Avatar name="Ada" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('has role="img" and aria-label from name', () => {
    render(<Avatar name="Ada Lovelace" />);
    const el = screen.getByRole('img', { name: 'Ada Lovelace' });
    expect(el).toBeInTheDocument();
  });

  it('applies size class', () => {
    render(<Avatar name="A" size="lg" />);
    const el = screen.getByRole('img');
    expect(el.className).toMatch(/size-lg/);
  });

  it('applies shape class', () => {
    render(<Avatar name="A" shape="square" />);
    const el = screen.getByRole('img');
    expect(el.className).toMatch(/shape-square/);
  });

  it('renders status indicator', () => {
    render(<Avatar name="Ada Lovelace" status="online" />);
    // Status is included in the parent's accessible label
    expect(screen.getByRole('img', { name: 'Ada Lovelace, online' })).toBeInTheDocument();
  });

  it('falls back to fallbackIcon when no name or src', () => {
    render(<Avatar fallbackIcon={<span data-testid="icon">icon</span>} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('falls back to initials when image fails to load', () => {
    const { container } = render(<Avatar src="invalid.png" name="Ada Lovelace" />);
    const img = container.querySelector('img');
    if (img) {
      fireEvent.error(img);
    }
    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it('applies colorByName style with white text for contrast', () => {
    render(<Avatar name="Ada Lovelace" colorByName />);
    const el = screen.getByRole('img');
    // backgroundColor and white text color should be set from colorByName
    expect(el).toHaveStyle({ backgroundColor: expect.any(String), color: '#fff' });
  });
});

describe('AvatarGroup', () => {
  it('renders only max avatars and overflow count', () => {
    render(
      <AvatarGroup max={3}>
        <Avatar name="A" />
        <Avatar name="B" />
        <Avatar name="C" />
        <Avatar name="D" />
        <Avatar name="E" />
      </AvatarGroup>
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.queryByText('D')).not.toBeInTheDocument();
    expect(screen.queryByText('E')).not.toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('renders all avatars when max is not set', () => {
    render(
      <AvatarGroup>
        <Avatar name="A" />
        <Avatar name="B" />
      </AvatarGroup>
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it('has role="group"', () => {
    render(
      <AvatarGroup>
        <Avatar name="A" />
      </AvatarGroup>
    );
    expect(screen.getByRole('group')).toBeInTheDocument();
  });
});

describe('Avatar a11y (axe)', () => {
  it('has no axe violations for Avatar', async () => {
    const { container } = render(<Avatar name="Ada Lovelace" colorByName />);
    await expectNoA11yViolations(container);
  });

  it('has no axe violations for AvatarGroup', async () => {
    const { container } = render(
      <AvatarGroup max={3} aria-label="Users">
        <Avatar name="Ada Lovelace" colorByName />
        <Avatar name="Grace Hopper" colorByName />
        <Avatar name="Alan Turing" colorByName />
        <Avatar name="Extra" colorByName />
      </AvatarGroup>
    );
    await expectNoA11yViolations(container);
  });
});
