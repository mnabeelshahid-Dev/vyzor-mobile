import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Layout, Card, Typography, Button, Icon } from '../../components/ui';

const DashboardScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 2000);
  };

  const statsData = [
    { title: 'Revenue', value: '$24.5K', icon: 'analytics', change: '+12%' },
    { title: 'Users', value: '1,432', icon: 'users', change: '+8%' },
    { title: 'Orders', value: '892', icon: 'star', change: '+15%' },
    { title: 'Growth', value: '89%', icon: 'heart', change: '+3%' },
  ];

  const quickActions = [
    { title: 'Add User', icon: 'user', onPress: () => {} },
    { title: 'Analytics', icon: 'analytics', onPress: () => {} },
    { title: 'Settings', icon: 'settings', onPress: () => {} },
    { title: 'Reports', icon: 'edit', onPress: () => {} },
  ];

  return (
    <Layout
      variant="default"
      scrollable
      refreshing={refreshing}
      onRefresh={handleRefresh}
    >
      {/* Header */}
      <View style={styles.header}>
        <Typography variant="h2" color="text">
          Dashboard
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Welcome back! Here's what's happening.
        </Typography>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {statsData.map((stat, index) => (
          <Card
            key={index}
            variant="elevated"
            padding="medium"
            style={styles.statCard}
          >
            <View style={styles.statHeader}>
              <Icon name={stat.icon as any} size="medium" color="#0088E7" />
              <Typography variant="caption" color="success">
                {stat.change}
              </Typography>
            </View>
            <Typography variant="h3" color="text" style={styles.statValue}>
              {stat.value}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {stat.title}
            </Typography>
          </Card>
        ))}
      </View>

      {/* Quick Actions */}
      <Card variant="elevated" padding="large" style={styles.actionsCard}>
        <Typography variant="h4" color="text" style={styles.sectionTitle}>
          Quick Actions
        </Typography>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <Button
              key={index}
              title={action.title}
              variant="secondary"
              size="medium"
              onPress={action.onPress}
              style={styles.actionButton}
              icon={
                <Icon name={action.icon as any} size="medium" color="#0088E7" />
              }
              iconPosition="left"
            />
          ))}
        </View>
      </Card>

      {/* Recent Activity */}
      <Card variant="elevated" padding="large" style={styles.activityCard}>
        <Typography variant="h4" color="text" style={styles.sectionTitle}>
          Recent Activity
        </Typography>
        <View style={styles.activityList}>
          {[1, 2, 3].map(item => (
            <View key={item} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Icon name="notification" size="small" color="#FFFFFF" />
              </View>
              <View style={styles.activityContent}>
                <Typography variant="body1" color="text">
                  New user registered
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  2 minutes ago
                </Typography>
              </View>
              <Button
                title="View"
                variant="ghost"
                size="small"
                onPress={() => {}}
              />
            </View>
          ))}
        </View>
      </Card>

      {/* Profile Card */}
      <Card variant="elevated" padding="large" style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatar}>
            <Typography variant="h3" color="#FFFFFF">
              JD
            </Typography>
          </View>
          <View style={styles.profileInfo}>
            <Typography variant="h4" color="text">
              John Doe
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Administrator
            </Typography>
          </View>
          <Button
            title="Edit"
            variant="outline"
            size="small"
            onPress={() => {}}
            icon={<Icon name="edit" size="small" color="#0088E7" />}
          />
        </View>
      </Card>
    </Layout>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    width: '48%',
    minHeight: 120,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    marginBottom: 4,
  },
  actionsCard: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '48%',
    justifyContent: 'flex-start',
    paddingVertical: 16,
  },
  activityCard: {
    marginBottom: 24,
  },
  activityList: {
    gap: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIcon: {
    width: 36,
    height: 36,
    backgroundColor: '#0088E7',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  profileCard: {
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    backgroundColor: '#0088E7',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
});

export default DashboardScreen;
