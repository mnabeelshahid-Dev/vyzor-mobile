import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import SearchIcon from '../../assets/svgs/searchIcon.svg';
import FilterIcon from '../../assets/svgs/filterIcon.svg';

interface FloatingSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress?: () => void;
  placeholder?: string;
  style?: ViewStyle;
}

const FloatingSearchBar: React.FC<FloatingSearchBarProps> = ({
  value,
  onChangeText,
  onFilterPress,
  placeholder = 'Search...',
  style,
}) => (
  <View style={[styles.searchBarFloatWrap, style]}>
    <View style={styles.searchBarFloat}>
      <SearchIcon width={25} height={25} style={{ marginLeft: 8 }} />
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor="#8E8E93"
        value={value}
        onChangeText={onChangeText}
      />
    </View>
    <TouchableOpacity
      style={styles.filterBtnFloat}
      onPress={onFilterPress}
    >
      <FilterIcon width={32} height={32} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  searchBarFloatWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    top: 20,
    marginHorizontal: 24,
    zIndex: 2,
  },
  searchBarFloat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    height: 52,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 8,
    color: '#222',
    fontSize: 18,
  },
  filterBtnFloat: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    paddingHorizontal: 14,
    marginLeft: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default FloatingSearchBar;
