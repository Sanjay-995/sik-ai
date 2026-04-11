import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  Platform, KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { fetchCoachReply } from '@/lib/coachClient';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hi — live answers use the Sik AI API (OpenAI on the server) when EXPO_PUBLIC_API_BASE_URL and OPENAI_API_KEY are set. Otherwise you’ll see short offline tips only. This is not medical advice.",
  timestamp: new Date().toISOString(),
};

const AI_RESPONSES: Record<string, string> = {
  default:
    "Offline tip: consistency beats intensity. Aim for 2–4 strength sessions per week plus daily walking if you can. Connect the API for tailored coaching.",
  weight:
    "Offline tip: track trend over weeks, not days. Pair the scale with waist measurement and how clothes fit. Connect the API for personalized targets.",
  waist:
    "Offline tip: core work supports posture; fat loss still comes mostly from overall energy balance and protein. Connect the API for a structured plan.",
  muscle:
    "Offline tip: progressive overload + enough protein (roughly 1.6–2.2 g/kg/day for many lifters) + sleep. Connect the API for programming details.",
  workout:
    "Offline tip: full-body 2–3×/week or upper/lower 4×/week are simple starters. Connect the API for a split matched to your equipment.",
  nutrition:
    "Offline tip: build meals around protein and vegetables; adjust carbs to training days. Connect the API for numbers tied to your goals.",
  scan:
    "Offline tip: treat any in-app scan numbers as illustrative until you use calibrated hardware. Connect the API to discuss trends safely.",
  chest:
    "Offline tip: horizontal press + incline + fly pattern + triceps work. Connect the API for sets/reps suggestions.",
  body:
    "Offline tip: recovery and adherence matter more than chasing perfect metrics. Connect the API for deeper guidance.",
};

function getAIResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("weight")) return AI_RESPONSES.weight;
  if (lower.includes("waist") || lower.includes("belly")) return AI_RESPONSES.waist;
  if (lower.includes("muscle") || lower.includes("mass")) return AI_RESPONSES.muscle;
  if (lower.includes("workout") || lower.includes("exercise") || lower.includes("training"))
    return AI_RESPONSES.workout;
  if (lower.includes("nutrition") || lower.includes("diet") || lower.includes("food") || lower.includes("eat"))
    return AI_RESPONSES.nutrition;
  if (lower.includes("scan") || lower.includes("score")) return AI_RESPONSES.scan;
  if (lower.includes("chest")) return AI_RESPONSES.chest;
  if (lower.includes("body") || lower.includes("composition")) return AI_RESPONSES.body;
  return AI_RESPONSES.default;
}

export default function CoachScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { chatMessages, addChatMessage, clearChat, profile, latestScan } = useApp();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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
    try {
      const transcript = [...chatMessages, userMsg];
      const messages = transcript.slice(-20).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      const latestScanSummary = latestScan
        ? `Score ${latestScan.score}; body fat ${latestScan.measurements.bodyFat.toFixed(1)}%; weight ${latestScan.weight}kg. Treat as demo unless you saved a real reference scan.`
        : "No saved scan yet.";

      const api = await fetchCoachReply({
        messages,
        context: {
          displayName: profile.name.split(" ")[0],
          heightCm: profile.height,
          weightKg: profile.weight,
          goal: profile.goal,
          latestScanSummary,
        },
      });

      const fallback = getAIResponse(userMsg.content);
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: api.ok ? api.reply : `${fallback}\n\n—\n${api.message}`,
        timestamp: new Date().toISOString(),
      };
      await addChatMessage(aiResponse);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      await addChatMessage({
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: `${getAIResponse(userMsg.content)}\n\n—\nCoach error: ${msg}`,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsTyping(false);
    }
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
          ? { backgroundColor: colors.emerald }
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
            <Text style={[styles.coachStatus, { color: colors.emerald }]}>API when configured</Text>
          </View>
        </View>
        <TouchableOpacity onPress={clearChat} style={styles.clearBtn}>
          <Feather name="trash-2" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={allMessages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={[styles.messageList, { paddingBottom: bottomPad + 140 }]}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={isTyping ? (
          <View style={[styles.typingBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
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
              >
                <Text style={[styles.quickBtnText, { color: colors.foreground }]}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={[
          styles.inputContainer,
          { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: bottomPad + (Platform.OS === 'web' ? 84 : insets.bottom + 84) }
        ]}>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
            placeholder="Ask your AI coach..."
            placeholderTextColor={colors.textTertiary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              { backgroundColor: inputText.trim() ? colors.emerald : colors.surface }
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Feather name="send" size={18} color={inputText.trim() ? '#fff' : colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
