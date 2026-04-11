import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp, ScanRecord } from '@/context/AppContext';

function ScanItem({ scan, index, onPress }: { scan: ScanRecord; index: number; onPress: () => void }) {
  const colors = useColors();
  const date = new Date(scan.date);
  const isLatest = index === 0;

  const scoreColor = scan.score >= 80
    ? colors.emerald
    : scan.score >= 65
    ? colors.chartOrange
    : colors.destructive;

  return (
    <TouchableOpacity
      style={[styles.scanCard, { backgroundColor: colors.card, borderColor: isLatest ? 'rgba(16,185,129,0.3)' : colors.border }]}
      onPress={onPress}
    >
      <View style={styles.scanCardLeft}>
        <View style={[styles.dateBox, { backgroundColor: colors.surface }]}>
          <Text style={[styles.dateMonth, { color: colors.textSecondary }]}>
            {date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
          </Text>
          <Text style={[styles.dateDay, { color: colors.foreground }]}>{date.getDate()}</Text>
        </View>
        <View style={styles.scanInfo}>
          <View style={styles.scanInfoRow}>
            <Text style={[styles.scanTitle, { color: colors.foreground }]}>
              Body Scan {isLatest ? '(Latest)' : ''}
            </Text>
            {isLatest && (
              <View style={[styles.latestBadge, { backgroundColor: colors.emeraldGlow }]}>
                <Text style={[styles.latestBadgeText, { color: colors.emerald }]}>NEW</Text>
              </View>
            )}
          </View>
          <Text style={[styles.scanSubtitle, { color: colors.textSecondary }]}>
            {scan.weight}kg · {scan.measurements.bodyFat.toFixed(1)}% body fat
          </Text>
          <Text style={[styles.scanSubtitle, { color: colors.textTertiary }]}>
            Waist {scan.measurements.waist.toFixed(1)}cm · BMI {scan.bmi}
          </Text>
        </View>
      </View>

      <View style={styles.scanCardRight}>
        <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
          <Text style={[styles.scoreText, { color: scoreColor }]}>{scan.score}</Text>
        </View>
        <Feather name="chevron-right" size={16} color={colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { scanHistory } = useApp();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 + 84 : insets.bottom + 84;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Scan History</Text>
        <View style={[styles.countBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.countText, { color: colors.textSecondary }]}>
            {scanHistory.length} scans
          </Text>
        </View>
      </View>

      {/* Stats summary */}
      {scanHistory.length >= 2 && (
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.emerald }]}>
              {(scanHistory[0].weight - scanHistory[scanHistory.length - 1].weight).toFixed(1)}kg
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Weight Change</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.chartOrange }]}>
              {(scanHistory[0].measurements.bodyFat - scanHistory[scanHistory.length - 1].measurements.bodyFat).toFixed(1)}%
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Body Fat</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.chartBlue }]}>
              +{(scanHistory[0].measurements.muscleMass - scanHistory[scanHistory.length - 1].measurements.muscleMass).toFixed(1)}kg
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Muscle Gained</Text>
          </View>
        </View>
      )}

      <FlatList
        data={scanHistory}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <ScanItem
            scan={item}
            index={index}
            onPress={() => {}}
          />
        )}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="clock" size={40} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Scans Yet</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Complete your first body scan to track your progress
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: colors.emerald }]}
              onPress={() => router.push('/(tabs)/scan')}
            >
              <Text style={styles.emptyBtnText}>Start Scanning</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  countText: { fontSize: 13, fontWeight: '500' },
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 16,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  summaryLabel: { fontSize: 11, marginTop: 4, textAlign: 'center' },
  summaryDivider: { width: 1, marginVertical: 4 },
  list: { paddingHorizontal: 16, gap: 10 },
  scanCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scanCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  dateBox: {
    width: 46,
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateMonth: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  dateDay: { fontSize: 22, fontWeight: '800' },
  scanInfo: { flex: 1, gap: 2 },
  scanInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scanTitle: { fontSize: 14, fontWeight: '600' },
  latestBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  latestBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  scanSubtitle: { fontSize: 12 },
  scanCardRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  scoreCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: { fontSize: 14, fontWeight: '800' },
  empty: { padding: 40, alignItems: 'center', gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700' },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  emptyBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
