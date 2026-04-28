'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { UseFormReturn, FieldValues, Resolver } from 'react-hook-form';
import type { UseZenputFormOptions } from './Form.types';

/**
 * `useZenputForm` — thin wrapper around `react-hook-form`'s `useForm` that
 * automatically wires up a Zod schema via `@hookform/resolvers/zod`.
 *
 * The returned value is a standard `react-hook-form` `UseFormReturn` object,
 * so all RHF APIs are available in addition to the convenience provided by
 * the `<Form>` compound component.
 *
 * @example
 * ```tsx
 * import { z } from 'zod';
 * import { Form, useZenputForm } from 'zenput/forms';
 *
 * const schema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8),
 * });
 *
 * function LoginForm() {
 *   const form = useZenputForm({
 *     schema,
 *     defaultValues: { email: '', password: '' },
 *   });
 *
 *   return (
 *     <Form form={form} onSubmit={(values) => console.log(values)}>
 *       <Form.Field name="email">
 *         {(field) => <TextInput label="Email" {...field.props} />}
 *       </Form.Field>
 *       <Form.Submit>Login</Form.Submit>
 *     </Form>
 *   );
 * }
 * ```
 */
export function useZenputForm<TFieldValues extends FieldValues = FieldValues>({
  schema,
  defaultValues,
  mode = 'onBlur',
}: UseZenputFormOptions<TFieldValues> = {}): UseFormReturn<TFieldValues> {
  // @hookform/resolvers v5 types zodResolver with an internal Zod4/$ZodType
  // intersection that doesn't match our generic TFieldValues constraint.
  // The cast through `any` is intentional: runtime behaviour is correct and
  // type safety is preserved at the call site via TFieldValues.
  const resolver = schema
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? (zodResolver(schema as any) as Resolver<TFieldValues>)
    : undefined;

  return useForm<TFieldValues>({
    resolver,
    defaultValues,
    mode,
  });
}
