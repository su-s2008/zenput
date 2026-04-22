import React, {
  forwardRef,
  useRef,
  useState,
  useCallback,
  useEffect,
  useImperativeHandle,
} from 'react';
import { FileInputProps } from './FileInput.types';
import { classNames, getValidationMessage, getValidationMessageClass } from '../../utils';
import { useFormField } from '../../hooks';
import styles from './FileInput.module.css';

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  (
    {
      size = 'md',
      variant: _variant,
      validationState = 'default',
      label,
      helperText,
      errorMessage,
      successMessage,
      warningMessage,
      required,
      disabled,
      readOnly: _readOnly,
      prefixIcon: _prefixIcon,
      suffixIcon: _suffixIcon,
      floatingLabel: _floatingLabel,
      fullWidth,
      wrapperClassName,
      wrapperStyle,
      labelClassName,
      labelStyle,
      inputClassName,
      inputStyle,
      helperTextClassName,
      helperTextStyle,
      id,
      className,
      buttonLabel = 'Choose file',
      showFileNames = true,
      dropzone,
      previewSrc,
      uploading,
      uploadProgress,
      onChange,
      multiple,
      accept,
      ...rest
    },
    ref
  ) => {
    const internalRef = useRef<HTMLInputElement>(null);

    // Always use internalRef for internal reads so that callback refs are supported.
    // Forward via useImperativeHandle so consumers with object or callback refs both work.
    useImperativeHandle(ref, () => internalRef.current as HTMLInputElement);

    const [fileNames, setFileNames] = useState<string[]>([]);
    const [isDragActive, setIsDragActive] = useState(false);
    const [objectUrl, setObjectUrl] = useState<string | undefined>(undefined);

    // Revoke the object-URL when it changes or the component unmounts.
    // Revocation happens only here (not inside setObjectUrl) to avoid double-revocation.
    useEffect(() => {
      return () => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      };
    }, [objectUrl]);

    const { inputId, helperId, labelProps, inputAriaProps } = useFormField({
      id,
      label,
      helperText,
      errorMessage,
      validationState,
      required,
      disabled,
    });

    const updatePreviewFromFiles = useCallback((files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setObjectUrl(URL.createObjectURL(file));
      }
    }, []);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target;
        if (files && showFileNames) {
          setFileNames(Array.from(files).map((f) => f.name));
        }
        updatePreviewFromFiles(files);
        onChange?.(e);
      },
      [onChange, showFileNames, updatePreviewFromFiles]
    );

    const handleDrop = useCallback(
      (e: React.DragEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsDragActive(false);
        if (disabled || !internalRef.current) return;
        const dt = e.dataTransfer;
        const dropped = dt.files;
        // Respect the `multiple` prop: in single-file mode, collapse to just the first file.
        let files: FileList | null = dropped;
        if (dropped && dropped.length > 1 && !multiple) {
          if (typeof DataTransfer === 'undefined') {
            // Fallback: FileList-like object containing only the first file.
            const first = dropped[0];
            files = {
              0: first,
              length: 1,
              item: (index: number) => (index === 0 ? first : null),
              [Symbol.iterator]: function* () {
                yield first;
              },
            } as unknown as FileList;
          } else {
            const single = new DataTransfer();
            single.items.add(dropped[0]);
            files = single.files;
          }
        }
        if (files && showFileNames) {
          setFileNames(Array.from(files).map((f) => f.name));
        }
        updatePreviewFromFiles(files);
        // Create a lightweight synthetic change event.
        // Only `target.files` / `currentTarget.files` are guaranteed.
        const changeEvent = {
          target: { files } as Partial<HTMLInputElement>,
          currentTarget: { files } as Partial<HTMLInputElement>,
        } as React.ChangeEvent<HTMLInputElement>;
        onChange?.(changeEvent);
      },
      [disabled, multiple, onChange, showFileNames, updatePreviewFromFiles]
    );

    const activeMessage = getValidationMessage(
      validationState,
      errorMessage,
      successMessage,
      warningMessage,
      helperText
    );

    const messageClass = getValidationMessageClass(validationState, styles);

    const activeSrc = objectUrl ?? previewSrc;
    const clampedProgress = uploadProgress && Math.min(100, Math.max(0, uploadProgress));

    return (
      <div
        className={classNames(
          styles.wrapper,
          styles[size],
          validationState === 'error' ? styles.error : undefined,
          fullWidth ? styles.fullWidth : undefined,
          wrapperClassName
        )}
        style={wrapperStyle}
      >
        {label && (
          <label
            {...labelProps}
            className={classNames(
              styles.label,
              required ? styles.required : undefined,
              labelClassName
            )}
            style={labelStyle}
          >
            {label}
          </label>
        )}
        <input
          {...rest}
          {...inputAriaProps}
          ref={internalRef}
          id={inputId}
          type="file"
          disabled={disabled}
          required={required}
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
          className={classNames(styles.nativeInput, inputClassName, className)}
          style={inputStyle}
        />
        {dropzone ? (
          <button
            type="button"
            aria-label={buttonLabel}
            disabled={disabled}
            className={classNames(
              styles.dropzone,
              isDragActive ? styles.dropzoneActive : undefined,
              disabled ? styles.dropzoneDisabled : undefined
            )}
            onClick={() => !disabled && internalRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              if (!disabled) setIsDragActive(true);
            }}
            onDragLeave={() => setIsDragActive(false)}
            onDrop={handleDrop}
          >
            <span>📁 {buttonLabel}</span>
            <span className={styles.dropzoneHint}>or drag and drop files here</span>
          </button>
        ) : (
          <button
            type="button"
            className={styles.fileButton}
            disabled={disabled}
            onClick={() => internalRef.current?.click()}
            aria-controls={inputId}
          >
            📁 {buttonLabel}
          </button>
        )}
        {activeSrc && (
          <div className={styles.imagePreview}>
            <img
              src={activeSrc}
              alt={
                typeof label === 'string' && label.trim()
                  ? `${label} preview`
                  : 'Selected image preview'
              }
              className={styles.previewImage}
            />
          </div>
        )}
        {showFileNames && fileNames.length > 0 && (
          <div className={styles.fileNames}>
            {fileNames.map((name) => (
              <div key={name} className={styles.fileName}>
                📄 {name}
              </div>
            ))}
          </div>
        )}
        {(uploading || clampedProgress !== undefined) && (
          <progress
            className={classNames(
              styles.uploadProgress,
              uploading ? styles.uploadProgressIndeterminate : undefined
            )}
            aria-label="Upload progress"
            max={100}
            value={uploading ? undefined : clampedProgress}
          />
        )}
        {activeMessage && (
          <span
            id={helperId}
            className={classNames(messageClass, helperTextClassName)}
            style={helperTextStyle}
          >
            {activeMessage}
          </span>
        )}
      </div>
    );
  }
);

FileInput.displayName = 'FileInput';
