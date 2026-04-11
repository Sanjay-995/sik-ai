import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, {
  Defs, Rect, RadialGradient, LinearGradient, Stop, Line,
} from 'react-native-svg';

const { width: W, height: H } = Dimensions.get('window');

// Pre-generate pixel noise positions (static pattern)
const NOISE_PIXELS: { x: number; y: number; opacity: number; size: number }[] = [];
for (let i = 0; i < 380; i++) {
  NOISE_PIXELS.push({
    x: Math.random() * W,
    y: Math.random() * H,
    opacity: Math.random() * 0.12 + 0.02,
    size: Math.random() < 0.7 ? 1 : 1.5,
  });
}

// Scan line positions (subtle horizontal bands)
const SCAN_LINES: number[] = [];
for (let y = 0; y < H; y += 3) {
  SCAN_LINES.push(y);
}

interface CameraBackgroundProps {
  isScanning: boolean;
  isIdle: boolean;
}

export function CameraBackground({ isScanning, isIdle }: CameraBackgroundProps) {
  const grainAnim = useRef(new Animated.Value(0)).current;
  const vignetteAnim = useRef(new Animated.Value(0.5)).current;
  const grainShift = useRef(new Animated.Value(0)).current;
  const flickerAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Continuously animate grain shift (makes noise feel alive)
    const grainLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(grainShift, {
          toValue: 1,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(grainShift, {
          toValue: 0,
          duration: 80,
          useNativeDriver: true,
        }),
      ])
    );
    grainLoop.start();

    if (isScanning) {
      // Brighter vignette opening during scan
      Animated.timing(vignetteAnim, {
        toValue: 0.72,
        duration: 800,
        useNativeDriver: false,
      }).start();

      // Occasional camera flicker
      const flickerLoop = Animated.loop(
        Animated.sequence([
          Animated.delay(2000 + Math.random() * 3000),
          Animated.timing(flickerAnim, { toValue: 0.88, duration: 60, useNativeDriver: true }),
          Animated.timing(flickerAnim, { toValue: 1, duration: 60, useNativeDriver: true }),
          Animated.timing(flickerAnim, { toValue: 0.93, duration: 40, useNativeDriver: true }),
          Animated.timing(flickerAnim, { toValue: 1, duration: 60, useNativeDriver: true }),
        ])
      );
      flickerLoop.start();
    } else {
      Animated.timing(vignetteAnim, {
        toValue: 0.5,
        duration: 600,
        useNativeDriver: false,
      }).start();
    }

    return () => {
      grainLoop.stop();
    };
  }, [isScanning, isIdle]);

  // Translate grain slightly each frame to simulate noise animation
  const grainTranslate = grainShift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 4],
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: flickerAnim }]}>
      {/* Camera base — deep dark with slight green warmth */}
      <View style={styles.cameraBase} />

      {/* Noise / grain layer — SVG static pixel field */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [
              { translateX: grainTranslate },
              { translateY: grainShift.interpolate({ inputRange: [0, 1], outputRange: [0, 3] }) },
            ],
          },
        ]}
        pointerEvents="none"
      >
        <Svg width={W + 8} height={H + 8} style={StyleSheet.absoluteFill}>
          {/* Static noise pixels */}
          {NOISE_PIXELS.map((px, i) => (
            <Rect
              key={`n${i}`}
              x={px.x}
              y={px.y}
              width={px.size}
              height={px.size}
              fill={`rgba(255,255,255,${px.opacity})`}
            />
          ))}
          {/* Second noise layer offset for denser grain */}
          {NOISE_PIXELS.slice(0, 180).map((px, i) => (
            <Rect
              key={`n2${i}`}
              x={(px.x + W * 0.33) % W}
              y={(px.y + H * 0.2) % H}
              width={1}
              height={1}
              fill={`rgba(16,185,129,${px.opacity * 0.4})`}
            />
          ))}
        </Svg>
      </Animated.View>

      {/* Horizontal scan lines */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
          {SCAN_LINES.map((y, i) => (
            <Line
              key={`sl${i}`}
              x1={0} y1={y}
              x2={W} y2={y}
              stroke="rgba(0,0,0,0.18)"
              strokeWidth={1}
            />
          ))}
        </Svg>
      </View>

      {/* Vignette — radial dark gradient from edges inward */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient
              id="vignette"
              cx="50%" cy="50%"
              rx="60%" ry="55%"
            >
              <Stop offset="0%" stopColor="transparent" stopOpacity={0} />
              <Stop offset="60%" stopColor="#000" stopOpacity={0.15} />
              <Stop offset="100%" stopColor="#000" stopOpacity={0.82} />
            </RadialGradient>
          </Defs>
          <Rect width={W} height={H} fill="url(#vignette)" />
        </Svg>
      </View>

      {/* Top & bottom gradient fade (letterbox-style darkening) */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="topFade" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#000" stopOpacity={0.55} />
              <Stop offset="0.18" stopColor="#000" stopOpacity={0} />
              <Stop offset="0.82" stopColor="#000" stopOpacity={0} />
              <Stop offset="1" stopColor="#000" stopOpacity={0.6} />
            </LinearGradient>
          </Defs>
          <Rect width={W} height={H} fill="url(#topFade)" />
        </Svg>
      </View>

      {/* Subtle green night-vision tint overlay */}
      {isScanning && (
        <View
          style={[StyleSheet.absoluteFill, styles.nightVisionTint]}
          pointerEvents="none"
        />
      )}

      {/* Corner lens aberration — subtle colored fringe at corners */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="cornerAberr" cx="50%" cy="50%" rx="52%" ry="48%">
              <Stop offset="0%" stopColor="transparent" stopOpacity={0} />
              <Stop offset="90%" stopColor="transparent" stopOpacity={0} />
              <Stop offset="100%" stopColor="rgba(10,40,20)" stopOpacity={0.3} />
            </RadialGradient>
          </Defs>
          <Rect width={W} height={H} fill="url(#cornerAberr)" />
        </Svg>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cameraBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#060c08',
  },
  nightVisionTint: {
    backgroundColor: 'rgba(8,28,15,0.12)',
  },
});
