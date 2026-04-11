import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Platform, TextInput, Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';

interface SettingRowProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (v: boolean) => void;
  destructive?: boolean;
}

function SettingRow({ icon, label, value, onPress, toggle, toggleValue, onToggle, destructive }: SettingRowProps) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.settingRow, { borderBottomColor: colors.border }]}
      onPress={onPress}
      disabled={toggle}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: destructive ? 'rgba(239,68,68,0.12)' : colors.surface }]}>
          <Feather name={icon as any} size={16} color={destructive ? colors.destructive : colors.textSecondary} />
        </View>
        <Text style={[styles.settingLabel, { color: destructive ? colors.destructive : colors.foreground }]}>
          {label}
        </Text>
      </View>
      {toggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.emerald }}
          thumbColor="#fff"
        />
      ) : (
        <View style={styles.settingRight}>
          {value && <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{value}</Text>}
          <Feather name="chevron-right" size={16} color={colors.textTertiary} />
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, loadDemoScanHistory, scanDataSource } = useApp();
  const [notifications, setNotifications] = useState(true);
  const [weeklyReminder, setWeeklyReminder] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(profile.name);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  async function handleResetData() {
    await AsyncStorage.clear();
    router.replace('/onboarding');
  }

  async function saveName() {
    await updateProfile({ name: editName });
    setIsEditingName(false);
  }

  function confirmLoadDemoCharts() {
    Alert.alert(
      "Load labeled demo data?",
      "This replaces your current scan list with 8 weeks of clearly marked sample data for UI testing. It is not real measurements.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Load demo",
          style: "destructive",
          onPress: () => void loadDemoScanHistory(),
        },
      ],
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad + 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Profile Card */}
      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.emeraldGlow }]}>
          <Text style={[styles.avatarText, { color: colors.emerald }]}>
            {profile.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        {isEditingName ? (
          <View style={styles.editNameContainer}>
            <TextInput
              style={[styles.nameInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.surface }]}
              value={editName}
              onChangeText={setEditName}
              autoFocus
            />
            <TouchableOpacity onPress={saveName} style={[styles.saveNameBtn, { backgroundColor: colors.emerald }]}>
              <Text style={styles.saveNameText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.foreground }]}>{profile.name}</Text>
            <Text style={[styles.profileDetail, { color: colors.textSecondary }]}>
              {profile.age}y · {profile.height}cm · {profile.weight}kg
            </Text>
            <View style={[styles.proStatusBadge, {
              backgroundColor: profile.isPro ? colors.emeraldGlow : colors.surface,
              borderColor: profile.isPro ? 'rgba(16,185,129,0.3)' : colors.border,
            }]}>
              <Feather name="zap" size={10} color={profile.isPro ? colors.emerald : colors.textTertiary} />
              <Text style={[styles.proStatusText, { color: profile.isPro ? colors.emerald : colors.textTertiary }]}>
                {profile.isPro ? 'Pro Member' : 'Free Plan'}
              </Text>
            </View>
          </View>
        )}
        {!isEditingName && (
          <TouchableOpacity onPress={() => setIsEditingName(true)}>
            <Feather name="edit-2" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Subscription */}
      {!profile.isPro && (
        <TouchableOpacity
          style={[styles.upgradeCard, { backgroundColor: colors.emeraldGlow, borderColor: 'rgba(16,185,129,0.3)' }]}
          onPress={() => router.push('/paywall')}
        >
          <Feather name="zap" size={20} color={colors.emerald} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.upgradeTitle, { color: colors.foreground }]}>Upgrade to Pro</Text>
            <Text style={[styles.upgradeSubtitle, { color: colors.textSecondary }]}>
              Unlimited scans · AI coaching · Advanced analytics
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.emerald} />
        </TouchableOpacity>
      )}

      {/* Profile settings */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Profile</Text>
        <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow icon="target" label="Goal" value={profile.goal.replace('_', ' ')} onPress={() => {}} />
          <SettingRow icon="user" label="Gender" value={profile.gender} onPress={() => {}} />
          <SettingRow icon="sliders" label="Units" value="Metric (cm, kg)" onPress={() => {}} />
        </View>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Notifications</Text>
        <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow
            icon="bell"
            label="Push Notifications"
            toggle
            toggleValue={notifications}
            onToggle={setNotifications}
          />
          <SettingRow
            icon="calendar"
            label="Weekly Scan Reminder"
            toggle
            toggleValue={weeklyReminder}
            onToggle={setWeeklyReminder}
          />
        </View>
      </View>

      {/* Data truthfulness */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Data</Text>
        <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow
            icon="database"
            label="Load demo scan history"
            value={scanDataSource === "demo" ? "Active" : ""}
            onPress={confirmLoadDemoCharts}
          />
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>About</Text>
        <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow icon="shield" label="Privacy Policy" onPress={() => {}} />
          <SettingRow icon="file-text" label="Terms of Service" onPress={() => {}} />
          <SettingRow icon="help-circle" label="Help & Support" onPress={() => {}} />
          <SettingRow icon="info" label="App Version" value="1.0.0" />
        </View>
      </View>

      {/* Danger zone */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Data</Text>
        <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow
            icon="trash-2"
            label="Reset All Data"
            onPress={handleResetData}
            destructive
          />
        </View>
      </View>

      <Text style={[styles.footer, { color: colors.textTertiary }]}>
        Bundle ID: com.sikai.bodyscanner{'\n'}Made with precision by Sik AI
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { padding: 8 },
  title: { fontSize: 20, fontWeight: '800' },
  profileCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '800' },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontSize: 17, fontWeight: '700' },
  profileDetail: { fontSize: 13 },
  proStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  proStatusText: { fontSize: 11, fontWeight: '600' },
  editNameContainer: { flex: 1, flexDirection: 'row', gap: 8 },
  nameInput: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
  },
  saveNameBtn: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, justifyContent: 'center' },
  saveNameText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  upgradeCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  upgradeTitle: { fontSize: 15, fontWeight: '700' },
  upgradeSubtitle: { fontSize: 12, marginTop: 2 },
  section: { marginTop: 16, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  settingsGroup: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 0.5,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: { fontSize: 15, fontWeight: '500' },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  settingValue: { fontSize: 13 },
  footer: { fontSize: 11, textAlign: 'center', marginTop: 24, lineHeight: 18 },
});
