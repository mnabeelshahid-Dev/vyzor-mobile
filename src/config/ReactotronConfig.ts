import Reactotron from 'reactotron-react-native';
import { QueryClientManager, reactotronReactQuery } from 'reactotron-react-query';
import { queryClient } from '../services/queryClient';

const queryClientManager = new QueryClientManager({
  queryClient,
});

if (__DEV__) {
  console.log('🔧 [Reactotron] Initializing...');
  
  const reactotron = Reactotron.configure({
    name: 'Vyzor Mobile',
    host: 'localhost', // Change to your computer's IP if using physical device
  })
    .useReactNative({
      asyncStorage: false, // We're using MMKV, not AsyncStorage
      networking: {
        ignoreUrls: /symbolicate/,
      },
      editor: false,
      errors: { veto: (stackFrame) => false },
      overlay: false,
    })
    .use(reactotronReactQuery(queryClientManager))
    .connect();

  // Clear Reactotron on every app start for fresh logs
  reactotron.clear?.();

  console.log('🔧 [Reactotron] Connected successfully!');
  console.log('🔧 [Reactotron] Listening on port 9090');
  console.log('🔧 [Reactotron] Open Reactotron desktop app to view logs');
}

export default Reactotron;
