import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface GradientCardProps {
  children: ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'emerald' | 'dark';
}

export function GradientCard({ children, style, variant = 'default' }: GradientCardProps) {
  const colors = useColors();

  const bgColor = variant === 'emerald'
    ? colors.emeraldGlow
    : variant === 'dark'
    ? colors.surface
    : colors.card;

  const borderColor = variant === 'emerald'
    ? 'rgba(16,185,129,0.3)'
    : colors.border;

  return (
    <View style={[
      styles.card,
      { backgroundColor: bgColor, borderColor },
      style,
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
  },
});
