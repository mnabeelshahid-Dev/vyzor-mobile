// Generic validation types
export interface ValidationRule<T = any> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T, data?: Record<string, any>) => string | null;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

// Generic validator class
export class FormValidator {
  private rules: Record<string, ValidationRule> = {};

  addRule(field: string, rule: ValidationRule): FormValidator {
    this.rules[field] = rule;
    return this;
  }

  validate(data: Record<string, any>): ValidationResult {
    const errors: Record<string, string[]> = {};

    Object.entries(this.rules).forEach(([field, rule]) => {
      const value = data[field];
      const fieldErrors: string[] = [];

      // Required validation
      if (
        rule.required &&
        (!value || (typeof value === 'string' && value.trim() === ''))
      ) {
        fieldErrors.push(rule.message || `${field} is required`);
      }

      // Skip other validations if field is empty and not required
      if (!value && !rule.required) return;

      // String validations
      if (typeof value === 'string') {
        if (rule.minLength && value.length < rule.minLength) {
          fieldErrors.push(
            `${field} must be at least ${rule.minLength} characters`
          );
        }

        if (rule.maxLength && value.length > rule.maxLength) {
          fieldErrors.push(
            `${field} must be no more than ${rule.maxLength} characters`
          );
        }

        if (rule.pattern && !rule.pattern.test(value)) {
          fieldErrors.push(rule.message || `${field} format is invalid`);
        }
      }

      // Custom validation
      if (rule.custom) {
        const customError = rule.custom(value, data);
        if (customError) {
          fieldErrors.push(customError);
        }
      }

      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}

// Common validation patterns
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  name: /^[a-zA-Z\s'-]{2,}$/,
  zipCode: /^\d{5}(-\d{4})?$/,
  creditCard: /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/,
};

// Pre-built validators for common forms
export const AuthValidators = {
  login: new FormValidator()
    .addRule('email', {
      required: true,
      pattern: ValidationPatterns.email,
      message: 'Please enter a valid email address',
    })
    .addRule('password', {
      required: true,
      minLength: 6,
      message: 'Password must be at least 6 characters',
    }),

  register: new FormValidator()
    .addRule('name', {
      required: true,
      minLength: 2,
      pattern: ValidationPatterns.name,
      message: 'Please enter a valid name',
    })
    .addRule('email', {
      required: true,
      pattern: ValidationPatterns.email,
      message: 'Please enter a valid email address',
    })
    .addRule('password', {
      required: true,
      pattern: ValidationPatterns.password,
      message:
        'Password must contain at least 8 characters, including uppercase, lowercase, and number',
    })
    .addRule('confirmPassword', {
      required: true,
      custom: (value, data) => {
        return value !== data?.password ? 'Passwords do not match' : null;
      },
    })
    .addRule('phoneNumber', {
      required: true,
      pattern: ValidationPatterns.phone,
      message: 'Please enter a valid phone number',
    }),

  forgotPassword: new FormValidator().addRule('email', {
    required: true,
    pattern: ValidationPatterns.email,
    message: 'Please enter a valid email address',
  }),
};

// Data formatting utilities
export class DataFormatter {
  // Format phone number
  static formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6
      )}`;
    } else if (cleaned.length === 11 && cleaned[0] === '1') {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(
        4,
        7
      )}-${cleaned.slice(7)}`;
    }

    return phone;
  }

  // Clean phone number for API
  static cleanPhone(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  // Format date for display
  static formatDate(
    date: string | Date,
    format: 'short' | 'long' | 'iso' = 'short'
  ): string {
    const d = new Date(date);

    switch (format) {
      case 'short':
        return d.toLocaleDateString();
      case 'long':
        return d.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      case 'iso':
        return d.toISOString().split('T')[0];
      default:
        return d.toLocaleDateString();
    }
  }

  // Format currency
  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  // Capitalize first letter
  static capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  // Format name properly
  static formatName(name: string): string {
    return name
      .split(' ')
      .map(word => this.capitalize(word))
      .join(' ');
  }

  // Truncate text with ellipsis
  static truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
  }
}

// Form state management helper
export class FormState<T extends Record<string, any>> {
  private data: T;
  private errors: Record<string, string[]> = {};
  private touched: Record<string, boolean> = {};

  constructor(initialData: T) {
    this.data = { ...initialData };
  }

  // Get current form data
  getData(): T {
    return { ...this.data };
  }

  // Update a field
  updateField(field: keyof T, value: any): void {
    this.data[field] = value;
    this.touched[field as string] = true;

    // Clear errors for this field when user starts typing
    if (this.errors[field as string]) {
      delete this.errors[field as string];
    }
  }

  // Get field value
  getFieldValue(field: keyof T): any {
    return this.data[field];
  }

  // Check if field has been touched
  isFieldTouched(field: keyof T): boolean {
    return this.touched[field as string] || false;
  }

  // Get field errors
  getFieldErrors(field: keyof T): string[] {
    return this.errors[field as string] || [];
  }

  // Set validation errors
  setErrors(errors: Record<string, string[]>): void {
    this.errors = { ...errors };
  }

  // Clear all errors
  clearErrors(): void {
    this.errors = {};
  }

  // Reset form to initial state
  reset(newData?: T): void {
    if (newData) {
      this.data = { ...newData };
    }
    this.errors = {};
    this.touched = {};
  }

  // Check if form is valid
  isValid(): boolean {
    return Object.keys(this.errors).length === 0;
  }

  // Check if form has any changes
  isDirty(): boolean {
    return Object.keys(this.touched).length > 0;
  }
}

// Example usage:
/*
// Basic validation
const loginForm = new FormState({ email: '', password: '' });

// Update field
loginForm.updateField('email', 'user@example.com');

// Validate
const validation = AuthValidators.login.validate(loginForm.getData());
if (!validation.isValid) {
  loginForm.setErrors(validation.errors);
}

// Custom validator
const customValidator = new FormValidator()
  .addRule('username', {
    required: true,
    minLength: 3,
    custom: (value) => {
      return value.includes('admin') ? 'Username cannot contain "admin"' : null;
    }
  });

// Format data
const formattedPhone = DataFormatter.formatPhone('1234567890');
const cleanPhone = DataFormatter.cleanPhone('(123) 456-7890');
*/
