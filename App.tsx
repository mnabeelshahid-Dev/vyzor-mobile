import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { getToastConfig } from './src/components/toast';
import { logDebuggerStatus, DebugConsole } from './src/utils/debug';
import { queryClient } from './src/services/queryClient';

// Wrapper component to access theme context for Toast config
const AppContent = () => {
  return (
    <>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
      <Toast config={getToastConfig()} />
    </>
  );
};

export default function App() {
  useEffect(() => {
    // Log debugger connection status on app start
    logDebuggerStatus();
    DebugConsole.log('🚀 App started in development mode');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
