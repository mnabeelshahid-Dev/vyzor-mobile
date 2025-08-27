// React Navigation type declarations for TypeScript
// Proper type definitions that maintain type safety

declare module '@react-navigation/native' {
  import { ComponentType, ReactNode } from 'react';

  // Core navigation types
  export interface NavigationState {
    key: string;
    index: number;
    routeNames: string[];
    history?: unknown[];
    routes: Route<string>[];
    type: string;
    stale: false;
  }

  export interface Route<RouteName extends string = string> {
    key: string;
    name: RouteName;
    params?: object;
  }

  export interface ParamListBase {
    [routeName: string]: object | undefined;
  }

  export interface NavigationHelpers<
    ParamList extends ParamListBase,
    EventMap extends Record<string, any> = {}
  > {
    navigate<RouteName extends keyof ParamList>(
      ...args: ParamList[RouteName] extends undefined
        ?
            | [screen: RouteName]
            | [screen: RouteName, params?: ParamList[RouteName]]
        : [screen: RouteName, params: ParamList[RouteName]]
    ): void;
    reset(state: NavigationState | PartialState<NavigationState>): void;
    goBack(): void;
    canGoBack(): boolean;
    getId(): string | undefined;
    getParent<T = NavigationHelpers<ParamListBase>>(): T | undefined;
    getState(): NavigationState;
  }

  export type NavigationProp<
    ParamList extends ParamListBase,
    RouteName extends keyof ParamList = keyof ParamList,
    NavigatorID extends string | undefined = undefined,
    State extends NavigationState = NavigationState,
    ScreenOptions extends {} = {},
    EventMap extends Record<string, any> = {}
  > = NavigationHelpers<ParamList, EventMap> & {
    addListener<EventName extends keyof EventMap>(
      type: EventName,
      callback: (e: EventMap[EventName]) => void
    ): () => void;
    removeListener<EventName extends keyof EventMap>(
      type: EventName,
      callback: (e: EventMap[EventName]) => void
    ): void;
  };

  export type RouteProp<
    ParamList extends ParamListBase,
    RouteName extends keyof ParamList = keyof ParamList
  > = Route<Extract<RouteName, string>> & {
    params: ParamList[RouteName];
  };

  export type NavigatorScreenParams<ParamList> = {
    screen?: keyof ParamList;
    params?: ParamList[keyof ParamList];
    initial?: boolean;
  };

  export interface PartialState<State extends NavigationState> {
    stale?: true;
    type?: State['type'];
    key?: State['key'];
    index?: number;
    routeNames?: string[];
    history?: unknown[];
    routes?: PartialRoute<Route<string>>[];
  }

  export interface PartialRoute<TRoute extends { name: string; key: string }> {
    key?: string;
    name: TRoute['name'];
    params?: object;
    state?: PartialState<NavigationState>;
  }

  // Theme types
  export interface Theme {
    dark: boolean;
    colors: {
      primary: string;
      background: string;
      card: string;
      text: string;
      border: string;
      notification: string;
    };
  }

  export const DefaultTheme: Theme;
  export const DarkTheme: Theme;

  // Components and hooks
  export const NavigationContainer: ComponentType<{
    theme?: Theme;
    linking?: LinkingOptions<ParamListBase>;
    initialState?: NavigationState;
    onStateChange?: (state: NavigationState | undefined) => void;
    children: ReactNode;
  }>;

  export function useNavigation<T = NavigationProp<ParamListBase>>(): T;
  export function useRoute<T = RouteProp<ParamListBase>>(): T;
  export function useFocusEffect(callback: () => void | (() => void)): void;
}

declare module '@react-navigation/native-stack' {
  import { ComponentType } from 'react';
  import {
    ParamListBase,
    NavigationProp,
    RouteProp,
    NavigatorScreenParams,
  } from '@react-navigation/native';

  export interface NativeStackNavigationOptions {
    title?: string;
    headerShown?: boolean;
    headerTitle?: string;
    headerTitleStyle?: object;
    headerStyle?: object;
    headerTintColor?: string;
    headerBackTitle?: string;
    headerBackTitleVisible?: boolean;
    headerLargeTitle?: boolean;
    presentation?:
      | 'card'
      | 'modal'
      | 'transparentModal'
      | 'containedModal'
      | 'containedTransparentModal'
      | 'fullScreenModal'
      | 'formSheet';
    animationTypeForReplace?: 'push' | 'pop';
    animation?:
      | 'default'
      | 'fade'
      | 'flip'
      | 'none'
      | 'simple_push'
      | 'slide_from_bottom'
      | 'slide_from_right'
      | 'slide_from_left';
    gestureEnabled?: boolean;
    statusBarStyle?: 'auto' | 'inverted' | 'light' | 'dark';
    statusBarBackgroundColor?: string;
    statusBarHidden?: boolean;
    contentStyle?: object;
  }

  export type NativeStackNavigationProp<
    ParamList extends ParamListBase,
    RouteName extends keyof ParamList = keyof ParamList,
    NavigatorID extends string | undefined = undefined
  > = NavigationProp<ParamList, RouteName, NavigatorID> & {
    push<ToRouteName extends keyof ParamList>(
      ...args: ParamList[ToRouteName] extends undefined
        ?
            | [screen: ToRouteName]
            | [screen: ToRouteName, params?: ParamList[ToRouteName]]
        : [screen: ToRouteName, params: ParamList[ToRouteName]]
    ): void;
    pop(count?: number): void;
    popToTop(): void;
  };

  export type NativeStackScreenProps<
    ParamList extends ParamListBase,
    RouteName extends keyof ParamList = keyof ParamList,
    NavigatorID extends string | undefined = undefined
  > = {
    navigation: NativeStackNavigationProp<ParamList, RouteName, NavigatorID>;
    route: RouteProp<ParamList, RouteName>;
  };

  export interface NativeStackNavigatorProps {
    initialRouteName?: string;
    screenOptions?:
      | NativeStackNavigationOptions
      | ((props: {
          route: RouteProp<ParamListBase>;
          navigation: NativeStackNavigationProp<ParamListBase>;
        }) => NativeStackNavigationOptions);
    children: React.ReactNode;
  }

  export function createNativeStackNavigator<
    ParamList extends ParamListBase = ParamListBase
  >(): {
    Navigator: ComponentType<NativeStackNavigatorProps>;
    Screen: ComponentType<{
      name: keyof ParamList;
      component?: ComponentType<
        NativeStackScreenProps<ParamList, keyof ParamList>
      >;
      options?:
        | NativeStackNavigationOptions
        | ((props: {
            route: RouteProp<ParamList, keyof ParamList>;
            navigation: NativeStackNavigationProp<ParamList>;
          }) => NativeStackNavigationOptions);
      initialParams?: ParamList[keyof ParamList];
    }>;
  };
}

declare module '@react-navigation/bottom-tabs' {
  import { ComponentType } from 'react';
  import {
    ParamListBase,
    NavigationProp,
    RouteProp,
  } from '@react-navigation/native';

  export interface BottomTabNavigationOptions {
    title?: string;
    tabBarLabel?: string;
    tabBarIcon?: (props: {
      focused: boolean;
      color: string;
      size: number;
    }) => React.ReactNode;
    tabBarBadge?: string | number;
    tabBarBadgeStyle?: object;
    tabBarActiveTintColor?: string;
    tabBarInactiveTintColor?: string;
    tabBarActiveBackgroundColor?: string;
    tabBarInactiveBackgroundColor?: string;
    tabBarShowLabel?: boolean;
    tabBarLabelStyle?: object;
    tabBarIconStyle?: object;
    tabBarStyle?: object;
    tabBarItemStyle?: object;
    tabBarHideOnKeyboard?: boolean;
    tabBarVisibilityAnimationConfig?: object;
    tabBarButton?: ComponentType<any>;
    headerShown?: boolean;
    unmountOnBlur?: boolean;
    freezeOnBlur?: boolean;
  }

  export type BottomTabNavigationProp<
    ParamList extends ParamListBase,
    RouteName extends keyof ParamList = keyof ParamList,
    NavigatorID extends string | undefined = undefined
  > = NavigationProp<ParamList, RouteName, NavigatorID> & {
    jumpTo<ToRouteName extends keyof ParamList>(
      ...args: ParamList[ToRouteName] extends undefined
        ?
            | [screen: ToRouteName]
            | [screen: ToRouteName, params?: ParamList[ToRouteName]]
        : [screen: ToRouteName, params: ParamList[ToRouteName]]
    ): void;
  };

  export type BottomTabScreenProps<
    ParamList extends ParamListBase,
    RouteName extends keyof ParamList = keyof ParamList,
    NavigatorID extends string | undefined = undefined
  > = {
    navigation: BottomTabNavigationProp<ParamList, RouteName, NavigatorID>;
    route: RouteProp<ParamList, RouteName>;
  };

  export interface BottomTabNavigatorProps {
    initialRouteName?: string;
    screenOptions?:
      | BottomTabNavigationOptions
      | ((props: {
          route: RouteProp<ParamListBase>;
          navigation: BottomTabNavigationProp<ParamListBase>;
        }) => BottomTabNavigationOptions);
    tabBar?: ComponentType<BottomTabBarProps>;
    children: React.ReactNode;
  }

  export function createBottomTabNavigator<
    ParamList extends ParamListBase = ParamListBase
  >(): {
    Navigator: ComponentType<BottomTabNavigatorProps>;
    Screen: ComponentType<{
      name: keyof ParamList;
      component?: ComponentType<
        BottomTabScreenProps<ParamList, keyof ParamList>
      >;
      options?:
        | BottomTabNavigationOptions
        | ((props: {
            route: RouteProp<ParamList, keyof ParamList>;
            navigation: BottomTabNavigationProp<ParamList>;
          }) => BottomTabNavigationOptions);
      initialParams?: ParamList[keyof ParamList];
    }>;
  };
}
