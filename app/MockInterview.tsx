import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { InterviewProgressManager } from "./../utils/InterviewProgressManager";
import { Question } from "./../utils/InterviewQuestionBank";

const MockInterview = () => {
  const router = useRouter();

  // State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isResumingSession, setIsResumingSession] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isPaused, setIsPaused] = useState(false);
  const [statistics, setStatistics] = useState({
    totalQuestions: 0,
    askedQuestions: 0,
    remainingQuestions: 0,
    percentageComplete: 0,
  });

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Load questions on mount
   */
  useEffect(() => {
    loadQuestions();

    return () => {
      // Cleanup timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Cleanup animations
      fadeAnim.stopAnimation();
      scaleAnim.stopAnimation();
      pulseAnim.stopAnimation();
    };
  }, [fadeAnim, scaleAnim, pulseAnim]);

  /**
   * Load questions from progress manager
   */
  const loadQuestions = async () => {
    try {
      setIsLoading(true);

      const result = await InterviewProgressManager.getNextQuestions('general');
      const stats = await InterviewProgressManager.getStatistics('general');

      setQuestions(result.questions);
      setCurrentQuestionIndex(result.progress.currentQuestionIndex);
      setIsResumingSession(result.isResumingSession);
      setStatistics(stats);

      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        })
      ]).start();

      // Start timer
      startTimer();

      // Show resume message if applicable
      if (result.isResumingSession) {
        Alert.alert(
          "Welcome Back! 👋",
          `Resuming from question ${result.progress.currentQuestionIndex + 1} of ${result.questions.length}`,
          [{ text: "Continue" }]
        );
      }

    } catch (error) {
      console.error('Error loading questions:', error);
      Alert.alert('Error', 'Failed to load questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Start countdown timer
   */
  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto-advance to next question
          handleNextQuestion();
          return 120;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  /**
   * Pause/Resume timer
   */
  const togglePause = useCallback(() => {
    if (isPaused) {
      startTimer();
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    setIsPaused(!isPaused);
  }, [isPaused, startTimer]);

  /**
   * Reset timer
   */
  const resetTimer = useCallback(() => {
    setTimeLeft(120);
    startTimer();
  }, [startTimer]);

  /**
   * Handle next question
   */
  const handleNextQuestion = useCallback(async () => {
    const currentQuestion = questions[currentQuestionIndex];

    if (!currentQuestion) return;

    try {
      // Mark question as answered
      await InterviewProgressManager.markQuestionAnswered('general', currentQuestion.id);

      // Update statistics
      const stats = await InterviewProgressManager.getStatistics('general');
      setStatistics(stats);

      // Move to next question
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        resetTimer();

        // Animate question change
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        // Session complete
        await InterviewProgressManager.completeSession('general');
        handleSessionComplete();
      }
    } catch (error) {
      console.error('Error advancing question:', error);
    }
  }, [currentQuestionIndex, questions, resetTimer, fadeAnim]);

  /**
   * Skip current question
   */
  const skipQuestion = useCallback(() => {
    Alert.alert(
      "Skip Question?",
      "This question will be marked as seen. You can practice it again in a future session.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Skip", onPress: handleNextQuestion, style: "destructive" }
      ]
    );
  }, [handleNextQuestion]);

  /**
   * Handle exit
   */
  const handleExit = useCallback(() => {
    Alert.alert(
      "Exit Interview?",
      "Your progress will be saved. You can resume from this question later.",
      [
        { text: "Stay", style: "cancel" },
        {
          text: "Exit",
          onPress: () => {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            router.back();
          },
        },
      ]
    );
  }, [router]);

  /**
   * Handle session complete
   */
  const handleSessionComplete = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    Alert.alert(
      "Session Complete! 🎉",
      `Great job! You've completed 10 questions.\n\nProgress: ${statistics.askedQuestions}/${statistics.totalQuestions} questions practiced overall.`,
      [
        { text: "Exit", onPress: () => router.back() },
        {
          text: "Start New Session",
          onPress: () => {
            setCurrentQuestionIndex(0);
            loadQuestions();
          },
        },
      ]
    );
  }, [router, statistics, loadQuestions]);

  /**
   * Get timer color based on time remaining
   */
  const getTimerColor = useCallback(() => {
    if (timeLeft > 60) return "#4CAF50";
    if (timeLeft > 30) return "#FFD700";
    return "#FF6B6B";
  }, [timeLeft]);

  /**
   * Format time display
   */
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Pulse animation for timer when low
  useEffect(() => {
    if (timeLeft <= 10 && !isPaused) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [timeLeft, isPaused, pulseAnim]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00D9FF" />
        <Text style={styles.loadingText}>Loading questions...</Text>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>No questions available</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit} style={styles.exitButton} activeOpacity={0.7}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>General Interview</Text>
          <Text style={styles.headerSubtitle}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </Text>
        </View>

        <TouchableOpacity onPress={togglePause} style={styles.pauseButton} activeOpacity={0.7}>
          <Ionicons name={isPaused ? "play" : "pause"} size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }
          ]}
        />
      </View>

      {/* Statistics Badge */}
      <View style={styles.statisticsBadge}>
        <Ionicons name="trophy" size={16} color="#FFD700" />
        <Text style={styles.statisticsText}>
          {statistics.askedQuestions}/{statistics.totalQuestions} practiced • {statistics.percentageComplete}% complete
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
          {/* Timer */}
          <Animated.View
            style={[
              styles.timerContainer,
              {
                borderColor: getTimerColor(),
                transform: [{ scale: pulseAnim }]
              }
            ]}
          >
            <Ionicons name="time" size={24} color={getTimerColor()} />
            <Text style={[styles.timerText, { color: getTimerColor() }]}>
              {formatTime(timeLeft)}
            </Text>
            <TouchableOpacity onPress={resetTimer} activeOpacity={0.7}>
              <Ionicons name="refresh" size={20} color={getTimerColor()} />
            </TouchableOpacity>
          </Animated.View>

          {/* Question Card */}
          <View style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <View style={[
                styles.difficultyBadge,
                currentQuestion.difficulty === 'easy' && styles.difficulty_easy,
                currentQuestion.difficulty === 'medium' && styles.difficulty_medium,
                currentQuestion.difficulty === 'hard' && styles.difficulty_hard,
              ]}>
                <Text style={styles.difficultyText}>
                  {currentQuestion.difficulty.toUpperCase()}
                </Text>
              </View>
            </View>

            <Text style={styles.questionText}>{currentQuestion.text}</Text>

            {currentQuestion.tips && (
              <View style={styles.tipsContainer}>
                <Ionicons name="bulb" size={18} color="#FFD700" />
                <Text style={styles.tipsText}>{currentQuestion.tips}</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={skipQuestion}
              activeOpacity={0.8}
            >
              <Ionicons name="play-skip-forward" size={20} color="#888" />
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNextQuestion}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>
                {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Complete"}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#000" />
            </TouchableOpacity>
          </View>

          {/* STAR Method Reminder */}
          <View style={styles.starReminder}>
            <Text style={styles.starTitle}>💡 Remember the STAR Method</Text>
            <View style={styles.starGrid}>
              <View style={styles.starItem}>
                <Text style={styles.starLetter}>S</Text>
                <Text style={styles.starLabel}>Situation</Text>
              </View>
              <View style={styles.starItem}>
                <Text style={styles.starLetter}>T</Text>
                <Text style={styles.starLabel}>Task</Text>
              </View>
              <View style={styles.starItem}>
                <Text style={styles.starLetter}>A</Text>
                <Text style={styles.starLabel}>Action</Text>
              </View>
              <View style={styles.starItem}>
                <Text style={styles.starLetter}>R</Text>
                <Text style={styles.starLabel}>Result</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default MockInterview;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    color: "#888",
    fontSize: 16,
    marginTop: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    backgroundColor: "#0A0A0A",
    borderBottomWidth: 2,
    borderBottomColor: "#1A1A1A",
  },
  exitButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#00D9FF",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#888",
    marginTop: 4,
    fontWeight: "600",
  },
  pauseButton: {
    padding: 8,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: "#1A1A1A",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#00D9FF",
  },
  statisticsBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#0A0A0A",
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
  },
  statisticsText: {
    color: "#FFD700",
    fontSize: 13,
    fontWeight: "700",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 16,
    backgroundColor: "#0A0A0A",
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 24,
  },
  timerText: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 1,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  questionCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#00D9FF40",
    shadowColor: "#00D9FF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  questionHeader: {
    marginBottom: 16,
  },
  difficultyBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficulty_easy: {
    backgroundColor: "#4CAF5020",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  difficulty_medium: {
    backgroundColor: "#FFD70020",
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  difficulty_hard: {
    backgroundColor: "#FF6B6B20",
    borderWidth: 1,
    borderColor: "#FF6B6B",
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  questionText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFF",
    lineHeight: 32,
    marginBottom: 16,
  },
  tipsContainer: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#0A0A0A",
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#FFD700",
  },
  tipsText: {
    flex: 1,
    fontSize: 13,
    color: "#FFD700",
    lineHeight: 18,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  skipButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1A1A1A",
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#333",
  },
  skipButtonText: {
    color: "#888",
    fontSize: 16,
    fontWeight: "700",
  },
  nextButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#00D9FF",
    padding: 16,
    borderRadius: 14,
    shadowColor: "#00D9FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  nextButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  starReminder: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  starTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFF",
    marginBottom: 16,
    textAlign: "center",
  },
  starGrid: {
    flexDirection: "row",
    gap: 12,
  },
  starItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#0A0A0A",
    padding: 12,
    borderRadius: 12,
  },
  starLetter: {
    fontSize: 20,
    fontWeight: "900",
    color: "#00D9FF",
    marginBottom: 6,
  },
  starLabel: {
    fontSize: 11,
    color: "#888",
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#00D9FF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "800",
  },
});