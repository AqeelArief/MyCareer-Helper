import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import type { FlatList as FlatListType } from "react-native";

import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import AssistantTutorial from "../../components/AssistantTutorial";
import { auth, db } from "../../firebase";
import GuestModeManager from "../../utils/GuestModeManager";
import { sanitizeInput } from "../../utils/helpers";
import RateLimiter, { RateLimitPresets } from "../../utils/rateLimiter";
import { getInputBottomPadding, getKeyboardVerticalOffset, needsKeyboardAvoiding } from "../../utils/responsive";
import ResumeContext from "../_context/ResumeContext";

const getApiKey = () =>
  Constants.expoConfig?.extra?.EXPO_PUBLIC_GEMINI_API_KEY ?? "";

const API_URL = (key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${key}`;

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

/**
 * Retry fetch with exponential backoff
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);

      if (response.status === 429 && i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
        continue;
      }

      if (!response.ok) {
        let errorDetail = response.statusText;
        try {
          const errorJson = await response.json();
          errorDetail = errorJson.error?.message || errorDetail;
        } catch { }
        throw new Error(`API call failed (${response.status}): ${errorDetail}`);
      }

      return response;
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }

  throw new Error("Maximum retries reached");
}

const MyAssistant = () => {
  const { resumeData, targetField } = useContext(ResumeContext);
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const [chatLoaded, setChatLoaded] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const flatListRef = useRef<FlatListType<Message> | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const quickActions = [
    { id: 1, icon: "search", text: "Find jobs", prompt: "Help me find job opportunities" },
    { id: 2, icon: "document-text", text: "Review resume", prompt: "Review my resume" },
    { id: 3, icon: "chatbubbles", text: "Interview prep", prompt: "Help me prepare for interviews" }
  ];

  // Show guest welcome on mount
  useEffect(() => {
    const checkGuest = async () => {
      await GuestModeManager.showGuestWelcome();
    };
    checkGuest();
  }, []);

  // Load chat history on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      const key = getApiKey();

      if (!key) {
        setApiKeyMissing(true);
        setMessages([{ id: Date.now(), text: "⚠️ API key missing.", sender: "bot" }]);
        setChatLoaded(true);
        return;
      }

      if (!auth || !auth.currentUser || !db) {
        setMessages([{ id: Date.now(), text: "👋 Hi! I'm your AI Career Assistant.", sender: "bot" }]);
        setChatLoaded(true);
        return;
      }

      try {
        const userId = auth.currentUser.uid;
        const chatDocRef = doc(db, `users/${userId}/assistant/chatHistory`);

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 5000)
        );

        const docPromise = getDoc(chatDocRef);
        const chatDoc = await Promise.race([docPromise, timeoutPromise]);

        if (chatDoc.exists()) {
          const data = chatDoc.data();
          console.log("💬 Chat history loaded successfully");
          setMessages(data.messages || [{ id: Date.now(), text: "👋 Welcome back! How can I help you today?", sender: "bot" }]);
          setRequestCount(data.requestCount || 0);
        } else {
          console.log("💬 No chat history found, starting fresh");
          setMessages([{ id: Date.now(), text: "👋 Hi! I'm your AI Career Assistant.", sender: "bot" }]);
        }
      } catch (error: unknown) {
        const err = error as any;
        console.log("⚠️ Could not load chat history:", err.message || err);

        if (err.message === 'timeout' || err.code === 'unavailable' || err.message?.includes('offline') || err.message?.includes('client is offline')) {
          console.log("📱 App is offline or slow - starting with fresh chat");
        }

        setMessages([{ id: Date.now(), text: "👋 Hi! I'm your AI Career Assistant.", sender: "bot" }]);
      }

      setChatLoaded(true);
    };

    loadChatHistory();
  }, []);

  // Check and show tutorial
  useEffect(() => {
    const checkTutorial = async () => {
      if (!chatLoaded) return;

      const TutorialManager = (await import('../../utils/TutorialManager')).default;

      if (!TutorialManager.isLoaded()) {
        await TutorialManager.loadTutorialStatus();
      }

      const hasSeenTutorial = await TutorialManager.hasSeen('assistant');
      if (!hasSeenTutorial) {
        setTimeout(() => setShowTutorial(true), 800);
      }
    };

    checkTutorial();
  }, [chatLoaded]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      fadeAnim.stopAnimation();
    };
  }, [fadeAnim]);

  /**
   * Save chat history to Firestore
   */
  const saveChatHistory = useCallback(async (updatedMessages: Message[], updatedCount: number) => {
    if (!auth || !auth.currentUser || !db) {
      console.log("⚠️ Cannot save: Auth or DB not ready");
      return;
    }

    try {
      const userId = auth.currentUser.uid;
      const chatDocRef = doc(db, `users/${userId}/assistant/chatHistory`);

      // Limit messages to prevent excessive storage
      const limitedMessages = updatedMessages.slice(-100);

      await setDoc(chatDocRef, {
        messages: limitedMessages,
        requestCount: updatedCount,
        lastUpdated: new Date().toISOString(),
      });

      console.log("💾 Chat history saved");
    } catch (error: unknown) {
      const err = error as any;
      console.log("⚠️ Error saving chat history:", err.message || err);

      if (err.code === 'unavailable' || err.message?.includes('offline') || err.message?.includes('client is offline')) {
        console.log("📱 App is offline - chat will sync when back online");
      }
    }
  }, []);

  /**
   * Send message to AI assistant with rate limiting
   */
  const sendMessage = useCallback(async (messageText?: string) => {
    const textToSend = messageText ?? input.trim();
    if (!textToSend || loading) return;

    // Sanitize input
    const sanitizedText = sanitizeInput(textToSend);
    if (!sanitizedText) {
      Alert.alert("Invalid Input", "Please enter a valid message.");
      return;
    }

    // GUEST MODE CHECK
    const canContinue = await GuestModeManager.trackAssistantInteraction(() => {
      router.push('/');
    });

    if (!canContinue) {
      return;
    }

    // RATE LIMITING CHECK
    const rateLimitOk = await RateLimiter.checkRateLimit('ai_assistant', RateLimitPresets.AI_ASSISTANT);
    if (!rateLimitOk) {
      const remaining = await RateLimiter.getRemainingRequests('ai_assistant', RateLimitPresets.AI_ASSISTANT);
      const resetTime = await RateLimiter.getTimeUntilReset('ai_assistant', RateLimitPresets.AI_ASSISTANT);
      const resetMinutes = Math.ceil(resetTime / 60000);

      Alert.alert(
        "Rate Limit Reached",
        `You've sent too many messages. Please wait ${resetMinutes} minute(s) before trying again.`
      );
      return;
    }

    if (apiKeyMissing) {
      Alert.alert("API Key Required", "Set EXPO_PUBLIC_GEMINI_API_KEY");
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      text: sanitizedText,
      sender: "user"
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const resumeText = resumeData?.name
        ? `Name: ${resumeData.name || "Unknown"}`
        : "No resume provided";

      const payload = {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are a concise Career Assistant AI. Answer in 2-3 sentences maximum unless more detail is explicitly requested.

Target Field: ${targetField || "General"}
Resume: ${resumeText}

User message: ${sanitizedText}

CRITICAL RULES:
- Use ONLY 2-3 sentences (40-60 words max)
- Get straight to the answer
- No greetings, no "I'd be happy to", no fluff
- Only use bullet points if user asks for a list
- If the question needs more detail, use max 4-5 sentences`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 500
        }
      };

      const apiKey = getApiKey();
      if (!apiKey) throw new Error("API key missing");

      const response = await fetchWithRetry(API_URL(apiKey), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      const botText =
        result?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't process that.";

      const finalMessages = [
        ...updatedMessages,
        { id: Date.now() + 1, text: botText, sender: "bot" as const }
      ];

      setMessages(finalMessages);

      const newCount = requestCount + 1;
      setRequestCount(newCount);

      await saveChatHistory(finalMessages, newCount);

    } catch (err: unknown) {
      const error = err as any;
      let errorMessage = "Connection error. Please try again.";

      if (error.message.includes("429") || error.message.includes("quota") || error.message.includes("Rate limit")) {
        errorMessage = "⚠️ API quota exceeded. Please wait a few minutes or upgrade your plan.";
      } else if (error.message.includes("API key")) {
        errorMessage = "⚠️ Invalid API key. Please check your configuration.";
      } else if (error.message.includes("network") || error.message.includes("fetch")) {
        errorMessage = "⚠️ Network error. Check your internet connection.";
      }

      const errorMessages = [
        ...updatedMessages,
        { id: Date.now() + 1, text: errorMessage, sender: "bot" as const }
      ];

      setMessages(errorMessages);
      await saveChatHistory(errorMessages, requestCount);
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [input, loading, messages, requestCount, resumeData, targetField, router, apiKeyMissing, fadeAnim, saveChatHistory]);

  /**
   * Clear chat and start new conversation
   */
  const clearChat = useCallback(() => {
    Alert.alert("Clear Chat", "Start a new conversation?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        onPress: async () => {
          const newMessages = [{ id: Date.now(), text: "New conversation started!", sender: "bot" as const }];
          setMessages(newMessages);
          setRequestCount(0);
          await saveChatHistory(newMessages, 0);
        }
      }
    ]);
  }, [saveChatHistory]);

  // MyAssistant.tsx PART 2 - Copy this AFTER Part 1

  const remainingCredits = 1500 - requestCount;
  const isLowCredits = remainingCredits < 100;

  if (!chatLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00D9FF" />
          <Text style={styles.loadingText}>Loading chat history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={needsKeyboardAvoiding() ? (Platform.OS === "ios" ? "padding" : "height") : undefined}
        keyboardVerticalOffset={getKeyboardVerticalOffset()}
      >
        <AssistantTutorial
          visible={showTutorial}
          onClose={async () => {
            setShowTutorial(false);
            const TutorialManager = (await import('../../utils/TutorialManager')).default;
            await TutorialManager.markTutorialAsSeen('assistant');
          }}
        />

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person-circle" size={32} color="#00D9FF" />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>AI Assistant</Text>
              <Text style={styles.subtitle}>Career helper</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={clearChat} style={styles.clearButton} activeOpacity={0.7}>
              <Ionicons name="refresh" size={22} color="#00D9FF" />
            </TouchableOpacity>
            <View style={[styles.creditsContainer, isLowCredits && styles.creditsLow]}>
              <Ionicons
                name={isLowCredits ? "warning" : "flash"}
                size={14}
                color={isLowCredits ? "#FF6B6B" : "#00D9FF"}
              />
              <Text style={[styles.creditsText, isLowCredits && styles.creditsTextLow]}>
                {remainingCredits}
              </Text>
            </View>
          </View>
        </View>

        {messages.length <= 1 && !loading && (
          <View style={styles.quickActions}>
            <Text style={styles.quickTitle}>Quick Actions</Text>
            <View style={styles.quickGrid}>
              {quickActions.map(a => (
                <TouchableOpacity
                  key={a.id}
                  style={styles.quickButton}
                  onPress={() => sendMessage(a.prompt)}
                  activeOpacity={0.7}
                >
                  <Ionicons name={a.icon as any} size={20} color="#00D9FF" />
                  <Text style={styles.quickText}>{a.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <FlatList<Message>
          ref={flatListRef}
          data={messages}
          keyExtractor={i => i.id.toString()}
          renderItem={({ item }) => (
            <Animated.View style={{ opacity: fadeAnim }}>
              <View
                style={[
                  styles.message,
                  item.sender === "user" ? styles.userMessage : styles.botMessage
                ]}
              >
                {item.sender === "bot" && (
                  <View style={styles.botHeader}>
                    <Ionicons name="sparkles" size={18} color="#00D9FF" />
                    <Text style={styles.botLabel}>AI Assistant</Text>
                  </View>
                )}
                <Text
                  style={item.sender === "user" ? styles.userMessageText : styles.messageText}
                >
                  {item.text}
                </Text>
              </View>
            </Animated.View>
          )}
          style={styles.chatList}
          contentContainerStyle={styles.chatContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />

        {loading && (
          <View style={styles.typing}>
            <ActivityIndicator color="#00D9FF" size="small" />
            <Text style={styles.typingText}>Thinking...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask anything..."
            placeholderTextColor="#555"
            editable={!loading && !apiKeyMissing}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, (loading || !input.trim()) && styles.sendDisabled]}
            onPress={() => sendMessage()}
            disabled={loading || !input.trim()}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={22} color="#000" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MyAssistant;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    color: "#00D9FF",
    fontSize: 17,
    fontWeight: "700",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#1A1A1A"
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1A1A1A",
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: "#00D9FF50",
  },
  titleContainer: {
    flex: 1,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  title: { fontSize: 20, fontWeight: "800", color: "#00D9FF", letterSpacing: 0.4 },
  subtitle: { fontSize: 12, color: "#888", fontWeight: "600", marginTop: 2 },
  creditsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#00D9FF50"
  },
  creditsLow: {
    backgroundColor: "#2A1A1A",
    borderColor: "#FF6B6B50"
  },
  creditsText: {
    color: "#00D9FF",
    fontSize: 12,
    fontWeight: "700"
  },
  creditsTextLow: {
    color: "#FF6B6B"
  },
  clearButton: { padding: 8 },
  quickActions: { padding: 20 },
  quickTitle: { fontSize: 15, fontWeight: "700", color: "#888", marginBottom: 14, letterSpacing: 0.4 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  quickButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1A1A1A",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#00D9FF50"
  },
  quickText: { color: "#00D9FF", fontSize: 14, fontWeight: "700" },
  chatList: { flex: 1 },
  chatContent: { padding: 20, paddingBottom: 20 },
  message: {
    padding: 18,
    borderRadius: 20,
    marginBottom: 16,
    maxWidth: "85%"
  },
  userMessage: {
    backgroundColor: "#00D9FF",
    alignSelf: "flex-end",
    shadowColor: "#00D9FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  botMessage: {
    backgroundColor: "#1A1A1A",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#333"
  },
  botHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  botLabel: { color: "#00D9FF", fontSize: 13, fontWeight: "700" },
  messageText: { color: "white", fontSize: 16, lineHeight: 24, fontWeight: "500" },
  userMessageText: {
    color: "#000",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "700"
  },
  typing: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 14
  },
  typingText: { color: "#00D9FF", fontSize: 14, fontStyle: "italic", fontWeight: "600" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: getInputBottomPadding(),
    borderTopWidth: 2,
    borderTopColor: "#1A1A1A",
    backgroundColor: "#000",
  },
  input: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    color: "white",
    padding: 16,
    borderRadius: 22,
    marginRight: 12,
    maxHeight: 110,
    fontSize: 16,
    fontWeight: "500",
    borderWidth: 2,
    borderColor: "#333"
  },
  sendButton: {
    backgroundColor: "#00D9FF",
    padding: 14,
    borderRadius: 24,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#00D9FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  sendDisabled: { opacity: 0.4 }
});