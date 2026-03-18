/**
 * @format
 */

import React, { useEffect } from 'react';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

import { enableScreens } from 'react-native-screens';
enableScreens();

// Wrapper to initialize FCM after React mounts
const AppWithFCM = () => {
  useEffect(() => {
    // Initialize FCM only after the bridge is ready
    const messaging = require('@react-native-firebase/messaging').default;
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      try {
        console.log('🔥 FCM background message:', JSON.stringify(remoteMessage, null, 2));
      } catch (e) {
        console.log('⚠️ FCM background message (raw):', remoteMessage);
      }
    });
  }, []);
  
  return <App />;
};

// Register the main App component
AppRegistry.registerComponent(appName, () => AppWithFCM);
