import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

// ✅ Function to generate random UUID (version 4)
export const generateUUID = (): string => {
  return uuidv4();
};