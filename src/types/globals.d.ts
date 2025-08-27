// Global environment variables and React Native type fixes
// Provides essential React Native types while preserving type safety

// Global environment variables injected by Metro
declare global {
  // Storybook configuration
  var __STORYBOOK_ENABLED__: boolean;

  // API configuration
  var __API_BASE_URL__: string;
  var __API_TIMEOUT__: number;
  var __API_RETRY_ATTEMPTS__: number;
  var __API_RETRY_DELAY__: number;

  // Feature flags
  var __ENABLE_ANALYTICS__: boolean;
  var __ENABLE_CRASH_REPORTING__: boolean;

  // Development environment
  var __DEV__: boolean;

  // Console extensions for development
  interface Console {
    time(label: string): void;
    timeEnd(label: string): void;
  }

  // Window object for development tools
  var window:
    | {
        __REDUX_DEVTOOLS_EXTENSION__?: {
          connect: (options: Record<string, unknown>) => unknown;
        };
      }
    | undefined;

  // Crypto API for ID generation
  var crypto: {
    randomUUID(): string;
  };
}

// React Native module declarations with proper types
declare module 'react-native' {
  import { ComponentType, ReactNode } from 'react';

  // Core component types with proper typing instead of 'any'
  export interface ViewProps {
    style?: ViewStyle | ViewStyle[];
    children?: ReactNode;
    [key: string]: unknown;
  }

  export interface TextProps {
    style?: TextStyle | TextStyle[];
    children?: ReactNode;
    [key: string]: unknown;
  }

  export interface TouchableOpacityProps {
    style?: ViewStyle | ViewStyle[];
    onPress?: () => void;
    children?: ReactNode;
    disabled?: boolean;
    [key: string]: unknown;
  }

  export interface TextInputProps {
    style?: TextStyle | TextStyle[];
    value?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    secureTextEntry?: boolean;
    [key: string]: unknown;
  }

  export interface ActivityIndicatorProps {
    size?: 'small' | 'large' | number;
    color?: string;
    [key: string]: unknown;
  }

  export interface ScrollViewProps {
    style?: ViewStyle | ViewStyle[];
    children?: ReactNode;
    [key: string]: unknown;
  }

  export interface SafeAreaViewProps {
    style?: ViewStyle | ViewStyle[];
    children?: ReactNode;
    [key: string]: unknown;
  }

  export interface StatusBarProps {
    backgroundColor?: string;
    barStyle?: 'default' | 'light-content' | 'dark-content';
    [key: string]: unknown;
  }

  export interface KeyboardAvoidingViewProps {
    style?: ViewStyle | ViewStyle[];
    behavior?: 'height' | 'position' | 'padding';
    children?: ReactNode;
    [key: string]: unknown;
  }

  export interface RefreshControlProps {
    refreshing: boolean;
    onRefresh?: () => void;
    [key: string]: unknown;
  }

  // Component exports with proper types
  export const View: ComponentType<ViewProps>;
  export const Text: ComponentType<TextProps>;
  export const TouchableOpacity: ComponentType<TouchableOpacityProps>;
  export const TextInput: ComponentType<TextInputProps>;
  export const ActivityIndicator: ComponentType<ActivityIndicatorProps>;
  export const ScrollView: ComponentType<ScrollViewProps>;
  export const SafeAreaView: ComponentType<SafeAreaViewProps>;
  export const StatusBar: ComponentType<StatusBarProps>;
  export const KeyboardAvoidingView: ComponentType<KeyboardAvoidingViewProps>;
  export const RefreshControl: ComponentType<RefreshControlProps>;

  // Alert API
  export const Alert: {
    alert: (
      title: string,
      message?: string,
      buttons?: Array<{
        text: string;
        onPress?: () => void;
        style?: 'default' | 'cancel' | 'destructive';
      }>
    ) => void;
  };

  // Platform API
  export const Platform: {
    OS: 'ios' | 'android';
    select: <T>(options: { ios: T; android: T }) => T;
  };

  // Appearance API
  export const Appearance: {
    getColorScheme: () => ColorSchemeName;
    addChangeListener: (
      listener: (preferences: { colorScheme: ColorSchemeName }) => void
    ) => { remove: () => void };
  };

  // AppRegistry
  export const AppRegistry: {
    registerComponent: (
      appName: string,
      componentProvider: () => ComponentType
    ) => void;
  };

  // StyleSheet with proper types
  export const StyleSheet: {
    create: <T extends NamedStyles<T>>(styles: T) => T;
    flatten: (style: unknown) => Record<string, unknown>;
    compose: (style1: unknown, style2: unknown) => unknown;
    absoluteFill: ViewStyle;
    absoluteFillObject: ViewStyle;
    hairlineWidth: number;
  };

  export type ViewStyle = Record<string, unknown>;
  export type TextStyle = Record<string, unknown>;
  export type ImageStyle = Record<string, unknown>;
  export type ColorSchemeName = 'light' | 'dark' | null;

  export type NamedStyles<T> = {
    [P in keyof T]: ViewStyle | TextStyle | ImageStyle;
  };
}

export {};
