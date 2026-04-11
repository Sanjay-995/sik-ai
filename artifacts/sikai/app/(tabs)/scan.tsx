import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform,
  Dimensions, Animated, ScrollView, Easing
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { LiDARScanner } from '@/components/LiDARScanner';
import { ScanRecord, BodyMeasurement } from '@/context/AppContext';
import { buildProfileBasedDemoScan } from '@/lib/scanSimulation';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const SCAN_PHASES = [
  'Preparing demo flow…',
  'Playing visualization…',
  'Mapping illustrative mesh…',
  'Sweeping preview point cloud…',
  'Deriving demo chest & shoulders…',
  'Deriving demo waist & hips…',
  'Deriving demo arms & thighs…',
  'Estimating composition (demo)…',
  'Stabilizing demo numbers…',
  'Computing illustrative score…',
  'Finishing…',
  'Demo pass complete',
];

function buildScanResult(
  profile: { height: number; weight: number; gender: 'male' | 'female'; age: number },
  liveScanCount: number,
): Omit<ScanRecord, 'id' | 'date'> {
  const sim = buildProfileBasedDemoScan(profile, liveScanCount);
  const measurements: BodyMeasurement = { ...sim.measurements };
  return {
    measurements,
    weight: sim.weight,
    bmi: sim.bmi,
    score: sim.score,
  };
}

// Animated counter for result numbers
function AnimatedNumber({ value, unit, duration = 800 }: { value: number; unit?: string; duration?: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: value,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    const listener = anim.addListener(({ value: v }) => {
      setDisplay(v.toFixed(1));
    });
    return () => anim.removeListener(listener);
  }, [value]);

  const colors = useColors();
  return (
    <Text style={[styles.resultMetricValue, { color: colors.foreground }]}>
      {display}{unit}
    </Text>
  );
}

export default function ScanScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addScan, profile, scanHistory } = useApp();
  const liveScanCount = scanHistory.filter((s) => !s.id.startsWith('demo_')).length;
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'complete'>('idle');
  const [progress, setProgress] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [result, setResult] = useState<Omit<ScanRecord, 'id' | 'date'> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Result panel slide-up
  const resultSlide = useRef(new Animated.Value(SCREEN_H)).current;
  const resultOpacity = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 + 84 : insets.bottom + 84;

  function startScan() {
    setScanState('scanning');
    setProgress(0);
    setPhaseIndex(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Fade header slightly
    Animated.timing(headerOpacity, { toValue: 0.6, duration: 400, useNativeDriver: true }).start();

    let p = 0;
    progressRef.current = setInterval(() => {
      p += 0.55 + Math.random() * 0.35;
      if (p >= 100) {
        p = 100;
        clearInterval(progressRef.current!);
        setProgress(100);
        setTimeout(() => completeScan(), 400);
      } else {
        setProgress(p);
      }
    }, 100);

    let phase = 0;
    phaseRef.current = setInterval(() => {
      phase = Math.min(phase + 1, SCAN_PHASES.length - 2);
      setPhaseIndex(phase);
      if (phase % 2 === 0) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 1000);
  }

  function completeScan() {
    clearInterval(progressRef.current!);
    clearInterval(phaseRef.current!);
    setPhaseIndex(SCAN_PHASES.length - 1);
    const scanResult = buildScanResult(profile, liveScanCount);
    setResult(scanResult);
    setScanState('complete');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Animate result panel in
    Animated.parallel([
      Animated.spring(resultSlide, {
        toValue: 0,
        tension: 55,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.timing(resultOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }

  async function saveScan() {
    if (!result) return;
    // Button press animation
    Animated.sequence([
      Animated.timing(btnScale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(btnScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    const scan: ScanRecord = {
      id: `scan_${Date.now()}`,
      date: new Date().toISOString(),
      ...result,
    };
    await addScan(scan);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/(tabs)');
  }

  function resetScan() {
    setScanState('idle');
    setProgress(0);
    setPhaseIndex(0);
    setResult(null);
    resultSlide.setValue(SCREEN_H);
    resultOpacity.setValue(0);
    headerOpacity.setValue(1);
  }

  useEffect(() => {
    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
      if (phaseRef.current) clearInterval(phaseRef.current);
    };
  }, []);

  const scoreColor = result
    ? result.score >= 85 ? colors.emerald
    : result.score >= 70 ? colors.chartOrange
    : colors.destructive
    : colors.emerald;

  const SUMMARY_ROWS = result ? [
    { label: 'Neck', value: result.measurements.neck, unit: 'cm' },
    { label: 'Shoulders', value: result.measurements.shoulders, unit: 'cm' },
    { label: 'Chest', value: result.measurements.chest, unit: 'cm' },
    { label: 'Waist', value: result.measurements.waist, unit: 'cm' },
    { label: 'Hips', value: result.measurements.hips, unit: 'cm' },
    { label: 'Left Arm', value: result.measurements.leftArm, unit: 'cm' },
    { label: 'Right Arm', value: result.measurements.rightArm, unit: 'cm' },
    { label: 'Left Thigh', value: result.measurements.leftThigh, unit: 'cm' },
    { label: 'Right Thigh', value: result.measurements.rightThigh, unit: 'cm' },
    { label: 'Body Fat', value: result.measurements.bodyFat, unit: '%' },
    { label: 'Muscle Mass', value: result.measurements.muscleMass, unit: 'kg' },
  ] : [];

  return (
    <View style={[styles.container, { backgroundColor: '#060c08' }]}>
      {/* Header */}
      <Animated.View style={[styles.header, { paddingTop: topPad + 8, opacity: headerOpacity }]}>
        <View>
          <Text style={styles.headerTitle}>Body Scan (demo)</Text>
          <Text style={styles.headerSub}>VISUALIZATION · NOT A REAL SENSOR</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.lidarPill}>
            <View style={[styles.lidarDot, { backgroundColor: scanState === 'scanning' ? colors.emerald : 'rgba(16,185,129,0.3)' }]} />
            <Text style={styles.lidarText}>
              {scanState === 'scanning' ? 'SCANNING' : scanState === 'complete' ? 'COMPLETE' : 'READY'}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Full-screen scanner */}
      <View style={styles.scanArea}>
        <LiDARScanner
          isScanning={scanState === 'scanning'}
          isIdle={scanState === 'idle'}
          progress={progress}
          phase={SCAN_PHASES[phaseIndex]}
        />
      </View>

      {/* Idle start button */}
      {scanState === 'idle' && (
        <View style={[styles.footer, { paddingBottom: bottomPad }]}>
          <View style={styles.idleInstructions}>
            <Feather name="info" size={13} color="rgba(16,185,129,0.5)" />
            <Text style={styles.idleInstructionText}>
              No camera or LiDAR is used — numbers are illustrative from your profile
            </Text>
          </View>
          <TouchableOpacity
            style={styles.startBtn}
            onPress={startScan}
            activeOpacity={0.85}
          >
            <View style={styles.startBtnInner}>
              <Feather name="maximize" size={20} color="#fff" />
              <Text style={styles.startBtnText}>Run demo scan</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Scanning info bar */}
      {scanState === 'scanning' && (
        <View style={[styles.footer, { paddingBottom: bottomPad }]}>
          <View style={styles.scanningBar}>
            <View style={styles.scanningBarDot}>
              <View style={[styles.pulsingDot, { backgroundColor: colors.emerald }]} />
            </View>
            <Text style={styles.scanningBarText}>Hold still · Keep breathing normally</Text>
          </View>
        </View>
      )}

      {/* Results panel — slides up from bottom */}
      {scanState === 'complete' && result && (
        <Animated.View
          style={[
            styles.resultsPanel,
            {
              transform: [{ translateY: resultSlide }],
              opacity: resultOpacity,
            },
          ]}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: bottomPad + 16 }}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Drag handle */}
            <View style={styles.dragHandle} />

            {/* Score hero */}
            <View style={styles.scoreHero}>
              <View style={styles.demoDisclaimer}>
                <Feather name="alert-circle" size={14} color="rgba(251,191,36,0.95)" />
                <Text style={styles.demoDisclaimerText}>
                  Illustrative values only — not medical or metrology data.
                </Text>
              </View>
              <View style={[styles.scoreBadge, { borderColor: scoreColor + '50' }]}>
                <Text style={[styles.scoreNumber, { color: scoreColor }]}>{result.score}</Text>
                <Text style={styles.scoreLabel}>BODY SCORE</Text>
              </View>

              <View style={styles.scoreMeta}>
                <View style={styles.scoreMetaItem}>
                  <Text style={styles.scoreMetaValue}>{result.weight}kg</Text>
                  <Text style={styles.scoreMetaLabel}>Weight</Text>
                </View>
                <View style={[styles.scoreMetaDivider]} />
                <View style={styles.scoreMetaItem}>
                  <Text style={[styles.scoreMetaValue, { color: colors.emerald }]}>
                    {result.measurements.bodyFat.toFixed(1)}%
                  </Text>
                  <Text style={styles.scoreMetaLabel}>Body Fat</Text>
                </View>
                <View style={[styles.scoreMetaDivider]} />
                <View style={styles.scoreMetaItem}>
                  <Text style={[styles.scoreMetaValue, { color: colors.chartBlue }]}>
                    {result.measurements.muscleMass.toFixed(1)}kg
                  </Text>
                  <Text style={styles.scoreMetaLabel}>Muscle</Text>
                </View>
                <View style={[styles.scoreMetaDivider]} />
                <View style={styles.scoreMetaItem}>
                  <Text style={styles.scoreMetaValue}>{result.bmi}</Text>
                  <Text style={styles.scoreMetaLabel}>BMI</Text>
                </View>
              </View>
            </View>

            {/* Section title */}
            <View style={styles.measurementsTitleRow}>
              <Text style={styles.measurementsTitle}>All Measurements</Text>
              <View style={styles.measurementCount}>
                <Text style={styles.measurementCountText}>11 zones</Text>
              </View>
            </View>

            {/* Measurements list */}
            <View style={styles.measurementsList}>
              {SUMMARY_ROWS.map((row, i) => (
                <View
                  key={row.label}
                  style={[
                    styles.measurementRow,
                    i < SUMMARY_ROWS.length - 1 && styles.measurementRowBorder,
                  ]}
                >
                  <View style={styles.measurementRowLeft}>
                    <View style={[styles.measurementDot, {
                      backgroundColor: row.unit === '%'
                        ? colors.chartOrange + '33'
                        : row.unit === 'kg' && row.label === 'Muscle Mass'
                        ? colors.chartBlue + '33'
                        : colors.emeraldGlow,
                    }]}>
                      <View style={[styles.measurementDotInner, {
                        backgroundColor: row.unit === '%'
                          ? colors.chartOrange
                          : row.unit === 'kg' && row.label === 'Muscle Mass'
                          ? colors.chartBlue
                          : colors.emerald,
                      }]} />
                    </View>
                    <Text style={styles.measurementLabel}>{row.label}</Text>
                  </View>
                  <View style={styles.measurementValueRow}>
                    <Text style={styles.measurementValue}>
                      {row.value.toFixed(1)}
                    </Text>
                    <Text style={styles.measurementUnit}>{row.unit}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Action buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.rescanBtn}
                onPress={resetScan}
              >
                <Feather name="refresh-ccw" size={16} color="rgba(255,255,255,0.6)" />
                <Text style={styles.rescanBtnText}>Rescan</Text>
              </TouchableOpacity>

              <Animated.View style={[styles.saveWrapper, { transform: [{ scale: btnScale }] }]}>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={saveScan}
                  activeOpacity={0.88}
                >
                  <Feather name="save" size={18} color="#fff" />
                  <Text style={styles.saveBtnText}>Save Scan</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
}

const E = '#10B981';
const CARD = '#111814';
const BORDER = '#1e2e26';

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(16,185,129,0.5)',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  headerRight: { alignItems: 'flex-end' },
  lidarPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  lidarDot: { width: 5, height: 5, borderRadius: 2.5 },
  lidarText: {
    fontSize: 9,
    fontWeight: '800',
    color: E,
    letterSpacing: 1.2,
  },
  scanArea: { flex: 1 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
  },
  idleInstructions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  idleInstructionText: {
    fontSize: 11,
    color: 'rgba(16,185,129,0.5)',
    textAlign: 'center',
    fontWeight: '500',
  },
  startBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: E,
    shadowColor: E,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  startBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 17,
  },
  startBtnText: { fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: -0.2 },
  scanningBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(16,185,129,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.15)',
  },
  scanningBarDot: { alignItems: 'center', justifyContent: 'center' },
  pulsingDot: { width: 7, height: 7, borderRadius: 3.5 },
  scanningBarText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
  },

  // Results panel
  resultsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_H * 0.72,
    backgroundColor: CARD,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },

  // Score hero
  scoreHero: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 14,
  },
  demoDisclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(251,191,36,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.25)',
    width: '100%',
  },
  demoDisclaimerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(253,230,138,0.95)',
    lineHeight: 17,
  },
  scoreBadge: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: 'rgba(16,185,129,0.06)',
  },
  scoreNumber: {
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 60,
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 2.5,
    marginTop: 2,
  },
  scoreMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 12,
    paddingHorizontal: 8,
    width: '100%',
    gap: 0,
  },
  scoreMetaItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  scoreMetaValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  scoreMetaLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '500',
  },
  scoreMetaDivider: {
    width: 1,
    height: 32,
    backgroundColor: BORDER,
  },

  // Measurements
  measurementsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  measurementsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.2,
  },
  measurementCount: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  measurementCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: E,
  },
  measurementsList: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: 'rgba(255,255,255,0.02)',
    overflow: 'hidden',
    marginBottom: 16,
  },
  measurementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  measurementRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  measurementRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  measurementDot: {
    width: 22,
    height: 22,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  measurementDotInner: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  measurementLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.75)',
  },
  measurementValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  measurementValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
  },
  measurementUnit: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '500',
  },
  resultMetricValue: {
    fontSize: 16,
    fontWeight: '700',
  },

  // Action buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
  },
  rescanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: BORDER,
  },
  rescanBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  saveWrapper: { flex: 1 },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: E,
    shadowColor: E,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.2,
  },
});
