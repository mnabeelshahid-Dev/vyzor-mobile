import React, { use, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { getToastConfig } from './src/components/toast';
import { logDebuggerStatus, DebugConsole } from './src/utils/debug';
import { queryClient } from './src/services/queryClient';
import { Text as RNText, TextProps as RNTextProps, PermissionsAndroid, Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { useAuthStore } from './src/store/authStore';



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
      {/* <Toast config={getToastConfig()} /> */}
    </>
  );
};

export default function App() {

  const user = useAuthStore((state) => state.user);

  const uuid = user?.pnUuId;


  useEffect(() => {
    console.log("user in app.tsx: ", user)
    console.log("uuid in app.tsx: ", uuid)
  } , [user])
  

  const requestPermissions = async () => {
    try {
      const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      console.log("result: ", result)
      console.log("result permissions: ", PermissionsAndroid.RESULTS.GRANTED)
      if(result === PermissionsAndroid.RESULTS.GRANTED) {
        //request for device permissions
        requestToken();
      } else {
        Alert.alert('Permission Denied', 'Notification permission is required for full functionality of the app.');
      }
      
    } catch (error) {
      console.log(error)
    }
  }

  const requestToken = async () => {
    try {
      await messaging().registerDeviceForRemoteMessages();
      const token = await messaging().getToken();
      console.log("token**: ", token)
      //store fcm token in your server
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    requestPermissions();

    // Subscribe topic using provided UUID
    const topic = uuid || 'default_topic';
    messaging()
      .subscribeToTopic(topic)
      .then(() => {
        console.log(`Subscribed to topic: ${topic}`);
      })
      .catch((err) => {
        console.log('Failed to subscribe to topic', err);
      });
  }, [])

  /* foreground notification */

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);

  // When the app is in background and opened by a notification
  useEffect(() => {
    const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification caused app to open from background state:', remoteMessage);
      // TODO: Optionally navigate to chat screen
    });
    return unsubscribe;
  }, []);

  // When the app is opened from a quit state by tapping the notification
  useEffect(() => {
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Notification caused app to open from quit state:', remoteMessage);
          // TODO: Optionally navigate to specific screen
        }
      })
      .catch(() => {});
  }, []);


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
