import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, LayoutAnimation, UIManager, Animated
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp, ScanRecord } from '@/context/AppContext';
import { useUnits } from '@/hooks/useUnits';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function ScanItem({ scan, index }: { scan: ScanRecord; index: number }) {
  const colors = useColors();
  const { convertLen, convertWt, lenUnit, wtUnit } = useUnits();
  const [expanded, setExpanded] = useState(false);
  const spinValue = React.useRef(new Animated.Value(0)).current;
  const date = new Date(scan.date);
  const isLatest = index === 0;

  const scoreColor = scan.score >= 80
    ? colors.emerald
    : scan.score >= 65
    ? colors.chartOrange
    : colors.destructive;

  function toggle() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(e => {
      Animated.timing(spinValue, {
        toValue: e ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      return !e;
    });
  }

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  const DETAIL_ROWS = [
    { label: 'Chest', value: `${convertLen(scan.measurements.chest).toFixed(1)} ${lenUnit}` },
    { label: 'Waist', value: `${convertLen(scan.measurements.waist).toFixed(1)} ${lenUnit}` },
    { label: 'Hips', value: `${convertLen(scan.measurements.hips).toFixed(1)} ${lenUnit}` },
    { label: 'Shoulders', value: `${convertLen(scan.measurements.shoulders).toFixed(1)} ${lenUnit}` },
    { label: 'Left Arm', value: `${convertLen(scan.measurements.leftArm).toFixed(1)} ${lenUnit}` },
    { label: 'Right Arm', value: `${convertLen(scan.measurements.rightArm).toFixed(1)} ${lenUnit}` },
    { label: 'Left Thigh', value: `${convertLen(scan.measurements.leftThigh).toFixed(1)} ${lenUnit}` },
    { label: 'Right Thigh', value: `${convertLen(scan.measurements.rightThigh).toFixed(1)} ${lenUnit}` },
    { label: 'Neck', value: `${convertLen(scan.measurements.neck).toFixed(1)} ${lenUnit}` },
    { label: 'Body Fat', value: `${scan.measurements.bodyFat.toFixed(1)}%` },
    { label: 'Muscle Mass', value: `${convertWt(scan.measurements.muscleMass).toFixed(1)} ${wtUnit}` },
    { label: 'BMI', value: `${scan.bmi}` },
  ];

  return (
    <View style={[styles.scanCard, { backgroundColor: colors.card, borderColor: isLatest ? 'rgba(16,185,129,0.3)' : colors.border }]}>
      <TouchableOpacity onPress={toggle} activeOpacity={0.75} style={styles.scanCardHeader}>
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
              {convertWt(scan.weight).toFixed(1)}{wtUnit} · {scan.measurements.bodyFat.toFixed(1)}% body fat
            </Text>
            <Text style={[styles.scanSubtitle, { color: colors.textTertiary }]}>
              Waist {convertLen(scan.measurements.waist).toFixed(1)}{lenUnit} · BMI {scan.bmi}
            </Text>
          </View>
        </View>

        <View style={styles.scanCardRight}>
          <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
            <Text style={[styles.scoreText, { color: scoreColor }]}>{scan.score}</Text>
          </View>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Feather name="chevron-down" size={16} color={colors.textTertiary} />
          </Animated.View>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={[styles.expandedDetails, { borderTopColor: colors.border }]}>
          {DETAIL_ROWS.map((row, i) => (
            <View
              key={row.label}
              style={[
                styles.detailRow, 
                i < DETAIL_ROWS.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: colors.border },
                { backgroundColor: i % 2 === 0 ? colors.surface : 'transparent' }
              ]}
            >
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{row.label}</Text>
              <Text style={[styles.detailValue, { color: colors.foreground }]}>{row.value}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { scanHistory } = useApp();
  const { convertWt, wtUnit } = useUnits();

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
              {convertWt(scanHistory[0].weight - scanHistory[scanHistory.length - 1].weight).toFixed(1)}{wtUnit}
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
              +{convertWt(scanHistory[0].measurements.muscleMass - scanHistory[scanHistory.length - 1].measurements.muscleMass).toFixed(1)}{wtUnit}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Muscle Gained</Text>
          </View>
        </View>
      )}

      <FlatList
        data={scanHistory}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <ScanItem scan={item} index={index} />
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
    overflow: 'hidden',
  },
  scanCardHeader: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expandedDetails: {
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
  },
  detailLabel: { fontSize: 13 },
  detailValue: { fontSize: 13, fontWeight: '600' },
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
