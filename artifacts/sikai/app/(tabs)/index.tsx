import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { BodyDiagram } from '@/components/BodyDiagram';
import { ScanScoreRing } from '@/components/ScanScoreRing';
import { MetricCard } from '@/components/MetricCard';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, latestScan, previousScan } = useApp();
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>('waist');

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning,';
    if (hour >= 12 && hour < 18) return 'Good afternoon,';
    return 'Good evening,';
  }, []);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 + 84 : insets.bottom + 84;

  const weightChange = latestScan && previousScan
    ? latestScan.weight - previousScan.weight
    : undefined;
  const bodyFatChange = latestScan && previousScan
    ? latestScan.measurements.bodyFat - previousScan.measurements.bodyFat
    : undefined;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>{greeting}</Text>
          <Text style={[styles.name, { color: colors.foreground }]}>{profile.name.split(' ')[0]}</Text>
        </View>
        <TouchableOpacity
          style={[styles.proBtn, { backgroundColor: profile.isPro ? colors.emeraldGlow : colors.card, borderColor: profile.isPro ? 'rgba(16,185,129,0.4)' : colors.border }]}
          onPress={() => router.push('/paywall')}
        >
          <Feather name="zap" size={14} color={profile.isPro ? colors.emerald : colors.textSecondary} />
          <Text style={[styles.proBtnText, { color: profile.isPro ? colors.emerald : colors.textSecondary }]}>
            {profile.isPro ? 'Pro' : 'Upgrade'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Score + Body Diagram */}
      <View style={[styles.mainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.mainCardRow}>
          <View style={styles.diagramContainer}>
            {latestScan ? (
              <BodyDiagram
                measurements={latestScan.measurements}
                selectedPart={selectedBodyPart}
                onSelectPart={setSelectedBodyPart}
              />
            ) : (
              <View style={styles.noScanPlaceholder}>
                <Feather name="user" size={48} color={colors.border} />
              </View>
            )}
          </View>

          <View style={styles.scoreColumn}>
            {latestScan ? (
              <>
                <ScanScoreRing score={latestScan.score} size={100} />
                <View style={[styles.scanDateBadge, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.scanDateText, { color: colors.textSecondary }]}>
                    {new Date(latestScan.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.newScanBtn, { backgroundColor: colors.emerald }]}
                  onPress={() => router.push('/(tabs)/scan')}
                >
                  <Feather name="camera" size={14} color="#fff" />
                  <Text style={styles.newScanBtnText}>New Scan</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.firstScanBtn, { backgroundColor: colors.emerald }]}
                onPress={() => router.push('/(tabs)/scan')}
              >
                <Feather name="camera" size={18} color="#fff" />
                <Text style={styles.newScanBtnText}>First Scan</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Measurement hint */}
        <Text style={[styles.tapHint, { color: colors.textTertiary }]}>
          Tap body zones to see measurements
        </Text>
      </View>

      {/* Key Metrics */}
      {latestScan && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Key Metrics</Text>
          <View style={styles.metricsRow}>
            <MetricCard
              label="Weight"
              value={latestScan.weight}
              unit="kg"
              change={weightChange}
              changeLabel="vs last"
            />
            <MetricCard
              label="Body Fat"
              value={latestScan.measurements.bodyFat}
              unit="%"
              change={bodyFatChange}
              changeLabel="vs last"
            />
          </View>
          <View style={styles.metricsRow}>
            <MetricCard
              label="BMI"
              value={latestScan.bmi}
              accent
            />
            <MetricCard
              label="Muscle Mass"
              value={latestScan.measurements.muscleMass}
              unit="kg"
            />
          </View>
        </View>
      )}

      {/* Measurements Grid */}
      {latestScan && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Measurements</Text>
          <View style={[styles.measurementsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {[
              { label: 'Chest', key: 'chest' },
              { label: 'Waist', key: 'waist' },
              { label: 'Hips', key: 'hips' },
              { label: 'L. Arm', key: 'leftArm' },
              { label: 'R. Arm', key: 'rightArm' },
              { label: 'L. Thigh', key: 'leftThigh' },
              { label: 'R. Thigh', key: 'rightThigh' },
              { label: 'Neck', key: 'neck' },
              { label: 'Shoulders', key: 'shoulders' },
            ].map((item, i, arr) => (
              <View
                key={item.key}
                style={[
                  styles.measurementRow,
                  i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                ]}
              >
                <Text style={[styles.measurementLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                <Text style={[styles.measurementValue, { color: colors.foreground }]}>
                  {latestScan.measurements[item.key as keyof typeof latestScan.measurements].toFixed(1)} cm
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {[
            { label: 'AI Coach', icon: 'cpu', route: '/(tabs)/coach' },
            { label: 'Progress', icon: 'trending-up', route: '/(tabs)/progress' },
            { label: 'History', icon: 'clock', route: '/(tabs)/history' },
            { label: 'Compare', icon: 'columns', route: '/compare' },
          ].map(action => (
            <TouchableOpacity
              key={action.label}
              style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push(action.route as any)}
            >
              <Feather name={action.icon as any} size={22} color={colors.emerald} />
              <Text style={[styles.actionLabel, { color: colors.foreground }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: { fontSize: 14 },
  name: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  proBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  proBtnText: { fontSize: 13, fontWeight: '600' },
  mainCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 8,
  },
  mainCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  diagramContainer: { flex: 1 },
  noScanPlaceholder: {
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreColumn: {
    alignItems: 'center',
    gap: 10,
    paddingLeft: 8,
  },
  scanDateBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  scanDateText: { fontSize: 11, fontWeight: '500' },
  newScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  firstScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
  },
  newScanBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  tapHint: { fontSize: 11, textAlign: 'center', marginTop: 10 },
  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, letterSpacing: -0.3 },
  metricsRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  measurementsCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  measurementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  measurementLabel: { fontSize: 14 },
  measurementValue: { fontSize: 15, fontWeight: '600' },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionBtn: {
    width: '47%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  actionLabel: { fontSize: 14, fontWeight: '600' },
});
