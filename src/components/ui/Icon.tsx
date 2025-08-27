import React from 'react';
import { Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { Theme } from '../../contexts/ThemeContext';

export type IconName =
  | 'email'
  | 'lock'
  | 'eye'
  | 'eye-off'
  | 'google'
  | 'facebook'
  | 'twitter'
  | 'user'
  | 'home'
  | 'settings'
  | 'analytics'
  | 'edit'
  | 'users'
  | 'notification'
  | 'heart'
  | 'star'
  | 'search'
  | 'menu'
  | 'close'
  | 'check'
  | 'chevron-right'
  | 'chevron-left'
  | 'chevron-up'
  | 'chevron-down';

export interface IconProps {
  name: IconName;
  size?: 'small' | 'medium' | 'large' | number;
  color?: string;
  style?: ViewStyle | TextStyle;
}

const iconMap: Record<IconName, string> = {
  // Auth icons (matching login screen)
  email: '✉',
  lock: '🔒',
  eye: '👁️',
  'eye-off': '👁️‍🗨️',

  // Social icons (matching login screen)
  google: 'G',
  facebook: 'f',
  twitter: '🐦',

  // Navigation & UI
  user: '👤',
  home: '🏠',
  settings: '⚙️',
  analytics: '📊',
  edit: '📝',
  users: '👥',
  notification: '🔔',
  heart: '❤️',
  star: '⭐',
  search: '🔍',
  menu: '☰',
  close: '✕',
  check: '✓',
  'chevron-right': '›',
  'chevron-left': '‹',
  'chevron-up': '˄',
  'chevron-down': '˅',
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'medium',
  color,
  style,
}) => {
  const styles = useThemedStyles(createStyles);

  const iconStyle = [
    styles.icon,
    typeof size === 'string'
      ? styles[size as keyof typeof styles]
      : { fontSize: size },
    color && { color },
    style,
  ];

  return <Text style={iconStyle}>{iconMap[name]}</Text>;
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    icon: {
      textAlign: 'center',
      includeFontPadding: false,
    },
    small: {
      fontSize: 16,
    },
    medium: {
      fontSize: 20, // Match login screen input icons
    },
    large: {
      fontSize: 24,
    },
  });

export default Icon;
