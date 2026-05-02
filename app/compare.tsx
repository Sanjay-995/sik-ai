import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp, ScanRecord } from '@/context/AppContext';
import { useUnits } from '@/hooks/useUnits';

const { width } = Dimensions.get('window');

function ScanSelector({ scans, selectedId, onSelect, label }: {
  scans: ScanRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  label: string;
}) {
  const colors = useColors();
  const [open, setOpen] = useState(false);
  const selected = scans.find(s => s.id === selectedId);

  return (
    <View style={{ flex: 1 }}>
      <Text style={[styles.selectorLabel, { color: colors.textSecondary }]}>{label}</Text>
      <TouchableOpacity
        style={[styles.selectorBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => setOpen(!open)}
        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
      >
        <View>
          {selected ? (
            <>
              <Text style={[styles.selectorDate, { color: colors.foreground }]}>
                {new Date(selected.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
              <Text style={[styles.selectorScore, { color: colors.emerald }]}>
                Score: {selected.score}
              </Text>
            </>
          ) : (
            <Text style={[styles.selectorPlaceholder, { color: colors.textTertiary }]}>Select scan</Text>
          )}
        </View>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textSecondary} />
      </TouchableOpacity>

      {open && (
        <View style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {scans.map((scan) => (
            <TouchableOpacity
              key={scan.id}
              style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
              onPress={() => { onSelect(scan.id); setOpen(false); }}
            >
              <Text style={[styles.dropdownDate, { color: colors.foreground }]}>
                {new Date(scan.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
              </Text>
              <Text style={[styles.dropdownScore, { color: colors.emerald }]}>
                {scan.score}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export default function CompareScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { scanHistory } = useApp();
  const [scanAId, setScanAId] = useState<string | null>(
    scanHistory.length > 0 ? scanHistory[scanHistory.length - 1].id : null
  );
  const [scanBId, setScanBId] = useState<string | null>(
    scanHistory.length > 1 ? scanHistory[0].id : null
  );

  const { convertLen, convertWt, lenUnit, wtUnit } = useUnits();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const scanA = scanHistory.find(s => s.id === scanAId);
  const scanB = scanHistory.find(s => s.id === scanBId);

  const COMPARE_METRICS = [
    { label: 'Body Score', getA: (s: ScanRecord) => s.score, getB: (s: ScanRecord) => s.score, unit: 'pts', higherIsBetter: true },
    { label: 'Weight', getA: (s: ScanRecord) => convertWt(s.weight), getB: (s: ScanRecord) => convertWt(s.weight), unit: wtUnit, higherIsBetter: false },
    { label: 'Body Fat', getA: (s: ScanRecord) => s.measurements.bodyFat, getB: (s: ScanRecord) => s.measurements.bodyFat, unit: '%', higherIsBetter: false },
    { label: 'Muscle Mass', getA: (s: ScanRecord) => convertWt(s.measurements.muscleMass), getB: (s: ScanRecord) => convertWt(s.measurements.muscleMass), unit: wtUnit, higherIsBetter: true },
    { label: 'Chest', getA: (s: ScanRecord) => convertLen(s.measurements.chest), getB: (s: ScanRecord) => convertLen(s.measurements.chest), unit: lenUnit, higherIsBetter: true },
    { label: 'Waist', getA: (s: ScanRecord) => convertLen(s.measurements.waist), getB: (s: ScanRecord) => convertLen(s.measurements.waist), unit: lenUnit, higherIsBetter: false },
    { label: 'Hips', getA: (s: ScanRecord) => convertLen(s.measurements.hips), getB: (s: ScanRecord) => convertLen(s.measurements.hips), unit: lenUnit, higherIsBetter: true },
    { label: 'L. Arm', getA: (s: ScanRecord) => convertLen(s.measurements.leftArm), getB: (s: ScanRecord) => convertLen(s.measurements.leftArm), unit: lenUnit, higherIsBetter: true },
    { label: 'Shoulders', getA: (s: ScanRecord) => convertLen(s.measurements.shoulders), getB: (s: ScanRecord) => convertLen(s.measurements.shoulders), unit: lenUnit, higherIsBetter: true },
    { label: 'BMI', getA: (s: ScanRecord) => s.bmi, getB: (s: ScanRecord) => s.bmi, unit: '', higherIsBetter: false },
  ];

  // Not enough scans — show a clear empty state
  if (scanHistory.length < 2) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, flex: 1 }]}>
        <View style={[styles.header, { paddingTop: topPad + 8 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>Compare Scans</Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={styles.notEnoughScans}>
          <View style={[styles.notEnoughIcon, { backgroundColor: colors.emeraldGlow }]}>
            <Feather name="columns" size={36} color={colors.emerald} />
          </View>
          <Text style={[styles.notEnoughTitle, { color: colors.foreground }]}>
            {scanHistory.length === 0 ? 'No scans yet' : 'Need one more scan'}
          </Text>
          <Text style={[styles.notEnoughText, { color: colors.textSecondary }]}>
            {scanHistory.length === 0
              ? 'Complete at least 2 body scans to compare your progress side by side.'
              : 'You have 1 scan. Complete a second scan to unlock comparison.'}
          </Text>
          <TouchableOpacity
            style={[styles.notEnoughBtn, { backgroundColor: colors.emerald }]}
            onPress={() => router.replace('/(tabs)/scan')}
            activeOpacity={0.8}
          >
            <Feather name="maximize" size={16} color="#fff" />
            <Text style={styles.notEnoughBtnText}>
              {scanHistory.length === 0 ? 'Take First Scan' : 'Take Second Scan'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Compare Scans</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Scan selectors */}
      <View style={styles.selectors}>
        <ScanSelector
          scans={scanHistory}
          selectedId={scanAId}
          onSelect={setScanAId}
          label="Scan A (Before)"
        />
        <View style={[styles.vsContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.vsText, { color: colors.textSecondary }]}>VS</Text>
        </View>
        <ScanSelector
          scans={scanHistory}
          selectedId={scanBId}
          onSelect={setScanBId}
          label="Scan B (After)"
        />
      </View>

      {/* Comparison table */}
      {scanA && scanB ? (
        <View style={[styles.compareTable, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Table header */}
          <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.tableHeaderCell, { color: colors.textSecondary }]}>Metric</Text>
            <Text style={[styles.tableHeaderCell, { color: '#60A5FA' }]}>Before</Text>
            <Text style={[styles.tableHeaderCell, { color: colors.emerald }]}>After</Text>
            <Text style={[styles.tableHeaderCell, { color: colors.textSecondary }]}>Change</Text>
          </View>

          {COMPARE_METRICS.map((metric, i) => {
            const valA = metric.getA(scanA);
            const valB = metric.getB(scanB);
            const diff = valB - valA;
            const isImprovement = metric.higherIsBetter ? diff > 0 : diff < 0;
            const changeColor = diff === 0
              ? colors.textSecondary
              : isImprovement ? colors.emerald : colors.destructive;

            return (
              <View
                key={metric.label}
                style={[
                  styles.tableRow,
                  { backgroundColor: i % 2 === 0 ? colors.surface : 'transparent' },
                  i < COMPARE_METRICS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                ]}
              >
                <Text style={[styles.tableCell, { color: colors.textSecondary, flex: 1.2 }]}>{metric.label}</Text>
                <Text style={[styles.tableCell, { color: '#60A5FA' }]}>
                  {valA.toFixed(1)}{metric.unit}
                </Text>
                <Text style={[styles.tableCell, { color: colors.emerald }]}>
                  {valB.toFixed(1)}{metric.unit}
                </Text>
                <View style={[styles.changePill, {
                  backgroundColor: diff === 0 ? colors.surface : (isImprovement ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)'),
                  flex: 0.9,
                }]}>
                  <Text style={[styles.changeCell, { color: changeColor }]}>
                    {diff > 0 ? '+' : ''}{diff.toFixed(1)}{metric.unit}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="columns" size={32} color={colors.border} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Select two scans above to compare your progress side by side
          </Text>
        </View>
      )}
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
  title: { fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  selectors: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  selectorLabel: { fontSize: 11, fontWeight: '600', marginBottom: 6, letterSpacing: 0.3 },
  selectorBtn: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorDate: { fontSize: 14, fontWeight: '700' },
  selectorScore: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  selectorPlaceholder: { fontSize: 13 },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 10,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 0.5,
  },
  dropdownDate: { fontSize: 13, fontWeight: '500' },
  dropdownScore: { fontSize: 13, fontWeight: '700' },
  vsContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },
  vsText: { fontSize: 11, fontWeight: '800' },
  compareTable: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 4,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 11,
    alignItems: 'center',
    gap: 4,
  },
  tableCell: { flex: 1, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  changePill: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeCell: { fontSize: 12, fontWeight: '700' },
  emptyState: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  notEnoughScans: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  notEnoughIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  notEnoughTitle: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  notEnoughText: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  notEnoughBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  notEnoughBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
