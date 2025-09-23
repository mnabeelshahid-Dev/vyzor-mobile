import * as yup from 'yup';

/**
 * Common validation patterns and messages
 */
export const ValidationMessages = {
  FIELD_REQUIRED: 'This field is required',
  EMAIL_REQUIRED: 'Email address is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters long',
  PASSWORD_PATTERN:
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  PHONE_REQUIRED: 'Phone number is required',
  PHONE_INVALID: 'Please enter a valid phone number',
  FIRSTNAME_REQUIRED: 'Firstname is required',
  FIRSTNAME_MIN_LENGTH: 'Firstname must be at least 3 characters long',
    FIRSTNAME_MAX_LENGTH: 'Firstname must be less than 15 characters',
  LASTNAME_REQUIRED: 'Lastname is required',
  LASTNAME_MIN_LENGTH: 'Lastname must be at least 3 characters long',
    LASTNAME_MAX_LENGTH: 'Lastname must be less than 15 characters',
  CONFIRM_PASSWORD_REQUIRED: 'Please confirm your password',
  PASSWORDS_NOT_MATCH: 'Passwords do not match',
  TERMS_REQUIRED: 'Please agree to terms and conditions',
};

/**
 * Validation patterns
 */
export const ValidationPatterns = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    USERNAME: /^[A-Za-z ]{3,15}$/,
};

/**
 * Email validation schema
 */
export const emailSchema = yup
  .string()
  .required(ValidationMessages.EMAIL_REQUIRED)
  .matches(ValidationPatterns.EMAIL, ValidationMessages.EMAIL_INVALID)
  .trim();

/**
 * Password validation schema
 */
export const passwordSchema = yup
  .string()
  .required(ValidationMessages.PASSWORD_REQUIRED)
  .min(8, ValidationMessages.PASSWORD_MIN_LENGTH)
  .matches(ValidationPatterns.PASSWORD, ValidationMessages.PASSWORD_PATTERN);

/**
 * Phone number validation schema
 */
export const phoneSchema = yup
  .string()
  .required(ValidationMessages.PHONE_REQUIRED)
  .matches(ValidationPatterns.PHONE, ValidationMessages.PHONE_INVALID)
  .min(10, 'Phone number must be at least 10 digits')
  .max(15, 'Phone number must be less than 15 digits');

/**
 * Firstname validation schema
 */
export const firstnameSchema = yup
  .string()
  .required(ValidationMessages.FIRSTNAME_REQUIRED)
  .min(3, ValidationMessages.FIRSTNAME_MIN_LENGTH)
    .max(15, ValidationMessages.FIRSTNAME_MAX_LENGTH)
  .matches(
    ValidationPatterns.USERNAME,
    'Firstname can only contain letters, numbers, and underscores'
  )
  .trim();

/**
 * Lastname validation schema
 */
export const lastnameSchema = yup
  .string()
  .required(ValidationMessages.LASTNAME_REQUIRED)
  .min(3, ValidationMessages.LASTNAME_MIN_LENGTH)
    .max(15, ValidationMessages.LASTNAME_MAX_LENGTH)
  .matches(
    /^[A-Za-z ]+$/,
    'Last name can only contain letters and spaces'
  );

/**
 * Date of birth validation schema
 */
export const dateOfBirthSchema = yup
  .string()
  .required('Date of birth is required')
  .test('valid-date', 'Please enter a valid date', function (value) {
    if (!value) return false;
    const date = new Date(value);
    return !isNaN(date.getTime());
  })
  .test('age-check', 'You must be at least 13 years old', function (value) {
    if (!value) return false;

    // Create date object and handle different date formats
    let birthDate;
    try {
      birthDate = new Date(value);
      // If date is invalid, try parsing MM/DD/YYYY format
      if (isNaN(birthDate.getTime())) {
        const parts = value.split('/');
        if (parts.length === 3) {
          // Assuming MM/DD/YYYY format
          birthDate = new Date(
            parseInt(parts[2]),
            parseInt(parts[0]) - 1,
            parseInt(parts[1])
          );
        }
      }
    } catch (error) {
      return false;
    }

    if (isNaN(birthDate.getTime())) return false;

    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Check if birthday has passed this year
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      return age - 1 >= 13;
    }
    return age >= 13;
  });

/**
 * Login form validation schema
 */
export const loginValidationSchema = yup.object({
  email: emailSchema,
  password: yup
    .string()
    .required(ValidationMessages.PASSWORD_REQUIRED)
    .min(8, ValidationMessages.PASSWORD_MIN_LENGTH),
});

/**
 * Generic function to build validation schema
 */
export function buildValidationSchema(fields: Record<string, any>) {
  return yup.object(fields);
}

/**
 * Register form validation schema (phone number optional)
 */
export const registerValidationSchema = buildValidationSchema({
  firstname: firstnameSchema,
  lastname: lastnameSchema,
  email: emailSchema,
  dateOfBirth: dateOfBirthSchema,
  phoneNumber: phoneSchema.optional(),
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .required(ValidationMessages.CONFIRM_PASSWORD_REQUIRED)
    .oneOf([yup.ref('password')], ValidationMessages.PASSWORDS_NOT_MATCH),
  agreeToTerms: yup.boolean().oneOf([true], ValidationMessages.TERMS_REQUIRED),
});

/**
 * Forgot password form validation schema
 */
export const forgotPasswordValidationSchema = yup.object({
  email: emailSchema,
});

/**
 * Reset password form validation schema
 */
export const resetPasswordValidationSchema = yup.object({
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

/**
 * Validation helper functions
 */
export const ValidationHelpers = {
  /**
   * Validates email format
   */
  isValidEmail: (email: string): boolean => {
    return ValidationPatterns.EMAIL.test(email);
  },

  /**
   * Validates password strength
   */
  isValidPassword: (password: string): boolean => {
    return password.length >= 8 && ValidationPatterns.PASSWORD.test(password);
  },

  /**
   * Validates phone number format
   */
  isValidPhone: (phone: string): boolean => {
    return (
      ValidationPatterns.PHONE.test(phone) &&
      phone.length >= 10 &&
      phone.length <= 15
    );
  },

  /**
   * Validates username format
   */
  isValidUsername: (username: string): boolean => {
    return ValidationPatterns.USERNAME.test(username);
  },

  /**
   * Get password strength level
   */
  getPasswordStrength: (
    password: string
  ): { level: number; text: string; color: string } => {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;

    switch (score) {
      case 0:
      case 1:
        return { level: 1, text: 'Very Weak', color: '#ff4757' };
      case 2:
        return { level: 2, text: 'Weak', color: '#ff6b6b' };
      case 3:
        return { level: 3, text: 'Fair', color: '#ffa502' };
      case 4:
        return { level: 4, text: 'Good', color: '#2ed573' };
      case 5:
        return { level: 5, text: 'Strong', color: '#00d2d3' };
      default:
        return { level: 1, text: 'Very Weak', color: '#ff4757' };
    }
  },

  /**
   * Format phone number for display
   */
  formatPhoneNumber: (phone: string, countryCode: string = 'US'): string => {
    const cleaned = phone.replace(/\D/g, '');

    if (countryCode === 'US') {
      if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
          6
        )}`;
      }
    }

    return phone;
  },

  /**
   * Clean phone number (remove formatting)
   */
  cleanPhoneNumber: (phone: string): string => {
    return phone.replace(/\D/g, '');
  },
};

export default {
  ValidationMessages,
  ValidationPatterns,
  loginValidationSchema,
  registerValidationSchema,
  forgotPasswordValidationSchema,
  resetPasswordValidationSchema,
  ValidationHelpers,
};
