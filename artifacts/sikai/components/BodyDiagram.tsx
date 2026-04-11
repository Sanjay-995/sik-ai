import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Ellipse, Line, Rect, Path, Circle, G } from 'react-native-svg';
import { useColors } from '@/hooks/useColors';
import { BodyMeasurement } from '@/context/AppContext';

interface BodyDiagramProps {
  measurements: BodyMeasurement;
  selectedPart?: string | null;
  onSelectPart?: (part: string) => void;
}

const BODY_PARTS = [
  { key: 'neck', label: 'Neck', x: 100, y: 68, r: 14 },
  { key: 'shoulders', label: 'Shoulders', x: 100, y: 90, r: 36 },
  { key: 'chest', label: 'Chest', x: 100, y: 115, r: 28 },
  { key: 'waist', label: 'Waist', x: 100, y: 150, r: 22 },
  { key: 'hips', label: 'Hips', x: 100, y: 182, r: 26 },
  { key: 'leftArm', label: 'L. Arm', x: 53, y: 118, r: 14 },
  { key: 'rightArm', label: 'R. Arm', x: 147, y: 118, r: 14 },
  { key: 'leftThigh', label: 'L. Thigh', x: 80, y: 225, r: 18 },
  { key: 'rightThigh', label: 'R. Thigh', x: 120, y: 225, r: 18 },
];

export function BodyDiagram({ measurements, selectedPart, onSelectPart }: BodyDiagramProps) {
  const colors = useColors();

  const getMeasurementLabel = (key: string): string => {
    const val = measurements[key as keyof BodyMeasurement];
    if (val === undefined) return '';
    return `${val.toFixed(1)}`;
  };

  return (
    <View style={styles.container}>
      <Svg width={200} height={300} viewBox="0 0 200 300">
        {/* Body outline */}
        {/* Head */}
        <Circle cx={100} cy={42} r={22} fill="none" stroke={colors.border} strokeWidth={1.5} />
        {/* Neck */}
        <Rect x={92} y={63} width={16} height={14} rx={4} fill="none" stroke={colors.border} strokeWidth={1.5} />
        {/* Torso */}
        <Path
          d="M68 78 L132 78 L140 105 L138 185 L118 188 L82 188 L62 185 L60 105 Z"
          fill="none"
          stroke={colors.border}
          strokeWidth={1.5}
        />
        {/* Left arm */}
        <Path d="M68 82 L48 80 L40 135 L52 138 L60 100" fill="none" stroke={colors.border} strokeWidth={1.5} />
        {/* Right arm */}
        <Path d="M132 82 L152 80 L160 135 L148 138 L140 100" fill="none" stroke={colors.border} strokeWidth={1.5} />
        {/* Left thigh */}
        <Path d="M82 188 L72 190 L68 250 L84 252 L90 195" fill="none" stroke={colors.border} strokeWidth={1.5} />
        {/* Right thigh */}
        <Path d="M118 188 L128 190 L132 250 L116 252 L110 195" fill="none" stroke={colors.border} strokeWidth={1.5} />

        {/* Interactive measurement points */}
        {BODY_PARTS.map((part) => {
          const isSelected = selectedPart === part.key;
          const hasKey = part.key in measurements;
          if (!hasKey) return null;

          return (
            <G key={part.key} onPress={() => onSelectPart?.(part.key)}>
              <Circle
                cx={part.x}
                cy={part.y}
                r={isSelected ? part.r + 2 : part.r}
                fill={isSelected ? 'rgba(16,185,129,0.25)' : 'rgba(16,185,129,0.08)'}
                stroke={isSelected ? colors.emerald : 'rgba(16,185,129,0.4)'}
                strokeWidth={isSelected ? 2 : 1}
              />
              {isSelected && (
                <Circle
                  cx={part.x}
                  cy={part.y}
                  r={4}
                  fill={colors.emerald}
                />
              )}
            </G>
          );
        })}
      </Svg>

      {/* Selected measurement label */}
      {selectedPart && (
        <View style={[styles.measurementBadge, { backgroundColor: colors.emeraldGlow, borderColor: 'rgba(16,185,129,0.3)' }]}>
          <Text style={[styles.measurementValue, { color: colors.emerald }]}>
            {getMeasurementLabel(selectedPart)} cm
          </Text>
          <Text style={[styles.measurementLabel, { color: colors.textSecondary }]}>
            {BODY_PARTS.find(p => p.key === selectedPart)?.label}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  measurementBadge: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  measurementValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  measurementLabel: {
    fontSize: 12,
    marginTop: 2,
  },
});
