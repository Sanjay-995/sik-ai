import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Platform, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAvoidingView as KeyboardControllerAvoidingView } from 'react-native-keyboard-controller';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: "Hi! I'm your Sik AI fitness coach. I can help you analyze your body scans, create personalized workout plans, and guide your nutrition. What would you like to know?",
  timestamp: new Date().toISOString(),
};

const AI_RESPONSES: Record<string, string> = {
  default: "Based on your recent scans, you're making excellent progress! Your body fat has decreased by 2.5% over the past 8 weeks while muscle mass increased by 2kg. Keep up the consistent training!",
  weight: "Your weight trend shows healthy, sustainable progress. You've lost approximately 3kg over 8 weeks. Focus on maintaining protein intake (aim for 1.6-2.2g per kg bodyweight) to preserve your muscle gains.",
  waist: "Your waist measurement has decreased by 2.5cm this month — great progress! This reduction typically correlates with improved metabolic health. Core-focused exercises like planks and deadlifts will accelerate this further.",
  muscle: "Your muscle mass has increased by 2kg over 8 weeks, which is excellent. Ensure you're progressively overloading your workouts and sleeping 7-9 hours for optimal recovery and muscle synthesis.",
  workout: "Based on your goal to build muscle, I recommend a 4-day push/pull split: Day 1 (Push): Bench Press, OHP, Tricep Dips. Day 2 (Pull): Deadlifts, Pull-ups, Rows. Day 3: Rest. Day 4: Legs. Day 5: Upper body hypertrophy. Days 6-7: Rest.",
  nutrition: "For muscle building with your current stats, target: 3,000-3,200 calories/day, 160g protein, 350g carbs, 90g fat. Prioritize protein in every meal. Pre-workout: fast-digesting carbs. Post-workout: protein + carbs within 30 mins.",
  scan: "Your latest body scan score of 85 is excellent! Your symmetry measurements look great — left/right arm difference is only 0.5cm. I'd focus on increasing shoulder width through lateral raises to improve your V-taper.",
  chest: "Your chest is at 97cm. For a powerful chest, focus on: Flat bench press (4x6-8), Incline DB press (3x10-12), Cable flys (3x12-15), Dips (3x failure). Progressive overload is key.",
  body: "Your body composition analysis shows you're in excellent shape for muscle building. Body fat at 16.5% is ideal — this range allows muscle building while keeping fat gains minimal. Your physique score puts you in the top 25% of users.",
};

function getAIResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('weight')) return AI_RESPONSES.weight;
  if (lower.includes('waist') || lower.includes('belly')) return AI_RESPONSES.waist;
  if (lower.includes('muscle') || lower.includes('mass')) return AI_RESPONSES.muscle;
  if (lower.includes('workout') || lower.includes('exercise') || lower.includes('training')) return AI_RESPONSES.workout;
  if (lower.includes('nutrition') || lower.includes('diet') || lower.includes('food') || lower.includes('eat')) return AI_RESPONSES.nutrition;
  if (lower.includes('scan') || lower.includes('score')) return AI_RESPONSES.scan;
  if (lower.includes('chest')) return AI_RESPONSES.chest;
  if (lower.includes('body') || lower.includes('composition')) return AI_RESPONSES.body;
  return AI_RESPONSES.default;
}

export default function CoachScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { chatMessages, addChatMessage, clearChat, profile, latestScan } = useApp();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const allMessages: Message[] = [WELCOME_MESSAGE, ...chatMessages.map(m => ({
    id: m.id,
    role: m.role,
    content: m.content,
    timestamp: m.timestamp,
  }))];

  async function sendMessage() {
    if (!inputText.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
    };
    setInputText('');
    await addChatMessage(userMsg);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsTyping(true);

    setTimeout(async () => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAIResponse(userMsg.content),
        timestamp: new Date().toISOString(),
      };
      await addChatMessage(aiResponse);
      setIsTyping(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1200 + Math.random() * 600);
  }

  const QUICK_QUESTIONS = [
    'How is my progress?',
    'Suggest a workout',
    'Nutrition tips',
    'Analyze my body scan',
  ];

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[
        styles.messageBubble,
        isUser ? styles.userBubble : styles.aiBubble,
        isUser
          ? { backgroundColor: colors.emeraldGlow, borderColor: colors.emerald, borderWidth: 1 }
          : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
      ]}>
        {!isUser && (
          <View style={[styles.aiAvatar, { backgroundColor: colors.emeraldGlow }]}>
            <Feather name="cpu" size={12} color={colors.emerald} />
          </View>
        )}
        <Text style={[
          styles.messageText,
          { color: isUser ? '#fff' : colors.foreground }
        ]}>
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.coachAvatar, { backgroundColor: colors.emeraldGlow }]}>
            <Feather name="cpu" size={20} color={colors.emerald} />
          </View>
          <View>
            <Text style={[styles.coachName, { color: colors.foreground }]}>Sik AI Coach</Text>
            <Text style={[styles.coachStatus, { color: colors.emerald }]}>Online · Ready</Text>
          </View>
        </View>
        <TouchableOpacity onPress={clearChat} style={styles.clearBtn} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
          <Feather name="trash-2" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={allMessages.slice().reverse()}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={[styles.messageList, { paddingBottom: 20 }]}
        showsVerticalScrollIndicator={false}
        inverted
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={isTyping ? (
          <View style={[styles.typingBubble, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 12 }]}>
            <View style={[styles.aiAvatar, { backgroundColor: colors.emeraldGlow }]}>
              <Feather name="cpu" size={12} color={colors.emerald} />
            </View>
            <View style={styles.typingDots}>
              {[0, 1, 2].map(i => (
                <View key={i} style={[styles.typingDot, { backgroundColor: colors.emerald }]} />
              ))}
            </View>
          </View>
        ) : null}
      />

      {/* Quick questions */}
      {chatMessages.length === 0 && (
        <View style={styles.quickQuestions}>
          <FlatList
            horizontal
            data={QUICK_QUESTIONS}
            keyExtractor={q => q}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.quickBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => { setInputText(item); }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={[styles.quickBtnText, { color: colors.foreground }]}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Input */}
      <KeyboardControllerAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={[
          styles.inputContainer,
          { 
            backgroundColor: colors.card, 
            borderTopColor: colors.border, 
            paddingBottom: Platform.OS === 'web' ? 34 : Math.max(insets.bottom, 16)
          }
        ]}>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.surface,
                color: colors.foreground,
                borderColor: isFocused ? colors.emerald : colors.border
              }
            ]}
            placeholder="Ask your AI coach..."
            placeholderTextColor={colors.textTertiary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
            autoFocus={false}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              { backgroundColor: inputText.trim() ? colors.emerald : colors.surface }
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="send" size={18} color={inputText.trim() ? '#fff' : colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </KeyboardControllerAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  coachAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachName: { fontSize: 16, fontWeight: '700' },
  coachStatus: { fontSize: 12, fontWeight: '500' },
  clearBtn: { padding: 8 },
  messageList: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  messageBubble: {
    maxWidth: '85%',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  userBubble: { alignSelf: 'flex-end' },
  aiBubble: { alignSelf: 'flex-start' },
  aiAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  messageText: { fontSize: 15, lineHeight: 22, flex: 1 },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    marginTop: 4,
  },
  typingDots: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  typingDot: { width: 6, height: 6, borderRadius: 3, opacity: 0.6 },
  quickQuestions: { paddingBottom: 8 },
  quickBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  quickBtnText: { fontSize: 13, fontWeight: '500' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
