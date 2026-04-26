import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import { Card, CardHeader, CardMedia, CardBody, CardFooter } from './Card';
import { expectNoA11yViolations } from '../../test-utils/axe';

describe('Card', () => {
  it('renders without crashing', () => {
    render(<Card>Content</Card>);
  });

  it('renders children', () => {
    render(
      <Card>
        <span>Hello</span>
      </Card>
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders as a div by default', () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.querySelector('div.card, div[class*="card"]')).toBeDefined();
  });

  it('renders as a button when interactive with no href', () => {
    render(<Card interactive>Click me</Card>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders as an anchor when as="a" with href', () => {
    render(
      <Card as="a" href="/path" interactive>
        Link
      </Card>
    );
    const link = screen.getByRole('link', { name: 'Link' });
    expect(link).toHaveAttribute('href', '/path');
  });

  it('calls onClick when interactive card is clicked', async () => {
    const onClick = vi.fn();
    render(
      <Card interactive onClick={onClick}>
        Click
      </Card>
    );
    await userEvent.click(screen.getByRole('button', { name: 'Click' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not forward href when rendering a native button', () => {
    render(<Card interactive>Click</Card>);
    const btn = screen.getByRole('button');
    expect(btn).not.toHaveAttribute('href');
    expect(btn).toHaveAttribute('type', 'button');
  });

  it('does not set type attribute when rendering a div', () => {
    const { container } = render(<Card>Plain</Card>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe('DIV');
    expect(root).not.toHaveAttribute('type');
    expect(root).not.toHaveAttribute('href');
  });

  it('forwards href when interactive without explicit as (anchor mode)', () => {
    render(
      <Card interactive href="/x">
        Link
      </Card>
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/x');
    expect(link).not.toHaveAttribute('type');
  });

  it('defaults type="button" when explicitly rendered as a native button', () => {
    render(<Card as="button">Action</Card>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('respects an explicit type prop on a native button root', () => {
    render(
      <Card as="button" type="submit">
        Submit
      </Card>
    );
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });
});

describe('CardHeader', () => {
  it('renders title and description', () => {
    render(<CardHeader title="My Title" description="Subtitle text" />);
    expect(screen.getByText('My Title')).toBeInTheDocument();
    expect(screen.getByText('Subtitle text')).toBeInTheDocument();
  });

  it('renders avatar and action slots', () => {
    render(
      <CardHeader
        title="User"
        avatar={<span data-testid="av">AV</span>}
        action={<button>…</button>}
      />
    );
    expect(screen.getByTestId('av')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('does not render description when omitted', () => {
    render(<CardHeader title="Only title" />);
    // The title renders as a <p>, but description should NOT be present
    expect(screen.getByText('Only title')).toBeInTheDocument();
    expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
  });
});

describe('CardMedia', () => {
  it('renders an img with the given src and alt', () => {
    render(<CardMedia src="/img.jpg" alt="A photo" />);
    const img = screen.getByRole('img', { name: 'A photo' });
    expect(img).toHaveAttribute('src', '/img.jpg');
  });

  it('uses empty alt by default', () => {
    const { container } = render(<CardMedia src="/img.jpg" />);
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('alt', '');
  });

  it('falls back to a 16:9 aspect ratio when given a non-positive value', () => {
    const { container } = render(<CardMedia src="/img.jpg" aspectRatio={0} />);
    const inner = container.querySelector('[style*="padding-bottom"]') as HTMLElement;
    // 1 / (16/9) * 100 = 56.25%
    expect(inner.style.paddingBottom).toBe('56.25%');
  });

  it('falls back to a 16:9 aspect ratio when given a non-finite value', () => {
    const { container } = render(
      <CardMedia src="/img.jpg" aspectRatio={Number.POSITIVE_INFINITY} />
    );
    const inner = container.querySelector('[style*="padding-bottom"]') as HTMLElement;
    expect(inner.style.paddingBottom).toBe('56.25%');
  });
});

describe('CardBody', () => {
  it('renders children', () => {
    render(<CardBody>Body content</CardBody>);
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });
});

describe('CardFooter', () => {
  it('renders children', () => {
    render(<CardFooter>Footer text</CardFooter>);
    expect(screen.getByText('Footer text')).toBeInTheDocument();
  });
});

describe('Card a11y', () => {
  it('passes a11y checks for a full card', async () => {
    const { container } = render(
      <Card variant="outlined">
        <CardHeader title="Title" description="Description" />
        <CardBody>Body</CardBody>
        <CardFooter>Footer</CardFooter>
      </Card>
    );
    await expectNoA11yViolations(container);
  });

  it('passes a11y checks for an interactive card', async () => {
    const { container } = render(
      <Card interactive onClick={() => undefined}>
        Interactive card
      </Card>
    );
    await expectNoA11yViolations(container);
  });
});
