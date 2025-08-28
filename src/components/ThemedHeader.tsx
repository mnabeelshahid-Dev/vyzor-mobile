import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ViewStyle } from 'react-native';
import BackArrowIcon from '../../assets/svgs/backArrowIcon.svg';
import ThreeDotIcon from '../../assets/svgs/threeDotIcon.svg';

interface ThemedHeaderProps {
  title: string;
  onBack?: () => void;
  onMenu?: () => void;
  backgroundColor?: string;
  rightComponent?: React.ReactNode;
  leftComponent?: React.ReactNode;
  children?: React.ReactNode; // for floating search/filter bar
  style?: ViewStyle;
}

const ThemedHeader: React.FC<ThemedHeaderProps> = ({
  title,
  onBack,
  onMenu,
  backgroundColor = '#007AFF',
  rightComponent,
  leftComponent,
  children,
  style,
}) => (
  <View style={[styles.header, { backgroundColor }, style]}>
    <View style={styles.headerRow}>
      {leftComponent ? (
        leftComponent
      ) : (
        <TouchableOpacity onPress={onBack} hitSlop={10}>
          <BackArrowIcon width={17} height={17} />
        </TouchableOpacity>
      )}
      <Text style={styles.headerTitle}>{title}</Text>
      {rightComponent ? (
        rightComponent
      ) : (
        <TouchableOpacity onPress={onMenu} hitSlop={10}>
          <ThreeDotIcon width={26} height={26} />
        </TouchableOpacity>
      )}
    </View>
    {children}
  </View>
);

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#007AFF',
    paddingTop: Platform.OS === 'ios' ? 18 : 55,
    paddingBottom: 10,
    paddingHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 24,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
});

export default ThemedHeader;
