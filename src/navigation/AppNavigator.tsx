import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useCurrentUser } from '../hooks/useAuth';

// Auth Screens
import RegisterScreen from '../screens/auth/registerScreen';
import ForgotPasswordScreen from '../screens/auth/forgetPasswordScreen';

// Main App Screens
import TasksScreen from '../screens/branches/tasks/TaskScreen';
import SectionsScreen from '../screens/branches/sections/SectionsScreen';

// Loading Component
import LoadingWrapper from '../components/loadWrapper';

const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const MainTab = createBottomTabNavigator();

// Auth Navigator - shown when user is not authenticated
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animationTypeForReplace: 'push',
        animation: 'slide_from_right',
      }}
    >
      <AuthStack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          animationTypeForReplace: 'push',
        }}
      />
      <AuthStack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          animationTypeForReplace: 'push',
        }}
      />
      <AuthStack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          animationTypeForReplace: 'push',
        }}
      />
    </AuthStack.Navigator>
  );
};

// Tab icon components using SVGs from assets/svgs
import BranchActiveIcon from '../assets/svgs/taskBranchActiveIcon.svg';
import BranchInActiveIcon from '../assets/svgs/taskBranchInActiveIcon.svg';
import ScheduleInActiveIcon from '../assets/svgs/scheduleInActive.svg';
import ScheduleActiveIcon from '../assets/svgs/scheduleActiveIcon.svg';
import EmailInActiveIcon from '../assets/svgs/bottomEmailIcon.svg';
import EmailActiveIcon from '../assets/svgs/EmailActiveIcon.svg';
import StatsBarInActiveIcon from '../assets/svgs/statsbarsInActive.svg';
import StatsBarActiveIcon from '../assets/svgs/statsBarActiveIcon.svg';
import ChatInActiveIcon from '../assets/svgs/chatInActive.svg';
import ChatActiveIcon from '../assets/svgs/chatActiveIcon.svg';
import EmailScreen from '../screens/email/EmailScreen';
import BranchesScreen from '../screens/branches/BranchesScreen';
import StatisticsScreen from '../screens/statistics/StatisticsScreen';
import ScheduleScreen from '../screens/schedule/ScheduleScreen';
import LoginScreen from '../screens/auth/loginScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const BranchesStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Branches" component={BranchesScreen} />
      <Stack.Screen name="Task" component={TasksScreen} />
      <Stack.Screen name="Section" component={SectionsScreen} />
    </Stack.Navigator>
  );
};

// Main Tab Navigator - 5 tabs matching the image flow
const MainNavigator = () => {
  return (
    <MainTab.Navigator
      initialRouteName="Branches"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5E5',
          paddingTop: 8,
          paddingBottom: 8,
          height: 80,
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
      }}
    >
      <MainTab.Screen
        name="Branches"
        component={BranchesStack}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <View style={{ alignItems: 'center' }}>
              {focused ? (
                <BranchActiveIcon width={size} height={size} />
              ) : (
                <BranchInActiveIcon width={size} height={size} />
              )}
              {focused && (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#007AFF',
                    marginTop: 3,
                  }}
                />
              )}
            </View>
          ),
          tabBarLabel: '',
        }}
      />
      <MainTab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <View style={{ alignItems: 'center' }}>
              {focused ? (
                <ScheduleActiveIcon width={size} height={size} />
              ) : (
                <ScheduleInActiveIcon width={size} height={size} />
              )}
              {focused && (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#007AFF',
                    marginTop: 3,
                  }}
                />
              )}
            </View>
          ),
          tabBarLabel: '',
        }}
      />
      <MainTab.Screen
        name="Emails"
        component={EmailScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <View style={{ alignItems: 'center' }}>
              {focused ? (
                <EmailActiveIcon width={size} height={size} />
              ) : (
                <EmailInActiveIcon width={size} height={size} />
              )}
              {focused && (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#007AFF',
                    marginTop: 3,
                  }}
                />
              )}
            </View>
          ),
          tabBarLabel: '',
        }}
      />
      <MainTab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <View style={{ alignItems: 'center' }}>
              {focused ? (
                <ChatActiveIcon width={size} height={size} />
              ) : (
                <ChatInActiveIcon width={size} height={size} />
              )}
              {focused && (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#007AFF',
                    marginTop: 3,
                  }}
                />
              )}
            </View>
          ),
          tabBarLabel: '',
        }}
      />
      <MainTab.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <View style={{ alignItems: 'center' }}>
              {focused ? (
                <StatsBarActiveIcon width={size} height={size} />
              ) : (
                <StatsBarInActiveIcon width={size} height={size} />
              )}
              {focused && (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#007AFF',
                    marginTop: 3,
                  }}
                />
              )}
            </View>
          ),
          tabBarLabel: '',
        }}
      />
    </MainTab.Navigator>
  );
};

// Root Navigator - decides between Auth and Main flows
const RootNavigator = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { isLoading: userLoading } = useCurrentUser();

  // Show loading screen while checking authentication status
  if (authLoading || userLoading) {
    return (
      <LoadingWrapper isLoading={true}>
        <View />
      </LoadingWrapper>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen
            name="Main"
            component={MainNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </>
      ) : (
        <Stack.Screen
          name="Auth"
          component={AuthNavigator}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
};

// Main App Navigator Component
export default function AppNavigator() {
  return <RootNavigator />;
}
