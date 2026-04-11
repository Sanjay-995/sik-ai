import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  change?: number;
  changeLabel?: string;
  style?: ViewStyle;
  accent?: boolean;
}

export function MetricCard({ label, value, unit, change, changeLabel, style, accent }: MetricCardProps) {
  const colors = useColors();
  const isPositive = change !== undefined ? change >= 0 : false;

  return (
    <View style={[
      styles.card,
      {
        backgroundColor: accent ? colors.emeraldGlow : colors.card,
        borderColor: accent ? 'rgba(16,185,129,0.3)' : colors.border,
      },
      style,
    ]}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: accent ? colors.emerald : colors.foreground }]}>
          {typeof value === 'number' ? value.toFixed(1) : value}
        </Text>
        {unit && (
          <Text style={[styles.unit, { color: colors.textSecondary }]}>{unit}</Text>
        )}
      </View>
      {change !== undefined && (
        <View style={styles.changeRow}>
          <Text style={[
            styles.change,
            { color: isPositive ? '#10B981' : '#EF4444' }
          ]}>
            {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(1)}{unit}
          </Text>
          {changeLabel && (
            <Text style={[styles.changeLabel, { color: colors.textTertiary }]}>
              {' '}{changeLabel}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: 13,
    marginBottom: 3,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  change: {
    fontSize: 12,
    fontWeight: '600',
  },
  changeLabel: {
    fontSize: 11,
  },
});
