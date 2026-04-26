import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Pagination } from './Pagination';

const meta: Meta<typeof Pagination> = {
  title: 'Components/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    currentPage: { control: 'number' },
    totalCount: { control: 'number' },
    pageSize: { control: 'number' },
    siblingCount: { control: 'number' },
    boundaryCount: { control: 'number' },
    showFirstLast: { control: 'boolean' },
    showPageSize: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

function DefaultDemo() {
  const [page, setPage] = useState(1);
  return <Pagination currentPage={page} totalCount={100} pageSize={10} onPageChange={setPage} />;
}

export const Default: Story = {
  render: () => <DefaultDemo />,
};

function WithFirstLastDemo() {
  const [page, setPage] = useState(5);
  return (
    <Pagination
      currentPage={page}
      totalCount={200}
      pageSize={10}
      onPageChange={setPage}
      showFirstLast
    />
  );
}

export const WithFirstLast: Story = {
  render: () => <WithFirstLastDemo />,
};

function WithPageSizeSelectorDemo() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  return (
    <Pagination
      currentPage={page}
      totalCount={300}
      pageSize={size}
      onPageChange={setPage}
      showPageSize
      onPageSizeChange={(s) => {
        setSize(s);
        setPage(1);
      }}
    />
  );
}

export const WithPageSizeSelector: Story = {
  render: () => <WithPageSizeSelectorDemo />,
};

function SmallSizeDemo() {
  const [page, setPage] = useState(3);
  return (
    <Pagination
      currentPage={page}
      totalCount={100}
      pageSize={10}
      onPageChange={setPage}
      size="sm"
    />
  );
}

export const SmallSize: Story = {
  render: () => <SmallSizeDemo />,
};

function LargeSizeDemo() {
  const [page, setPage] = useState(3);
  return (
    <Pagination
      currentPage={page}
      totalCount={100}
      pageSize={10}
      onPageChange={setPage}
      size="lg"
      showFirstLast
    />
  );
}

export const LargeSize: Story = {
  render: () => <LargeSizeDemo />,
};

export const Disabled: Story = {
  render: () => (
    <Pagination
      currentPage={3}
      totalCount={100}
      pageSize={10}
      onPageChange={() => undefined}
      disabled
    />
  ),
};

function FewPagesDemo() {
  const [page, setPage] = useState(1);
  return <Pagination currentPage={page} totalCount={30} pageSize={10} onPageChange={setPage} />;
}

export const FewPages: Story = {
  render: () => <FewPagesDemo />,
};
