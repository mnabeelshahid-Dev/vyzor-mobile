import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme, ThemeMode } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  style?: ViewStyle;
  showLabel?: boolean;
}
const ThemeToggle: React.FC<ThemeToggleProps> = ({
  style,
  showLabel = true,
}) => {
  const { theme, themeMode, toggleTheme } = useTheme();

  const getThemeIcon = (mode: ThemeMode) => {
    switch (mode) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'system':
        return '📱';
      default:
        return '☀️';
    }
  };

  const getThemeLabel = (mode: ThemeMode) => {
    switch (mode) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
      default:
        return 'Light';
    }
  };

  return (
    <TouchableOpacity
      testID="theme-toggle"
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
        style,
      ]}
      onPress={toggleTheme}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{getThemeIcon(themeMode)}</Text>
        {showLabel && (
          <Text style={[styles.label, { color: theme.colors.text }]}>
            {getThemeLabel(themeMode)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ThemeToggle;
export { ThemeToggle };
