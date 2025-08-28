import React from 'react';
import { FlatList, StyleSheet, ViewStyle, FlatListProps } from 'react-native';

interface ThemedFlatListProps<ItemT> extends FlatListProps<ItemT> {
  contentContainerStyle?: ViewStyle;
}

function ThemedFlatList<ItemT = any>(props: ThemedFlatListProps<ItemT>) {
  return (
    <FlatList
      {...props}
      contentContainerStyle={[
        styles.container,
        props.contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
    backgroundColor: '#F2F2F2',
    paddingTop: 50,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    minHeight: '100%',
  },
});

export default ThemedFlatList;
