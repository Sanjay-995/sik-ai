import React, { useEffect, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions, Easing
} from 'react-native';
import Svg, {
  Circle, Line, G, Defs, LinearGradient, Stop, Rect,
} from 'react-native-svg';
import { useColors } from '@/hooks/useColors';
import { CameraBackground } from './CameraBackground';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Body geometry helpers ───────────────────────────────────────────────────
// All coordinates in a 200×360 body-local space.
// bodyOffsetX/Y places this inside the SVG viewBox.

function isInsideBody(x: number, y: number): boolean {
  // Head (ellipse)
  const hx = (x - 100) / 21, hy = (y - 28) / 25;
  if (hx * hx + hy * hy <= 1) return true;
  // Neck
  if (y >= 51 && y <= 64 && x >= 87 && x <= 113) return true;
  // Torso (trapezoid with waist narrowing)
  if (y >= 64 && y <= 200) {
    const t = (y - 64) / (200 - 64);
    // Shoulder width ~82px, hip width ~92px, waist ~70px at t≈0.5
    const halfW = 41 + t * 5 - Math.sin(t * Math.PI) * 10;
    if (Math.abs(x - 100) <= halfW) return true;
  }
  // Left arm
  if (y >= 68 && y <= 170) {
    const t = (y - 68) / (170 - 68);
    const cx = 50 - t * 10;
    const hw = 11 - t * 2.5;
    if (Math.abs(x - cx) <= hw) return true;
  }
  // Right arm
  if (y >= 68 && y <= 170) {
    const t = (y - 68) / (170 - 68);
    const cx = 150 + t * 10;
    const hw = 11 - t * 2.5;
    if (Math.abs(x - cx) <= hw) return true;
  }
  // Left thigh
  if (y >= 200 && y <= 290) {
    const t = (y - 200) / (290 - 200);
    const cx = 78 + t * 3;
    const hw = 18 - t * 4;
    if (Math.abs(x - cx) <= hw) return true;
  }
  // Right thigh
  if (y >= 200 && y <= 290) {
    const t = (y - 200) / (290 - 200);
    const cx = 122 - t * 3;
    const hw = 18 - t * 4;
    if (Math.abs(x - cx) <= hw) return true;
  }
  // Left calf
  if (y >= 290 && y <= 356) {
    const t = (y - 290) / (356 - 290);
    const cx = 72 + t * 2;
    const hw = 12 - t * 5;
    if (Math.abs(x - cx) <= Math.max(hw, 4)) return true;
  }
  // Right calf
  if (y >= 290 && y <= 356) {
    const t = (y - 290) / (356 - 290);
    const cx = 128 - t * 2;
    const hw = 12 - t * 5;
    if (Math.abs(x - cx) <= Math.max(hw, 4)) return true;
  }
  return false;
}

// ─── Pre-generate point cloud at module load (runs once) ─────────────────────
// Use a seeded-looking RNG for deterministic jitter
function mulberry32(a: number) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

type CloudDot = { x: number; y: number; r: number; opacity: number };

function generateBodyCloud(): CloudDot[] {
  const rng = mulberry32(0xdeadbeef);
  const dots: CloudDot[] = [];
  const SPACING = 4.5; // grid spacing → ~550-650 dots
  for (let gy = 2; gy <= 358; gy += SPACING) {
    for (let gx = 20; gx <= 180; gx += SPACING) {
      // Small jitter on each grid point so it feels organic
      const jx = gx + (rng() - 0.5) * 3.5;
      const jy = gy + (rng() - 0.5) * 3.5;
      if (isInsideBody(jx, jy)) {
        const roll = rng();
        dots.push({
          x: jx,
          y: jy,
          r: roll < 0.08 ? 2.4 : roll < 0.28 ? 1.8 : 1.2,
          opacity: 0.55 + rng() * 0.45,
        });
      }
    }
  }
  // Sort top → bottom so progress-based reveal flows naturally
  dots.sort((a, b) => a.y - b.y);
  return dots;
}

const BODY_CLOUD = generateBodyCloud();
const BODY_MAX_Y = 358;

// ─── Measurement brackets ─────────────────────────────────────────────────────
const MEASURE_ZONES = [
  { key: 'neck',      label: 'Neck',      y: 62,  x1: 86,  x2: 114, triggerAt: 0.12 },
  { key: 'shoulders', label: 'Shoulders', y: 78,  x1: 40,  x2: 160, triggerAt: 0.18 },
  { key: 'chest',     label: 'Chest',     y: 108, x1: 52,  x2: 148, triggerAt: 0.30 },
  { key: 'waist',     label: 'Waist',     y: 152, x1: 56,  x2: 144, triggerAt: 0.46 },
  { key: 'hips',      label: 'Hips',      y: 192, x1: 46,  x2: 154, triggerAt: 0.58 },
  { key: 'arm',       label: 'Arm',       y: 130, x1: 28,  x2: 50,  triggerAt: 0.36 },
  { key: 'thigh',     label: 'Thigh',     y: 250, x1: 50,  x2: 92,  triggerAt: 0.72 },
];

const AnimatedLine = Animated.createAnimatedComponent(Line);

// ─── SVG dimensions ───────────────────────────────────────────────────────────
const SVG_W = 340;
const SVG_H = 520;
const BODY_OX = (SVG_W - 200) / 2; // = 70
const BODY_OY = 60;
const SCAN_H = 380; // pixel range of scan sweep

// ─── Component ────────────────────────────────────────────────────────────────
interface LiDARScannerProps {
  isScanning: boolean;
  isIdle: boolean;
  progress: number; // 0-100
  phase: string;
}

export function LiDARScanner({ isScanning, isIdle, progress, phase }: LiDARScannerProps) {
  const colors = useColors();
  const E = colors.emerald;

  // ── Shared animations ──
  const scanLineY    = useRef(new Animated.Value(0)).current;
  const scanLineOp   = useRef(new Animated.Value(0)).current;
  const cornerPulse  = useRef(new Animated.Value(1)).current;
  const gridFade     = useRef(new Animated.Value(0)).current;
  const hudFlicker   = useRef(new Animated.Value(1)).current;

  // Per-zone bracket animations
  const zoneAnims = useRef(MEASURE_ZONES.map(() => new Animated.Value(0))).current;

  // HUD state (string updates only, no native driver)
  const [liveReadout, setLiveReadout] = React.useState('0000.00');
  const [depthValue,  setDepthValue]  = React.useState('0.000m');
  const [signalBars,  setSignalBars]  = React.useState(0);
  const readoutRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Point cloud: derive visible dots directly from progress prop ──
  // revealedY is the Y threshold in body-local coords (0–358)
  const revealedY = isScanning
    ? (progress / 100) * BODY_MAX_Y
    : progress >= 100
    ? BODY_MAX_Y
    : -1;
  // "glow zone" — dots within this many units below scan line get extra brightness
  const GLOW_BAND = 20;

  useEffect(() => {
    if (isScanning) {
      // Grid fade in
      Animated.timing(gridFade, { toValue: 1, duration: 500, useNativeDriver: true }).start();

      // Scan beam sweep
      scanLineOp.setValue(1);
      const sweep = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineY, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true }),
          Animated.timing(scanLineY, { toValue: 0, duration: 2000, easing: Easing.linear, useNativeDriver: true }),
        ])
      );
      sweep.start();

      // Corner brackets pulse
      const bracketLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(cornerPulse, { toValue: 1.012, duration: 1100, useNativeDriver: true }),
          Animated.timing(cornerPulse, { toValue: 1,     duration: 1100, useNativeDriver: true }),
        ])
      );
      bracketLoop.start();

      // HUD flicker
      const flickerLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(hudFlicker, { toValue: 0.82, duration: 70,  useNativeDriver: true }),
          Animated.timing(hudFlicker, { toValue: 1,    duration: 70,  useNativeDriver: true }),
          Animated.delay(2800),
        ])
      );
      flickerLoop.start();

      // Zone bracket reveals
      MEASURE_ZONES.forEach((zone, i) => {
        Animated.sequence([
          Animated.delay(zone.triggerAt * 10500),
          Animated.timing(zoneAnims[i], { toValue: 1, duration: 380, useNativeDriver: false }),
        ]).start();
      });

      // HUD data ticker
      readoutRef.current = setInterval(() => {
        setLiveReadout((Math.random() * 9999).toFixed(2).padStart(7, '0'));
        setDepthValue(`${(Math.random() * 1.8 + 0.5).toFixed(3)}m`);
        setSignalBars(Math.floor(Math.random() * 2) + 3);
      }, 110);

      return () => {
        sweep.stop();
        bracketLoop.stop();
        flickerLoop.stop();
        if (readoutRef.current) clearInterval(readoutRef.current);
        scanLineOp.setValue(0);
        scanLineY.setValue(0);
        gridFade.setValue(0);
        cornerPulse.setValue(1);
        hudFlicker.setValue(1);
        zoneAnims.forEach(a => a.setValue(0));
      };
    } else if (isIdle) {
      const idleBracket = Animated.loop(
        Animated.sequence([
          Animated.timing(cornerPulse, { toValue: 1.018, duration: 1400, useNativeDriver: true }),
          Animated.timing(cornerPulse, { toValue: 1,     duration: 1400, useNativeDriver: true }),
        ])
      );
      idleBracket.start();
      return () => idleBracket.stop();
    }
  }, [isScanning, isIdle]);

  const beamTranslate = scanLineY.interpolate({
    inputRange: [0, 1],
    outputRange: [BODY_OY, BODY_OY + SCAN_H],
  });

  return (
    <View style={styles.container}>
      {/* ── Camera background ── */}
      <CameraBackground isScanning={isScanning} isIdle={isIdle} />

      {/* ── AR grid overlay (fades in when scanning) ── */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: gridFade }]} pointerEvents="none">
        <Svg width={SCREEN_W} height={SCREEN_H} style={StyleSheet.absoluteFill}>
          {Array.from({ length: 22 }).map((_, i) => (
            <Line key={`gh${i}`} x1={0} y1={(SCREEN_H / 22) * i} x2={SCREEN_W} y2={(SCREEN_H / 22) * i}
              stroke="rgba(16,185,129,0.055)" strokeWidth={0.5} />
          ))}
          {Array.from({ length: 15 }).map((_, i) => (
            <Line key={`gv${i}`} x1={(SCREEN_W / 15) * i} y1={0} x2={(SCREEN_W / 15) * i} y2={SCREEN_H}
              stroke="rgba(16,185,129,0.055)" strokeWidth={0.5} />
          ))}
        </Svg>
      </Animated.View>

      {/* ── Main scanner SVG ── */}
      <Animated.View style={[styles.svgWrap, { transform: [{ scale: cornerPulse }] }]}>
        <Svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
          <Defs>
            <LinearGradient id="bodyG" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={E} stopOpacity={0.18} />
              <Stop offset="1" stopColor={E} stopOpacity={0.04} />
            </LinearGradient>
          </Defs>

          {/* Body silhouette ghost — always faintly visible */}
          <G transform={`translate(${BODY_OX},${BODY_OY})`}>
            <Circle cx={100} cy={28} r={23} fill={E} opacity={0.03} />
            {/* Torso ghost */}
            <Rect x={58} y={64} width={84} height={136} rx={12} fill={E} opacity={0.025} />
          </G>

          {/* ── POINT CLOUD ── */}
          <G transform={`translate(${BODY_OX},${BODY_OY})`}>
            {BODY_CLOUD.map((dot, i) => {
              const revealed = dot.y <= revealedY;
              const inGlow   = revealed && (revealedY - dot.y) < GLOW_BAND;
              if (!revealed && !isScanning) return null;
              if (!revealed) return null;
              const opacity = inGlow
                ? Math.min(1, dot.opacity + 0.3)
                : dot.opacity * 0.88;
              const r = inGlow ? dot.r * 1.5 : dot.r;
              return (
                <G key={i}>
                  {/* Glow halo for recently revealed dots */}
                  {inGlow && (
                    <Circle
                      cx={dot.x} cy={dot.y}
                      r={r * 2.2}
                      fill={E}
                      opacity={0.15}
                    />
                  )}
                  <Circle
                    cx={dot.x} cy={dot.y}
                    r={r}
                    fill={E}
                    opacity={opacity}
                  />
                </G>
              );
            })}
          </G>

          {/* ── Measurement brackets ── */}
          {MEASURE_ZONES.map((zone, i) => (
            <G key={zone.key} transform={`translate(${BODY_OX},${BODY_OY})`}>
              {/* Left tick */}
              <AnimatedLine x1={zone.x1-9} y1={zone.y} x2={zone.x1+3} y2={zone.y}
                stroke={E} strokeWidth={1.8} opacity={zoneAnims[i] as any} />
              <AnimatedLine x1={zone.x1-9} y1={zone.y-5} x2={zone.x1-9} y2={zone.y+5}
                stroke={E} strokeWidth={1.8} opacity={zoneAnims[i] as any} />
              {/* Right tick */}
              <AnimatedLine x1={zone.x2-3} y1={zone.y} x2={zone.x2+9} y2={zone.y}
                stroke={E} strokeWidth={1.8} opacity={zoneAnims[i] as any} />
              <AnimatedLine x1={zone.x2+9} y1={zone.y-5} x2={zone.x2+9} y2={zone.y+5}
                stroke={E} strokeWidth={1.8} opacity={zoneAnims[i] as any} />
              {/* Dashed center bridge */}
              {[0.12, 0.35, 0.5, 0.65, 0.88].map(t => {
                const lx = zone.x1 + t * (zone.x2 - zone.x1);
                return (
                  <AnimatedLine key={t} x1={lx-3.5} y1={zone.y} x2={lx+3.5} y2={zone.y}
                    stroke={E} strokeWidth={0.7}
                    opacity={zoneAnims[i].interpolate({ inputRange: [0,1], outputRange: [0, 0.28] }) as any}
                  />
                );
              })}
              {/* Endpoint glowing dots */}
              <AnimatedLine x1={zone.x1-9} y1={zone.y} x2={zone.x1-9} y2={zone.y}
                stroke={E} strokeWidth={5}
                opacity={zoneAnims[i].interpolate({ inputRange: [0,1], outputRange: [0, 0.6] }) as any}
                strokeLinecap="round"
              />
              <AnimatedLine x1={zone.x2+9} y1={zone.y} x2={zone.x2+9} y2={zone.y}
                stroke={E} strokeWidth={5}
                opacity={zoneAnims[i].interpolate({ inputRange: [0,1], outputRange: [0, 0.6] }) as any}
                strokeLinecap="round"
              />
            </G>
          ))}

          {/* ── Corner targeting brackets ── */}
          {/* TL */}
          <G>
            <Line x1={18} y1={18} x2={18} y2={58} stroke={E} strokeWidth={2.5} strokeLinecap="round" />
            <Line x1={18} y1={18} x2={58} y2={18} stroke={E} strokeWidth={2.5} strokeLinecap="round" />
            <Circle cx={18} cy={18} r={3.5} fill={E} opacity={0.55} />
          </G>
          {/* TR */}
          <G>
            <Line x1={SVG_W-18} y1={18} x2={SVG_W-18} y2={58}    stroke={E} strokeWidth={2.5} strokeLinecap="round" />
            <Line x1={SVG_W-18} y1={18} x2={SVG_W-58} y2={18}    stroke={E} strokeWidth={2.5} strokeLinecap="round" />
            <Circle cx={SVG_W-18} cy={18} r={3.5} fill={E} opacity={0.55} />
          </G>
          {/* BL */}
          <G>
            <Line x1={18} y1={SVG_H-18} x2={18} y2={SVG_H-58}    stroke={E} strokeWidth={2.5} strokeLinecap="round" />
            <Line x1={18} y1={SVG_H-18} x2={58} y2={SVG_H-18}    stroke={E} strokeWidth={2.5} strokeLinecap="round" />
            <Circle cx={18} cy={SVG_H-18} r={3.5} fill={E} opacity={0.55} />
          </G>
          {/* BR */}
          <G>
            <Line x1={SVG_W-18} y1={SVG_H-18} x2={SVG_W-18} y2={SVG_H-58} stroke={E} strokeWidth={2.5} strokeLinecap="round" />
            <Line x1={SVG_W-18} y1={SVG_H-18} x2={SVG_W-58} y2={SVG_H-18} stroke={E} strokeWidth={2.5} strokeLinecap="round" />
            <Circle cx={SVG_W-18} cy={SVG_H-18} r={3.5} fill={E} opacity={0.55} />
          </G>

          {/* Side tick marks */}
          <Line x1={18} y1={SVG_H/2} x2={32} y2={SVG_H/2} stroke={E} strokeWidth={1.5} opacity={0.4} />
          <Line x1={SVG_W-18} y1={SVG_H/2} x2={SVG_W-32} y2={SVG_H/2} stroke={E} strokeWidth={1.5} opacity={0.4} />

          {/* Center crosshair */}
          <Circle cx={SVG_W/2} cy={BODY_OY+180} r={20} fill="none" stroke={E} strokeWidth={0.6} opacity={0.18} />
          <Circle cx={SVG_W/2} cy={BODY_OY+180} r={7}  fill="none" stroke={E} strokeWidth={1}   opacity={0.35} />
          <Circle cx={SVG_W/2} cy={BODY_OY+180} r={2}  fill={E}               opacity={0.65} />
          <Line x1={SVG_W/2-28} y1={BODY_OY+180} x2={SVG_W/2-10} y2={BODY_OY+180} stroke={E} strokeWidth={0.8} opacity={0.35} />
          <Line x1={SVG_W/2+10} y1={BODY_OY+180} x2={SVG_W/2+28} y2={BODY_OY+180} stroke={E} strokeWidth={0.8} opacity={0.35} />
          <Line x1={SVG_W/2} y1={BODY_OY+152} x2={SVG_W/2} y2={BODY_OY+170} stroke={E} strokeWidth={0.8} opacity={0.35} />
          <Line x1={SVG_W/2} y1={BODY_OY+190} x2={SVG_W/2} y2={BODY_OY+208} stroke={E} strokeWidth={0.8} opacity={0.35} />
        </Svg>

        {/* ── Scan beam overlay ── */}
        {isScanning && (
          <Animated.View
            style={[
              styles.scanBeam,
              {
                left: BODY_OX - 12,
                width: 224,
                opacity: scanLineOp,
                transform: [{ translateY: beamTranslate }],
              },
            ]}
          >
            <View style={styles.scanBeamCore} />
            <View style={styles.scanBeamGlowTop} />
            <View style={styles.scanBeamGlowBot} />
          </Animated.View>
        )}
      </Animated.View>

      {/* ── HUD: top-left ── */}
      {isScanning && (
        <Animated.View style={[styles.hudTL, { opacity: hudFlicker }]}>
          <Text style={styles.hudLabel}>DEPTH</Text>
          <Text style={styles.hudVal}>{depthValue}</Text>
          <Text style={[styles.hudLabel, { marginTop: 8 }]}>PT·ID</Text>
          <Text style={styles.hudValSm}>{liveReadout}</Text>
        </Animated.View>
      )}

      {/* ── HUD: top-right signal ── */}
      {isScanning && (
        <Animated.View style={[styles.hudTR, { opacity: hudFlicker }]}>
          <Text style={styles.hudLabel}>SIGNAL</Text>
          <View style={styles.bars}>
            {[1,2,3,4,5].map(b => (
              <View key={b} style={[styles.bar, {
                height: 4 + b * 3,
                backgroundColor: b <= signalBars ? E : 'rgba(16,185,129,0.12)',
              }]} />
            ))}
          </View>
          <Text style={styles.hudValSm}>LiDAR ON</Text>
        </Animated.View>
      )}

      {/* ── HUD: point count ── */}
      {isScanning && (
        <Animated.View style={[styles.hudPtCount, { opacity: hudFlicker }]}>
          <Text style={styles.hudLabel}>PTS MAPPED</Text>
          <Text style={styles.hudVal}>
            {Math.floor((progress / 100) * BODY_CLOUD.length).toString().padStart(4, '0')}
          </Text>
        </Animated.View>
      )}

      {/* ── Progress bar ── */}
      {isScanning && (
        <View style={styles.progressSection}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: E }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressPct, { color: E }]}>{Math.round(progress)}%</Text>
            <Text style={styles.progressStatus}>{phase}</Text>
          </View>
        </View>
      )}

      {/* ── Idle label ── */}
      {isIdle && (
        <View style={styles.idlePrompt}>
          <View style={[styles.idleDot, { backgroundColor: E }]} />
          <Text style={styles.idleText}>READY TO SCAN</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgWrap: {
    width: SVG_W,
    height: SVG_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Scan beam — 3-layer glow effect
  scanBeam: {
    position: 'absolute',
    top: 0,
    height: 44,
  },
  scanBeamCore: {
    position: 'absolute',
    left: 0, right: 0,
    top: 21, height: 2,
    backgroundColor: '#10B981',
    opacity: 0.95,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  scanBeamGlowTop: {
    position: 'absolute',
    left: 0, right: 0,
    top: 0, height: 22,
    backgroundColor: 'rgba(16,185,129,0.07)',
  },
  scanBeamGlowBot: {
    position: 'absolute',
    left: 0, right: 0,
    bottom: 0, height: 22,
    backgroundColor: 'rgba(16,185,129,0.07)',
  },
  // HUD elements
  hudTL: {
    position: 'absolute',
    top: 16, left: 16,
  },
  hudTR: {
    position: 'absolute',
    top: 16, right: 16,
    alignItems: 'flex-end',
  },
  hudPtCount: {
    position: 'absolute',
    bottom: 56, left: 20,
  },
  hudLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: 'rgba(16,185,129,0.45)',
    letterSpacing: 1.4,
  },
  hudVal: {
    fontSize: 17,
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: 0.4,
  },
  hudValSm: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
    letterSpacing: 0.4,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    marginVertical: 5,
  },
  bar: {
    width: 5,
    borderRadius: 2,
  },
  // Progress bar
  progressSection: {
    position: 'absolute',
    bottom: 16,
    left: 20, right: 20,
    gap: 6,
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: 'rgba(16,185,129,0.1)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressPct: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  progressStatus: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(16,185,129,0.65)',
    letterSpacing: 0.4,
  },
  // Idle
  idlePrompt: {
    position: 'absolute',
    bottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  idleDot: {
    width: 6, height: 6,
    borderRadius: 3,
    opacity: 0.8,
  },
  idleText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(16,185,129,0.55)',
    letterSpacing: 2.2,
  },
});
