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

type PlanId = 'monthly' | 'annual' | 'pro_plus';

const PLANS: Array<{
  id: PlanId;
  name: string;
  price: string;
  period: string;
  badge: string | null;
  perMonth?: string;
  highlight?: string;
}> = [
  {
    id: 'annual',
    name: 'Pro Annual',
    price: '$79.99',
    period: '/year',
    badge: 'BEST VALUE',
    perMonth: '$6.67/mo · Save 33%',
  },
  {
    id: 'monthly',
    name: 'Pro Monthly',
    price: '$9.99',
    period: '/month',
    badge: null,
  },
  {
    id: 'pro_plus',
    name: 'Pro+',
    price: '$19.99',
    period: '/month',
    badge: 'PREMIUM',
    highlight: 'HealthKit · PDF Reports · Priority AI',
  },
];

const FREE_FEATURES = [
  '2 scans per month',
  'Basic measurements (chest, waist, hips)',
  '30-day scan history',
];

const PRO_FEATURES = [
  { icon: 'maximize', title: 'Unlimited Scans', desc: 'Scan as often as you want' },
  { icon: 'cpu', title: 'AI Coach', desc: 'LLM-powered personalized guidance' },
  { icon: 'bar-chart-2', title: 'All 11 Metrics', desc: 'Body fat, muscle mass + 9 measurements' },
  { icon: 'columns', title: 'Scan Compare', desc: 'Side-by-side progress view' },
  { icon: 'trending-up', title: 'Full History', desc: 'Unlimited scan storage' },
  { icon: 'download', title: 'Export Reports', desc: 'CSV data export' },
];

const PRO_PLUS_EXTRAS = [
  { icon: 'heart', title: 'HealthKit Sync', desc: 'Auto-sync body data to Apple Health' },
  { icon: 'file-text', title: 'PDF Reports', desc: 'Detailed scan reports to share' },
  { icon: 'zap', title: 'Priority AI', desc: 'Faster AI Coach responses' },
];

export default function PaywallScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, updateProfile } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('annual');
  const [isLoading, setIsLoading] = useState(false);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  async function handleSubscribe() {
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setTimeout(async () => {
      await updateProfile({ isPro: true });
      setIsLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    }, 1500);
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

  const isProPlus = selectedPlan === 'pro_plus';

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
        <View style={[styles.trialBadge, { backgroundColor: colors.emeraldGlow, borderColor: 'rgba(16,185,129,0.3)' }]}>
          <Feather name="gift" size={12} color={colors.emerald} />
          <Text style={[styles.trialBadgeText, { color: colors.emerald }]}>7-DAY FREE TRIAL</Text>
        </View>
        <View style={{ width: 38 }} />
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
          LiDAR precision scanning + AI coaching. No extra hardware — just your iPhone.
        </Text>
      </View>

      {/* Free vs Pro comparison */}
      <View style={[styles.comparisonCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.comparisonRow}>
          <View style={styles.comparisonCol}>
            <Text style={[styles.comparisonTier, { color: colors.textSecondary }]}>Free</Text>
            {FREE_FEATURES.map(f => (
              <View key={f} style={styles.comparisonItem}>
                <Feather name="minus" size={12} color={colors.textTertiary} />
                <Text style={[styles.comparisonItemText, { color: colors.textSecondary }]}>{f}</Text>
              </View>
            ))}
          </View>
          <View style={[styles.comparisonDivider, { backgroundColor: colors.border }]} />
          <View style={styles.comparisonCol}>
            <Text style={[styles.comparisonTier, { color: colors.emerald }]}>Pro</Text>
            {['Unlimited scans', 'All 11 measurements', 'Full history + AI Coach'].map(f => (
              <View key={f} style={styles.comparisonItem}>
                <Feather name="check" size={12} color={colors.emerald} />
                <Text style={[styles.comparisonItemText, { color: colors.foreground }]}>{f}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Pro features */}
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
        {PLANS.map(plan => {
          const isSelected = selectedPlan === plan.id;
          return (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                {
                  backgroundColor: isSelected ? colors.emeraldGlow : colors.card,
                  borderColor: isSelected ? 'rgba(16,185,129,0.5)' : colors.border,
                  borderWidth: isSelected ? 2 : 1,
                }
              ]}
              onPress={() => {
                setSelectedPlan(plan.id);
                Haptics.selectionAsync();
              }}
            >
              {plan.badge && (
                <View style={[styles.planBadge, { backgroundColor: plan.id === 'pro_plus' ? '#6366F1' : colors.emerald }]}>
                  <Text style={styles.planBadgeText}>{plan.badge}</Text>
                </View>
              )}
              <View style={styles.planRadio}>
                <View style={[styles.radioOuter, { borderColor: isSelected ? colors.emerald : colors.border }]}>
                  {isSelected && <View style={[styles.radioInner, { backgroundColor: colors.emerald }]} />}
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.planName, { color: colors.foreground }]}>{plan.name}</Text>
                {plan.perMonth && (
                  <Text style={[styles.planPerMonth, { color: colors.emerald }]}>{plan.perMonth}</Text>
                )}
                {plan.highlight && (
                  <Text style={[styles.planHighlight, { color: colors.textSecondary }]}>{plan.highlight}</Text>
                )}
              </View>
              <View style={styles.planPriceGroup}>
                <Text style={[styles.planPrice, { color: isSelected ? colors.emerald : colors.foreground }]}>
                  {plan.price}
                </Text>
                <Text style={[styles.planPeriod, { color: colors.textSecondary }]}>{plan.period}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Pro+ extras (shown when pro_plus selected) */}
      {isProPlus && (
        <View style={[styles.extrasCard, { backgroundColor: '#1a1435', borderColor: '#6366F1' + '40' }]}>
          <Text style={[styles.extrasTitle, { color: '#A5B4FC' }]}>Pro+ Extras</Text>
          {PRO_PLUS_EXTRAS.map(e => (
            <View key={e.title} style={styles.extrasRow}>
              <Feather name={e.icon as any} size={14} color="#A5B4FC" />
              <View>
                <Text style={[styles.extrasName, { color: '#E0E7FF' }]}>{e.title}</Text>
                <Text style={[styles.extrasDesc, { color: '#A5B4FC' }]}>{e.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* CTA */}
      <View style={{ paddingHorizontal: 16, gap: 12 }}>
        <TouchableOpacity
          style={[styles.subscribeBtn, { backgroundColor: isProPlus ? '#6366F1' : colors.emerald, opacity: isLoading ? 0.7 : 1 }]}
          onPress={handleSubscribe}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={styles.subscribeBtnText}>Starting trial...</Text>
          ) : (
            <>
              <Feather name="gift" size={18} color="#fff" />
              <Text style={styles.subscribeBtnText}>Start 7-Day Free Trial</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={[styles.legalText, { color: colors.textTertiary }]}>
          Free for 7 days, then{' '}
          {PLANS.find(p => p.id === selectedPlan)?.price}
          {PLANS.find(p => p.id === selectedPlan)?.period}. Cancel anytime in App Store settings.
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
    justifyContent: 'space-between',
  },
  closeBtn: { padding: 4 },
  trialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  trialBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
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
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  comparisonCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  comparisonRow: { flexDirection: 'row', gap: 12 },
  comparisonCol: { flex: 1, gap: 8 },
  comparisonDivider: { width: 1 },
  comparisonTier: { fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  comparisonItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  comparisonItemText: { fontSize: 12, lineHeight: 17, flex: 1 },
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
  plans: { paddingHorizontal: 16, gap: 10, marginBottom: 16 },
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
  planHighlight: { fontSize: 11, marginTop: 2 },
  planPriceGroup: { alignItems: 'flex-end' },
  planPrice: { fontSize: 20, fontWeight: '800' },
  planPeriod: { fontSize: 12 },
  extrasCard: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10,
    marginBottom: 16,
  },
  extrasTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  extrasRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  extrasName: { fontSize: 13, fontWeight: '600' },
  extrasDesc: { fontSize: 11, marginTop: 1 },
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
