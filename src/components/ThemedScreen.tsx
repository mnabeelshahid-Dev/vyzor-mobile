import React, { ReactNode } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ThemedScreenProps {
  children: ReactNode;
  style?: ViewStyle;
  safeArea?: boolean;
  statusBarStyle?: 'default' | 'light-content' | 'dark-content';
}

const ThemedScreen: React.FC<ThemedScreenProps> = ({
  children,
  style,
  safeArea = true,
  statusBarStyle,
}) => {
  const { theme, isDark } = useTheme();

  const defaultStatusBarStyle =
    statusBarStyle || (isDark ? 'light-content' : 'dark-content');

  const Container = safeArea ? SafeAreaView : View;

  return (
    <>
      <StatusBar
        barStyle={defaultStatusBarStyle}
        backgroundColor={theme.colors.background}
      />
      <Container
        style={[
          styles.container,
          { backgroundColor: theme.colors.background },
          style,
        ]}
      >
        {children}
      </Container>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ThemedScreen;
