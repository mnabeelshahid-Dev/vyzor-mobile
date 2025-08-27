import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const OverviewScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Overview</Text>
      {/* Add your overview UI here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default OverviewScreen;
