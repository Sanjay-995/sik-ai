import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform,
  Dimensions, Animated, ScrollView, Easing, Alert, Image, Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { LiDARScanner } from '@/components/LiDARScanner';
import { ScanRecord, BodyMeasurement } from '@/context/AppContext';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : '';

const CHECKLIST_ITEMS = [
  { icon: 'sun', text: 'Bright lighting — no harsh shadows on your body' },
  { icon: 'move', text: 'Stand 6–8 feet (2m) away from the camera' },
  { icon: 'user', text: 'Wear fitted or minimal clothing' },
  { icon: 'navigation', text: 'Face the camera directly, arms slightly out' },
  { icon: 'smartphone', text: 'Camera at chest height, held still or on a stand' },
];

const SCAN_PHASES = [
  'Initializing AI model...',
  'Processing depth data...',
  'Mapping body surface...',
  'Detecting skeletal landmarks...',
  'Measuring chest & shoulders...',
  'Measuring waist & hips...',
  'Measuring arms & thighs...',
  'Analyzing body composition...',
  'Computing fat distribution...',
  'Calculating AI score...',
  'Finalizing measurements...',
  'Scan complete!',
];

type PhotoState = {
  frontUri: string;
  frontBase64: string;
  sideUri?: string;
  sideBase64?: string;
};

function fallbackResult(weight: number, height: number): Omit<ScanRecord, 'id' | 'date'> {
  const j = (b: number, r: number) => parseFloat((b + (Math.random() - 0.5) * r).toFixed(1));
  const bmi = parseFloat((weight / Math.pow(height / 100, 2)).toFixed(1));
  const measurements: BodyMeasurement = {
    chest: j(97, 3), waist: j(82, 4), hips: j(96, 3),
    leftArm: j(36, 2), rightArm: j(36.5, 2),
    leftThigh: j(59, 3), rightThigh: j(58.5, 3),
    neck: j(38.5, 1.5), shoulders: j(123, 3),
    bodyFat: j(16.5, 2), muscleMass: j(43, 2),
  };
  return { measurements, weight, bmi, score: Math.floor(78 + Math.random() * 12) };
}

function AnimatedNumber({ value, unit, duration = 800 }: { value: number; unit?: string; duration?: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState('0');
  const colors = useColors();

  useEffect(() => {
    anim.setValue(0);
    const animation = Animated.timing(anim, {
      toValue: value, duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    animation.start();
    const listener = anim.addListener(({ value: v }) => setDisplay(v.toFixed(1)));
    return () => {
      animation.stop();
      anim.removeListener(listener);
    };
  }, [value]);

  return (
    <Text style={[styles.resultMetricValue, { color: colors.foreground }]}>
      {display}{unit}
    </Text>
  );
}

export default function ScanScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addScan, profile, previousScan } = useApp();

  const [scanState, setScanState] = useState<'idle' | 'photo' | 'scanning' | 'complete' | 'error'>('idle');
  const [photos, setPhotos] = useState<PhotoState | null>(null);
  const [progress, setProgress] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [result, setResult] = useState<Omit<ScanRecord, 'id' | 'date'> | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [isAiScan, setIsAiScan] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [hasOutlier, setHasOutlier] = useState(false);

  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const apiResultRef = useRef<Omit<ScanRecord, 'id' | 'date'> | null>(null);

  const resultSlide = useRef(new Animated.Value(SCREEN_H)).current;
  const resultOpacity = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const photoPreviewOpacity = useRef(new Animated.Value(0)).current;
  const animatedNumber = useRef(new Animated.Value(0)).current;

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 + 84 : insets.bottom + 84;

  async function requestCameraPermission(): Promise<boolean> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Sik AI needs camera access to capture your body scan photo. Please enable it in Settings.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  }

  async function takeFrontPhoto() {
    const granted = await requestCameraPermission();
    if (!granted) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: false,
      quality: 0.7,
      base64: true,
      exif: false,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setPhotos({
        frontUri: asset.uri,
        frontBase64: asset.base64 ?? '',
      });
      setScanState('photo');
      Animated.timing(photoPreviewOpacity, {
        toValue: 1, duration: 400, useNativeDriver: true,
      }).start();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }

  async function takeSidePhoto() {
    const granted = await requestCameraPermission();
    if (!granted) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: false,
      quality: 0.7,
      base64: true,
      exif: false,
    });

    if (!result.canceled && result.assets[0] && photos) {
      const asset = result.assets[0];
      setPhotos(prev => prev ? {
        ...prev,
        sideUri: asset.uri,
        sideBase64: asset.base64 ?? '',
      } : prev);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }

  type ScanAPIResult = Omit<ScanRecord, 'id' | 'date'> & { insights: string[] };

  async function callScanAPI(photoData: PhotoState): Promise<ScanAPIResult | null> {
    try {
      const body = {
        frontImage: photoData.frontBase64,
        sideImage: photoData.sideBase64 || undefined,
        profile: {
          height: profile.height,
          weight: profile.weight,
          age: profile.age,
          gender: profile.gender,
          goal: profile.goal,
        },
      };

      const response = await fetch(`${API_BASE}/api/scan/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.warn('Scan API error:', err);
        return null;
      }

      const data = await response.json();
      return {
        measurements: data.measurements,
        weight: data.weight,
        bmi: data.bmi,
        score: data.score,
        insights: data.insights ?? [],
      };
    } catch (e) {
      console.warn('Scan API fetch error:', e);
      return null;
    }
  }

  function runProgressAnimation(onComplete: () => void) {
    let p = 0;
    progressRef.current = setInterval(() => {
      // Slow at 85% — wait for API response
      const increment = p < 85
        ? 0.65 + Math.random() * 0.45
        : apiResultRef.current ? 1.5 : 0.15;

      p += increment;
      if (p >= 100) {
        p = 100;
        if (progressRef.current) clearInterval(progressRef.current);
        setProgress(100);
        setTimeout(onComplete, 300);
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

  function showResults(scanResult: Omit<ScanRecord, 'id' | 'date'>, isAI: boolean, insights: string[]) {
    if (progressRef.current) clearInterval(progressRef.current);
    if (phaseRef.current) clearInterval(phaseRef.current);
    setPhaseIndex(SCAN_PHASES.length - 1);
    setResult(scanResult);
    setAiInsights(insights);
    setIsAiScan(isAI);
    setScanState('complete');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.parallel([
      Animated.spring(resultSlide, { toValue: 0, tension: 55, friction: 12, useNativeDriver: true }),
      Animated.timing(resultOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }

  async function startScan() {
    if (!photos) return;
    setScanState('scanning');
    setProgress(0);
    setPhaseIndex(0);
    apiResultRef.current = null;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Animated.timing(headerOpacity, { toValue: 0.6, duration: 400, useNativeDriver: true }).start();

    // Start API call and animation in parallel
    const [apiResult] = await Promise.all([
      callScanAPI(photos).then(r => {
        apiResultRef.current = r;
        return r;
      }),
      // Animation runs independently — it just slows at 85% until API responds
      new Promise<void>(resolve => runProgressAnimation(resolve)),
    ]);

    // Use AI result or fall back
    const isAI = apiResult !== null;
    const insights: string[] = apiResult?.insights ?? [];
    const finalResult: Omit<ScanRecord, 'id' | 'date'> = apiResult
      ? { measurements: apiResult.measurements, weight: apiResult.weight, bmi: apiResult.bmi, score: apiResult.score }
      : fallbackResult(profile.weight, profile.height);

    // If animation finished before API (rare), show results now
    // If API finished before animation, it already released the 85% gate
    if (previousScan) {
      const waistDiff = Math.abs(finalResult.measurements.waist - previousScan.measurements.waist);
      const bfDiff = Math.abs(finalResult.measurements.bodyFat - previousScan.measurements.bodyFat);
      const wtDiff = Math.abs(finalResult.weight - previousScan.weight);
      setHasOutlier(waistDiff > 5 || bfDiff > 5 || wtDiff > 5);
    }
    showResults(finalResult, isAI, insights);
  }

  async function saveScan() {
    if (!result) return;
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
    if (progressRef.current) clearInterval(progressRef.current);
    if (phaseRef.current) clearInterval(phaseRef.current);
    setScanState('idle');
    setProgress(0);
    setPhaseIndex(0);
    setResult(null);
    setPhotos(null);
    setAiInsights([]);
    setIsAiScan(false);
    setHasOutlier(false);
    setShowChecklist(false);
    apiResultRef.current = null;
    resultSlide.setValue(SCREEN_H);
    resultOpacity.setValue(0);
    headerOpacity.setValue(1);
    photoPreviewOpacity.setValue(0);
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
          <Text style={styles.headerTitle}>Body Scan</Text>
          <Text style={styles.headerSub}>CAMERA · AI VISION · DEPTH</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.lidarPill}>
            <View style={[styles.lidarDot, {
              backgroundColor: scanState === 'scanning' ? colors.emerald : 'rgba(16,185,129,0.3)'
            }]} />
            <Text style={styles.lidarText}>
              {scanState === 'scanning' ? 'ANALYZING' : scanState === 'complete' ? 'COMPLETE' : 'READY'}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Full-screen scanner visualization */}
      <View style={styles.scanArea}>
        <LiDARScanner
          isScanning={scanState === 'scanning'}
          isIdle={scanState === 'idle' || scanState === 'photo'}
          progress={progress}
          phase={SCAN_PHASES[phaseIndex]}
        />
      </View>

      {/* Photo preview overlay (idle/photo state) */}
      {photos && (scanState === 'idle' || scanState === 'photo') && (
        <Animated.View style={[styles.photoPreviewOverlay, { opacity: photoPreviewOpacity }]}>
          <Image source={{ uri: photos.frontUri }} style={styles.photoThumb} />
          {photos.sideUri && (
            <Image source={{ uri: photos.sideUri }} style={styles.photoThumb} />
          )}
        </Animated.View>
      )}

      {/* Idle state — no photos taken yet */}
      {scanState === 'idle' && (
        <View style={[styles.footer, { paddingBottom: bottomPad }]}>
          <View style={styles.idleInstructions}>
            <Feather name="info" size={13} color="rgba(16,185,129,0.5)" />
            <Text style={styles.idleInstructionText}>
              Stand 1–2m away · Arms slightly out · Good lighting
            </Text>
          </View>
          <TouchableOpacity style={styles.cameraBtn} onPress={() => setShowChecklist(true)} activeOpacity={0.85}>
            <View style={styles.startBtnInner}>
              <Feather name="camera" size={20} color="#fff" />
              <Text style={styles.startBtnText}>Take Front Photo</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Photo taken — ready to scan + optional side photo */}
      {scanState === 'photo' && (
        <View style={[styles.footer, { paddingBottom: bottomPad }]}>
          <View style={styles.photoActions}>
            <TouchableOpacity style={styles.sidePhotoBtn} onPress={takeSidePhoto} activeOpacity={0.85}>
              <Feather name="camera" size={15} color="rgba(16,185,129,0.8)" />
              <Text style={styles.sidePhotoBtnText}>
                {photos?.sideUri ? '✓ Side Photo' : '+ Side Photo'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.retakeBtn} onPress={resetScan} activeOpacity={0.85}>
              <Feather name="refresh-ccw" size={15} color="rgba(255,255,255,0.5)" />
              <Text style={styles.retakeBtnText}>Retake</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.startBtn} onPress={startScan} activeOpacity={0.85}>
            <View style={styles.startBtnInner}>
              <Feather name="zap" size={20} color="#fff" />
              <Text style={styles.startBtnText}>Analyze with AI</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Scanning info bar */}
      {scanState === 'scanning' && (
        <View style={[styles.footer, { paddingBottom: bottomPad }]}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 12 }}>{Math.round(progress)}%</Text>
          <View style={styles.scanningBar}>
            <View style={styles.scanningBarDot}>
              <View style={[styles.pulsingDot, { backgroundColor: colors.emerald }]} />
            </View>
            <Text style={styles.scanningBarText}>AI analyzing your photo…</Text>
          </View>
        </View>
      )}

      {/* Results panel */}
      {scanState === 'complete' && result && (
        <Animated.View
          style={[styles.resultsPanel, {
            transform: [{ translateY: resultSlide }],
            opacity: resultOpacity,
          }]}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: bottomPad + 16 }}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.dragHandle} />

            {/* Outlier warning */}
            {hasOutlier && (
              <View style={styles.outlierBanner}>
                <Feather name="alert-triangle" size={13} color="#F59E0B" />
                <Text style={styles.outlierText}>
                  Large change vs last scan — double-check pose and lighting for best accuracy
                </Text>
              </View>
            )}

            {/* AI badge */}
            {isAiScan && (
              <View style={styles.aiBadgeRow}>
                <View style={styles.aiBadge}>
                  <Feather name="zap" size={11} color={colors.emerald} />
                  <Text style={styles.aiBadgeText}>AI Vision Analysis</Text>
                </View>
              </View>
            )}

            {/* Score hero */}
            <View style={styles.scoreHero}>
              <View style={[styles.scoreBadge, { borderColor: scoreColor + '50' }]}>
                <Text style={[styles.scoreNumber, { color: scoreColor }]}>{result.score}</Text>
                <Text style={styles.scoreLabel}>BODY SCORE</Text>
              </View>
              <View style={styles.scoreMeta}>
                <View style={styles.scoreMetaItem}>
                  <Text style={styles.scoreMetaValue}>{result.weight}kg</Text>
                  <Text style={styles.scoreMetaLabel}>Weight</Text>
                </View>
                <View style={styles.scoreMetaDivider} />
                <View style={styles.scoreMetaItem}>
                  <Text style={[styles.scoreMetaValue, { color: colors.emerald }]}>
                    {result.measurements.bodyFat.toFixed(1)}%
                  </Text>
                  <Text style={styles.scoreMetaLabel}>Body Fat</Text>
                </View>
                <View style={styles.scoreMetaDivider} />
                <View style={styles.scoreMetaItem}>
                  <Text style={[styles.scoreMetaValue, { color: colors.chartBlue }]}>
                    {result.measurements.muscleMass.toFixed(1)}kg
                  </Text>
                  <Text style={styles.scoreMetaLabel}>Muscle</Text>
                </View>
                <View style={styles.scoreMetaDivider} />
                <View style={styles.scoreMetaItem}>
                  <Text style={styles.scoreMetaValue}>{result.bmi}</Text>
                  <Text style={styles.scoreMetaLabel}>BMI</Text>
                </View>
              </View>
            </View>

            {/* AI Insights */}
            {aiInsights.length > 0 && (
              <View style={styles.insightsSection}>
                <Text style={styles.insightsTitle}>AI Insights</Text>
                {aiInsights.map((insight, i) => (
                  <View key={i} style={styles.insightRow}>
                    <View style={styles.insightDot} />
                    <Text style={styles.insightText}>{insight}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Measurements */}
            <View style={styles.measurementsTitleRow}>
              <Text style={styles.measurementsTitle}>All Measurements</Text>
              <View style={styles.measurementCount}>
                <Text style={styles.measurementCountText}>11 zones</Text>
              </View>
            </View>

            <View style={styles.measurementsList}>
              {SUMMARY_ROWS.map((row, i) => (
                <View
                  key={row.label}
                  style={[styles.measurementRow, i < SUMMARY_ROWS.length - 1 && styles.measurementRowBorder]}
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
                    <Text style={styles.measurementValue}>{row.value.toFixed(1)}</Text>
                    <Text style={styles.measurementUnit}>{row.unit}</Text>
                    {isAiScan && row.unit === 'cm' && (
                      <Text style={styles.confidenceText}>
                        ±{(row.value * 0.015).toFixed(1)}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>

            {/* Action buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.rescanBtn} onPress={resetScan}>
                <Feather name="refresh-ccw" size={16} color="rgba(255,255,255,0.6)" />
                <Text style={styles.rescanBtnText}>Rescan</Text>
              </TouchableOpacity>
              <Animated.View style={[styles.saveWrapper, { transform: [{ scale: btnScale }] }]}>
                <TouchableOpacity style={styles.saveBtn} onPress={saveScan} activeOpacity={0.88}>
                  <Feather name="save" size={18} color="#fff" />
                  <Text style={styles.saveBtnText}>Save Scan</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </ScrollView>
        </Animated.View>
      )}

      {/* Pre-scan checklist Modal */}
      <Modal
        visible={showChecklist}
        transparent
        animationType="slide"
        onRequestClose={() => setShowChecklist(false)}
      >
        <View style={styles.checklistOverlay}>
          <View style={styles.checklistSheet}>
            <View style={styles.checklistHandle} />
            <Text style={styles.checklistTitle}>Before You Scan</Text>
            <Text style={styles.checklistSub}>
              Follow these steps for the most accurate LiDAR measurements
            </Text>
            {CHECKLIST_ITEMS.map((item, i) => (
              <View key={i} style={styles.checklistItem}>
                <View style={styles.checklistIconWrap}>
                  <Feather name={item.icon as any} size={15} color={E} />
                </View>
                <Text style={styles.checklistItemText}>{item.text}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={styles.checklistBtn}
              onPress={() => {
                setShowChecklist(false);
                takeFrontPhoto();
              }}
              activeOpacity={0.88}
            >
              <Feather name="camera" size={18} color="#fff" />
              <Text style={styles.checklistBtnText}>I'm Ready — Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.checklistSkip}
              onPress={() => setShowChecklist(false)}
            >
              <Text style={styles.checklistSkipText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const E = '#10B981';
const CARD = '#111814';
const BORDER = '#1e2e26';

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    paddingHorizontal: 20, paddingBottom: 10,
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  headerSub: { fontSize: 9, fontWeight: '600', color: 'rgba(16,185,129,0.5)', letterSpacing: 1.5, marginTop: 2 },
  headerRight: { alignItems: 'flex-end' },
  lidarPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(16,185,129,0.08)', borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  lidarDot: { width: 5, height: 5, borderRadius: 2.5 },
  lidarText: { fontSize: 9, fontWeight: '800', color: E, letterSpacing: 1.2 },
  scanArea: { flex: 1 },

  // Photo preview
  photoPreviewOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'flex-end', alignItems: 'flex-start',
    paddingLeft: 16, paddingBottom: 180, gap: 8, flexDirection: 'row',
    paddingHorizontal: 16, pointerEvents: 'none',
  },
  photoThumb: {
    width: 70, height: 100, borderRadius: 12,
    borderWidth: 1.5, borderColor: E + '60',
    opacity: 0.85,
  },

  // Footer
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingTop: 12, gap: 10,
  },
  idleInstructions: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  idleInstructionText: { fontSize: 11, color: 'rgba(16,185,129,0.5)', textAlign: 'center', fontWeight: '500' },
  cameraBtn: {
    borderRadius: 18, overflow: 'hidden', backgroundColor: E,
    shadowColor: E, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 8,
  },
  startBtn: {
    borderRadius: 18, overflow: 'hidden', backgroundColor: E,
    shadowColor: E, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 8,
  },
  startBtnInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 17,
  },
  startBtnText: { fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: -0.2 },

  // Photo state actions
  photoActions: { flexDirection: 'row', gap: 10 },
  sidePhotoBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 13, borderRadius: 14,
    backgroundColor: 'rgba(16,185,129,0.08)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)',
  },
  sidePhotoBtnText: { fontSize: 13, fontWeight: '600', color: 'rgba(16,185,129,0.9)' },
  retakeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 13, paddingHorizontal: 18, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: BORDER,
  },
  retakeBtnText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.5)' },

  // Scanning
  scanningBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingVertical: 14, borderRadius: 14,
    backgroundColor: 'rgba(16,185,129,0.06)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.15)',
  },
  scanningBarDot: { alignItems: 'center', justifyContent: 'center' },
  pulsingDot: { width: 7, height: 7, borderRadius: 3.5 },
  scanningBarText: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.6)' },

  // Results panel
  resultsPanel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: SCREEN_H * 0.78, backgroundColor: CARD,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderTopWidth: 1, borderColor: BORDER, overflow: 'hidden',
  },
  dragHandle: {
    width: 36, height: 4, backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 6,
  },

  // AI badge
  aiBadgeRow: { alignItems: 'center', marginBottom: 4 },
  aiBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(16,185,129,0.1)', paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)',
  },
  aiBadgeText: { fontSize: 11, fontWeight: '700', color: E, letterSpacing: 0.5 },

  // Score hero
  scoreHero: { paddingHorizontal: 20, paddingVertical: 14, alignItems: 'center', gap: 14 },
  scoreBadge: {
    alignItems: 'center', borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 32, paddingVertical: 14, backgroundColor: 'rgba(16,185,129,0.06)',
  },
  scoreNumber: { fontSize: 56, fontWeight: '900', letterSpacing: -2, lineHeight: 60 },
  scoreLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.35)', letterSpacing: 2.5, marginTop: 2 },
  scoreMeta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, borderWidth: 1,
    borderColor: BORDER, paddingVertical: 12, paddingHorizontal: 8, width: '100%', gap: 0,
  },
  scoreMetaItem: { flex: 1, alignItems: 'center', gap: 4 },
  scoreMetaValue: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  scoreMetaLabel: { fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: '500' },
  scoreMetaDivider: { width: 1, height: 32, backgroundColor: BORDER },

  // AI Insights
  insightsSection: {
    marginHorizontal: 16, marginBottom: 12, padding: 14,
    backgroundColor: 'rgba(16,185,129,0.05)', borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(16,185,129,0.15)',
  },
  insightsTitle: { fontSize: 12, fontWeight: '700', color: E, letterSpacing: 1, marginBottom: 10 },
  insightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  insightDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: E, marginTop: 5, flexShrink: 0 },
  insightText: { fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 18, flex: 1 },

  // Measurements
  measurementsTitleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, marginBottom: 8,
  },
  measurementsTitle: { fontSize: 15, fontWeight: '700', color: '#fff', letterSpacing: -0.2 },
  measurementCount: { backgroundColor: 'rgba(16,185,129,0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  measurementCountText: { fontSize: 10, fontWeight: '700', color: E },
  measurementsList: {
    marginHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: BORDER,
    backgroundColor: 'rgba(255,255,255,0.02)', overflow: 'hidden', marginBottom: 16,
  },
  measurementRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 11,
  },
  measurementRowBorder: { borderBottomWidth: 1, borderBottomColor: BORDER },
  measurementRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  measurementDot: { width: 22, height: 22, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  measurementDotInner: { width: 7, height: 7, borderRadius: 3.5 },
  measurementLabel: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.75)' },
  measurementValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  measurementValue: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: -0.3 },
  measurementUnit: { fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: '500' },
  resultMetricValue: { fontSize: 16, fontWeight: '700' },

  // Action buttons
  actionButtons: { flexDirection: 'row', gap: 10, paddingHorizontal: 16 },
  rescanBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 15, paddingHorizontal: 20, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: BORDER,
  },
  rescanBtnText: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
  saveWrapper: { flex: 1 },
  saveBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 15, borderRadius: 16, backgroundColor: E,
    shadowColor: E, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 14, elevation: 8,
  },
  saveBtnText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: -0.2 },

  // Confidence score
  confidenceText: { fontSize: 10, color: 'rgba(16,185,129,0.65)', fontWeight: '600', marginLeft: 2 },

  // Outlier banner
  outlierBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginBottom: 10, padding: 10,
    backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)',
  },
  outlierText: { flex: 1, fontSize: 12, color: 'rgba(245,158,11,0.9)', lineHeight: 17 },

  // Checklist modal
  checklistOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  checklistSheet: {
    backgroundColor: '#111814', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderTopWidth: 1, borderColor: BORDER,
    padding: 24, paddingBottom: 36, gap: 12,
  },
  checklistHandle: {
    width: 36, height: 4, backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 2, alignSelf: 'center', marginBottom: 8,
  },
  checklistTitle: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.5, textAlign: 'center' },
  checklistSub: { fontSize: 13, color: 'rgba(255,255,255,0.45)', textAlign: 'center', marginBottom: 4, lineHeight: 19 },
  checklistItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: BORDER,
  },
  checklistIconWrap: {
    width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(16,185,129,0.1)',
  },
  checklistItemText: { flex: 1, fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 19 },
  checklistBtn: {
    marginTop: 8, borderRadius: 16, backgroundColor: E,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingVertical: 16,
    shadowColor: E, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 8,
  },
  checklistBtnText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: -0.2 },
  checklistSkip: { alignItems: 'center', paddingVertical: 6 },
  checklistSkipText: { fontSize: 14, color: 'rgba(255,255,255,0.3)' },
});
