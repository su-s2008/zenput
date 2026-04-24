import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { Breadcrumbs } from './Breadcrumbs';
import { expectNoA11yViolations } from '../../../test-utils/axe';

const items = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Current Page' },
];

describe('Breadcrumbs', () => {
  it('renders without crashing', () => {
    render(<Breadcrumbs items={items} />);
  });

  it('renders a nav landmark with default aria-label', () => {
    render(<Breadcrumbs items={items} />);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
  });

  it('accepts a custom aria-label', () => {
    render(<Breadcrumbs items={items} aria-label="Page path" />);
    expect(screen.getByRole('navigation', { name: 'Page path' })).toBeInTheDocument();
  });

  it('renders all item labels', () => {
    render(<Breadcrumbs items={items} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Current Page')).toBeInTheDocument();
  });

  it('renders links for items with href (except last)', () => {
    render(<Breadcrumbs items={items} />);
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Products' })).toHaveAttribute('href', '/products');
    // last item is not a link
    expect(screen.queryByRole('link', { name: 'Current Page' })).not.toBeInTheDocument();
  });

  it('marks the last item with aria-current="page"', () => {
    render(<Breadcrumbs items={items} />);
    expect(screen.getByText('Current Page')).toHaveAttribute('aria-current', 'page');
  });

  it('does not mark non-last items as current', () => {
    render(<Breadcrumbs items={items} />);
    expect(screen.getByText('Home')).not.toHaveAttribute('aria-current');
  });

  it('renders separators between items', () => {
    const { container } = render(<Breadcrumbs items={items} />);
    // two separators for three items
    const separators = container.querySelectorAll('[aria-hidden="true"]');
    expect(separators).toHaveLength(2);
  });

  it('supports a custom separator', () => {
    const { container } = render(<Breadcrumbs items={items} separator=">" />);
    const separators = container.querySelectorAll('[aria-hidden="true"]');
    separators.forEach((sep) => expect(sep.textContent).toBe('>'));
  });

  it('renders a single item correctly', () => {
    render(<Breadcrumbs items={[{ label: 'Home' }]} />);
    expect(screen.getByText('Home')).toHaveAttribute('aria-current', 'page');
    // no separator
    expect(document.querySelectorAll('[aria-hidden="true"]')).toHaveLength(0);
  });

  it('renders the list as an ordered list', () => {
    const { container } = render(<Breadcrumbs items={items} />);
    expect(container.querySelector('ol')).toBeInTheDocument();
  });

  it('supports a custom link component via item.as', () => {
    const CustomLink = ({
      href,
      children,
      ...rest
    }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a href={href} data-custom="true" {...rest}>
        {children}
      </a>
    );
    const customItems = [
      { label: 'Home', href: '/', as: CustomLink },
      { label: 'Current' },
    ];
    render(<Breadcrumbs items={customItems} />);
    const link = screen.getByRole('link', { name: 'Home' });
    expect(link).toHaveAttribute('data-custom', 'true');
  });
});

describe('Breadcrumbs a11y (axe)', () => {
  it('has no detectable axe violations', async () => {
    const { container } = render(<Breadcrumbs items={items} />);
    await expectNoA11yViolations(container);
  });
});
