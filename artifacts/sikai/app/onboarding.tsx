import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
  ScrollView, TextInput, Platform
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';

const { width } = Dimensions.get('window');

const STEPS = [
  {
    title: 'Welcome to\nSik AI',
    subtitle: 'Your premium body scanning & measurement tracking companion powered by AI.',
    icon: 'activity',
  },
  {
    title: 'Smart Body\nAnalysis',
    subtitle: 'Track 11 body measurements including chest, waist, hips, arms, and more with precision scanning.',
    icon: 'maximize',
  },
  {
    title: 'AI-Powered\nCoaching',
    subtitle: 'Get personalized insights and recommendations from your dedicated AI fitness coach.',
    icon: 'cpu',
  },
];

const GOALS = [
  { id: 'lose_weight', label: 'Lose Weight', icon: 'trending-down' },
  { id: 'build_muscle', label: 'Build Muscle', icon: 'trending-up' },
  { id: 'maintain', label: 'Maintain', icon: 'minus' },
  { id: 'improve_fitness', label: 'Get Fit', icon: 'zap' },
] as const;

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { updateProfile } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState<'lose_weight' | 'build_muscle' | 'maintain' | 'improve_fitness'>('build_muscle');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  const isProfileStep = step === STEPS.length;
  const totalSteps = STEPS.length + 1;
  const progress = step / (totalSteps - 1);

  async function handleComplete() {
    await updateProfile({
      name: name || 'Alex Johnson',
      age: parseInt(age) || 28,
      height: parseInt(height) || 178,
      weight: parseFloat(weight) || 82,
      goal,
      gender,
      onboardingComplete: true,
    });
    router.replace('/(tabs)');
  }

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        {/* Progress dots */}
        <View style={styles.dots}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i <= step ? colors.emerald : colors.border,
                  width: i === step ? 20 : 6,
                },
              ]}
            />
          ))}
        </View>
        {step > 0 && (
          <TouchableOpacity onPress={() => setStep(s => s - 1)} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </TouchableOpacity>
        )}
      </View>

      {!isProfileStep ? (
        <View style={styles.slideContent}>
          <View style={[styles.iconContainer, { backgroundColor: colors.emeraldGlow, borderColor: 'rgba(16,185,129,0.3)' }]}>
            <Feather name={STEPS[step].icon as any} size={36} color={colors.emerald} />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>{STEPS[step].title}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{STEPS[step].subtitle}</Text>
        </View>
      ) : (
        <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: colors.foreground }]}>Set Up{'\n'}Your Profile</Text>

          <View style={styles.formGroup}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Your Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
              placeholderTextColor={colors.textTertiary}
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Age</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
                placeholderTextColor={colors.textTertiary}
                placeholder="28"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Height (cm)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
                placeholderTextColor={colors.textTertiary}
                placeholder="178"
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Weight (kg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
              placeholderTextColor={colors.textTertiary}
              placeholder="82"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Gender</Text>
            <View style={styles.row}>
              {(['male', 'female'] as const).map(g => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.genderBtn,
                    {
                      backgroundColor: gender === g ? colors.emeraldGlow : colors.card,
                      borderColor: gender === g ? 'rgba(16,185,129,0.5)' : colors.border,
                      flex: 1,
                    },
                  ]}
                  onPress={() => setGender(g)}
                >
                  <Feather
                    name={g === 'male' ? 'user' : 'user'}
                    size={16}
                    color={gender === g ? colors.emerald : colors.textSecondary}
                  />
                  <Text style={[styles.genderBtnText, { color: gender === g ? colors.emerald : colors.textSecondary }]}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Your Goal</Text>
            <View style={styles.goalsGrid}>
              {GOALS.map(g => (
                <TouchableOpacity
                  key={g.id}
                  style={[
                    styles.goalBtn,
                    {
                      backgroundColor: goal === g.id ? colors.emeraldGlow : colors.card,
                      borderColor: goal === g.id ? 'rgba(16,185,129,0.5)' : colors.border,
                    },
                  ]}
                  onPress={() => setGoal(g.id)}
                >
                  <Feather name={g.icon as any} size={20} color={goal === g.id ? colors.emerald : colors.textSecondary} />
                  <Text style={[styles.goalBtnText, { color: goal === g.id ? colors.emerald : colors.foreground }]}>
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      <View style={[styles.footer, { paddingBottom: bottomPad + 16 }]}>
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: colors.emerald }]}
          onPress={() => {
            if (step < STEPS.length - 1) setStep(s => s + 1);
            else if (step === STEPS.length - 1) setStep(STEPS.length);
            else handleComplete();
          }}
        >
          <Text style={styles.nextBtnText}>
            {isProfileStep ? 'Get Started' : step === STEPS.length - 1 ? 'Set Up Profile' : 'Continue'}
          </Text>
          <Feather name={isProfileStep ? 'check' : 'arrow-right'} size={20} color="#fff" />
        </TouchableOpacity>

        {!isProfileStep && (
          <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.skipBtn}>
            <Text style={[styles.skipText, { color: colors.textTertiary }]}>Skip for now</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { height: 6, borderRadius: 3 },
  backBtn: { padding: 8 },
  slideContent: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
    textAlign: 'center',
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  formScroll: { flex: 1, paddingHorizontal: 24 },
  formGroup: { marginBottom: 16, gap: 8 },
  fieldLabel: { fontSize: 13, fontWeight: '600', letterSpacing: 0.3 },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  row: { flexDirection: 'row', gap: 12 },
  genderBtn: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  genderBtnText: { fontSize: 15, fontWeight: '600' },
  goalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  goalBtn: {
    width: '47%',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
  },
  goalBtnText: { fontSize: 14, fontWeight: '600' },
  footer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  nextBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  skipBtn: { alignItems: 'center', paddingVertical: 8 },
  skipText: { fontSize: 14 },
});
