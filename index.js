/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';

// Set up background handler for FCM (runs when app is in background/quit)
messaging().setBackgroundMessageHandler(async remoteMessage => {
  try {
    console.log('FCM background message:', JSON.stringify(remoteMessage, null, 2));
  } catch (e) {
    console.log('FCM background message (raw):', remoteMessage);
  }
});

AppRegistry.registerComponent(appName, () => App);
