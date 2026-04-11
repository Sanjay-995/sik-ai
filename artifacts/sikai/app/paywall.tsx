import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { requestProSubscription } from '@/services/purchases';

const PLANS = [
  {
    id: 'monthly',
    name: 'Pro Monthly',
    price: '$14.99',
    period: '/month',
    badge: null,
    features: [
      'Unlimited body scans',
      'AI coaching sessions',
      'Advanced progress analytics',
      'Scan comparison tool',
      'Export reports',
    ],
  },
  {
    id: 'annual',
    name: 'Pro Annual',
    price: '$99.99',
    period: '/year',
    badge: 'BEST VALUE',
    perMonth: '$8.33/mo',
    features: [
      'Everything in Monthly',
      'Save 44% vs monthly',
      'Priority AI responses',
      'Body composition trends',
      'Unlimited history storage',
      'Early access to new features',
    ],
  },
];

const PRO_FEATURES = [
  { icon: 'maximize', title: 'Unlimited Scans', desc: 'Scan as often as you want' },
  { icon: 'cpu', title: 'AI Coach', desc: 'Personalized fitness guidance' },
  { icon: 'trending-up', title: 'Advanced Analytics', desc: 'Deep body composition insights' },
  { icon: 'columns', title: 'Scan Compare', desc: 'Side-by-side progress view' },
  { icon: 'bar-chart-2', title: 'Progress Charts', desc: 'All 11 body part metrics' },
  { icon: 'download', title: 'Export Reports', desc: 'PDF & CSV export' },
];

export default function PaywallScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, updateProfile } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [isLoading, setIsLoading] = useState(false);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  async function handleSubscribe() {
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const ok = await requestProSubscription(selectedPlan);
      if (ok) {
        await updateProfile({ isPro: true });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.back();
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (profile.isPro) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 8 }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="x" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>
        <View style={styles.proActiveContainer}>
          <View style={[styles.proActiveIcon, { backgroundColor: colors.emeraldGlow }]}>
            <Feather name="check-circle" size={48} color={colors.emerald} />
          </View>
          <Text style={[styles.proActiveTitle, { color: colors.foreground }]}>You're Pro!</Text>
          <Text style={[styles.proActiveText, { color: colors.textSecondary }]}>
            You have full access to all Sik AI features.
          </Text>
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: colors.emerald }]}
            onPress={() => router.back()}
          >
            <Text style={styles.doneBtnText}>Continue</Text>
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
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Feather name="x" size={22} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <View style={[styles.heroIcon, { backgroundColor: colors.emeraldGlow, borderColor: 'rgba(16,185,129,0.3)' }]}>
          <Feather name="zap" size={36} color={colors.emerald} />
        </View>
        <Text style={[styles.heroTitle, { color: colors.foreground }]}>
          Unlock{'\n'}Sik AI Pro
        </Text>
        <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
          Pro features are planned for when StoreKit billing is integrated. This screen previews pricing only.
        </Text>
      </View>

      {/* Feature list */}
      <View style={styles.featureGrid}>
        {PRO_FEATURES.map(f => (
          <View key={f.title} style={[styles.featureItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.featureIcon, { backgroundColor: colors.emeraldGlow }]}>
              <Feather name={f.icon as any} size={18} color={colors.emerald} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.featureTitle, { color: colors.foreground }]}>{f.title}</Text>
              <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Plan selector */}
      <View style={styles.plans}>
        {PLANS.map(plan => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              {
                backgroundColor: selectedPlan === plan.id ? colors.emeraldGlow : colors.card,
                borderColor: selectedPlan === plan.id ? 'rgba(16,185,129,0.5)' : colors.border,
                borderWidth: selectedPlan === plan.id ? 2 : 1,
              }
            ]}
            onPress={() => setSelectedPlan(plan.id as 'monthly' | 'annual')}
          >
            {plan.badge && (
              <View style={[styles.planBadge, { backgroundColor: colors.emerald }]}>
                <Text style={styles.planBadgeText}>{plan.badge}</Text>
              </View>
            )}
            <View style={styles.planRadio}>
              <View style={[
                styles.radioOuter,
                { borderColor: selectedPlan === plan.id ? colors.emerald : colors.border }
              ]}>
                {selectedPlan === plan.id && (
                  <View style={[styles.radioInner, { backgroundColor: colors.emerald }]} />
                )}
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.planName, { color: colors.foreground }]}>{plan.name}</Text>
              {plan.perMonth && (
                <Text style={[styles.planPerMonth, { color: colors.textSecondary }]}>{plan.perMonth}</Text>
              )}
            </View>
            <View style={styles.planPriceGroup}>
              <Text style={[styles.planPrice, { color: selectedPlan === plan.id ? colors.emerald : colors.foreground }]}>
                {plan.price}
              </Text>
              <Text style={[styles.planPeriod, { color: colors.textSecondary }]}>{plan.period}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* CTA */}
      <View style={{ paddingHorizontal: 16, gap: 12 }}>
        <TouchableOpacity
          style={[styles.subscribeBtn, { backgroundColor: colors.emerald, opacity: isLoading ? 0.7 : 1 }]}
          onPress={handleSubscribe}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={styles.subscribeBtnText}>Processing...</Text>
          ) : (
            <>
              <Feather name="zap" size={18} color="#fff" />
              <Text style={styles.subscribeBtnText}>
                Start {selectedPlan === 'annual' ? 'Annual' : 'Monthly'} Pro
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={[styles.legalText, { color: colors.textTertiary }]}>
          App Store billing is not active in this build. When subscriptions launch, Apple’s standard terms and restore purchases will apply.
        </Text>

        <TouchableOpacity onPress={() => router.back()} style={styles.skipPaywall}>
          <Text style={[styles.skipPaywallText, { color: colors.textTertiary }]}>
            Continue with Free Plan
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeBtn: { padding: 4 },
  hero: {
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  featureGrid: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  featureDesc: { fontSize: 12 },
  plans: { paddingHorizontal: 16, gap: 10, marginBottom: 20 },
  planCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  planBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 10,
  },
  planBadgeText: { fontSize: 9, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  planRadio: { width: 24 },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  planName: { fontSize: 15, fontWeight: '700' },
  planPerMonth: { fontSize: 12, marginTop: 2 },
  planPriceGroup: { alignItems: 'flex-end' },
  planPrice: { fontSize: 20, fontWeight: '800' },
  planPeriod: { fontSize: 12 },
  subscribeBtn: {
    borderRadius: 16,
    paddingVertical: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  subscribeBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  legalText: { fontSize: 11, textAlign: 'center', lineHeight: 17 },
  skipPaywall: { alignItems: 'center', paddingVertical: 8 },
  skipPaywallText: { fontSize: 14 },
  proActiveContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20, padding: 32 },
  proActiveIcon: {
    width: 100,
    height: 100,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proActiveTitle: { fontSize: 32, fontWeight: '900' },
  proActiveText: { fontSize: 16, textAlign: 'center', lineHeight: 24 },
  doneBtn: { borderRadius: 16, paddingVertical: 16, paddingHorizontal: 40 },
  doneBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});
