import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { FileInput } from './FileInput';
import { expectNoA11yViolations } from '../../test-utils/axe';

describe('FileInput', () => {
  it('renders without errors', () => {
    render(<FileInput />);
  });

  it('renders with label', () => {
    render(<FileInput label="Upload file" />);
    expect(screen.getByText('Upload file')).toBeInTheDocument();
  });

  it('renders the file button', () => {
    render(<FileInput buttonLabel="Select file" />);
    expect(screen.getByRole('button', { name: /Select file/ })).toBeInTheDocument();
  });

  it('renders the hidden native file input', () => {
    render(<FileInput />);
    expect(document.querySelector('input[type="file"]')).toBeInTheDocument();
  });

  it('disables the button when disabled', () => {
    render(<FileInput disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders dropzone when dropzone prop is set', () => {
    render(<FileInput dropzone buttonLabel="Drop files here" />);
    expect(screen.getByRole('button', { name: 'Drop files here' })).toBeInTheDocument();
  });

  it('renders error message', () => {
    render(<FileInput validationState="error" errorMessage="File required" />);
    expect(screen.getByText('File required')).toBeInTheDocument();
  });

  it('renders helper text', () => {
    render(<FileInput helperText="Max 5MB" />);
    expect(screen.getByText('Max 5MB')).toBeInTheDocument();
  });

  it('forwards ref to input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<FileInput ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('renders image preview when previewSrc is provided', () => {
    render(<FileInput previewSrc="https://example.com/image.jpg" />);
    const img = screen.getByRole('img', { name: 'Selected image preview' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('uses label in preview alt text when label is provided', () => {
    render(<FileInput previewSrc="https://example.com/image.jpg" label="Avatar" />);
    expect(screen.getByRole('img', { name: 'Avatar preview' })).toBeInTheDocument();
  });

  it('does not render image preview when previewSrc is not provided', () => {
    render(<FileInput />);
    expect(screen.queryByRole('img', { name: 'Selected image preview' })).not.toBeInTheDocument();
  });

  it('renders progress bar when uploadProgress is provided', () => {
    render(<FileInput uploadProgress={50} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '50');
  });

  it('renders progress bar when uploading is true', () => {
    render(<FileInput uploading />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
    // Indeterminate — value should not be set
    expect(progressbar).not.toHaveAttribute('value');
  });

  it('clamps uploadProgress to 0–100', () => {
    render(<FileInput uploadProgress={120} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '100');
  });

  it('renders a determinate 0% progress bar when uploadProgress is 0', () => {
    render(<FileInput uploadProgress={0} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute('value', '0');
  });

  describe('file selection', () => {
    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;

    beforeEach(() => {
      URL.createObjectURL = vi.fn(() => 'blob:mock-url');
      URL.revokeObjectURL = vi.fn();
    });

    afterEach(() => {
      URL.createObjectURL = originalCreate;
      URL.revokeObjectURL = originalRevoke;
    });

    it('calls onChange and lists selected file names', async () => {
      const onChange = vi.fn();
      render(<FileInput onChange={onChange} />);
      const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      await userEvent.upload(input, file);
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/hello\.txt/)).toBeInTheDocument();
    });

    it('does not list file names when showFileNames is false', async () => {
      render(<FileInput showFileNames={false} />);
      const file = new File(['x'], 'secret.txt', { type: 'text/plain' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      await userEvent.upload(input, file);
      expect(screen.queryByText(/secret\.txt/)).not.toBeInTheDocument();
    });

    it('creates an object URL preview for image files', async () => {
      render(<FileInput />);
      const file = new File(['img'], 'pic.png', { type: 'image/png' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      await userEvent.upload(input, file);
      expect(URL.createObjectURL).toHaveBeenCalledWith(file);
      const img = screen.getByRole('img', { name: 'Selected image preview' });
      expect(img).toHaveAttribute('src', 'blob:mock-url');
    });

    it('revokes the object URL on unmount', async () => {
      const { unmount } = render(<FileInput />);
      const file = new File(['img'], 'pic.png', { type: 'image/png' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      await userEvent.upload(input, file);
      unmount();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });
  });

  describe('dropzone interactions', () => {
    const originalCreate = URL.createObjectURL;

    beforeEach(() => {
      URL.createObjectURL = vi.fn(() => 'blob:drop-url');
    });

    afterEach(() => {
      URL.createObjectURL = originalCreate;
    });

    it('activates the file input when the button is clicked', () => {
      render(<FileInput />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const clickSpy = vi.spyOn(input, 'click');
      fireEvent.click(screen.getByRole('button'));
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it('activates the file input via Enter key on the dropzone', async () => {
      render(<FileInput dropzone />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const clickSpy = vi.spyOn(input, 'click');
      screen.getByRole('button').focus();
      await userEvent.keyboard('{Enter}');
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it('activates the file input via Space key on the dropzone', async () => {
      render(<FileInput dropzone />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const clickSpy = vi.spyOn(input, 'click');
      screen.getByRole('button').focus();
      await userEvent.keyboard(' ');
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it('ignores keyboard activation when disabled', async () => {
      render(<FileInput dropzone disabled />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const clickSpy = vi.spyOn(input, 'click');
      screen.getByRole('button').focus();
      await userEvent.keyboard('{Enter}');
      expect(clickSpy).not.toHaveBeenCalled();
    });

    it('handles drag over / drag leave and drop with files', () => {
      const onChange = vi.fn();
      render(<FileInput dropzone onChange={onChange} />);
      const dropzone = screen.getByRole('button');
      const file = new File(['img'], 'drop.png', { type: 'image/png' });
      const fileList = {
        0: file,
        length: 1,
        item: (i: number) => (i === 0 ? file : null),
      } as unknown as FileList;

      fireEvent.dragOver(dropzone, { dataTransfer: { files: fileList } });
      fireEvent.dragLeave(dropzone);
      fireEvent.drop(dropzone, { dataTransfer: { files: fileList } });

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/drop\.png/)).toBeInTheDocument();
      expect(URL.createObjectURL).toHaveBeenCalledWith(file);
    });

    it('ignores drop events when disabled', () => {
      const onChange = vi.fn();
      render(<FileInput dropzone disabled onChange={onChange} />);
      const file = new File(['x'], 'nope.txt', { type: 'text/plain' });
      const fileList = {
        0: file,
        length: 1,
        item: (i: number) => (i === 0 ? file : null),
      } as unknown as FileList;
      fireEvent.drop(screen.getByRole('button'), { dataTransfer: { files: fileList } });
      expect(onChange).not.toHaveBeenCalled();
    });
  });
});

describe('a11y (axe)', () => {
  it('has no detectable axe violations in default render', async () => {
    const { container } = render(<FileInput label="Upload file" />);
    await expectNoA11yViolations(container);
  });
});
