import { useState, useCallback } from 'react';

export interface ValidationRule<T> {
  validator: (value: T) => boolean;
  message: string;
}

export interface FieldValidation<T = string> {
  value: T;
  error: string;
  touched: boolean;
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: Partial<Record<keyof T, ValidationRule<T[keyof T]>[]>>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validateField = useCallback(
    (field: keyof T, value: T[keyof T]): string => {
      const rules = validationRules[field];
      if (!rules) return '';

      for (const rule of rules) {
        if (!rule.validator(value)) {
          return rule.message;
        }
      }
      return '';
    },
    [validationRules]
  );

  const handleChange = useCallback(
    (field: keyof T) => (value: T[keyof T]) => {
      setValues(prev => ({ ...prev, [field]: value }));

      if (touched[field]) {
        const error = validateField(field, value);
        setErrors(prev => ({ ...prev, [field]: error }));
      }
    },
    [touched, validateField]
  );

  const handleBlur = useCallback(
    (field: keyof T) => () => {
      setTouched(prev => ({ ...prev, [field]: true }));
      const error = validateField(field, values[field]);
      setErrors(prev => ({ ...prev, [field]: error }));
    },
    [values, validateField]
  );

  const validateAll = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    const newTouched: Partial<Record<keyof T, boolean>> = {};
    let isValid = true;

    (Object.keys(validationRules) as Array<keyof T>).forEach(field => {
      newTouched[field] = true;
      const error = validateField(field, values[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setTouched(newTouched);
    setErrors(newErrors);
    return isValid;
  }, [values, validationRules, validateField]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    setValues,
  };
}

// 常用验证规则
export const validators = {
  required: <T>(message = '此字段为必填项'): ValidationRule<T> => ({
    validator: (value: T) => {
      if (typeof value === 'string') return value.trim().length > 0;
      if (typeof value === 'number') return !isNaN(value);
      return value != null;
    },
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validator: (value: string) => value.trim().length >= min,
    message: message || `至少需要 ${min} 个字符`,
  }),

  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    validator: (value: string) => value.trim().length <= max,
    message: message || `最多 ${max} 个字符`,
  }),

  min: (min: number, message?: string): ValidationRule<number> => ({
    validator: (value: number) => value >= min,
    message: message || `最小值为 ${min}`,
  }),

  max: (max: number, message?: string): ValidationRule<number> => ({
    validator: (value: number) => value <= max,
    message: message || `最大值为 ${max}`,
  }),

  email: (message = '请输入有效的邮箱地址'): ValidationRule<string> => ({
    validator: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  }),

  pattern: (regex: RegExp, message: string): ValidationRule<string> => ({
    validator: (value: string) => regex.test(value),
    message,
  }),

  custom: <T>(validator: (value: T) => boolean, message: string): ValidationRule<T> => ({
    validator,
    message,
  }),
};
