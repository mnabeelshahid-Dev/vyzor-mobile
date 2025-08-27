import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ThemedScreen from '../../components/ThemedScreen';
import ThemeToggle from '../../components/ThemeToggle';
import { useTheme } from '../../contexts/ThemeContext';
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
} from '../../components/toast';
import LoadingWrapper from '../../components/loadWrapper';

const ExampleScreen = () => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const simulateLoading = () => {
    setIsLoading(true);
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      showSuccessToast(
        'Loading Complete!',
        'The operation finished successfully.'
      );
      timeoutRef.current = null;
    }, 3000);
  };

  return (
    <ThemedScreen>
      <LoadingWrapper isLoading={isLoading} loadingText="Please wait...">
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Theme Demo
            </Text>
            <ThemeToggle />
          </View>

          <View style={styles.content}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              onPress={simulateLoading}
            >
              <Text style={styles.buttonText}>Test Loading</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.success }]}
              onPress={() =>
                showSuccessToast('Success!', 'This is a success message')
              }
            >
              <Text style={styles.buttonText}>Show Success Toast</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.error }]}
              onPress={() =>
                showErrorToast('Error!', 'This is an error message')
              }
            >
              <Text style={styles.buttonText}>Show Error Toast</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.info }]}
              onPress={() => showInfoToast('Info!', 'This is an info message')}
            >
              <Text style={styles.buttonText}>Show Info Toast</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LoadingWrapper>
    </ThemedScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ExampleScreen;
