import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import Svg, { Line, Path, Circle, G, Text as SvgText, Rect } from 'react-native-svg';
import { useColors } from '@/hooks/useColors';
import { ScanRecord } from '@/context/AppContext';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 64;
const CHART_HEIGHT = 160;
const PADDING = { top: 16, bottom: 32, left: 40, right: 16 };

interface ProgressChartProps {
  scans: ScanRecord[];
  metric: keyof ScanRecord['measurements'] | 'weight' | 'bodyFat' | 'bmi' | 'score';
  color?: string;
}

export function ProgressChart({ scans, metric, color }: ProgressChartProps) {
  const colors = useColors();
  const chartColor = color || colors.emerald;

  if (scans.length < 2) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.card }]}>
        <Text style={{ color: colors.textSecondary }}>Not enough data yet</Text>
      </View>
    );
  }

  const reversedScans = [...scans].reverse();

  const getValue = (scan: ScanRecord): number => {
    if (metric === 'weight') return scan.weight;
    if (metric === 'bmi') return scan.bmi;
    if (metric === 'score') return scan.score;
    if (metric in scan.measurements) return scan.measurements[metric as keyof typeof scan.measurements];
    return 0;
  };

  const values = reversedScans.map(getValue);
  const minVal = Math.min(...values) * 0.97;
  const maxVal = Math.max(...values) * 1.03;
  const range = maxVal - minVal || 1;

  const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  const getX = (i: number) => PADDING.left + (i / (values.length - 1)) * plotWidth;
  const getY = (val: number) => PADDING.top + (1 - (val - minVal) / range) * plotHeight;

  const pathD = values.reduce((acc, val, i) => {
    const x = getX(i);
    const y = getY(val);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const areaD = `${pathD} L ${getX(values.length - 1)} ${PADDING.top + plotHeight} L ${PADDING.left} ${PADDING.top + plotHeight} Z`;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const y = PADDING.top + t * plotHeight;
        const val = maxVal - t * range;
        return (
          <G key={i}>
            <Line
              x1={PADDING.left}
              y1={y}
              x2={CHART_WIDTH - PADDING.right}
              y2={y}
              stroke={colors.border}
              strokeWidth={0.5}
              strokeDasharray="4,4"
            />
            <SvgText
              x={PADDING.left - 4}
              y={y + 4}
              fontSize={9}
              fill={colors.textTertiary}
              textAnchor="end"
            >
              {val.toFixed(0)}
            </SvgText>
          </G>
        );
      })}

      {/* Area fill */}
      <Path d={areaD} fill={`${chartColor}18`} />

      {/* Line */}
      <Path d={pathD} stroke={chartColor} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Data points */}
      {values.map((val, i) => (
        <G key={i}>
          <Circle
            cx={getX(i)}
            cy={getY(val)}
            r={5}
            fill={colors.card}
            stroke={chartColor}
            strokeWidth={2}
          />
        </G>
      ))}

      {/* X labels — show first, middle, last */}
      {[0, Math.floor((values.length - 1) / 2), values.length - 1].map((i) => (
        <SvgText
          key={i}
          x={getX(i)}
          y={PADDING.top + plotHeight + 18}
          fontSize={9}
          fill={colors.textTertiary}
          textAnchor="middle"
        >
          {formatDate(reversedScans[i].date)}
        </SvgText>
      ))}
    </Svg>
  );
}

const styles = StyleSheet.create({
  empty: {
    height: CHART_HEIGHT,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
