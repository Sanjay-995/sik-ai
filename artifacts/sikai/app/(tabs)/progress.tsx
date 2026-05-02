import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { ProgressChart } from '@/components/ProgressChart';

type MetricKey = 'weight' | 'bodyFat' | 'chest' | 'waist' | 'hips' | 'leftArm' | 'leftThigh' | 'muscleMass' | 'score' | 'bmi';

const METRICS: Array<{ key: MetricKey; label: string; unit: string; color: string }> = [
  { key: 'weight', label: 'Weight', unit: 'kg', color: '#3B82F6' },
  { key: 'bodyFat', label: 'Body Fat', unit: '%', color: '#F59E0B' },
  { key: 'muscleMass', label: 'Muscle Mass', unit: 'kg', color: '#10B981' },
  { key: 'score', label: 'Body Score', unit: '', color: '#8B5CF6' },
  { key: 'waist', label: 'Waist', unit: 'cm', color: '#EF4444' },
  { key: 'chest', label: 'Chest', unit: 'cm', color: '#10B981' },
  { key: 'hips', label: 'Hips', unit: 'cm', color: '#F59E0B' },
  { key: 'leftArm', label: 'Arm', unit: 'cm', color: '#3B82F6' },
  { key: 'leftThigh', label: 'Thigh', unit: 'cm', color: '#8B5CF6' },
  { key: 'bmi', label: 'BMI', unit: '', color: '#10B981' },
];

export default function ProgressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { scanHistory: scans, latestScan } = useApp();
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('weight');

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 + 84 : insets.bottom + 84;

  if (scans.length < 2) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 8 }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>Progress</Text>
        </View>
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconCircle, { backgroundColor: colors.emeraldGlow }]}>
            <Feather name="trending-up" size={40} color={colors.emerald} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No progress yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Complete at least 2 scans to see your progress trends
          </Text>
        </View>
      </View>
    );
  }

  const selectedMetricInfo = METRICS.find(m => m.key === selectedMetric)!;

  const getValue = (key: MetricKey): number => {
    if (!latestScan) return 0;
    if (key === 'weight') return latestScan.weight;
    if (key === 'bmi') return latestScan.bmi;
    if (key === 'score') return latestScan.score;
    return latestScan.measurements[key as keyof typeof latestScan.measurements] ?? 0;
  };

  const getPrevValue = (key: MetricKey): number => {
    if (!scans[scans.length - 1]) return getValue(key);
    const oldest = scans[scans.length - 1];
    if (key === 'weight') return oldest.weight;
    if (key === 'bmi') return oldest.bmi;
    if (key === 'score') return oldest.score;
    return oldest.measurements[key as keyof typeof oldest.measurements] ?? 0;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Progress</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {scans.length} scans · 8 weeks
        </Text>
      </View>

      {/* Chart */}
      <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.chartHeader}>
          <View>
            <Text style={[styles.chartTitle, { color: colors.foreground }]}>
              {selectedMetricInfo.label}
            </Text>
            {latestScan && (
              <Text style={[styles.chartValue, { color: selectedMetricInfo.color }]}>
                {getValue(selectedMetric).toFixed(1)}{selectedMetricInfo.unit}
              </Text>
            )}
          </View>
          {scans.length >= 2 && (
            <View style={[styles.changeBadge, {
              backgroundColor: getValue(selectedMetric) > getPrevValue(selectedMetric)
                ? 'rgba(16,185,129,0.12)'
                : 'rgba(239,68,68,0.12)',
            }]}>
              <Feather
                name={getValue(selectedMetric) > getPrevValue(selectedMetric) ? 'trending-up' : 'trending-down'}
                size={14}
                color={getValue(selectedMetric) > getPrevValue(selectedMetric) ? colors.emerald : colors.destructive}
              />
              <Text style={[
                styles.changeText,
                { color: getValue(selectedMetric) > getPrevValue(selectedMetric) ? colors.emerald : colors.destructive }
              ]}>
                {Math.abs(getValue(selectedMetric) - getPrevValue(selectedMetric)).toFixed(1)}{selectedMetricInfo.unit}
              </Text>
            </View>
          )}
        </View>

        <ProgressChart
          scans={scans}
          metric={selectedMetric as any}
          color={selectedMetricInfo.color}
        />
      </View>

      {/* Metric selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.metricSelector}
        style={{ marginBottom: 4 }}
      >
        {METRICS.map(m => (
          <TouchableOpacity
            key={m.key}
            style={[
              styles.metricChip,
              {
                backgroundColor: selectedMetric === m.key ? m.color + '22' : colors.card,
                borderColor: selectedMetric === m.key ? m.color + '66' : colors.border,
              }
            ]}
            onPress={() => setSelectedMetric(m.key)}
          >
            <View style={[styles.metricDot, { backgroundColor: m.color }]} />
            <Text style={[
              styles.metricChipText,
              { color: selectedMetric === m.key ? m.color : colors.textSecondary }
            ]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Progress Summary */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>8-Week Summary</Text>
        <View style={styles.summaryGrid}>
          {[
            { label: 'Weight Lost', value: scans.length >= 2 ? `${Math.abs(scans[0].weight - scans[scans.length - 1].weight).toFixed(1)}kg` : '--', metric: 'weight', diff: scans[0].weight - scans[scans.length - 1].weight },
            { label: 'Fat Lost', value: scans.length >= 2 ? `${Math.abs(scans[0].measurements.bodyFat - scans[scans.length - 1].measurements.bodyFat).toFixed(1)}%` : '--', metric: 'bodyFat', diff: scans[0].measurements.bodyFat - scans[scans.length - 1].measurements.bodyFat },
            { label: 'Muscle Gained', value: scans.length >= 2 ? `${Math.abs(scans[0].measurements.muscleMass - scans[scans.length - 1].measurements.muscleMass).toFixed(1)}kg` : '--', metric: 'muscleMass', diff: scans[0].measurements.muscleMass - scans[scans.length - 1].measurements.muscleMass },
            { label: 'Score Improved', value: scans.length >= 2 ? `${Math.abs(scans[0].score - scans[scans.length - 1].score)}pts` : '--', metric: 'score', diff: scans[0].score - scans[scans.length - 1].score },
          ].map(item => {
            const isImprovement = (item.metric === 'weight' || item.metric === 'bodyFat') ? item.diff < 0 : item.diff > 0;
            return (
              <View
                key={item.label}
                style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={[styles.summaryIcon, { backgroundColor: isImprovement ? colors.emeraldGlow : 'rgba(239,68,68,0.12)' }]}>
                  <Feather name={isImprovement ? 'arrow-up' : 'arrow-down'} size={16} color={isImprovement ? colors.emerald : colors.destructive} />
                </View>
                <Text style={[styles.summaryValue, { color: colors.foreground }]}>{item.value}</Text>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{item.label}</Text>
              </View>
            );
          })}
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
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 13 },
  chartCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  chartTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  chartValue: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  changeText: { fontSize: 13, fontWeight: '700' },
  metricSelector: { paddingHorizontal: 16, gap: 8, paddingBottom: 4 },
  metricChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  metricDot: { width: 6, height: 6, borderRadius: 3 },
  metricChipText: { fontSize: 13, fontWeight: '500' },
  section: { marginTop: 16, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, letterSpacing: -0.3 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  summaryCard: {
    width: '47%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryValue: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  summaryLabel: { fontSize: 12 },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 60,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
