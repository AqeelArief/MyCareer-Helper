import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Alert, Animated, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import ResumeTutorial from "../../components/ResumeTutorial";
import GuestModeManager from '../../utils/GuestModeManager';
import ResumeContext from "../_context/ResumeContext";

const ResumeBuilder = () => {
  const { setResumeData, resumeData } = useContext(ResumeContext);
  const router = useRouter();

  const [showTutorial, setShowTutorial] = useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  const [name, setName] = useState(resumeData.name || "");
  const [email, setEmail] = useState(resumeData.email || "");
  const [phone, setPhone] = useState(resumeData.phone || "");
  const [address, setAddress] = useState(resumeData.address || "");
  const [linkedin, setLinkedin] = useState(resumeData.linkedin || "");
  const [website, setWebsite] = useState(resumeData.website || "");
  const [school, setSchool] = useState(resumeData.school || "");
  const [degree, setDegree] = useState(resumeData.degree || "");
  const [major, setMajor] = useState(resumeData.major || "");
  const [gpa, setGpa] = useState(resumeData.gpa || "");
  const [graduationDate, setGraduationDate] = useState(resumeData.graduationDate || "");
  const [coursework, setCoursework] = useState(resumeData.coursework || "");
  const [experiences, setExperiences] = useState(resumeData.experiences || "");
  const [technicalSkills, setTechnicalSkills] = useState(resumeData.technicalSkills || "");
  const [languages, setLanguages] = useState(resumeData.languages || "");
  const [certifications, setCertifications] = useState(resumeData.certifications || "");
  const [projects, setProjects] = useState(resumeData.projects || "");
  const [activities, setActivities] = useState(resumeData.activities || "");

  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const sections = [
    "Personal Info",
    "Education",
    "Experience",
    "Projects",
    "Skills",
    "Activities"
  ];

  useEffect(() => {
    const checkTutorial = async () => {
      const TutorialManager = (await import('../../utils/TutorialManager')).default;

      if (!TutorialManager.isLoaded()) {
        await TutorialManager.loadTutorialStatus();
      }

      // hasSeen is now async!
      const hasSeenTutorial = await TutorialManager.hasSeen('resume');
      const isFirstVisit = !resumeData.name && !resumeData.email && !resumeData.phone;

      if (!hasSeenTutorial && isFirstVisit) {
        setTimeout(() => setShowTutorial(true), 500);
      }

      setHasSeenTutorial(hasSeenTutorial);
    };

    checkTutorial();
  }, []);

  useEffect(() => {
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
  }, [currentSection]);
  // Auto-save guest resume data

  useEffect(() => {
    const saveGuestResume = async () => {
      const isGuest = await GuestModeManager.isGuestMode();
      if (isGuest) {
        await GuestModeManager.saveGuestResume({
          name, email, phone, address, linkedin, website,
          school, degree, major, gpa, graduationDate, coursework,
          experiences, technicalSkills, languages, certifications,
          projects, activities,
        });
      }
    };

    // Debounce save - only save after 500ms of no changes
    const timeout = setTimeout(() => {
      saveGuestResume();
    }, 500);

    return () => clearTimeout(timeout);
  }, [name, email, phone, address, linkedin, website, school, degree, major, gpa, graduationDate, coursework, experiences, technicalSkills, languages, certifications, projects, activities]);

  const handleCriticalFieldChange = (
    field: 'name' | 'email' | 'phone',
    value: string,
    setter: (val: string) => void
  ) => {
    setter(value);
    // Guests can now fill out everything - no restrictions!
  };

  const handleGenerate = useCallback(async () => {
    if (!name || !email || !phone) {
      setError("Please fill in at least your name, email, and phone number.");
      return;
    }

    setError("");
    setIsGenerating(true);

    const resumeDataToSave = {
      name, email, phone, address, linkedin, website,
      school, degree, major, gpa, graduationDate, coursework,
      experiences, technicalSkills, languages, certifications,
      projects, activities,
    };

    // Save to context
    setResumeData(resumeDataToSave);

    // Check if guest mode
    const isGuest = await GuestModeManager.isGuestMode();

    if (isGuest) {
      // Save to AsyncStorage
      await GuestModeManager.saveGuestResume(resumeDataToSave);

      setIsGenerating(false);

      // Prompt to sign up to VIEW resume
      GuestModeManager.showViewResumePrompt(() => {
        router.push('/'); // Navigate to sign up/sign in
      });
    } else {
      // Authenticated user - allow viewing
      setTimeout(() => {
        setIsGenerating(false);
        Alert.alert(
          "Resume Saved! ✅",
          "Your resume has been saved. View it from your Profile tab.",
          [
            { text: "Stay Here", style: "cancel" },
            { text: "View Resume", onPress: () => router.push("/MadeResume") }
          ]
        );
      }, 500);
    }
  }, [name, email, phone, address, linkedin, website, school, degree, major, gpa, graduationDate, coursework, experiences, technicalSkills, languages, certifications, projects, activities, setResumeData, router]);
  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const renderSection = () => {
    switch (currentSection) {
      case 0:
        return (
          <>
            <Text style={styles.sectionTitle}>📋 Personal Information</Text>
            <Text style={styles.helperText}>Basic contact details</Text>

            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor="#555"
              value={name}
              onChangeText={(val) => handleCriticalFieldChange('name', val, setName)}
            />

            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="john.doe@example.com"
              placeholderTextColor="#555"
              value={email}
              onChangeText={(val) => handleCriticalFieldChange('email', val, setEmail)}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="(123) 456-7890"
              placeholderTextColor="#555"
              value={phone}
              onChangeText={(val) => handleCriticalFieldChange('phone', val, setPhone)}
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Address</Text>
            <TextInput style={styles.input} placeholder="City, State ZIP" placeholderTextColor="#555" value={address} onChangeText={setAddress} />

            <Text style={styles.label}>LinkedIn Profile</Text>
            <TextInput style={styles.input} placeholder="linkedin.com/in/yourprofile" placeholderTextColor="#555" value={linkedin} onChangeText={setLinkedin} autoCapitalize="none" />

            <Text style={styles.label}>Website/Portfolio</Text>
            <TextInput style={styles.input} placeholder="yourwebsite.com" placeholderTextColor="#555" value={website} onChangeText={setWebsite} autoCapitalize="none" />
          </>
        );

      case 1:
        return (
          <>
            <Text style={styles.sectionTitle}>🎓 Education</Text>
            <Text style={styles.helperText}>Your academic background</Text>

            <Text style={styles.label}>School/University</Text>
            <TextInput style={styles.input} placeholder="Harvard University" placeholderTextColor="#555" value={school} onChangeText={setSchool} />

            <Text style={styles.label}>Degree</Text>
            <TextInput style={styles.input} placeholder="Bachelor of Science" placeholderTextColor="#555" value={degree} onChangeText={setDegree} />

            <Text style={styles.label}>Major/Field of Study</Text>
            <TextInput style={styles.input} placeholder="Mechanical Engineering" placeholderTextColor="#555" value={major} onChangeText={setMajor} />

            <Text style={styles.label}>GPA (Optional)</Text>
            <TextInput style={styles.input} placeholder="3.55" placeholderTextColor="#555" value={gpa} onChangeText={setGpa} keyboardType="decimal-pad" />

            <Text style={styles.label}>Expected Graduation</Text>
            <TextInput style={styles.input} placeholder="May 2027" placeholderTextColor="#555" value={graduationDate} onChangeText={setGraduationDate} />

            <Text style={styles.label}>Relevant Coursework</Text>
            <TextInput style={[styles.input, styles.textArea]} placeholder="Computer Science 101, Data Structures, Algorithms..." placeholderTextColor="#555" value={coursework} onChangeText={setCoursework} multiline />
          </>
        );

      case 2:
        return (
          <>
            <Text style={styles.sectionTitle}>💼 Work Experience</Text>
            <Text style={styles.helperText}>Include internships, jobs, and research positions</Text>

            <View style={styles.tipBox}>
              <Ionicons name="bulb-outline" size={20} color="#FFD700" />
              <Text style={styles.tipText}>
                Format: Company/Organization{'\n'}
                Position | Location | Dates{'\n'}
                • Use bullet points for achievements{'\n'}
                • Start with action verbs (Led, Developed, Managed){'\n'}
                • Include quantifiable results
              </Text>
            </View>

            <TextInput style={[styles.input, styles.largeTextArea]} placeholder="Example:&#10;Harvard Laboratory for Nanoscale Optics&#10;Research Assistant | Cambridge, MA | June - Aug 2025&#10;• Optimized dry etch recipe for titanium dioxide films&#10;• Fabricated photonic devices using cleanroom facilities&#10;• Characterized devices using transmission setup" placeholderTextColor="#555" value={experiences} onChangeText={setExperiences} multiline numberOfLines={12} />
          </>
        );

      case 3:
        return (
          <>
            <Text style={styles.sectionTitle}>🚀 Projects</Text>
            <Text style={styles.helperText}>Personal projects, design work, or research</Text>

            <View style={styles.tipBox}>
              <Ionicons name="bulb-outline" size={20} color="#FFD700" />
              <Text style={styles.tipText}>
                Include: Project name, brief description, technologies used, and your specific contributions
              </Text>
            </View>

            <TextInput style={[styles.input, styles.largeTextArea]} placeholder="Example:&#10;Electric Bicycle | Personal Project&#10;• Designed electrical and mechanical systems for custom 1kW bike&#10;• Integrated battery management system and motor controller&#10;&#10;Smart Appliance | IoT Project&#10;• Built IoT toaster using Raspberry Pi and Python&#10;• Designed and 3D-printed custom enclosure" placeholderTextColor="#555" value={projects} onChangeText={setProjects} multiline numberOfLines={10} />
          </>
        );

      case 4:
        return (
          <>
            <Text style={styles.sectionTitle}>⚡ Skills & Qualifications</Text>
            <Text style={styles.helperText}>Technical skills, languages, and certifications</Text>

            <Text style={styles.label}>Technical Skills</Text>
            <TextInput style={[styles.input, styles.textArea]} placeholder="Programming: Python, JavaScript, C++&#10;Tools: Git, Docker, AWS&#10;Frameworks: React, Node.js" placeholderTextColor="#555" value={technicalSkills} onChangeText={setTechnicalSkills} multiline />

            <Text style={styles.label}>Languages</Text>
            <TextInput style={styles.input} placeholder="Spanish (Fluent), French (Intermediate)" placeholderTextColor="#555" value={languages} onChangeText={setLanguages} />

            <Text style={styles.label}>Certifications (Optional)</Text>
            <TextInput style={[styles.input, styles.textArea]} placeholder="AWS Certified Developer&#10;Google UX Design Certificate" placeholderTextColor="#555" value={certifications} onChangeText={setCertifications} multiline />
          </>
        );

      case 5:
        return (
          <>
            <Text style={styles.sectionTitle}>🏆 Leadership & Activities</Text>
            <Text style={styles.helperText}>Extracurriculars, clubs, volunteer work</Text>

            <TextInput style={[styles.input, styles.largeTextArea]} placeholder="Example:&#10;Harvard College Engineering Society | Vice President | Sept 2024 - present&#10;• Organize monthly meetings for engineering community&#10;• Host guest speakers and manage communications&#10;&#10;Campus Volunteer Program | Volunteer | 2023 - present&#10;• Tutor underprivileged students in math and science" placeholderTextColor="#555" value={activities} onChangeText={setActivities} multiline numberOfLines={10} />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#000" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <ResumeTutorial
        visible={showTutorial}
        onClose={async () => {
          setShowTutorial(false);
          const TutorialManager = (await import('../../utils/TutorialManager')).default;
          await TutorialManager.markTutorialAsSeen('resume');
        }}
      />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerSection}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="document-text" size={36} color="#00D9FF" />
          </View>
          <Text style={styles.title}>Resume Builder</Text>
          <Text style={styles.headerSubtitle}>Build your professional resume</Text>

          <TouchableOpacity
            style={styles.tutorialBadge}
            onPress={() => setShowTutorial(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="help-circle" size={18} color="#00D9FF" />
            <Text style={styles.tutorialBadgeText}>How it Works</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: `${((currentSection + 1) / sections.length) * 100}%` }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Section {currentSection + 1} of {sections.length}: {sections[currentSection]}
          </Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Animated.View
          style={[
            styles.sectionContainer,
            {
              opacity: fadeAnim,
            }
          ]}
        >
          {renderSection()}
        </Animated.View>

        <View style={styles.navigationContainer}>
          {currentSection > 0 && (
            <TouchableOpacity
              style={styles.navButton}
              onPress={prevSection}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color="#00D9FF" />
              <Text style={styles.navButtonText}>Previous</Text>
            </TouchableOpacity>
          )}

          {currentSection < sections.length - 1 ? (
            <TouchableOpacity
              style={[styles.navButton, styles.nextButton]}
              onPress={nextSection}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>Next</Text>
              <Ionicons name="arrow-forward" size={20} color="#000" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.generateButton]}
              onPress={handleGenerate}
              disabled={isGenerating}
              activeOpacity={0.8}
            >
              <Ionicons name="document-text" size={22} color="#000" />
              <Text style={styles.buttonText}>
                {isGenerating ? "Generating..." : "Generate Resume"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => {
              Alert.alert("Preview Resume", "Complete at least your personal information to preview your resume.", [
                { text: "OK" },
                { text: "Go to Preview", onPress: handleGenerate }
              ]);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="eye-outline" size={20} color="#00D9FF" />
            <Text style={styles.quickActionText}>Preview</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => {
              Alert.alert("Clear All Data", "Are you sure you want to clear all resume data?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Clear", style: "destructive",
                  onPress: () => {
                    setName(""); setEmail(""); setPhone(""); setAddress("");
                    setLinkedin(""); setWebsite(""); setSchool(""); setDegree("");
                    setMajor(""); setGpa(""); setGraduationDate(""); setCoursework("");
                    setExperiences(""); setTechnicalSkills(""); setLanguages("");
                    setCertifications(""); setProjects(""); setActivities("");
                    setCurrentSection(0);
                  }
                }
              ]);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
            <Text style={[styles.quickActionText, { color: "#FF6B6B" }]}>Clear</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: Platform.OS === 'ios' ? 100 : 95 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ResumeBuilder;

// STYLES IN PART 2...// PASTE THIS IMMEDIATELY AFTER PART 1

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 20,
    backgroundColor: "#000",
    flexGrow: 1,
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
    backgroundColor: "#0A1A1A",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#00D9FF50",
  },
  tutorialBadgeText: {
    color: "#00D9FF",
    fontSize: 13,
    fontWeight: "700",
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    height: 12,
    backgroundColor: "#1A1A1A",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#00D9FF",
    borderRadius: 6,
    shadowColor: "#00D9FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  progressText: {
    fontSize: 15,
    color: "#00D9FF",
    textAlign: "center",
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFF",
    marginBottom: 12,
    letterSpacing: 0.6,
  },
  helperText: {
    fontSize: 15,
    color: "#888",
    marginBottom: 24,
    fontStyle: "italic",
    fontWeight: "500",
  },
  label: {
    fontSize: 15,
    color: "#00D9FF",
    marginBottom: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: "#1A1A1A",
    padding: 16,
    borderRadius: 12,
    marginBottom: 18,
    fontSize: 16,
    borderWidth: 2,
    borderColor: "#333",
    color: "#FFF",
    fontWeight: "500",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  largeTextArea: {
    minHeight: 240,
    textAlignVertical: "top",
  },
  tipBox: {
    backgroundColor: "#1A1A1A",
    padding: 16,
    borderRadius: 12,
    marginBottom: 18,
    borderLeftWidth: 4,
    borderLeftColor: "#FFD700",
    flexDirection: "row",
    gap: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: "#FFD700",
    lineHeight: 20,
    fontWeight: "600",
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 14,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    padding: 16,
    borderRadius: 12,
    gap: 10,
    flex: 1,
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#333",
  },
  nextButton: {
    backgroundColor: "#00D9FF",
    borderColor: "#00D9FF",
    shadowColor: "#00D9FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  navButtonText: {
    color: "#00D9FF",
    fontSize: 17,
    fontWeight: "700",
  },
  nextButtonText: {
    color: "#000",
    fontSize: 17,
    fontWeight: "700",
  },
  button: {
    backgroundColor: "#00D9FF",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    flex: 1,
  },
  generateButton: {
    shadowColor: "#00D9FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#000",
    letterSpacing: 0.5,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 18,
    fontWeight: "600",
    backgroundColor: "#FF6B6B20",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF6B6B50",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: 24,
  },
  quickActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
  },
  quickActionText: {
    color: "#00D9FF",
    fontSize: 15,
    fontWeight: "700",
  },
});