
import { useState, useCallback } from 'react';
import { ZodSchema, ZodError } from 'zod';

interface UseFormValidationProps<T> {
  schema: ZodSchema<T>;
  onSuccess: (data: T) => void;
}

export const useFormValidation = <T>({ schema, onSuccess }: UseFormValidationProps<T>) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  const validate = useCallback(async (data: unknown) => {
    setIsValidating(true);
    setErrors({});

    try {
      const validatedData = schema.parse(data);
      onSuccess(validatedData);
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [schema, onSuccess]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const getFieldError = useCallback((fieldName: string) => {
    return errors[fieldName];
  }, [errors]);

  return {
    validate,
    errors,
    isValidating,
    clearErrors,
    getFieldError,
    hasErrors: Object.keys(errors).length > 0
  };
};
