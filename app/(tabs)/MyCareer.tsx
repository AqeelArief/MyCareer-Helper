import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { sanitizeInput } from "../../utils/helpers";
import ResumeContext from "../_context/ResumeContext";

const ALL_SKILLS = [
    "Communication", "Problem-Solving", "Time Management", "Leadership",
    "Critical Thinking", "Teamwork", "Adaptability", "Data Analysis",
    "Coding/Programming", "Public Speaking", "SEO/SEM", "Project Management",
    "Financial Modeling", "Negotiation", "UX/UI Design", "Sales Strategy"
];

const getApiKey = () =>
    Constants.expoConfig?.extra?.EXPO_PUBLIC_GEMINI_API_KEY ?? "";

const API_URL = (key: string) =>
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${key}`;

interface SkillPickerProps {
    visible: boolean;
    onClose: () => void;
    selectedSkills: string[];
    onSkillToggle: (skill: string) => void;
}

const SkillPickerModal = ({ visible, onClose, selectedSkills, onSkillToggle }: SkillPickerProps) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }).start();
        } else {
            scaleAnim.setValue(0);
        }

        // Cleanup animation on unmount
        return () => {
            scaleAnim.stopAnimation();
        };
    }, [visible, scaleAnim]);

    const renderSkillItem = ({ item }: { item: string }) => {
        const isSelected = selectedSkills.includes(item);
        const isDisabled = selectedSkills.length >= 3 && !isSelected;

        return (
            <Animated.View
                style={{
                    opacity: visible ? 1 : 0,
                    transform: [{
                        translateY: visible ? 0 : 20
                    }]
                }}
            >
                <TouchableOpacity
                    style={[
                        summaryStyles.skillItem,
                        isSelected ? summaryStyles.skillSelected : (isDisabled ? summaryStyles.skillDisabled : {})
                    ]}
                    onPress={() => onSkillToggle(item)}
                    disabled={isDisabled}
                    activeOpacity={0.7}
                >
                    <Text style={[summaryStyles.skillText, isSelected && { color: '#000' }]}>{item}</Text>
                    {isSelected && <Ionicons name="checkmark-circle" size={22} color="#000" />}
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={summaryStyles.modalBackground}>
                <Animated.View
                    style={[
                        summaryStyles.modalContainer,
                        {
                            transform: [{ scale: scaleAnim }]
                        }
                    ]}
                >
                    <Text style={summaryStyles.modalTitle}>Select Focus Skills (Max 3)</Text>
                    <FlatList<string>
                        data={ALL_SKILLS}
                        renderItem={renderSkillItem}
                        keyExtractor={item => item}
                        style={summaryStyles.skillList}
                    />
                    <TouchableOpacity
                        style={summaryStyles.closeButton}
                        onPress={onClose}
                        activeOpacity={0.8}
                    >
                        <Text style={summaryStyles.closeButtonText}>Done</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
};

const ResumeGradingCard = () => {
    const { resumeData } = useContext(ResumeContext);
    const [isExpanded, setIsExpanded] = useState(false);
    const [grading, setGrading] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const expandAnim = useRef(new Animated.Value(0)).current;

    // Cleanup animations on unmount
    useEffect(() => {
        return () => {
            rotateAnim.stopAnimation();
            expandAnim.stopAnimation();
        };
    }, [rotateAnim, expandAnim]);

    // TOUGHER GRADING SYSTEM - More Critical
    const calculateBasicScore = useCallback(() => {
        let score = 0;
        let maxScore = 100;

        // Contact info (15 points) - strict requirements
        if (resumeData.name && resumeData.name.length > 2) score += 5;
        if (resumeData.email && resumeData.email.includes('@') && resumeData.email.includes('.')) score += 5;
        if (resumeData.phone && resumeData.phone.replace(/\D/g, '').length >= 10) score += 5;

        // Education (15 points) - needs to be complete
        if (resumeData.school && resumeData.school.length > 5) score += 5;
        if (resumeData.degree && resumeData.major) score += 5;
        if (resumeData.graduationDate) score += 5;

        // Experience (30 points) - must be substantial and detailed
        if (resumeData.experiences) {
            const expLength = resumeData.experiences.length;
            const bulletCount = (resumeData.experiences.match(/•/g) || []).length;
            if (expLength > 200 && bulletCount >= 6) score += 30;
            else if (expLength > 100 && bulletCount >= 3) score += 20;
            else if (expLength > 50) score += 10;
        }

        // Skills (20 points) - needs multiple categories
        if (resumeData.technicalSkills) {
            const skillLength = resumeData.technicalSkills.length;
            const hasCategories = resumeData.technicalSkills.includes(':') || resumeData.technicalSkills.includes(',');
            if (skillLength > 100 && hasCategories) score += 20;
            else if (skillLength > 50) score += 12;
            else if (skillLength > 20) score += 6;
        }

        // Projects (15 points) - substantial projects required
        if (resumeData.projects) {
            const projLength = resumeData.projects.length;
            const bulletCount = (resumeData.projects.match(/•/g) || []).length;
            if (projLength > 150 && bulletCount >= 4) score += 15;
            else if (projLength > 75 && bulletCount >= 2) score += 8;
            else if (projLength > 30) score += 4;
        }

        // Activities (5 points) - bonus for well-rounded profile
        if (resumeData.activities && resumeData.activities.length > 50) score += 5;

        return Math.round((score / maxScore) * 100);
    }, [resumeData]);

    const analyzeWithAI = useCallback(async () => {
        setIsAnalyzing(true);

        try {
            const apiKey = getApiKey();
            if (!apiKey) {
                Alert.alert("API Key Missing", "AI analysis requires API key configuration.");
                setIsAnalyzing(false);
                return;
            }

            const resumeText = `
Name: ${resumeData.name || 'Missing'}
Email: ${resumeData.email || 'Missing'}
Phone: ${resumeData.phone || 'Missing'}
School: ${resumeData.school || 'Missing'}
Degree: ${resumeData.degree || 'Missing'}
Major: ${resumeData.major || 'Missing'}
Experience: ${resumeData.experiences || 'Missing'}
Skills: ${resumeData.technicalSkills || 'Missing'}
Projects: ${resumeData.projects || 'Missing'}
Activities: ${resumeData.activities || 'Missing'}
            `;

            const response = await fetch(API_URL(apiKey), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        role: "user",
                        parts: [{
                            text: `You are a TOUGH resume critic. Grade this resume HARSHLY and find what's WRONG. Respond ONLY with valid JSON (no markdown, no backticks):
{
  "strengths": ["strength1", "strength2"],
  "improvements": ["critical issue 1", "critical issue 2", "critical issue 3"],
  "missing": ["missing element 1", "missing element 2"],
  "tips": ["actionable tip 1", "actionable tip 2"]
}

CRITICAL GRADING RULES:
- Each item must be 8-12 words max
- Be DIRECT and critical - no sugar-coating
- Find real weaknesses even if resume looks complete
- Focus on: missing metrics, weak verbs, vague descriptions, lack of impact
- Improvements should point out SPECIFIC flaws

Resume:
${resumeText}`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 800
                    }
                })
            });

            const result = await response.json();
            const aiText = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";

            const cleanText = aiText.replace(/```json|```/g, '').trim();
            const analysis = JSON.parse(cleanText);

            setGrading(analysis);
        } catch (error: unknown) {
            const err = error as any;
            console.error("AI Analysis error:", err);
            Alert.alert("Analysis Error", "Could not analyze resume. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    }, [resumeData]);

    const toggleExpand = useCallback(() => {
        const toValue = isExpanded ? 0 : 1;

        Animated.parallel([
            Animated.spring(rotateAnim, {
                toValue,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.spring(expandAnim, {
                toValue,
                tension: 50,
                friction: 8,
                useNativeDriver: false,
            })
        ]).start();

        setIsExpanded(!isExpanded);

        if (!isExpanded && !grading) {
            analyzeWithAI();
        }
    }, [isExpanded, grading, rotateAnim, expandAnim, analyzeWithAI]);

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg']
    });

    const score = calculateBasicScore();
    // Tougher grading thresholds
    const scoreColor = score >= 90 ? '#4CAF50' : score >= 75 ? '#FFD700' : score >= 60 ? '#FF9800' : '#FF6B6B';
    const scoreLabel = score >= 90 ? 'Excellent' : score >= 75 ? 'Good' : score >= 60 ? 'Needs Work' : 'Weak';

    return (
        <View style={gradeStyles.container}>
            <TouchableOpacity
                style={gradeStyles.header}
                onPress={toggleExpand}
                activeOpacity={0.9}
            >
                <View style={gradeStyles.headerLeft}>
                    <View style={[gradeStyles.scoreCircle, { borderColor: scoreColor }]}>
                        <Text style={[gradeStyles.scoreText, { color: scoreColor }]}>{score}%</Text>
                    </View>
                    <View>
                        <Text style={gradeStyles.title}>Resume Analysis</Text>
                        <Text style={[gradeStyles.subtitle, { color: scoreColor }]}>
                            {scoreLabel}
                        </Text>
                    </View>
                </View>
                <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                    <Ionicons name="chevron-down" size={26} color="#00D9FF" />
                </Animated.View>
            </TouchableOpacity>

            {isExpanded && (
                <Animated.View
                    style={[
                        gradeStyles.content,
                        {
                            opacity: expandAnim,
                            transform: [{
                                translateY: expandAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-10, 0]
                                })
                            }]
                        }
                    ]}
                >
                    {isAnalyzing ? (
                        <View style={gradeStyles.analyzing}>
                            <ActivityIndicator size="large" color="#00D9FF" />
                            <Text style={gradeStyles.analyzingText}>Analyzing your resume...</Text>
                        </View>
                    ) : grading ? (
                        <ScrollView style={gradeStyles.resultsContainer}>
                            <View style={gradeStyles.section}>
                                <View style={gradeStyles.sectionHeader}>
                                    <Ionicons name="checkmark-circle" size={22} color="#4CAF50" />
                                    <Text style={gradeStyles.sectionTitle}>Strengths</Text>
                                </View>
                                {grading.strengths?.map((item: string, index: number) => (
                                    <View key={index} style={gradeStyles.item}>
                                        <Text style={gradeStyles.bullet}>•</Text>
                                        <Text style={gradeStyles.itemText}>{item}</Text>
                                    </View>
                                ))}
                            </View>

                            <View style={gradeStyles.section}>
                                <View style={gradeStyles.sectionHeader}>
                                    <Ionicons name="warning" size={22} color="#FF9800" />
                                    <Text style={gradeStyles.sectionTitle}>Improvements Needed</Text>
                                </View>
                                {grading.improvements?.map((item: string, index: number) => (
                                    <View key={index} style={gradeStyles.item}>
                                        <Text style={gradeStyles.bullet}>•</Text>
                                        <Text style={gradeStyles.itemText}>{item}</Text>
                                    </View>
                                ))}
                            </View>

                            <View style={gradeStyles.section}>
                                <View style={gradeStyles.sectionHeader}>
                                    <Ionicons name="alert-circle" size={22} color="#FF6B6B" />
                                    <Text style={gradeStyles.sectionTitle}>Missing</Text>
                                </View>
                                {grading.missing?.map((item: string, index: number) => (
                                    <View key={index} style={gradeStyles.item}>
                                        <Text style={gradeStyles.bullet}>•</Text>
                                        <Text style={gradeStyles.itemText}>{item}</Text>
                                    </View>
                                ))}
                            </View>

                            <View style={gradeStyles.section}>
                                <View style={gradeStyles.sectionHeader}>
                                    <Ionicons name="bulb" size={22} color="#FFD700" />
                                    <Text style={gradeStyles.sectionTitle}>Quick Tips</Text>
                                </View>
                                {grading.tips?.map((item: string, index: number) => (
                                    <View key={index} style={gradeStyles.item}>
                                        <Text style={gradeStyles.bullet}>•</Text>
                                        <Text style={gradeStyles.itemText}>{item}</Text>
                                    </View>
                                ))}
                            </View>

                            <TouchableOpacity
                                style={gradeStyles.refreshButton}
                                onPress={analyzeWithAI}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="refresh" size={18} color="#000" />
                                <Text style={gradeStyles.refreshButtonText}>Re-analyze</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    ) : (
                        <View style={gradeStyles.placeholder}>
                            <Ionicons name="analytics" size={48} color="#555" />
                            <Text style={gradeStyles.placeholderText}>
                                Expand to see detailed analysis
                            </Text>
                        </View>
                    )}
                </Animated.View>
            )}
        </View>
    );
};

const CareerPlanSummary = () => {
    const { targetField, careerGoal, priority, steps, focusSkills, setTargetField, setCareerGoal, setPriority, setSteps, setFocusSkills } = useContext(ResumeContext);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSkillPickerVisible, setIsSkillPickerVisible] = useState(false);
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const expandAnim = useRef(new Animated.Value(0)).current;

    // Cleanup animations on unmount
    useEffect(() => {
        return () => {
            rotateAnim.stopAnimation();
            expandAnim.stopAnimation();
        };
    }, [rotateAnim, expandAnim]);

    const handleSkillToggle = useCallback((skill: string) => {
        if (focusSkills.includes(skill)) {
            setFocusSkills(focusSkills.filter(s => s !== skill));
        } else if (focusSkills.length < 3) {
            setFocusSkills([...focusSkills, skill]);
        } else {
            Alert.alert("Limit Reached", "You can only select up to 3 focus skills.");
        }
    }, [focusSkills, setFocusSkills]);

    const toggleExpand = useCallback(() => {
        const toValue = isExpanded ? 0 : 1;

        Animated.parallel([
            Animated.spring(rotateAnim, {
                toValue,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.spring(expandAnim, {
                toValue,
                tension: 50,
                friction: 8,
                useNativeDriver: false,
            })
        ]).start();

        setIsExpanded(!isExpanded);
        if (isExpanded) {
            setIsEditing(false);
        }
    }, [isExpanded, rotateAnim, expandAnim]);

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg']
    });

    return (
        <View style={summaryStyles.moduleContainer}>
            <TouchableOpacity
                style={summaryStyles.collapsedCard}
                onPress={toggleExpand}
                activeOpacity={0.9}
            >
                <View style={summaryStyles.cardHeader}>
                    <View style={summaryStyles.cardHeaderLeft}>
                        <View style={summaryStyles.iconContainer}>
                            <Ionicons name="compass" size={36} color="#00D9FF" />
                        </View>
                        <View style={summaryStyles.cardHeaderText}>
                            <Text style={summaryStyles.cardTitle}>Career Path Plan</Text>
                            <Text style={summaryStyles.cardSubtitle}>
                                {targetField || "Set your career direction"}
                            </Text>
                        </View>
                    </View>
                    <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                        <Ionicons name="chevron-down" size={26} color="#00D9FF" />
                    </Animated.View>
                </View>

                {!isExpanded && (
                    <View style={summaryStyles.previewContainer}>
                        <Text style={summaryStyles.previewText} numberOfLines={2}>
                            {careerGoal || "Tap to customize your career plan"}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>

            {isExpanded && (
                <Animated.View
                    style={[
                        summaryStyles.expandedContent,
                        {
                            opacity: expandAnim,
                            transform: [{
                                translateY: expandAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-20, 0]
                                })
                            }]
                        }
                    ]}
                >
                    <View style={summaryStyles.editToggleContainer}>
                        <TouchableOpacity
                            style={summaryStyles.editButton}
                            onPress={() => setIsEditing(!isEditing)}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={isEditing ? "checkmark-circle" : "create"}
                                size={20}
                                color="#00D9FF"
                            />
                            <Text style={summaryStyles.editButtonText}>
                                {isEditing ? "Done Editing" : "Edit Plan"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={summaryStyles.fieldBadge}>
                        <Ionicons name="sparkles" size={16} color="#FFD700" />
                        <Text style={summaryStyles.fieldBadgeText}>AI Suggested: {targetField}</Text>
                    </View>

                    {isEditing ? (
                        <>
                            <Text style={summaryStyles.label}>My Career Goal (Job I Want)</Text>
                            <TextInput
                                style={summaryStyles.input}
                                value={careerGoal}
                                onChangeText={(text) => setCareerGoal(sanitizeInput(text))}
                                placeholder="e.g., Senior Software Engineer"
                                placeholderTextColor="#555"
                                maxLength={200}
                            />

                            <Text style={summaryStyles.label}>Current Priority</Text>
                            <TextInput
                                style={summaryStyles.input}
                                value={priority}
                                onChangeText={(text) => setPriority(sanitizeInput(text))}
                                placeholder="e.g., Focus on skill development in Data Science"
                                placeholderTextColor="#555"
                                maxLength={500}
                            />

                            <Text style={summaryStyles.label}>Next Steps</Text>
                            <TextInput
                                style={[summaryStyles.input, summaryStyles.textArea]}
                                value={steps}
                                onChangeText={(text) => setSteps(sanitizeInput(text))}
                                multiline
                                placeholder="e.g., 1. Complete Python course. 2. Build personal portfolio project."
                                placeholderTextColor="#555"
                                maxLength={2000}
                            />

                            <Text style={summaryStyles.label}>Important Skills to Focus On (Max 3)</Text>
                            <View style={summaryStyles.skillDisplayContainer}>
                                {focusSkills.length > 0 ? (
                                    focusSkills.map(skill => (
                                        <View key={skill} style={summaryStyles.tag}>
                                            <Text style={summaryStyles.tagText}>{skill}</Text>
                                            <TouchableOpacity onPress={() => handleSkillToggle(skill)} activeOpacity={0.7}>
                                                <Ionicons name="close-circle" size={18} color="#000" style={{ marginLeft: 6 }} />
                                            </TouchableOpacity>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={{ color: '#888', marginBottom: 8, fontWeight: "500" }}>No skills selected.</Text>
                                )}
                            </View>

                            <TouchableOpacity
                                style={summaryStyles.selectSkillsButton}
                                onPress={() => setIsSkillPickerVisible(true)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="add-circle" size={22} color="#000" />
                                <Text style={summaryStyles.selectSkillsButtonText}>Select/Edit Skills</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <View style={summaryStyles.viewMode}>
                            <View style={summaryStyles.infoSection}>
                                <Text style={summaryStyles.infoLabel}>Career Goal</Text>
                                <Text style={summaryStyles.infoText}>
                                    {careerGoal || "Not set yet"}
                                </Text>
                            </View>

                            <View style={summaryStyles.infoSection}>
                                <Text style={summaryStyles.infoLabel}>Current Priority</Text>
                                <Text style={summaryStyles.infoText}>
                                    {priority || "Not set yet"}
                                </Text>
                            </View>

                            <View style={summaryStyles.infoSection}>
                                <Text style={summaryStyles.infoLabel}>Next Steps</Text>
                                <Text style={summaryStyles.infoText}>
                                    {steps || "Not set yet"}
                                </Text>
                            </View>

                            <View style={summaryStyles.infoSection}>

                            // MyCareer.tsx PART 2 - Copy this AFTER Part 1

                                <Text style={summaryStyles.infoLabel}>Focus Skills</Text>
                                <View style={summaryStyles.skillDisplayContainer}>
                                    {focusSkills.length > 0 ? (
                                        focusSkills.map(skill => (
                                            <View key={skill} style={summaryStyles.tagViewOnly}>
                                                <Text style={summaryStyles.tagText}>{skill}</Text>
                                            </View>
                                        ))
                                    ) : (
                                        <Text style={summaryStyles.infoText}>No skills selected</Text>
                                    )}
                                </View>
                            </View>
                        </View>
                    )}
                </Animated.View>
            )}

            <SkillPickerModal
                visible={isSkillPickerVisible}
                onClose={() => setIsSkillPickerVisible(false)}
                selectedSkills={focusSkills}
                onSkillToggle={handleSkillToggle}
            />
        </View>
    );
};

const MyCareer = () => {
    const { resumeData } = useContext(ResumeContext);
    const router = useRouter();
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();

        // Cleanup animation on unmount
        return () => {
            fadeAnim.stopAnimation();
        };
    }, [fadeAnim]);

    if (!resumeData) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>
                    Resume data not available. Please use the Resume Builder first.
                </Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push("/(tabs)/ResumeBuilder")}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>Go to Resume Builder</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Animated.View style={{ opacity: fadeAnim, width: '100%', alignItems: 'center' }}>
                {/* ENHANCED HEADER - Similar to AI Assistant & Resource Hub */}
                <View style={styles.headerSection}>
                    <View style={styles.headerIconContainer}>
                        <Ionicons name="stats-chart" size={36} color="#00D9FF" />
                    </View>
                    <Text style={styles.title}>My Career Profile</Text>
                    <Text style={styles.headerSubtitle}>Track your progress and goals</Text>
                </View>

                <ResumeGradingCard />

                <CareerPlanSummary />

                <TouchableOpacity
                    style={styles.resumeModule}
                    onPress={() => router.push("/MadeResume")}
                    activeOpacity={0.85}
                >
                    <View style={styles.resumeIconContainer}>
                        <Ionicons name="document-text" size={44} color="#00D9FF" />
                    </View>
                    <Text style={styles.moduleText}>View My Resume</Text>
                    <Text style={styles.moduleSubText}>Tap to see your full resume preview</Text>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </Animated.View>
        </ScrollView>
    );
};

export default MyCareer;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: "#000",
        alignItems: "center",
        padding: 20,
    },
    // ENHANCED HEADER STYLES
    headerSection: {
        alignItems: "center",
        marginBottom: 32,
        paddingBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: "#1A1A1A",
        width: '100%',
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
        marginBottom: 8,
        letterSpacing: 1.2,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#888",
        textAlign: "center",
        fontWeight: "500",
    },
    resumeModule: {
        backgroundColor: "#1A1A1A",
        padding: 26,
        borderRadius: 20,
        width: "100%",
        alignItems: "center",
        marginBottom: 20,
        shadowColor: "#00D9FF",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
        borderWidth: 2,
        borderColor: "#333",
    },
    resumeIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#0A1A1A",
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: "#00D9FF50",
    },
    moduleText: {
        fontSize: 20,
        fontWeight: "800",
        color: "#FFF",
        marginTop: 8,
        letterSpacing: 0.5,
    },
    moduleSubText: {
        fontSize: 15,
        color: "#00D9FF",
        marginTop: 8,
        textAlign: "center",
        fontWeight: "600",
    },
    button: {
        backgroundColor: "#00D9FF",
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 14,
        alignItems: "center",
        width: "100%",
        marginBottom: 12,
        shadowColor: "#00D9FF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 8,
    },
    buttonText: {
        color: "#000",
        fontSize: 17,
        fontWeight: "800",
        letterSpacing: 0.5,
    },
    errorText: {
        color: "#FFF",
        fontSize: 17,
        textAlign: "center",
        marginBottom: 24,
        fontWeight: "600",
    },
});

const gradeStyles = StyleSheet.create({
    container: {
        width: "100%",
        marginBottom: 24,
        backgroundColor: "#1A1A1A",
        borderRadius: 20,
        borderWidth: 2,
        borderColor: "#333",
        overflow: 'hidden',
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 24,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        flex: 1,
    },
    scoreCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 4,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0A0A0A",
    },
    scoreText: {
        fontSize: 19,
        fontWeight: "900",
        letterSpacing: 0.45,
    },
    title: {
        fontSize: 20,
        fontWeight: "800",
        color: "#FFF",
        marginBottom: 6,
        letterSpacing: 0.4,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: "700",
    },
    content: {
        backgroundColor: "#0A0A0A",
        padding: 24,
        borderTopWidth: 2,
        borderTopColor: "#333",
    },
    analyzing: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
    },
    analyzingText: {
        color: "#888",
        fontSize: 15,
        marginTop: 16,
        fontWeight: "600",
    },
    resultsContainer: {
        maxHeight: 400,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: "#FFF",
        letterSpacing: 0.3,
    },
    item: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 12,
        gap: 12,
    },
    bullet: {
        color: "#00D9FF",
        fontSize: 16,
        fontWeight: "900",
    },
    itemText: {
        flex: 1,
        fontSize: 14,
        color: "#B8B8B8",
        lineHeight: 20,
        fontWeight: "500",
    },
    refreshButton: {
        flexDirection: "row",
        backgroundColor: "#00D9FF",
        padding: 14,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        marginTop: 10,
        shadowColor: "#00D9FF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 6,
    },
    refreshButtonText: {
        color: "#000",
        fontSize: 15,
        fontWeight: "800",
        letterSpacing: 0.3,
    },
    placeholder: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
    },
    placeholderText: {
        color: "#888",
        fontSize: 15,
        marginTop: 16,
        textAlign: "center",
        fontWeight: "600",
    },
});

const summaryStyles = StyleSheet.create({
    moduleContainer: {
        width: "100%",
        marginBottom: 24,
    },
    collapsedCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 20,
        padding: 24,
        shadowColor: "#00D9FF",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 10,
        borderWidth: 2,
        borderColor: "#00D9FF40",
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    cardHeaderLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        flex: 1,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#0A0A0A",
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: "#00D9FF50",
    },
    cardHeaderText: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: "#FFF",
        marginBottom: 6,
        letterSpacing: 0.4,
    },
    cardSubtitle: {
        fontSize: 15,
        color: "#00D9FF",
        fontWeight: "600",
    },
    previewContainer: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 2,
        borderTopColor: '#333',
    },
    previewText: {
        fontSize: 15,
        color: "#B8B8B8",
        fontStyle: "italic",
        fontWeight: "500",
    },
    expandedContent: {
        backgroundColor: "#0A0A0A",
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        padding: 24,
        marginTop: -16,
        borderWidth: 2,
        borderTopWidth: 0,
        borderColor: '#00D9FF40',
    },
    editToggleContainer: {
        alignItems: "flex-end",
        marginBottom: 18,
    },
    editButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#1A1A1A",
        paddingVertical: 11,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#333",
    },
    editButtonText: {
        color: "#00D9FF",
        fontSize: 15,
        fontWeight: "700",
    },
    fieldBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: "#2A2A0A",
        padding: 16,
        borderRadius: 14,
        marginBottom: 24,
        borderWidth: 2,
        borderColor: "#FFD70040",
    },
    fieldBadgeText: {
        color: "#FFD700",
        fontSize: 15,
        fontWeight: "700",
    },
    viewMode: {
        gap: 18,
    },
    infoSection: {
        marginBottom: 18,
    },
    infoLabel: {
        fontSize: 13,
        fontWeight: "800",
        color: "#00D9FF",
        marginBottom: 10,
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },
    infoText: {
        fontSize: 16,
        color: "#FFF",
        lineHeight: 24,
        fontWeight: "500",
    },
    label: {
        fontSize: 15,
        fontWeight: '700',
        color: '#00D9FF',
        marginTop: 14,
        marginBottom: 10,
        letterSpacing: 0.3,
    },
    input: {
        backgroundColor: '#1A1A1A',
        padding: 14,
        borderRadius: 12,
        color: '#FFF',
        fontSize: 16,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: '#333',
        fontWeight: "500",
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    skillDisplayContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
        minHeight: 40,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#00D9FF',
        borderRadius: 18,
        paddingVertical: 9,
        paddingHorizontal: 14,
        marginRight: 10,
        marginBottom: 10,
    },
    tagViewOnly: {
        backgroundColor: '#00D9FF',
        borderRadius: 18,
        paddingVertical: 9,
        paddingHorizontal: 16,
        marginRight: 10,
        marginBottom: 10,
    },
    tagText: {
        color: '#000',
        fontWeight: '700',
        fontSize: 14,
    },
    selectSkillsButton: {
        flexDirection: 'row',
        backgroundColor: '#00D9FF',
        padding: 14,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        shadowColor: "#00D9FF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
    },
    selectSkillsButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '800',
        marginLeft: 10,
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.94)',
    },
    modalContainer: {
        width: '90%',
        backgroundColor: '#0A0A0A',
        borderRadius: 24,
        padding: 24,
        maxHeight: '80%',
        borderWidth: 2,
        borderColor: '#00D9FF',
        shadowColor: "#00D9FF",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 20,
    },
    modalTitle: {
        fontSize: 23,
        fontWeight: '800',
        color: '#00D9FF',
        marginBottom: 20,
        textAlign: 'center',
        letterSpacing: 0.6,
    },
    skillList: {
        maxHeight: 400,
        paddingHorizontal: 4,
    },
    skillItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 18,
        backgroundColor: '#1A1A1A',
        borderRadius: 14,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: '#333',
    },
    skillText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    skillSelected: {
        backgroundColor: '#00D9FF',
        borderWidth: 2,
        borderColor: '#00D9FF',
    },
    skillDisabled: {
        opacity: 0.3,
    },
    closeButton: {
        backgroundColor: '#00D9FF',
        padding: 18,
        borderRadius: 14,
        marginTop: 20,
        alignItems: 'center',
        shadowColor: "#00D9FF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 8,
    },
    closeButtonText: {
        color: '#000',
        fontSize: 17,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});