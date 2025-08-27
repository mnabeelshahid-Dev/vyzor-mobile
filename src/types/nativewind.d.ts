/// <reference types="nativewind/types" />

/**
 * NativeWind CSS className prop support for React Native components
 * Extends React Native component interfaces to include Tailwind CSS className support
 * @see https://www.nativewind.dev/
 */

// Define the className type for better type safety
type ClassNameProp = {
  /**
   * Tailwind CSS classes for styling React Native components
   * @example "flex-1 bg-blue-500 text-white p-4"
   */
  className?: string;
};

declare module 'react-native' {
  // Core UI Components
  interface ViewProps extends ClassNameProp {}
  interface TextProps extends ClassNameProp {}
  interface ScrollViewProps extends ClassNameProp {}
  interface SafeAreaViewProps extends ClassNameProp {}

  // Input Components
  interface TextInputProps extends ClassNameProp {}

  // Touchable Components
  interface TouchableOpacityProps extends ClassNameProp {}
  interface TouchableHighlightProps extends ClassNameProp {}
  interface TouchableWithoutFeedbackProps extends ClassNameProp {}
  interface PressableProps extends ClassNameProp {}

  // List Components
  interface FlatListProps<ItemT> extends ClassNameProp {}
  interface SectionListProps<ItemT, SectionT> extends ClassNameProp {}

  // Media Components
  interface ImageProps extends ClassNameProp {}

  // Additional Components (commonly used with NativeWind)
  interface ActivityIndicatorProps extends ClassNameProp {}
  interface SwitchProps extends ClassNameProp {}
  interface SliderProps extends ClassNameProp {}
  interface PickerProps extends ClassNameProp {}
  interface ModalProps extends ClassNameProp {}
  interface KeyboardAvoidingViewProps extends ClassNameProp {}
  interface RefreshControlProps extends ClassNameProp {}
  interface StatusBarProps extends ClassNameProp {}
}
