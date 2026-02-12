import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { InterviewProgressManager } from "./../utils/InterviewProgressManager";
import { Question } from "./../utils/InterviewQuestionBank";

const FieldSpecificInterview = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const field = (params.field as string) || "Software Engineering";

  // State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isResumingSession, setIsResumingSession] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isPaused, setIsPaused] = useState(false);
  const [points, setPoints] = useState(0);
  const [statistics, setStatistics] = useState({
    totalQuestions: 0,
    askedQuestions: 0,
    remainingQuestions: 0,
    percentageComplete: 0,
  });

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pointsAnim = useRef(new Animated.Value(0)).current;

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
      pointsAnim.stopAnimation();
    };
  }, [fadeAnim, scaleAnim, pointsAnim]);

  /**
   * Load questions from progress manager
   */
  const loadQuestions = async () => {
    try {
      setIsLoading(true);

      const result = await InterviewProgressManager.getNextQuestions(field);
      const stats = await InterviewProgressManager.getStatistics(field);

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
          `Resuming ${field} interview from question ${result.progress.currentQuestionIndex + 1} of ${result.questions.length}`,
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
   * Award points with animation
   */
  const awardPoints = useCallback((amount: number) => {
    setPoints((prev) => prev + amount);

    Animated.sequence([
      Animated.spring(pointsAnim, {
        toValue: 1.3,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(pointsAnim, {
        toValue: 1,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, [pointsAnim]);

  /**
   * Handle next question
   */
  const handleNextQuestion = useCallback(async () => {
    const currentQuestion = questions[currentQuestionIndex];

    if (!currentQuestion) return;

    try {
      // Award points based on time remaining
      const pointsEarned = timeLeft > 60 ? 100 : timeLeft > 30 ? 75 : 50;
      awardPoints(pointsEarned);

      // Mark question as answered
      await InterviewProgressManager.markQuestionAnswered(field, currentQuestion.id);

      // Update statistics
      const stats = await InterviewProgressManager.getStatistics(field);
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
        await InterviewProgressManager.completeSession(field);
        handleSessionComplete();
      }
    } catch (error) {
      console.error('Error advancing question:', error);
    }
  }, [currentQuestionIndex, questions, resetTimer, fadeAnim, field, timeLeft, awardPoints]);

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
      `Excellent work! You earned ${points} points.\n\nProgress: ${statistics.askedQuestions}/${statistics.totalQuestions} ${field} questions practiced.`,
      [
        { text: "Exit", onPress: () => router.back() },
        {
          text: "Start New Session",
          onPress: () => {
            setCurrentQuestionIndex(0);
            setPoints(0);
            loadQuestions();
          },
        },
      ]
    );
  }, [router, statistics, points, field, loadQuestions]);

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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading {field} questions...</Text>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>No questions available for {field}</Text>
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
          <Text style={styles.headerTitle}>{field}</Text>
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

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <Animated.View style={[styles.pointsBadge, { transform: [{ scale: pointsAnim }] }]}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.pointsText}>{points} pts</Text>
        </Animated.View>

        <View style={styles.statisticsBadge}>
          <Ionicons name="trophy" size={14} color="#4CAF50" />
          <Text style={styles.statisticsText}>
            {statistics.askedQuestions}/{statistics.totalQuestions} • {statistics.percentageComplete}%
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
          {/* Timer */}
          <View
            style={[
              styles.timerContainer,
              { borderColor: getTimerColor() }
            ]}
          >
            <Ionicons name="time" size={24} color={getTimerColor()} />
            <Text style={[styles.timerText, { color: getTimerColor() }]}>
              {formatTime(timeLeft)}
            </Text>
            <TouchableOpacity onPress={resetTimer} activeOpacity={0.7}>
              <Ionicons name="refresh" size={20} color={getTimerColor()} />
            </TouchableOpacity>
          </View>

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
                <Ionicons name="bulb" size={18} color="#4CAF50" />
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

          {/* Field Context */}
          <View style={styles.contextCard}>
            <Text style={styles.contextTitle}>💼 {field} Focus</Text>
            <Text style={styles.contextText}>
              Share specific examples from your {field} experience. Highlight technical skills, tools, and measurable outcomes relevant to this field.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default FieldSpecificInterview;

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
    color: "#4CAF50",
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
    backgroundColor: "#4CAF50",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    paddingHorizontal: 20,
    backgroundColor: "#0A0A0A",
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
  },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1A1A1A",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  pointsText: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "800",
  },
  statisticsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statisticsText: {
    color: "#4CAF50",
    fontSize: 12,
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
    borderColor: "#4CAF5040",
    shadowColor: "#4CAF50",
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
    borderLeftColor: "#4CAF50",
  },
  tipsText: {
    flex: 1,
    fontSize: 13,
    color: "#4CAF50",
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
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 14,
    shadowColor: "#4CAF50",
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
  contextCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  contextTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFF",
    marginBottom: 12,
  },
  contextText: {
    fontSize: 14,
    color: "#888",
    lineHeight: 20,
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#4CAF50",
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