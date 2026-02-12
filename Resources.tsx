import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import InterviewTutorial from "../../components/InterviewTutorial";
import GuestModeManager from "../../utils/GuestModeManager";
import { sanitizeInput } from "../../utils/helpers";
import { getModalMaxHeight } from "../../utils/responsive";

interface Tip {
  id: number;
  title: string;
  description: string;
  icon: string;
}

const Resources = () => {
  const router = useRouter();
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [customField, setCustomField] = useState("");
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [showSTARModal, setShowSTARModal] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const careerFields = [
    "Software Engineering", "Data Science", "Marketing", "Finance",
    "Healthcare", "Education", "Sales", "Human Resources",
    "Design (UI/UX)", "Business Analyst", "Project Management",
    "Customer Service", "Engineering", "Legal", "Consulting"
  ];

  const tips: Tip[] = [
    {
      id: 1,
      title: "Tailor Your Resume",
      description: "Customize your resume for each job application. Highlight skills and experiences that match the job description. Use keywords from the posting.",
      icon: "document-text-outline",
    },
    {
      id: 2,
      title: "Practice Common Questions",
      description: "Prepare answers for 'Tell me about yourself,' 'Why this company?' and 'What are your strengths?' Practice out loud to build confidence.",
      icon: "chatbubble-outline",
    },
    {
      id: 3,
      title: "Network Effectively",
      description: "Connect with professionals on LinkedIn. Attend industry events and career fairs. Reach out for informational interviews. Most jobs come through connections.",
      icon: "people-outline",
    },
    {
      id: 4,
      title: "Follow Up After Interviews",
      description: "Send a thank-you email within 24 hours. Mention specific topics discussed. Reiterate your interest. It shows professionalism and keeps you top of mind.",
      icon: "mail-outline",
    },
    {
      id: 5,
      title: "Research the Company",
      description: "Study the company's mission, values, recent news, and products. Understand their culture. Check employee reviews on Glassdoor. Show genuine interest.",
      icon: "search-outline",
    },
    {
      id: 6,
      title: "Prepare Smart Questions",
      description: "Ask about team dynamics, growth opportunities, and day-to-day responsibilities. Avoid questions about salary/benefits in first interviews. Show curiosity.",
      icon: "help-circle-outline",
    },
    {
      id: 7,
      title: "Professional Online Presence",
      description: "Update LinkedIn with a professional photo and complete profile. Remove inappropriate social media content. Employers WILL Google you.",
      icon: "logo-linkedin",
    },
    {
      id: 8,
      title: "Body Language Matters",
      description: "Maintain eye contact, sit up straight, and smile. Firm handshake. Avoid fidgeting or crossing arms. Project confidence through your presence.",
      icon: "hand-left-outline",
    }
  ];

  // Animation effect
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Cleanup animation
    return () => {
      fadeAnim.stopAnimation();
      slideAnim.stopAnimation();
    };
  }, [fadeAnim, slideAnim]);

  // Check guest mode
  useEffect(() => {
    const checkGuest = async () => {
      await GuestModeManager.showGuestWelcome();
    };
    checkGuest();
  }, []);

  // Check tutorial
  useEffect(() => {
    const checkTutorial = async () => {
      const TutorialManager = (await import('../../utils/TutorialManager')).default;
      if (!TutorialManager.isLoaded()) {
        await TutorialManager.loadTutorialStatus();
      }
      const hasSeenTutorial = await TutorialManager.hasSeen('interview');
      if (!hasSeenTutorial) {
        setTimeout(() => setShowTutorial(true), 500);
      }
    };
    checkTutorial();
  }, []);

  /**
   * Handle field selection and navigate to field-specific interview
   */
  const handleFieldSelection = useCallback((field: string) => {
    setShowFieldModal(false);
    router.push({
      pathname: "/FieldSpecificInterview",
      params: { field }
    });
  }, [router]);

  /**
   * Handle custom field submission with sanitization
   */
  const handleCustomField = useCallback(() => {
    const sanitized = sanitizeInput(customField);
    if (sanitized && sanitized.length >= 3) {
      setShowFieldModal(false);
      router.push({
        pathname: "/FieldSpecificInterview",
        params: { field: sanitized }
      });
      setCustomField("");
    }
  }, [customField, router]);

  /**
   * Navigate to next tip
   */
  const nextTip = useCallback(() => {
    if (currentTipIndex < tips.length - 1) {
      setCurrentTipIndex(currentTipIndex + 1);
    }
  }, [currentTipIndex, tips.length]);

  /**
   * Navigate to previous tip
   */
  const prevTip = useCallback(() => {
    if (currentTipIndex > 0) {
      setCurrentTipIndex(currentTipIndex - 1);
    }
  }, [currentTipIndex]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <InterviewTutorial
        visible={showTutorial}
        onClose={async () => {
          setShowTutorial(false);
          const TutorialManager = (await import('../../utils/TutorialManager')).default;
          await TutorialManager.markTutorialAsSeen('interview');
        }}
      />

      <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
        <View style={styles.headerSection}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="library" size={36} color="#00D9FF" />
          </View>
          <Text style={styles.title}>Resource Hub</Text>
          <Text style={styles.headerSubtitle}>Everything you need to succeed</Text>

          <TouchableOpacity
            style={styles.tutorialBadge}
            onPress={() => setShowTutorial(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="help-circle" size={18} color="#4CAF50" />
            <Text style={styles.tutorialBadgeText}>How it Works</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interview Practice</Text>
          <Text style={styles.sectionDescription}>
            Sharpen your interview skills with practice questions
          </Text>

          <TouchableOpacity
            style={styles.interviewCard}
            onPress={() => router.push("/MockInterview" as any)}
            activeOpacity={0.85}
          >
            <View style={styles.cardIcon}>
              <Ionicons name="chatbubbles" size={30} color="#00D9FF" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>General Interview Questions</Text>
              <Text style={styles.cardDescription}>
                Practice common behavioral and situational questions
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={26} color="#00D9FF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.interviewCard}
            onPress={() => setShowFieldModal(true)}
            activeOpacity={0.85}
          >
            <View style={[styles.cardIcon, { backgroundColor: "#0A2A0A" }]}>
              <Ionicons name="briefcase" size={30} color="#4CAF50" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Field-Specific Questions</Text>
              <Text style={styles.cardDescription}>
                Get tailored questions for your specific career field
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={26} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.tipsModule}
          onPress={() => setShowTipsModal(true)}
          activeOpacity={0.85}
        >
          <View style={styles.moduleHeader}>
            <Ionicons name="bulb" size={28} color="#FFD700" />
            <Text style={styles.moduleTitle}>Career Tips & Best Practices</Text>
          </View>
          <Text style={styles.moduleSubtitle}>
            Expert advice to boost your job search success
          </Text>
          <View style={styles.moduleFooter}>
            <Text style={styles.viewAllText}>View All Tips</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFD700" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.starModule}
          onPress={() => setShowSTARModal(true)}
          activeOpacity={0.85}
        >
          <View style={styles.moduleHeader}>
            <Ionicons name="star" size={28} color="#00D9FF" />
            <Text style={styles.moduleTitle}>The STAR Method</Text>
          </View>
          <Text style={styles.moduleSubtitle}>
            Master the framework for answering behavioral questions
          </Text>
          <View style={styles.moduleFooter}>
            <Text style={styles.viewAllText}>Learn More</Text>
            <Ionicons name="arrow-forward" size={18} color="#00D9FF" />
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Field Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showFieldModal}
        onRequestClose={() => setShowFieldModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxHeight: getModalMaxHeight() as any }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Your Field</Text>
              <TouchableOpacity onPress={() => setShowFieldModal(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={30} color="#888" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.fieldList}>
              {careerFields.map((field, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.fieldItem}
                  onPress={() => handleFieldSelection(field)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.fieldText}>{field}</Text>
                  <Ionicons name="chevron-forward" size={22} color="#00D9FF" />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.customFieldContainer}>
              <Text style={styles.customFieldLabel}>Or enter your own:</Text>
              <View style={styles.customFieldInput}>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., Graphic Design"
                  placeholderTextColor="#555"
                  value={customField}
                  onChangeText={(text) => setCustomField(sanitizeInput(text))}
                  maxLength={100}
                />
                <TouchableOpacity
                  style={styles.goButton}
                  onPress={handleCustomField}
                  disabled={!customField.trim()}
                  activeOpacity={0.8}
                >
                  <Text style={styles.goButtonText}>Go</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Tips Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showTipsModal}
        onRequestClose={() => setShowTipsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.tipsModalContainer, { maxHeight: getModalMaxHeight() as any }]}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowTipsModal(false)}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={30} color="#888" />
            </TouchableOpacity>

            <View style={styles.tipCard}>
              <View style={styles.tipIconContainer}>
                <Ionicons name={tips[currentTipIndex].icon as any} size={44} color="#FFD700" />
              </View>
              <Text style={styles.tipTitle}>{tips[currentTipIndex].title}</Text>
              <Text style={styles.tipDescription}>{tips[currentTipIndex].description}</Text>

              <View style={styles.tipProgress}>
                {tips.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressDot,
                      index === currentTipIndex && styles.activeDot
                    ]}
                  />
                ))}
              </View>

              <View style={styles.tipNavigation}>
                <TouchableOpacity
                  style={[styles.navBtn, currentTipIndex === 0 && styles.navBtnDisabled]}
                  onPress={prevTip}
                  disabled={currentTipIndex === 0}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-back" size={26} color={currentTipIndex === 0 ? "#555" : "white"} />
                </TouchableOpacity>

                <Text style={styles.tipCounter}>
                  {currentTipIndex + 1} of {tips.length}
                </Text>

                <TouchableOpacity
                  style={[styles.navBtn, currentTipIndex === tips.length - 1 && styles.navBtnDisabled]}
                  onPress={nextTip}
                  disabled={currentTipIndex === tips.length - 1}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-forward" size={26} color={currentTipIndex === tips.length - 1 ? "#555" : "white"} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* STAR Method Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSTARModal}
        onRequestClose={() => setShowSTARModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.starModalContainer, { maxHeight: getModalMaxHeight() as any }]}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSTARModal(false)}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={30} color="#888" />
            </TouchableOpacity>

            <ScrollView
              contentContainerStyle={styles.starModalContent}
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.starIconContainer}>
                <Ionicons name="star" size={40} color="#00D9FF" />
              </View>

              <Text style={styles.starTitle}>The STAR Method</Text>
              <Text style={styles.starSubtitle}>Structure your interview answers effectively</Text>

              <View style={styles.starSteps}>
                <View style={styles.starStep}>
                  <View style={styles.starStepBadge}>
                    <Text style={styles.starStepLetter}>S</Text>
                  </View>
                  <View style={styles.starStepContent}>
                    <Text style={styles.starStepTitle}>Situation</Text>
                    <Text style={styles.starStepText}>Set the context. Describe the challenge or situation.</Text>
                  </View>
                </View>

                <View style={styles.starStep}>
                  <View style={styles.starStepBadge}>
                    <Text style={styles.starStepLetter}>T</Text>
                  </View>
                  <View style={styles.starStepContent}>
                    <Text style={styles.starStepTitle}>Task</Text>
                    <Text style={styles.starStepText}>Explain your specific responsibility or goal.</Text>
                  </View>
                </View>

                <View style={styles.starStep}>
                  <View style={styles.starStepBadge}>
                    <Text style={styles.starStepLetter}>A</Text>
                  </View>
                  <View style={styles.starStepContent}>
                    <Text style={styles.starStepTitle}>Action</Text>
                    <Text style={styles.starStepText}>Detail the steps you took to address it.</Text>
                  </View>
                </View>

                <View style={styles.starStep}>
                  <View style={styles.starStepBadge}>
                    <Text style={styles.starStepLetter}>R</Text>
                  </View>
                  <View style={styles.starStepContent}>
                    <Text style={styles.starStepTitle}>Result</Text>
                    <Text style={styles.starStepText}>Share the outcome and what you learned.</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.starCloseButton}
                onPress={() => setShowSTARModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.starCloseButtonText}>Got It!</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default Resources;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#000",
    padding: 20,
    paddingBottom: 20,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 32,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#1A1A1A",
  },
  headerIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#0A1A1A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 2,
    borderColor: "#00D9FF50",
    shadowColor: "#00D9FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#00D9FF",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 1.2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 14,
    fontWeight: "500",
  },
  tutorialBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0A2A0A",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#4CAF5050",
  },
  tutorialBadgeText: {
    color: "#4CAF50",
    fontSize: 13,
    fontWeight: "700",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFF",
    marginBottom: 12,
    letterSpacing: 0.6,
  },
  sectionDescription: {
    fontSize: 15,
    color: "#888",
    marginBottom: 18,
    fontWeight: "500",
  },
  interviewCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: "#333",
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#0A1A1A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 2,
    borderColor: "#00D9FF50",
    flexShrink: 0,
  },
  cardContent: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFF",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  cardDescription: {
    fontSize: 13,
    color: "#888",
    lineHeight: 18,
    fontWeight: "500",
  },
  tipsModule: {
    backgroundColor: "#1A1A1A",
    padding: 18,
    borderRadius: 16,
    marginBottom: 18,
    borderLeftWidth: 4,
    borderLeftColor: "#FFD700",
    borderWidth: 2,
    borderColor: "#333",
  },
  starModule: {
    backgroundColor: "#1A1A1A",
    padding: 18,
    borderRadius: 16,
    marginBottom: 18,
    borderLeftWidth: 4,
    borderLeftColor: "#00D9FF",
    borderWidth: 2,
    borderColor: "#333",
  },
  moduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 0.3,
    flex: 1,
  },
  moduleSubtitle: {
    fontSize: 13,
    color: "#888",
    marginBottom: 12,
    fontWeight: "500",
    lineHeight: 18,
  },
  moduleFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  viewAllText: {
    fontSize: 15,
    color: "#00D9FF",
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.94)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#0A0A0A",
    borderRadius: 24,
    width: "90%",
    padding: 24,
    borderWidth: 2,
    borderColor: "#00D9FF",
    shadowColor: "#00D9FF",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#00D9FF",
    letterSpacing: 0.6,
  },
  fieldList: {
    maxHeight: 450,
    marginBottom: 10,
  },
  fieldItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  fieldText: {
    fontSize: 15,
    color: "#FFF",
    fontWeight: "600",
    flex: 1,
    marginRight: 10,
  },
  customFieldContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: "#1A1A1A",
  },
  customFieldLabel: {
    fontSize: 15,
    color: "#888",
    marginBottom: 14,
    fontWeight: "600",
  },
  customFieldInput: {
    flexDirection: "row",
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    color: "white",
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    fontWeight: "500",
    borderWidth: 2,
    borderColor: "#333",
  },
  goButton: {
    backgroundColor: "#00D9FF",
    paddingHorizontal: 26,
    borderRadius: 12,
    justifyContent: "center",
    shadowColor: "#00D9FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  goButtonText: {
    color: "#000",
    fontWeight: "800",
    fontSize: 16,
  },
  tipsModalContainer: {
    backgroundColor: "#0A0A0A",
    borderRadius: 20,
    width: "90%",
    maxWidth: 400,
    padding: 25,
    borderWidth: 2,
    borderColor: "#FFD700",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 4,
  },
  tipCard: {
    alignItems: "center",
  },
  tipIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 3,
    borderColor: "#FFD700",
  },
  tipTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFF",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  tipDescription: {
    fontSize: 14,
    color: "#B8B8B8",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
    fontWeight: "500",
  },
  tipProgress: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#333",
  },
  activeDot: {
    backgroundColor: "#FFD700",
    width: 28,
  },
  tipNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  navBtn: {
    backgroundColor: "#1A1A1A",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#333",
  },
  navBtnDisabled: {
    opacity: 0.3,
  },
  tipCounter: {
    fontSize: 16,
    color: "#FFD700",
    fontWeight: "700",
  },
  starModalContainer: {
    backgroundColor: "#0A0A0A",
    borderRadius: 24,
    width: "90%",
    maxWidth: 400,
    borderWidth: 2,
    borderColor: "#00D9FF",
    shadowColor: "#00D9FF",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  starModalContent: {
    padding: 24,
    paddingTop: 50,
    paddingBottom: 20,
  },
  starIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#00D9FF",
  },
  starTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFF",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.6,
  },
  starSubtitle: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "500",
  },
  starSteps: {
    gap: 14,
    marginBottom: 24,
  },
  starStep: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: "#1A1A1A",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#333",
  },
  starStepBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#00D9FF",
    justifyContent: "center",
    alignItems: "center",
  },
  starStepLetter: {
    fontSize: 18,
    fontWeight: "900",
    color: "#000",
  },
  starStepContent: {
    flex: 1,
  },
  starStepTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#00D9FF",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  starStepText: {
    fontSize: 13,
    color: "#B8B8B8",
    lineHeight: 18,
    fontWeight: "500",
  },
  starCloseButton: {
    backgroundColor: "#00D9FF",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#00D9FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 10,
  },
  starCloseButtonText: {
    color: "#000",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});