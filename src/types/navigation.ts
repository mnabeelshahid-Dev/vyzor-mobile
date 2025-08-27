// Navigation types - properly typed for TypeScript safety
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

export type MainStackParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  Example: undefined;
};

// Add Tab Navigator types
export type MainTabParamList = {
  Home: undefined;
  Example: undefined;
  Profile: undefined;
  Settings: undefined;
};

// Navigation props helpers - properly typed
export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type MainScreenProps<T extends keyof MainStackParamList> =
  NativeStackScreenProps<MainStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;
