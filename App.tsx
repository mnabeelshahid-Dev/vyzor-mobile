import React, { use, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { getToastConfig, showNotificationToast } from './src/components/toast';
import { logDebuggerStatus, DebugConsole } from './src/utils/debug';
import { queryClient } from './src/services/queryClient';
import { Text as RNText, TextProps as RNTextProps, Alert } from 'react-native';
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

// Global navigation ref to navigate from outside React components (e.g., FCM handlers)
export const navigationRef = React.createRef<any>();
const NavigationContainerAny: any = NavigationContainer;

// Wrapper component to access theme context for Toast config
const AppContent = () => {
  return (
    <>
      <NavigationContainerAny ref={navigationRef}>
        <AppNavigator />
      </NavigationContainerAny>
      <Toast config={getToastConfig()} />
    </>
  );
};

export default function App() {

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const uuid = (user as unknown as { pnUuId?: string })?.pnUuId;


  useEffect(() => {
    console.log("user in app.tsx: ", user)
    console.log("uuid in app.tsx: ", uuid)
  } , [user])
  

  const requestPermissions = async () => {
    try {
      const RN: any = require('react-native');
      const result = await RN.PermissionsAndroid.request(RN.PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      console.log("result: ", result)
      console.log("result permissions: ", RN.PermissionsAndroid.RESULTS.GRANTED)
      if(result === RN.PermissionsAndroid.RESULTS.GRANTED) {
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

  // Ask for notification permission and register for remote messages on app start only
  useEffect(() => {
    requestPermissions();
  }, [])

  // Subscribe to topic only after login when uuid is available.
  // Also handle topic change and logout by unsubscribing from the previous topic.
  const lastSubscribedTopicRef = useRef<string | null>(null);
  useEffect(() => {
    const performSubscription = async () => {
      const nextTopic = isAuthenticated && uuid ? uuid : null;

      // If topic changed, unsubscribe from previous
      if (lastSubscribedTopicRef.current && lastSubscribedTopicRef.current !== nextTopic) {
        try {
          await messaging().unsubscribeFromTopic(lastSubscribedTopicRef.current);
          console.log(`Unsubscribed from topic: ${lastSubscribedTopicRef.current}`);
        } catch (err) {
          console.log('Failed to unsubscribe from previous topic', err);
        }
        lastSubscribedTopicRef.current = null;
      }

      // Subscribe to new topic if available
      if (nextTopic && lastSubscribedTopicRef.current !== nextTopic) {
        try {
          await messaging().subscribeToTopic(nextTopic);
          lastSubscribedTopicRef.current = nextTopic;
          console.log(`Subscribed to topic: ${nextTopic}`);
        } catch (err) {
          console.log('Failed to subscribe to topic', err);
        }
      }

      // If logged out and no topic, nothing else to do
    };

    performSubscription();
  }, [isAuthenticated, uuid])

  /* foreground notification */

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('FCM foreground message:', JSON.stringify(remoteMessage, null, 2));
      const title = remoteMessage.notification?.title || 'Notification';
      const body =
        remoteMessage.notification?.body ||
        (remoteMessage.data && (remoteMessage.data.body || remoteMessage.data.message)) ||
        undefined;

      // Show a themed, dismissible top banner
      if (title || body) {
        const bodyText = typeof body === 'string' ? body : body ? JSON.stringify(body) : undefined;
        showNotificationToast(title, bodyText as string | undefined);
      }
    });

    return unsubscribe;
  }, []);

  // When the app is in background and opened by a notification
  useEffect(() => {
    const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification opened from background state:', JSON.stringify(remoteMessage, null, 2));
      try {
        const tag = remoteMessage?.data?.tag;
        if (navigationRef.current && tag) {
          if (tag === 'Tasks') {
            navigationRef.current.navigate('Main', { screen: 'Task' });
          } else if (tag === 'Chat') {
            navigationRef.current.navigate('Main', { screen: 'Chat' });
          }
        }
      } catch {}
    });
    return unsubscribe;
  }, []);

  // When the app is opened from a quit state by tapping the notification
  useEffect(() => {
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Notification opened from quit state:', JSON.stringify(remoteMessage, null, 2));
          try {
            const tag = remoteMessage?.data?.tag;
            if (navigationRef.current && tag) {
              if (tag === 'Tasks') {
                navigationRef.current.navigate('Main', { screen: 'Task' });
              } else if (tag === 'Chat') {
                navigationRef.current.navigate('Main', { screen: 'Chat' });
              }
            }
          } catch {}
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
