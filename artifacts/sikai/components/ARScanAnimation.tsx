import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { Line, Rect, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useColors } from '@/hooks/useColors';

const { width, height } = Dimensions.get('window');

interface ARScanAnimationProps {
  isScanning: boolean;
  progress: number;
  phase: string;
}

export function ARScanAnimation({ isScanning, progress, phase }: ARScanAnimationProps) {
  const colors = useColors();
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const gridOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isScanning) {
      Animated.loop(
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.timing(gridOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      scanLineAnim.setValue(0);
      pulseAnim.setValue(1);
      gridOpacity.setValue(0);
    }
  }, [isScanning]);

  const scanLineY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, height * 0.65],
  });

  const scanBoxSize = 220;

  return (
    <View style={styles.container}>
      {/* Corner brackets */}
      <Animated.View style={[styles.scanBox, {
        width: scanBoxSize,
        height: scanBoxSize * 1.6,
        transform: [{ scale: pulseAnim }],
      }]}>
        {/* TL */}
        <View style={[styles.corner, styles.cornerTL, { borderColor: colors.emerald }]} />
        {/* TR */}
        <View style={[styles.corner, styles.cornerTR, { borderColor: colors.emerald }]} />
        {/* BL */}
        <View style={[styles.corner, styles.cornerBL, { borderColor: colors.emerald }]} />
        {/* BR */}
        <View style={[styles.corner, styles.cornerBR, { borderColor: colors.emerald }]} />

        {/* Grid overlay */}
        <Animated.View style={[styles.gridOverlay, { opacity: gridOpacity }]}>
          <Svg width={scanBoxSize} height={scanBoxSize * 1.6}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Line
                key={`h${i}`}
                x1={0}
                y1={(scanBoxSize * 1.6 / 8) * i}
                x2={scanBoxSize}
                y2={(scanBoxSize * 1.6 / 8) * i}
                stroke="rgba(16,185,129,0.12)"
                strokeWidth={0.5}
              />
            ))}
            {Array.from({ length: 6 }).map((_, i) => (
              <Line
                key={`v${i}`}
                x1={(scanBoxSize / 6) * i}
                y1={0}
                x2={(scanBoxSize / 6) * i}
                y2={scanBoxSize * 1.6}
                stroke="rgba(16,185,129,0.12)"
                strokeWidth={0.5}
              />
            ))}
            {/* Center crosshair */}
            <Circle cx={scanBoxSize / 2} cy={scanBoxSize * 0.8} r={3} fill={colors.emerald} opacity={0.6} />
            <Circle cx={scanBoxSize / 2} cy={scanBoxSize * 0.8} r={10} fill="none" stroke={colors.emerald} strokeWidth={0.8} opacity={0.4} />
            <Circle cx={scanBoxSize / 2} cy={scanBoxSize * 0.8} r={20} fill="none" stroke={colors.emerald} strokeWidth={0.4} opacity={0.2} />
          </Svg>
        </Animated.View>

        {/* Scan line */}
        {isScanning && (
          <Animated.View style={[
            styles.scanLine,
            {
              width: scanBoxSize,
              backgroundColor: colors.emerald,
              transform: [{ translateY: scanLineAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, scanBoxSize * 1.6],
              }) }],
            }
          ]} />
        )}
      </Animated.View>

      {/* Progress bar */}
      {isScanning && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, {
              backgroundColor: colors.emerald,
              width: `${progress}%`,
            }]} />
          </View>
          <Text style={[styles.progressText, { color: colors.emerald }]}>
            {Math.round(progress)}%
          </Text>
        </View>
      )}

      {/* Phase label */}
      <View style={[styles.phaseLabel, { backgroundColor: 'rgba(0,0,0,0.6)', borderColor: 'rgba(16,185,129,0.3)' }]}>
        <View style={[styles.phaseDot, { backgroundColor: isScanning ? colors.emerald : colors.textTertiary }]} />
        <Text style={[styles.phaseText, { color: colors.foreground }]}>{phase}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  scanBox: {
    borderRadius: 4,
    position: 'relative',
    alignItems: 'center',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderWidth: 3,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 4,
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  scanLine: {
    position: 'absolute',
    height: 2,
    opacity: 0.8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: 240,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700',
    width: 36,
  },
  phaseLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  phaseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  phaseText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
