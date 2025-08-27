# 🚀 Vyzor - React Native TypeScript App

A modern, production-ready React Native application built with TypeScript, featuring comprehensive authentication, state management, testing, and development tools.

![React Native](https://img.shields.io/badge/React%20Native-0.80.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.4-blue)
![License](https://img.shields.io/badge/license-Private-green)

## 📋 Table of Contents

- [🚀 Quick Start](#-quick-start)
- [🏗️ Project Architecture](#️-project-architecture)
- [📦 Dependencies Overview](#-dependencies-overview)
- [🔧 Development Tools](#-development-tools)
- [🧪 Testing Configuration](#-testing-configuration)
- [🎨 Styling & Theming](#-styling--theming)
- [🔐 Authentication System](#-authentication-system)
- [🧭 Navigation Setup](#-navigation-setup)
- [📱 State Management](#-state-management)
- [🛡️ Code Quality & Linting](#️-code-quality--linting)
- [🪝 Git Hooks (Husky)](#-git-hooks-husky)
- [🔧 Configuration Files](#-configuration-files)
- [📊 Scripts Reference](#-scripts-reference)
- [🌍 Environment Setup](#-environment-setup)
- [🚀 Deployment](#-deployment)

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- React Native CLI
- Android Studio (for Android)
- Xcode (for iOS)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd vyzor

# Install dependencies
npm install

# Install iOS dependencies (macOS only)
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Demo Credentials

```
Email: demo@vyzor.com
Password: password

Email: admin@vyzor.com
Password: Admin123!
```

## 🏗️ Project Architecture

### Folder Structure

```
vyzor/
├── src/
│   ├── api/                   # API layer and endpoints
│   │   └── auth.ts           # Authentication API
│   ├── components/           # Reusable UI components
│   │   ├── loadingWrapper.tsx
│   │   ├── ThemedScreen.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── toast.tsx
│   ├── constants/            # App-wide constants
│   │   └── index.ts
│   ├── contexts/             # React contexts
│   │   └── ThemeContext.tsx
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.ts
│   │   └── useThemedStyles.ts
│   ├── navigation/           # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── screens/              # Screen components
│   │   ├── auth/
│   │   ├── home/
│   │   └── example/
│   ├── services/             # Service layer
│   │   ├── api.ts
│   │   ├── queryClient.ts
│   │   └── storage.ts
│   ├── store/                # State management
│   │   └── authStore.ts
│   ├── types/                # TypeScript definitions
│   │   ├── index.ts
│   │   └── navigation.ts
│   └── utils/                # Utility functions
├── android/                  # Android-specific code
├── ios/                      # iOS-specific code
├── __tests__/               # Test files
└── .husky/                  # Git hooks
```

## 📦 Dependencies Overview

### Core Dependencies

#### **React Native & React**

- **react** (19.1.0) - Core React library
- **react-native** (0.80.1) - React Native framework
- **@react-native/new-app-screen** (0.80.1) - Default React Native screens

#### **Navigation**

- **@react-navigation/native** (^7.1.14) - Core navigation library
- **@react-navigation/native-stack** (^7.3.21) - Stack navigator
- **@react-navigation/bottom-tabs** (^7.4.2) - Tab navigator
- **@react-navigation/stack** (^7.1.23) - Stack navigator (legacy)
- **react-native-screens** (^4.13.1) - Native screen optimization
- **react-native-safe-area-context** (^5.5.2) - Safe area handling
- **react-native-gesture-handler** (^2.27.2) - Gesture handling

#### **State Management & Data Fetching**

- **zustand** (^5.0.6) - Lightweight state management
- **@tanstack/react-query** (^5.83.0) - Server state management
- **@tanstack/react-query-devtools** (^5.83.0) - DevTools for React Query

#### **Storage & Security**

- **@react-native-async-storage/async-storage** (^2.2.0) - Async storage
- **react-native-keychain** (^8.2.0) - Secure keychain storage
- **react-native-mmkv** (^3.1.0) - Fast key-value storage

#### **UI & Styling**

- **nativewind** (^4.1.23) - Tailwind CSS for React Native
- **tailwindcss** (^3.4.17) - Utility-first CSS framework
- **react-native-vector-icons** (^10.2.0) - Icon library
- **react-native-reanimated** (^4.0.0) - Animation library

#### **Forms & Validation**

- **react-hook-form** (^7.61.1) - Form handling
- **zod** (^4.0.8) - Schema validation

#### **Utilities**

- **axios** (^1.6.7) - HTTP client
- **react-native-toast-message** (^2.3.3) - Toast notifications
- **react-native-config** (^1.5.1) - Environment configuration
- **react-native-dotenv** (^3.4.11) - Environment variables
- **react-native-bootsplash** (^6.3.10) - Splash screen

### Development Dependencies

#### **TypeScript & Build Tools**

- **typescript** (^5.0.4) - TypeScript compiler
- **@react-native/typescript-config** (0.80.1) - TypeScript configuration
- **@react-native/babel-preset** (0.80.1) - Babel preset for React Native
- **@react-native/metro-config** (0.80.1) - Metro bundler configuration

#### **Testing Framework**

- **jest** (^29.6.3) - JavaScript testing framework
- **@testing-library/react-native** (^12.4.3) - React Native testing utilities
- **react-test-renderer** (19.1.0) - React test renderer
- **@types/jest** (^29.5.13) - Jest type definitions
- **@types/react-test-renderer** (^19.1.0) - Test renderer types

#### **Linting & Code Quality**

- **eslint** (^8.57.1) - JavaScript/TypeScript linter
- **@react-native/eslint-config** (0.80.1) - React Native ESLint config
- **@typescript-eslint/eslint-plugin** (^8.38.0) - TypeScript ESLint rules
- **@typescript-eslint/parser** (^8.38.0) - TypeScript parser for ESLint
- **eslint-plugin-react** (^7.37.5) - React-specific linting rules
- **eslint-plugin-react-hooks** (^5.2.0) - React Hooks linting
- **eslint-plugin-react-native** (^4.1.0) - React Native linting
- **eslint-plugin-import** (^2.32.0) - Import/export linting
- **eslint-config-prettier** (^10.1.8) - Prettier integration with ESLint

#### **Code Formatting**

- **prettier** (^2.8.8) - Code formatter
- **lint-staged** (^16.1.2) - Run linters on staged files

#### **Git Hooks & Commit Standards**

- **husky** (^9.1.7) - Git hooks management
- **commitizen** (^4.3.1) - Standardized commit messages
- **cz-conventional-changelog** (^3.3.0) - Conventional commits

#### **Type Definitions**

- **@types/react** (^19.1.8) - React type definitions
- **@types/react-native** (^0.72.8) - React Native type definitions
- **@types/react-native-vector-icons** (^6.4.18) - Vector icons types

## 🔧 Development Tools

### Metro Bundler Configuration

Located in `metro.config.js`:

- Asset resolution
- Platform-specific extensions
- Transformer configurations
- Resolver settings

### Babel Configuration

Located in `babel.config.js`:

- React Native preset
- Plugin configurations
- Environment-specific settings

### TypeScript Configuration

Located in `tsconfig.json`:

- Strict type checking enabled
- Path aliases for cleaner imports
- React Native specific settings
- Module resolution configuration

```json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@components/*": ["components/*"],
      "@screens/*": ["screens/*"],
      "@services/*": ["services/*"],
      "@types/*": ["types/*"],
      "@utils/*": ["utils/*"],
      "@api/*": ["api/*"],
      "@hooks/*": ["hooks/*"],
      "@store/*": ["store/*"],
      "@constants/*": ["constants/*"],
      "@contexts/*": ["contexts/*"],
      "@navigation/*": ["navigation/*"]
    }
  }
}
```

### Absolute Path Imports

The project is configured with TypeScript path mapping for cleaner imports:

```typescript
// Instead of relative imports
import { ThemedScreen } from '../../../components/ThemedScreen';
import { useAuth } from '../../hooks/useAuth';

// Use absolute imports
import { ThemedScreen } from '@components/ThemedScreen';
import { useAuth } from '@hooks/useAuth';
```

#### Available Path Aliases:

- `@components/*` → `src/components/*`
- `@screens/*` → `src/screens/*`
- `@services/*` → `src/services/*`
- `@types/*` → `src/types/*`
- `@utils/*` → `src/utils/*`
- `@api/*` → `src/api/*`
- `@hooks/*` → `src/hooks/*`
- `@store/*` → `src/store/*`
- `@constants/*` → `src/constants/*`
- `@contexts/*` → `src/contexts/*`
- `@navigation/*` → `src/navigation/*`

#### ESLint Import Configuration

ESLint is configured to resolve these path aliases:

```javascript
"import/resolver": {
  "typescript": {
    "alwaysTryTypes": true,
    "project": "./tsconfig.json"
  }
}
```

## 🧪 Testing Configuration

### Jest Setup

Located in `jest.config.js` and `jest.setup.js`:

#### Features:

- **Coverage Thresholds**: 80% minimum coverage enforced
- **React Native Testing Library**: Integrated for component testing
- **Mock Implementations**: AsyncStorage, navigation, native modules
- **Path Mapping**: Same aliases as TypeScript
- **Coverage Reports**: HTML and text formats

#### Test Scripts:

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode for development
npm run test:coverage # Generate coverage report
npm run test:ci       # CI mode (no watch)
```

#### Coverage Configuration:

```javascript
collectCoverageFrom: [
  'src/**/*.{js,jsx,ts,tsx}',
  '!src/**/*.d.ts',
  '!src/**/__tests__/**',
  '!src/**/node_modules/**'
],
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  }
}
```

#### Mocks Included:

- **AsyncStorage**: For testing storage operations
- **React Navigation**: For testing navigation
- **Native Modules**: For React Native specific APIs
- **Reanimated**: For animation testing

## 🎨 Styling & Theming

### Theme System

- **Context-based**: React Context for theme management
- **Persistent**: Theme preference saved to storage
- **System Integration**: Respects device theme preference
- **Dynamic Switching**: Runtime theme changes

#### Theme Structure:

```typescript
interface Theme {
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    surface: string;
  };
  dark: boolean;
}
```

### NativeWind Integration

- **Tailwind CSS**: Utility-first styling
- **Class-based**: Familiar CSS class approach
- **Responsive**: Built-in responsive utilities
- **Theme-aware**: Integrates with theme system

### Custom Hook: `useThemedStyles`

```typescript
const styles = useThemedStyles(createStyles);

const createStyles = theme =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
    },
  });
```

## 🔐 Authentication System

### Complete Auth Flow

- **Login/Register**: Email and password authentication
- **Password Recovery**: Forgot/reset password flow
- **Token Management**: Automatic refresh and storage
- **Secure Storage**: Keychain integration for sensitive data
- **Persistent Sessions**: Auto-login on app restart

### Authentication Hooks (TanStack Query)

```typescript
// Mutations
const loginMutation = useLogin();
const registerMutation = useRegister();
const logoutMutation = useLogout();
const forgotPasswordMutation = useForgotPassword();
const resetPasswordMutation = useResetPassword();

// Queries
const { data: user } = useCurrentUser();
```

### Auth Store (Zustand)

```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  // ... other methods
}
```

### Security Features:

- **Password Validation**: Strength requirements enforced
- **Token Rotation**: Automatic token refresh
- **Secure Storage**: Keychain for sensitive data
- **Session Management**: Automatic logout on token expiry

## 🧭 Navigation Setup

### Navigation Structure

```
RootNavigator
├── AuthStack (Unauthenticated)
│   ├── LoginScreen
│   └── RegisterScreen
└── MainTabNavigator (Authenticated)
    ├── HomeTab
    └── ExampleTab
```

### Navigation Configuration

- **Conditional Routing**: Based on authentication state
- **Type Safety**: TypeScript navigation types
- **Deep Linking**: Ready for URL-based navigation
- **Stack + Tabs**: Combined navigation patterns

### Navigation Types

```typescript
type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};
```

## 📱 State Management

### Zustand Store Architecture

- **Lightweight**: Minimal boilerplate
- **TypeScript**: Full type safety
- **Persistence**: Automatic state hydration
- **Middleware**: Integrated with storage layer

### TanStack Query Integration

- **Server State**: Separate from client state
- **Caching**: Intelligent data caching
- **Background Updates**: Automatic refetching
- **Optimistic Updates**: Better UX
- **Error Handling**: Comprehensive error management

### State Structure:

```typescript
// Client State (Zustand)
- Authentication state
- User preferences
- UI state

// Server State (TanStack Query)
- User data
- API responses
- Cached data
```

## 🛡️ Code Quality & Linting

### ESLint Configuration

Located in `.eslintrc.js`:

#### Rules Enabled:

- **React Native**: React Native specific rules
- **TypeScript**: TypeScript best practices
- **React**: React component best practices
- **React Hooks**: Hooks rules enforcement
- **Import/Export**: Module import rules
- **Prettier Integration**: No conflicts with formatting

#### Key Features:

- **Auto-fix**: Many issues auto-fixable
- **IDE Integration**: Works with VS Code/other editors
- **Custom Rules**: Project-specific configurations
- **Performance**: Optimized for large codebases

### Prettier Configuration

Located in `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false
}
```

### Lint-Staged Configuration

Pre-commit automatic formatting:

```json
{
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md}": ["prettier --write"]
}
```

## 🪝 Git Hooks (Husky)

### Pre-commit Hook

Located in `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run lint-staged
npx lint-staged

# Type checking
npm run typecheck

# Run tests
npm run test:ci
```

### Pre-push Hook

Located in `.husky/pre-push`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Full test suite
npm run test:ci

# Build check
npm run typecheck

# Linting
npm run lint
```

### Commit Message Standards

Using Commitizen for standardized commits:

```bash
# Instead of git commit
npm run commit

# Or use directly
npx cz
```

### Commit Types:

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation
- **style**: Formatting changes
- **refactor**: Code refactoring
- **test**: Adding tests
- **chore**: Maintenance tasks

## 🔧 Configuration Files

### Environment Configuration

Multiple environment files:

- `.env.development` - Development settings
- `.env.production` - Production settings
- `.env.local` - Local overrides (git-ignored)

#### Environment Variables:

```bash
# API Configuration
API_BASE_URL=https://api.example.com
API_TIMEOUT=10000

# Auth Configuration
JWT_SECRET=your-jwt-secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Feature Flags
ENABLE_ANALYTICS=false
ENABLE_CRASH_REPORTING=false
ENABLE_BIOMETRIC_AUTH=true

# Debug Settings
DEBUG_API_LOGS=true
DEBUG_REDUX_LOGS=true
```

### React Native Config

Using `react-native-config` for environment variables:

```typescript
import Config from 'react-native-config';

const apiUrl = Config.API_BASE_URL;
const enableAnalytics = Config.ENABLE_ANALYTICS === 'true';
```

### Metro Configuration

Located in `metro.config.js`:

- Asset resolution
- Platform extensions
- Transformer settings
- Resolver configurations

## 📊 Scripts Reference

### Development Scripts

```bash
npm start                    # Start Metro bundler
npm run android              # Run on Android
npm run ios                  # Run on iOS
npm run typecheck           # TypeScript validation
npm run typecheck:watch     # Watch TypeScript
```

### Testing Scripts

```bash
npm test                    # Run tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
npm run test:ci           # CI mode
```

### Code Quality Scripts

```bash
npm run lint              # ESLint check
npm run lint:fix          # Auto-fix ESLint issues
npm run format            # Format with Prettier
npm run format:check      # Check formatting
```

### Build & Deployment Scripts

```bash
npm run build:android     # Android release build
npm run build:ios         # iOS release build
npm run clean             # Clean project
npm run clean:android     # Clean Android
npm run clean:ios         # Clean iOS
npm run reset-cache       # Reset Metro cache
```

### Utility Scripts

```bash
npm run bump:patch        # Increment patch version
npm run bump:minor        # Increment minor version
npm run bump:major        # Increment major version
npm run postinstall       # Post-install setup
```

## 🌍 Environment Setup

### Development Environment

1. **Node.js**: Version 18 or higher
2. **React Native CLI**: Latest version
3. **Android Studio**: For Android development
4. **Xcode**: For iOS development (macOS only)
5. **VS Code**: Recommended editor with extensions

### Recommended VS Code Extensions

- React Native Tools
- TypeScript Importer
- ESLint
- Prettier
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens

### Android Setup

1. Install Android Studio
2. Configure SDK and emulator
3. Set ANDROID_HOME environment variable
4. Add platform-tools to PATH

### iOS Setup (macOS)

1. Install Xcode from App Store
2. Install iOS Simulator
3. Install CocoaPods: `sudo gem install cocoapods`
4. Run `pod install` in ios directory

## 🚀 Deployment

### Android Deployment

```bash
# Generate release APK
npm run build:android

# Generate signed bundle
cd android
./gradlew bundleRelease
```

### iOS Deployment

```bash
# Build for App Store
npm run build:ios

# Or using Xcode
open ios/vyzor.xcworkspace
```

### Environment-Specific Builds

```bash
# Production build
NODE_ENV=production npm run build:android

# Staging build
NODE_ENV=staging npm run build:android
```

### CI/CD Integration

Ready for integration with:

- **GitHub Actions**
- **CircleCI**
- **Bitrise**
- **App Center**

Example GitHub Actions workflow included in `.github/workflows/`.

## 🔍 Troubleshooting

### Common Issues & Solutions

#### Metro Bundler Issues

```bash
npm run reset-cache
npm run clean
```

#### Android Build Issues

```bash
npm run clean:android
cd android && ./gradlew clean
```

#### iOS Build Issues

```bash
npm run clean:ios
cd ios && pod install
```

#### TypeScript Errors

```bash
npm run typecheck
```

#### Linting Errors

```bash
npm run lint:fix
```

## 📝 Contributing

### Development Workflow

1. Create feature branch
2. Make changes
3. Run tests: `npm test`
4. Run linting: `npm run lint`
5. Commit with Commitizen: `npm run commit`
6. Push changes
7. Create pull request

### Code Standards

- Follow TypeScript strict mode
- Use functional components with hooks
- Write tests for new features
- Follow conventional commit messages
- Maintain 80%+ test coverage

## 📄 License

This project is private and proprietary.

---

## 🎯 Next Steps

### Immediate Development

- [ ] Replace mock APIs with real backend
- [ ] Add more screens and features
- [ ] Implement push notifications
- [ ] Add offline data synchronization

### Production Readiness

- [ ] Set up CI/CD pipeline
- [ ] Configure crash reporting
- [ ] Implement analytics
- [ ] Performance optimization
- [ ] App store submission

### Advanced Features

- [ ] Biometric authentication
- [ ] Deep linking
- [ ] Background sync
- [ ] Internationalization (i18n)
- [ ] Advanced animations

---

**Built with ❤️ using React Native, TypeScript, and modern development practices.**
#