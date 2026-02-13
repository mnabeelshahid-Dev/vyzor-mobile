// Base64 encoding utilities for React Native
// Works cross-platform (React Native and Web)

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

export const base64Encode = (str: string): string => {
  let result = '';
  let i = 0;
  
  while (i < str.length) {
    const a = str.charCodeAt(i++);
    const b = i < str.length ? str.charCodeAt(i++) : 0;
    const c = i < str.length ? str.charCodeAt(i++) : 0;
    
    const bitmap = (a << 16) | (b << 8) | c;
    
    result += chars.charAt((bitmap >> 18) & 63);
    result += chars.charAt((bitmap >> 12) & 63);
    result += chars.charAt((bitmap >> 6) & 63);
    result += chars.charAt(bitmap & 63);
  }
  
  // Handle padding
  const paddingLength = (3 - (str.length % 3)) % 3;
  return result.slice(0, result.length - paddingLength) + '='.repeat(paddingLength);
};

export const base64Decode = (str: string): string => {
  str = str.replace(/[^A-Za-z0-9+/=]/g, '');
  let result = '';
  let i = 0;
  
  while (i < str.length) {
    const encoded1 = chars.indexOf(str.charAt(i++));
    const encoded2 = chars.indexOf(str.charAt(i++));
    const encoded3 = chars.indexOf(str.charAt(i++));
    const encoded4 = chars.indexOf(str.charAt(i++));
    
    const bitmap = (encoded1 << 18) | (encoded2 << 12) | (encoded3 << 6) | encoded4;
    
    result += String.fromCharCode((bitmap >> 16) & 255);
    if (encoded3 !== 64) result += String.fromCharCode((bitmap >> 8) & 255);
    if (encoded4 !== 64) result += String.fromCharCode(bitmap & 255);
  }
  
  return result;
};

// URL-safe base64 encoding
export const base64UrlEncode = (str: string): string => {
  return base64Encode(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/[=]/g, '');
};

export const base64UrlDecode = (str: string): string => {
  // Add padding if needed
  const padding = str.length % 4;
  const paddedStr = padding ? str + '='.repeat(4 - padding) : str;

  return base64Decode(paddedStr.replace(/-/g, '+').replace(/_/g, '/'));
};
