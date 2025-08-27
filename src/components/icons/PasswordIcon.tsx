import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface PasswordIconProps {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

const PasswordIcon: React.FC<PasswordIconProps> = ({
  width = 17,
  height = 17,
  color = '#475467',
  style,
}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 17 17"
      fill="none"
      style={style}
    >
      <Path
        d="M4.43908 7.78809H12.7111C13.0246 7.78809 13.3252 7.91262 13.5469 8.13428C13.7685 8.35595 13.8931 8.6566 13.8931 8.97009V13.1061C13.8931 13.4196 13.7685 13.7202 13.5469 13.9419C13.3252 14.1636 13.0246 14.2881 12.7111 14.2881H4.43908C4.12559 14.2881 3.82495 14.1636 3.60328 13.9419C3.38161 13.7202 3.25708 13.4196 3.25708 13.1061V8.97009C3.25708 8.6566 3.38161 8.35595 3.60328 8.13428C3.82495 7.91262 4.12559 7.78809 4.43908 7.78809V7.78809Z"
        stroke={color}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.62012 7.78798V5.42398C5.62012 4.6404 5.93139 3.88891 6.48547 3.33484C7.03955 2.78076 7.79104 2.46948 8.57462 2.46948C9.3582 2.46948 10.1097 2.78076 10.6638 3.33484C11.2178 3.88891 11.5291 4.6404 11.5291 5.42398V7.78798"
        stroke={color}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default PasswordIcon;
