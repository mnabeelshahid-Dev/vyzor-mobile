import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { getToastConfig } from './src/components/toast';
import { logDebuggerStatus, DebugConsole } from './src/utils/debug';
import { queryClient } from './src/services/queryClient';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';

// Set default font for all Text components with fontWeight mapping
const fontMap = {
  'normal': 'Prompt-Regular',
  'bold': 'Prompt-Bold',
  '100': 'Prompt-Thin',
  '200': 'Prompt-ExtraLight',
  '300': 'Prompt-Light',
  '400': 'Prompt-Regular',
  '500': 'Prompt-Medium',
  '600': 'Prompt-SemiBold',
  '700': 'Prompt-Bold',
  '800': 'Prompt-ExtraBold',
  '900': 'Prompt-Black',
};
const oldRender = RNText.render;
RNText.render = function (...args) {
  const origin = oldRender.call(this, ...args);
  let style = origin.props.style || {};
  let fontWeight = style?.fontWeight || (Array.isArray(style) ? style.find(s => s?.fontWeight)?.fontWeight : 'normal') || 'normal';
  let fontFamily = fontMap[fontWeight] || 'Prompt-Regular';
  // Remove fontWeight so it doesn't override fontFamily
  if (Array.isArray(style)) {
    style = [{ fontFamily }, ...style.map(s => {
      if (s && s.fontWeight) {
        const { fontWeight, ...rest } = s;
        return rest;
      }
      return s;
    })];
  } else {
    style = { ...style, fontFamily };
    delete style.fontWeight;
  }
  return React.cloneElement(origin, {
    style,
  });
};

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
