import React, { ReactNode } from 'react';
import { ActivityIndicator, Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface LoadingWrapperProps {
  isLoading: boolean;
  children: ReactNode;
  loadingText?: string;
  backgroundColor?: string;
}

const LoadWrapper: React.FC<LoadingWrapperProps> = ({
  isLoading,
  children,
  loadingText = 'Loading...',
  backgroundColor,
}) => {
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: backgroundColor || theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.loading} />
        {loadingText && (
          <Text
            style={[
              styles.loadingText,
              {
                color: theme.colors.text,
                marginTop: theme.spacing.md,
              },
            ]}
          >
            {loadingText}
          </Text>
        )}
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default LoadWrapper;
