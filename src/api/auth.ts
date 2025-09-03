import { AuthTokens, User, ApiResponse } from '../types';
import { ApiClient, createUrlParams } from '../utils/apiHelpers';
import { base64Encode } from '../utils/base64';
import { debugFetch } from '../utils/networkDebugger';

interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

interface RegisterResponse {
  user: User;
  tokens: AuthTokens;
}

// OAuth API client with Basic Auth
const oauthClient = new ApiClient('https://vyzor.app/api', {
  Authorization: `Basic ${base64Encode('SSApp:password')}`,
  'Content-Type': 'application/x-www-form-urlencoded',
});

// Regular API client
const apiClient = new ApiClient('https://vyzor.app/api');

export const authApi = {
  async login(
    email: string,
    password: string,
  ): Promise<ApiResponse<LoginResponse>> {
    console.log('🔐 [AUTH] Starting login for:', email);

    const formData = createUrlParams({
      username: email,
      password: password,
      grant_type: 'password',
    });

    console.log('🔐 [AUTH] Form data:', formData.toString());

    const response = await oauthClient.post<any>('/oauth/token', formData);

    console.log('🔐 [AUTH] API response:', {
      success: response.success,
      hasData: !!response.data,
      hasAccessToken: !!(response.data && response.data.access_token),
    });

    if (response.success && response.data && response.data.access_token) {
      console.log('🔐 [AUTH] Login successful, processing response...');

      const result = {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: 'user-id', // Will be populated from user profile API later
            email: email,
            name: email.split('@')[0], // Use email prefix as temporary name
            firstName: email.split('@')[0],
            lastName: '',
            dateOfBirth: '',
            phoneNumber: '',
            emailVerified: true, // Assume verified since login succeeded
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          tokens: {
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token || '',
            expiresIn: response.data.expires_in || 3600,
          },
        },
      };

      console.log('🔐 [AUTH] Returning successful result');
      return result;
    }

    console.log('🔐 [AUTH] Login failed:', response.message);
    return {
      success: false,
      message: response.message || 'Login failed',
      errors: {
        email: [response.message || 'Invalid credentials'],
      },
    };
  },

  async register(
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
    phoneNumber: string,
    dateOfBirth?: string,
  ): Promise<ApiResponse<RegisterResponse>> {
    console.log('🔗 [API] Starting registration request...');

    try {
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.slice(1).join(' ') || '';

      const formattedBirthday = dateOfBirth
        ? new Date(dateOfBirth).toISOString()
        : new Date('1990-01-01').toISOString();

      // Clean phone number - ensure it has proper format with country code
      const cleanPhoneNumber = phoneNumber.startsWith('+')
        ? phoneNumber
        : `+${phoneNumber.replace(/\D/g, '')}`;

      console.log('📞 Phone number formatting:', {
        original: phoneNumber,
        cleaned: cleanPhoneNumber,
      });

      const requestBody = {
        firstName,
        lastName,
        email: email.trim().toLowerCase(),
        birthday: formattedBirthday,
        password,
        userRoleModels: [],
        language: '',
        status: 'INACTIVE',
        userPhoneModels: [
          {
            phoneModel: {
              phoneNumber: cleanPhoneNumber,
              type: 'CALL',
              defaultPhone: true,
            },
          },
        ],
      };

      console.log('🔗 [API] Request body:', {
        ...requestBody,
        password: '***',
        userPhoneModels: [
          {
            phoneModel: {
              phoneNumber: cleanPhoneNumber,
              type: 'CALL',
              defaultPhone: true,
            },
          },
        ],
      });

      const response = await apiClient.post<any>('/newUser', requestBody);
      console.log('🔗 [API] Registration response:', response);

      if (response.success && response.data) {
        console.log('🔗 [API] Registration successful');
        return {
          success: true,
          message: 'Registration successful',
          data: {
            user: {
              id: response.data.user?.id || 'user-id',
              email: email,
              name: name,
              firstName,
              lastName,
              dateOfBirth: dateOfBirth || '',
              phoneNumber: cleanPhoneNumber,
              emailVerified: response.data.user?.emailVerified || false,
              createdAt:
                response.data.user?.createdAt || new Date().toISOString(),
              updatedAt:
                response.data.user?.updatedAt || new Date().toISOString(),
            },
            tokens: {
              accessToken: response.data.tokens?.accessToken || '',
              refreshToken: response.data.tokens?.refreshToken || '',
              expiresIn: response.data.tokens?.expiresIn || 3600,
            },
          },
        };
      }

      console.log('🔗 [API] Registration failed:', response.message);
      return {
        success: false,
        message: response.message || 'Registration failed',
        errors: {
          form: [response.message || 'Registration failed'],
        },
      };
    } catch (error: any) {
      console.error('🔗 [API] Registration error:', error);
      console.error('🔗 [API] Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      return {
        success: false,
        message: error.message || 'Network error occurred',
        errors: {
          form: [error.message || 'Unable to connect to server'],
        },
      };
    }
  },

  async forgotPassword(
    email: string,
  ): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.get<{ message: string }>(
      `/forgetPassword?email=${encodeURIComponent(email)}`,
    );

    if (response.success) {
      return {
        success: true,
        data: {
          message: 'Password reset instructions sent to your email',
        },
      };
    }

    return {
      success: false,
      message: response.message || 'Failed to send reset email',
      errors: {
        email: [response.message || 'Failed to send reset email'],
      },
    };
  },

  async resetPassword(
    token: string,
    password: string,
    confirmPassword: string,
  ): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post<{ message: string }>(
      '/resetPassword',
      {
        token,
        password,
        confirmPassword,
      },
    );

    return response.success
      ? response
      : {
          success: false,
          message: response.message || 'Failed to reset password',
          errors: {
            password: [response.message || 'Failed to reset password'],
          },
        };
  },

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthTokens>> {
    if (!refreshToken || refreshToken.length < 10) {
      return {
        success: false,
        message: 'Invalid refresh token',
        errors: { token: ['Invalid refresh token'] },
      };
    }

    // Mock implementation - replace with real API call
    return {
      success: true,
      data: {
        accessToken: `mock-access-token-${Date.now()}`,
        refreshToken: `mock-refresh-token-${Date.now()}`,
        expiresIn: 3600,
      },
    };
  },

  async logout(): Promise<ApiResponse<{ message: string }>> {
    return {
      success: true,
      data: {
        message: 'Logged out successfully',
      },
    };
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return await apiClient.get<User>('/user/me');
  },

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return await apiClient.put<User>('/user/profile', userData);
  },
};
