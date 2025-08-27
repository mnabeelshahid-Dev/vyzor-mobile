import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useThemedStyles } from '../../hooks/useThemedStyles';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  trackColor?: {
    false?: string;
    true?: string;
  };
  thumbColor?: string;
  style?: ViewStyle;
}

export const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  trackColor = {
    false: '#E0E0E0',
    true: '#0088E7',
  },
  thumbColor = '#FFFFFF',
  style,
}) => {
  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  const styles = StyleSheet.create({
    container: {
      width: 50,
      height: 30,
      borderRadius: 15,
      backgroundColor: value ? trackColor.true : trackColor.false,
      justifyContent: 'center',
      paddingHorizontal: 2,
      opacity: disabled ? 0.5 : 1,
    },
    thumb: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: thumbColor,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      alignSelf: value ? 'flex-end' : 'flex-start',
    },
  });

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View style={styles.thumb} />
    </TouchableOpacity>
  );
};

export default Switch;
