import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useAuthStore } from '../../store/authStore';
import { useLogout, useCurrentUser } from '../../hooks/useAuth';
import ThemedScreen from '../../components/ThemedScreen';
import ThemeToggle from '../../components/ThemeToggle';
import LoadingWrapper from '../../components/loadWrapper';

/* eslint-disable react-native/no-unused-styles */
const createStyles = (theme: {
  colors: Record<string, string>;
  spacing: Record<string, number>;
}) =>
  StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
      padding: 20,
    },
    rtlContainer: {
      direction: 'rtl',
    },
    header: {
      marginBottom: 30,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    userInfo: {
      flex: 1,
    },
    greeting: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 4,
    },
    userName: {
      color: theme.colors.primary,
    },
    email: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    themeToggle: {
      marginLeft: 16,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 30,
    },
    statsCard: {
      flex: 1,
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
      marginHorizontal: 4,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    statsNumber: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 4,
    },
    statsLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 16,
    },
    actionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    actionCard: {
      width: '48%',
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    actionIcon: {
      fontSize: 24,
      marginBottom: 8,
    },
    actionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    actionSubtitle: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    activityCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    activityText: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 4,
    },
    activitySubtext: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    accountActions: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
    },
    accountButton: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    accountButtonText: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
    },
    logoutButton: {
      borderBottomWidth: 0,
    },
    logoutButtonText: {
      color: '#ff4757',
    },
    appInfo: {
      alignItems: 'center',
      paddingTop: 20,
      paddingBottom: 40,
    },
    appInfoText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    appInfoSubtext: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
  });
/* eslint-enable react-native/no-unused-styles */

const HomeScreen = () => {
  const styles = useThemedStyles(createStyles);
  const { user } = useAuthStore();
  const { data: currentUser, isLoading, refetch } = useCurrentUser();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleRefresh = () => {
    refetch();
  };

  const userData = currentUser || user;

  return (
    <ThemedScreen>
      <LoadingWrapper isLoading={isLoading && !userData}>
        <ScrollView
          contentContainerStyle={[styles.scrollContainer]}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.userInfo}>
                <Text style={styles.greeting}>
                  Welcome,{' '}
                  <Text style={styles.userName}>
                    {userData?.name || 'User'}
                  </Text>
                  !
                </Text>
                <Text style={styles.email}>{userData?.email}</Text>
              </View>
              <ThemeToggle showLabel={false} style={styles.themeToggle} />
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statsCard}>
              <Text style={styles.statsNumber}>0</Text>
              <Text style={styles.statsLabel}>Statistics</Text>
            </View>
            <View style={styles.statsCard}>
              <Text style={styles.statsNumber}>0</Text>
              <Text style={styles.statsLabel}>Messages</Text>
            </View>
            <View style={styles.statsCard}>
              <Text style={styles.statsNumber}>0</Text>
              <Text style={styles.statsLabel}>Notifications</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionGrid}>
              <TouchableOpacity style={styles.actionCard}>
                <Text style={styles.actionIcon}>📊</Text>
                <Text style={styles.actionTitle}>Analytics</Text>
                <Text style={styles.actionSubtitle}>Reports</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard}>
                <Text style={styles.actionIcon}>📝</Text>
                <Text style={styles.actionTitle}>Edit</Text>
                <Text style={styles.actionSubtitle}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard}>
                <Text style={styles.actionIcon}>👥</Text>
                <Text style={styles.actionTitle}>Users</Text>
                <Text style={styles.actionSubtitle}>Users</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard}>
                <Text style={styles.actionIcon}>⚙️</Text>
                <Text style={styles.actionTitle}>Settings</Text>
                <Text style={styles.actionSubtitle}>App Settings</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityCard}>
              <Text style={styles.activityText}>Recent Activity</Text>
              <Text style={styles.activitySubtext}>Get Started</Text>
            </View>
          </View>

          {/* Account Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.accountActions}>
              <TouchableOpacity style={styles.accountButton}>
                <Text style={styles.accountButtonText}>Edit Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.accountButton}>
                <Text style={styles.accountButtonText}>Settings</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.accountButton}>
                <Text style={styles.accountButtonText}>Help</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.accountButton, styles.logoutButton]}
                onPress={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <Text
                  style={[styles.accountButtonText, styles.logoutButtonText]}
                >
                  {logoutMutation.isPending ? 'Loading' : 'Sign Out'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* App Info */}
          <View style={styles.appInfo}>
            <Text style={styles.appInfoText}>Vyzor v1.0.0</Text>
            <Text style={styles.appInfoSubtext}>
              Built with React Native & TypeScript
            </Text>
          </View>
        </ScrollView>
      </LoadingWrapper>
    </ThemedScreen>
  );
};

export default HomeScreen;
