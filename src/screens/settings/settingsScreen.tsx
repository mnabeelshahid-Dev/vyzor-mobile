import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Layout,
  Card,
  Typography,
  Button,
  Input,
  Icon,
  Switch,
} from '../../components/ui';

const SettingsScreen: React.FC = () => {
  const [firstName, setFirstName] = useState('John');
  const [lastName, setLastName] = useState('Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [biometric, setBiometric] = useState(false);

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        { title: 'Profile Information', icon: 'user', onPress: () => {} },
        { title: 'Security', icon: 'lock', onPress: () => {} },
        { title: 'Privacy', icon: 'eye', onPress: () => {} },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          title: 'Language',
          icon: 'settings',
          value: 'English',
          onPress: () => {},
        },
        {
          title: 'Currency',
          icon: 'analytics',
          value: 'USD',
          onPress: () => {},
        },
        { title: 'Time Zone', icon: 'home', value: 'UTC-5', onPress: () => {} },
      ],
    },
    {
      title: 'Support',
      items: [
        { title: 'Help Center', icon: 'search', onPress: () => {} },
        { title: 'Contact Us', icon: 'email', onPress: () => {} },
        { title: 'Report a Bug', icon: 'edit', onPress: () => {} },
      ],
    },
  ];

  return (
    <Layout variant="default" scrollable>
      {/* Header */}
      <View style={styles.header}>
        <Typography variant="h2" color="text">
          Settings
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Manage your account and preferences
        </Typography>
      </View>

      {/* Profile Edit Card */}
      <Card variant="elevated" padding="large" style={styles.profileCard}>
        <Typography variant="h4" color="text" style={styles.sectionTitle}>
          Profile Information
        </Typography>

        <View style={styles.nameRow}>
          <Input
            label="First Name"
            value={firstName}
            onChangeText={setFirstName}
            leftIcon={<Icon name="user" size="medium" color="#FFFFFF" />}
            containerStyle={styles.nameInput}
          />
          <Input
            label="Last Name"
            value={lastName}
            onChangeText={setLastName}
            leftIcon={<Icon name="user" size="medium" color="#FFFFFF" />}
            containerStyle={styles.nameInput}
          />
        </View>

        <Input
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          leftIcon={<Icon name="email" size="medium" color="#FFFFFF" />}
        />

        <Button
          title="Save Changes"
          variant="primary"
          size="medium"
          fullWidth
          onPress={() => {}}
          style={styles.saveButton}
        />
      </Card>

      {/* Notification Settings */}
      <Card variant="elevated" padding="large" style={styles.notificationCard}>
        <Typography variant="h4" color="text" style={styles.sectionTitle}>
          Notifications & Privacy
        </Typography>

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Icon name="notification" size="medium" color="#0088E7" />
            <View style={styles.toggleText}>
              <Typography variant="body1" color="text">
                Push Notifications
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Receive important updates
              </Typography>
            </View>
          </View>
          <Switch value={notifications} onValueChange={setNotifications} />
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Icon name="eye" size="medium" color="#0088E7" />
            <View style={styles.toggleText}>
              <Typography variant="body1" color="text">
                Dark Mode
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Use dark theme
              </Typography>
            </View>
          </View>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Icon name="lock" size="medium" color="#0088E7" />
            <View style={styles.toggleText}>
              <Typography variant="body1" color="text">
                Biometric Login
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Use fingerprint or face ID
              </Typography>
            </View>
          </View>
          <Switch value={biometric} onValueChange={setBiometric} />
        </View>
      </Card>

      {/* Settings Groups */}
      {settingsGroups.map((group, groupIndex) => (
        <Card
          key={groupIndex}
          variant="elevated"
          padding="large"
          style={styles.settingsCard}
        >
          <Typography variant="h4" color="text" style={styles.sectionTitle}>
            {group.title}
          </Typography>

          <View style={styles.settingsList}>
            {group.items.map((item, itemIndex) => (
              <View
                key={itemIndex}
                style={[
                  styles.settingsItem,
                  itemIndex === group.items.length - 1 && styles.lastItem,
                ]}
              >
                <View style={styles.settingsItemLeft}>
                  <Icon name={item.icon as any} size="medium" color="#0088E7" />
                  <Typography variant="body1" color="text">
                    {item.title}
                  </Typography>
                </View>
                <View style={styles.settingsItemRight}>
                  {item.value && (
                    <Typography variant="body2" color="textSecondary">
                      {item.value}
                    </Typography>
                  )}
                  <Icon name="chevron-right" size="small" color="#666666" />
                </View>
              </View>
            ))}
          </View>
        </Card>
      ))}

      {/* Danger Zone */}
      <Card variant="outlined" padding="large" style={styles.dangerCard}>
        <Typography variant="h4" color="error" style={styles.sectionTitle}>
          Danger Zone
        </Typography>

        <Button
          title="Sign Out"
          variant="outline"
          size="medium"
          fullWidth
          onPress={() => {}}
          style={styles.signOutButton}
        />

        <Button
          title="Delete Account"
          variant="danger"
          size="medium"
          fullWidth
          onPress={() => {}}
          style={styles.deleteButton}
        />
      </Card>
    </Layout>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 24,
  },
  profileCard: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameInput: {
    flex: 1,
  },
  saveButton: {
    marginTop: 8,
  },
  notificationCard: {
    marginBottom: 24,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 12,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  toggleText: {
    flex: 1,
  },
  settingsCard: {
    marginBottom: 24,
  },
  settingsList: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dangerCard: {
    marginBottom: 24,
    borderColor: '#FF3B30',
  },
  signOutButton: {
    marginBottom: 12,
    borderColor: '#FF3B30',
  },
  deleteButton: {
    // No additional styles needed
  },
});

export default SettingsScreen;
