import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useContext, useEffect, useRef } from "react";
import { Alert, Animated, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ResumeContext from "./_context/ResumeContext";

interface ExperienceEntry {
  title: string;
  details: string;
  bullets: string[];
}

const MadeResume = () => {
  const { resumeData } = useContext(ResumeContext);
  const router = useRouter();
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  /**
   * Handle exit with confirmation
   */
  const handleExit = useCallback(() => {
    Alert.alert(
      "Exit Resume",
      "Your resume is saved. You can view it anytime from your Profile.",
      [
        { text: "Stay", style: "cancel" },
        { text: "Exit", onPress: () => router.back() },
      ]
    );
  }, [router]);

  /**
   * Format resume as text for sharing
   */
  const formatResumeAsText = useCallback(() => {
    let text = `${resumeData.name}\n`;
    if (resumeData.address) text += `${resumeData.address}\n`;
    if (resumeData.email) text += `${resumeData.email}`;
    if (resumeData.phone) text += ` | ${resumeData.phone}`;
    if (resumeData.linkedin) text += `\n${resumeData.linkedin}`;
    if (resumeData.website) text += `\n${resumeData.website}`;

    if (resumeData.school) {
      text += `\n\nEDUCATION\n${resumeData.school}`;
      if (resumeData.degree) text += `\n${resumeData.degree}`;
      if (resumeData.major) text += `: ${resumeData.major}`;
      if (resumeData.gpa) text += `. GPA: ${resumeData.gpa}`;
      if (resumeData.graduationDate) text += `\nExpected: ${resumeData.graduationDate}`;
    }

    if (resumeData.experiences) text += `\n\nEXPERIENCE\n${resumeData.experiences}`;
    if (resumeData.projects) text += `\n\nPROJECTS\n${resumeData.projects}`;
    if (resumeData.technicalSkills) text += `\n\nSKILLS\n${resumeData.technicalSkills}`;
    if (resumeData.activities) text += `\n\nLEADERSHIP & ACTIVITIES\n${resumeData.activities}`;

    return text;
  }, [resumeData]);

  /**
   * Share resume
   */
  const handleShare = useCallback(async () => {
    try {
      const resumeText = formatResumeAsText();
      await Share.share({
        message: resumeText,
        title: `${resumeData.name}'s Resume`,
      });
    } catch (error: unknown) {
      const err = error as any;
      console.error("Error sharing:", err);
    }
  }, [formatResumeAsText, resumeData.name]);

  /**
   * Parse experience/project text into structured entries
   */
  const parseExperienceEntry = useCallback((text: string): ExperienceEntry[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const entries: ExperienceEntry[] = [];
    let currentEntry: ExperienceEntry | null = null;

    lines.forEach(line => {
      const trimmed = line.trim();

      if (!trimmed.startsWith('•') && !trimmed.startsWith('-') && !trimmed.startsWith('*') && currentEntry === null) {
        if (currentEntry) entries.push(currentEntry);
        currentEntry = { title: trimmed, details: '', bullets: [] };
      }
      else if (!trimmed.startsWith('•') && !trimmed.startsWith('-') && !trimmed.startsWith('*') && currentEntry && !currentEntry.details) {
        currentEntry.details = trimmed;
      }
      else if ((trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) && currentEntry) {
        currentEntry.bullets.push(trimmed.replace(/^[•\-*]\s*/, ''));
      }
      else if (!trimmed.startsWith('•') && !trimmed.startsWith('-') && !trimmed.startsWith('*') && currentEntry && currentEntry.details) {
        entries.push(currentEntry);
        currentEntry = { title: trimmed, details: '', bullets: [] };
      }
    });

    if (currentEntry) entries.push(currentEntry);
    return entries;
  }, []);

  /**
   * Extract date from details string
   */
  const extractDateFromDetails = useCallback((details: string): { main: string; date: string } => {
    const datePatterns = [
      /\|\s*([A-Z][a-z]+\s+\d{4}\s*[-–—]\s*(?:[A-Z][a-z]+\s+\d{4}|Present|Current))\s*$/i,
      /\|\s*(\d{4}\s*[-–—]\s*(?:\d{4}|Present|Current))\s*$/i,
      /\|\s*([A-Z][a-z]+\s+\d{4})\s*$/i,
      /([A-Z][a-z]+\s+\d{4}\s*[-–—]\s*(?:[A-Z][a-z]+\s+\d{4}|Present|Current))\s*$/i,
      /(\d{4}\s*[-–—]\s*(?:\d{4}|Present|Current))\s*$/i,
    ];

    for (const pattern of datePatterns) {
      const match = details.match(pattern);
      if (match) {
        const date = match[1];
        const main = details.replace(match[0], '').trim();
        return { main: main.replace(/\|\s*$/, '').trim(), date };
      }
    }

    return { main: details, date: '' };
  }, []);

  /**
   * Render experience section
   */
  const renderExperience = useCallback(() => {
    if (!resumeData.experiences) return null;
    const entries = parseExperienceEntry(resumeData.experiences);

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconTitle}>
            <Ionicons name="briefcase" size={14} color="#000" />
            <Text style={styles.sectionTitle}>EXPERIENCE</Text>
          </View>
          <View style={styles.sectionLine} />
        </View>

        {entries.map((entry, idx) => {
          const { main, date } = extractDateFromDetails(entry.details);

          return (
            <View key={idx} style={styles.entryBlock}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{entry.title}</Text>
                {date && <Text style={styles.entryDate}>{date}</Text>}
              </View>
              {main && <Text style={styles.entryDetails}>{main}</Text>}
              {entry.bullets.map((bullet: string, bidx: number) => (
                <View key={bidx} style={styles.bulletContainer}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{bullet}</Text>
                </View>
              ))}
            </View>
          );
        })}
      </View>
    );
  }, [resumeData.experiences, parseExperienceEntry, extractDateFromDetails]);

  /**
   * Render projects section
   */
  const renderProjects = useCallback(() => {
    if (!resumeData.projects) return null;
    const entries = parseExperienceEntry(resumeData.projects);

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconTitle}>
            <Ionicons name="code-slash" size={14} color="#000" />
            <Text style={styles.sectionTitle}>PROJECTS</Text>
          </View>
          <View style={styles.sectionLine} />
        </View>

        {entries.map((entry, idx) => {
          const { main, date } = extractDateFromDetails(entry.details);

          return (
            <View key={idx} style={styles.entryBlock}>
              <View style={styles.entryHeader}>
                <Text style={styles.projectTitle}>{entry.title}</Text>
                {date && <Text style={styles.entryDate}>{date}</Text>}
              </View>
              {main && <Text style={styles.entryDetails}>{main}</Text>}
              {entry.bullets.map((bullet: string, bidx: number) => (
                <View key={bidx} style={styles.bulletContainer}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{bullet}</Text>
                </View>
              ))}
            </View>
          );
        })}
      </View>
    );
  }, [resumeData.projects, parseExperienceEntry, extractDateFromDetails]);

  /**
   * Render activities section
   */
  const renderActivities = useCallback(() => {
    if (!resumeData.activities) return null;
    const entries = parseExperienceEntry(resumeData.activities);

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconTitle}>
            <Ionicons name="trophy" size={14} color="#000" />
            <Text style={styles.sectionTitle}>LEADERSHIP & ACTIVITIES</Text>
          </View>
          <View style={styles.sectionLine} />
        </View>

        {entries.map((entry, idx) => {
          const { main, date } = extractDateFromDetails(entry.details);

          return (
            <View key={idx} style={styles.entryBlock}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{entry.title}</Text>
                {date && <Text style={styles.entryDate}>{date}</Text>}
              </View>
              {main && <Text style={styles.entryDetails}>{main}</Text>}
              {entry.bullets.map((bullet: string, bidx: number) => (
                <View key={bidx} style={styles.bulletContainer}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{bullet}</Text>
                </View>
              ))}
            </View>
          );
        })}
      </View>
    );
  }, [resumeData.activities, parseExperienceEntry, extractDateFromDetails]);

  // Set navigation options
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
          <Ionicons name="close" size={26} color="white" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity style={styles.shareButton} onPress={handleShare} activeOpacity={0.7}>
          <Ionicons name="share-outline" size={26} color="white" />
        </TouchableOpacity>
      ),
      title: "Resume Preview",
      headerStyle: { backgroundColor: "#000" },
      headerTintColor: "white",
    });

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Cleanup animation
    return () => {
      fadeAnim.stopAnimation();
    };
  }, [navigation, handleExit, handleShare, fadeAnim]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Header - Name and Contact */}
        <View style={styles.header}>
          <Text style={styles.name}>{resumeData.name || "Your Name"}</Text>
          <View style={styles.contactInfo}>
            {resumeData.address && (
              <Text style={styles.contactText}>{resumeData.address}</Text>
            )}
            <View style={styles.contactRow}>
              {resumeData.email && (
                <Text style={styles.contactText}>{resumeData.email}</Text>
              )}
              {resumeData.email && resumeData.phone && (
                <Text style={styles.contactText}> • </Text>
              )}
              {resumeData.phone && (
                <Text style={styles.contactText}>{resumeData.phone}</Text>
              )}
            </View>
            {resumeData.linkedin && (
              <Text style={styles.linkText}>{resumeData.linkedin}</Text>
            )}
            {resumeData.website && (
              <Text style={styles.linkText}>{resumeData.website}</Text>
            )}
          </View>
        </View>

        {/* Education Section */}
        {resumeData.school && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconTitle}>
                <Ionicons name="school" size={14} color="#000" />
                <Text style={styles.sectionTitle}>EDUCATION</Text>
              </View>
              <View style={styles.sectionLine} />
            </View>

            <View style={styles.entryBlock}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{resumeData.school}</Text>
                {resumeData.graduationDate && (
                  <Text style={styles.entryDate}>{resumeData.graduationDate}</Text>
                )}
              </View>

              {(resumeData.degree || resumeData.major) && (
                <Text style={styles.degreeInfo}>
                  {resumeData.degree}
                  {resumeData.degree && resumeData.major && ": "}
                  {resumeData.major}
                  {resumeData.gpa && ` • GPA: ${resumeData.gpa}`}
                </Text>
              )}

              {resumeData.coursework && (
                <Text style={styles.courseworkText}>
                  <Text style={styles.courseworkLabel}>Relevant Coursework: </Text>
                  {resumeData.coursework}
                </Text>
              )}
            </View>
          </View>
        )}

        {renderExperience()}
        {renderProjects()}

        {/* Skills Section */}
        {(resumeData.technicalSkills || resumeData.languages || resumeData.certifications) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconTitle}>
                <Ionicons name="flash" size={14} color="#000" />
                <Text style={styles.sectionTitle}>SKILLS & QUALIFICATIONS</Text>
              </View>
              <View style={styles.sectionLine} />
            </View>

            <View style={styles.skillsContainer}>
              {resumeData.technicalSkills && (
                <Text style={styles.skillLine}>
                  <Text style={styles.skillLabel}>Technical: </Text>
                  {resumeData.technicalSkills}
                </Text>
              )}

              {resumeData.languages && (
                <Text style={styles.skillLine}>
                  <Text style={styles.skillLabel}>Languages: </Text>
                  {resumeData.languages}
                </Text>
              )}

              {resumeData.certifications && (
                <Text style={styles.skillLine}>
                  <Text style={styles.skillLabel}>Certifications: </Text>
                  {resumeData.certifications}
                </Text>
              )}
            </View>
          </View>
        )}

        {renderActivities()}

        {/* Enhanced Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Ionicons name="share-social-outline" size={22} color="#00D9FF" />
            <Text style={styles.actionButtonText}>Share Resume</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Ionicons name="information-circle-outline" size={18} color="#999" />
          <Text style={styles.footerText}>
            Professional one-page resume • Optimized for ATS
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

export default MadeResume;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "white",
    padding: 24,
    paddingBottom: 40,
  },
  exitButton: {
    marginLeft: 15,
    padding: 4,
  },
  shareButton: {
    marginRight: 15,
    padding: 4,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#000",
  },
  name: {
    fontSize: 22,
    fontWeight: "900",
    color: "#000",
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  contactInfo: {
    alignItems: "center",
    gap: 2,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactText: {
    fontSize: 10,
    color: "#333",
    fontWeight: "500",
  },
  linkText: {
    fontSize: 9,
    color: "#0066cc",
    textDecorationLine: "underline",
    fontWeight: "500",
  },
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionIconTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#000",
    letterSpacing: 0.8,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#000",
    marginLeft: 6,
  },
  entryBlock: {
    marginBottom: 10,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  entryTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#000",
    flex: 1,
    paddingRight: 8,
  },
  projectTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#000",
    flex: 1,
    paddingRight: 8,
  },
  entryDate: {
    fontSize: 10,
    color: "#444",
    fontStyle: "italic",
    fontWeight: "600",
    textAlign: "right",
  },
  entryDetails: {
    fontSize: 10,
    color: "#333",
    marginBottom: 3,
    fontWeight: "500",
  },
  degreeInfo: {
    fontSize: 10,
    color: "#333",
    marginBottom: 3,
    fontWeight: "500",
  },
  courseworkText: {
    fontSize: 9,
    color: "#333",
    lineHeight: 14,
    marginTop: 2,
  },
  courseworkLabel: {
    fontWeight: "700",
    color: "#000",
  },
  bulletContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 2,
    paddingLeft: 4,
  },
  bullet: {
    fontSize: 10,
    color: "#000",
    marginRight: 6,
    fontWeight: "700",
    lineHeight: 14,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    color: "#333",
    lineHeight: 14,
    fontWeight: "400",
  },
  skillsContainer: {
    gap: 3,
  },
  skillLine: {
    fontSize: 10,
    color: "#333",
    lineHeight: 14,
  },
  skillLabel: {
    fontWeight: "700",
    color: "#000",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
    marginTop: 20,
    marginBottom: 15,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#f5f5f5",
    padding: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#00D9FF",
    minWidth: 160,
    shadowColor: "#00D9FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#00D9FF",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
  },
  footerText: {
    fontSize: 11,
    color: "#999",
    fontStyle: "italic",
    fontWeight: "500",
  },
});