import React from 'react';
import { render, screen } from '@testing-library/react';
import { Text } from './Text';
import { Heading } from './Heading';
import { Link } from './Link';
import { Code } from './Code';
import { Kbd } from './Kbd';

describe('Typography', () => {
  describe('Text', () => {
    it('renders a span by default', () => {
      render(<Text>hello</Text>);
      const el = screen.getByText('hello');
      expect(el.tagName).toBe('SPAN');
    });

    it('renders as the polymorphic element via `as`', () => {
      render(<Text as="p">hello</Text>);
      expect(screen.getByText('hello').tagName).toBe('P');
    });

    it('applies size, weight, tone, align, italic, underline, truncate classes', () => {
      render(
        <Text
          data-testid="t"
          size="lg"
          weight="bold"
          tone="danger"
          align="center"
          italic
          underline
          truncate
        >
          text
        </Text>
      );
      const el = screen.getByTestId('t');
      expect(el.className).toMatch(/size-lg/);
      expect(el.className).toMatch(/weight-bold/);
      expect(el.className).toMatch(/tone-danger/);
      expect(el.className).toMatch(/align-center/);
      expect(el.className).toMatch(/italic/);
      expect(el.className).toMatch(/underline/);
      expect(el.className).toMatch(/truncate/);
    });
  });

  describe('Heading', () => {
    it('renders h2 by default', () => {
      render(<Heading>t</Heading>);
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('renders the requested level', () => {
      render(<Heading level={1}>t</Heading>);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('can override element via `as`', () => {
      render(
        <Heading level={3} as="h1">
          t
        </Heading>
      );
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
  });

  describe('Link', () => {
    it('renders an anchor with href', () => {
      render(<Link href="/foo">bar</Link>);
      const link = screen.getByRole('link', { name: 'bar' });
      expect(link).toHaveAttribute('href', '/foo');
    });

    it('adds target and rel when external', () => {
      render(
        <Link external href="https://example.com">
          ex
        </Link>
      );
      const link = screen.getByRole('link', { name: 'ex' });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link.getAttribute('rel')).toContain('noopener');
      expect(link.getAttribute('rel')).toContain('noreferrer');
    });
  });

  describe('Code', () => {
    it('renders a <code> element', () => {
      const { container } = render(<Code>x</Code>);
      expect(container.querySelector('code')).toBeInTheDocument();
    });
  });

  describe('Kbd', () => {
    it('renders a <kbd> element', () => {
      const { container } = render(<Kbd>Ctrl</Kbd>);
      expect(container.querySelector('kbd')).toBeInTheDocument();
    });
  });
});
