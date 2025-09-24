declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  interface ExtendedSvgProps extends SvgProps {
    color?: string;
  }
  const content: React.FC<ExtendedSvgProps>;
  export default content;
}
