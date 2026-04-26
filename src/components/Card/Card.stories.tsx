import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardMedia, CardBody, CardFooter } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: ['outlined', 'elevated', 'filled'] },
    padding: { control: 'radio', options: ['none', 'sm', 'md', 'lg'] },
    interactive: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Outlined: Story = {
  render: () => (
    <Card variant="outlined" style={{ maxWidth: 360 }}>
      <CardHeader title="Card Title" description="Supporting description text" />
      <CardBody>This is the main content area. It can contain any React nodes.</CardBody>
      <CardFooter>
        <span style={{ color: '#6b7280', fontSize: '0.8125rem' }}>Updated 2 hours ago</span>
      </CardFooter>
    </Card>
  ),
};

export const Elevated: Story = {
  render: () => (
    <Card variant="elevated" style={{ maxWidth: 360 }}>
      <CardHeader title="Elevated Card" description="No border, box shadow instead" />
      <CardBody>Content goes here.</CardBody>
    </Card>
  ),
};

export const Filled: Story = {
  render: () => (
    <Card variant="filled" style={{ maxWidth: 360 }}>
      <CardHeader title="Filled Card" description="Subtle background colour" />
      <CardBody>Content goes here.</CardBody>
    </Card>
  ),
};

export const WithMedia: Story = {
  render: () => (
    <Card variant="outlined" style={{ maxWidth: 360 }}>
      <CardMedia
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
        alt="Mountain landscape"
        aspectRatio={16 / 9}
      />
      <CardHeader title="Mountain Sunrise" description="Photography by Unsplash" />
      <CardBody>A breathtaking view of the mountains at sunrise.</CardBody>
      <CardFooter>
        <button
          type="button"
          style={{
            padding: '0.375rem 0.75rem',
            borderRadius: 6,
            border: '1px solid #e5e7eb',
            background: '#fff',
            cursor: 'pointer',
            fontSize: '0.8125rem',
          }}
        >
          View photo
        </button>
      </CardFooter>
    </Card>
  ),
};

export const Interactive: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      {['Alpha', 'Beta', 'Gamma'].map((name) => (
        <Card
          key={name}
          variant="outlined"
          interactive
          onClick={() => alert(`Clicked ${name}`)}
          padding="md"
        >
          <strong>{name}</strong>
          <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
            Click to select
          </p>
        </Card>
      ))}
    </div>
  ),
};

export const InteractiveLink: Story = {
  render: () => (
    <Card variant="elevated" interactive as="a" href="#" style={{ maxWidth: 320 }}>
      <CardHeader title="Link Card" description="The whole card is a link" />
      <CardBody>Click anywhere on this card to navigate.</CardBody>
    </Card>
  ),
};

export const WithAvatar: Story = {
  render: () => (
    <Card variant="outlined" style={{ maxWidth: 400 }}>
      <CardHeader
        title="Alice Johnson"
        description="Senior Engineer · Engineering"
        avatar={
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: '#1d4ed8',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1rem',
            }}
          >
            AJ
          </div>
        }
        action={
          <button
            type="button"
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '1.25rem',
              color: '#6b7280',
            }}
            aria-label="More options"
          >
            ⋯
          </button>
        }
      />
      <CardBody>Alice has been with the company for 3 years.</CardBody>
    </Card>
  ),
};
