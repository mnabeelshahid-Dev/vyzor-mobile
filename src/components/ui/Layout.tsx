import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  ViewStyle,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { Theme } from '../../contexts/ThemeContext';

export interface LayoutProps {
  children: React.ReactNode;
  variant?: 'default' | 'centered' | 'auth' | 'fullscreen';
  scrollable?: boolean;
  safeArea?: boolean;
  statusBarColor?: string;
  statusBarStyle?: 'default' | 'light-content' | 'dark-content';
  backgroundColor?: string;
  padding?: boolean;
  style?: ViewStyle;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  variant = 'default',
  scrollable = false,
  safeArea = true,
  statusBarColor,
  statusBarStyle = 'dark-content',
  backgroundColor,
  padding = true,
  style,
  refreshing,
  onRefresh,
}) => {
  const styles = useThemedStyles(createStyles);

  const containerStyle = [
    styles.container,
    styles[variant as keyof typeof styles],
    padding && styles.padding,
    backgroundColor && { backgroundColor },
    style,
  ];

  const Container = safeArea ? SafeAreaView : View;

  const renderContent = () => {
    if (scrollable) {
      return (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            padding && styles.scrollPadding,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      );
    }

    return children;
  };

  return (
    <Container style={containerStyle}>
      <StatusBar
        backgroundColor={
          statusBarColor || (variant === 'auth' ? '#0088E7' : undefined)
        }
        barStyle={statusBarStyle}
      />
      {renderContent()}
    </Container>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    // Layout variants
    default: {
      backgroundColor: theme.colors.background,
    },
    centered: {
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    auth: {
      backgroundColor: '#0088E7', // Match login screen gradient
    },
    fullscreen: {
      backgroundColor: theme.colors.background,
    },
    padding: {
      padding: theme.spacing.lg,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
    scrollPadding: {
      padding: theme.spacing.lg,
    },
  });

export default Layout;
