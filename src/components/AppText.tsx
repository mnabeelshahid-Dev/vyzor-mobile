import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

const AppText: React.FC<TextProps> = ({ style, children, ...props }) => {
  return (
    <Text {...props} style={[styles.text, style]}>{children}</Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: 'Prompt-Regular',
  },
});

export default AppText;
