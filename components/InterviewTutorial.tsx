import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface InterviewTutorialProps {
    visible: boolean;
    onClose: () => void;
}

const InterviewTutorial: React.FC<InterviewTutorialProps> = ({ visible, onClose }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            icon: "mic" as const,
            title: "Welcome to Interview Practice",
            description: "Practice makes perfect! Prepare for real interviews by practicing with common and field-specific questions.",
            tip: "The more you practice, the more confident you'll be in actual interviews!"
        },
        {
            icon: "list" as const,
            title: "Two Practice Modes",
            description: "General Interview: Common behavioral and situational questions. Field-Specific: Questions tailored to your career field like software engineering, marketing, or finance.",
            tip: "Start with general questions, then move to field-specific for best results."
        },
        {
            icon: "time" as const,
            title: "Timed Practice (General Mode)",
            description: "Each question has a 60-second timer to simulate real interview pressure. Practice thinking quickly and structuring your answers under time constraints.",
            tip: "Don't panic if time runs out - you can reset the timer or skip to the next question!"
        },
        {
            icon: "trophy" as const,
            title: "Points System (Field Mode)",
            description: "Earn 10 points for each question you complete. Track your progress and see your completion percentage at the end.",
            tip: "Complete all questions to get 100% and build your confidence!"
        },
        {
            icon: "chatbubbles" as const,
            title: "Practice Out Loud",
            description: "Read each question and answer OUT LOUD as if you're in a real interview. This helps you practice speaking clearly and confidently.",
            tip: "Record yourself on your phone to hear how you sound and improve!"
        },
        {
            icon: "star" as const,
            title: "Use the STAR Method",
            description: "Structure your answers: Situation (context), Task (your role), Action (what you did), Result (the outcome). This format makes your answers clear and impactful.",
            tip: "Example: 'At my internship (S), I was tasked with fixing a bug (T), so I debugged the code (A), reducing errors by 50% (R).'"
        },
        {
            icon: "checkmark-circle" as const,
            title: "You're Ready to Practice!",
            description: "Choose your practice mode and start building your interview confidence. Remember: every expert was once a beginner!",
            tip: "Practice regularly for best results - even 10 minutes a day helps!"
        }
    ];

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            handleClose();
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    const handleClose = () => {
        setCurrentSlide(0);
        onClose();
    };

    const slide = slides[currentSlide];

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={handleClose} activeOpacity={0.7}>
                        <Ionicons name="close" size={28} color="#888" />
                    </TouchableOpacity>

                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={true}
                        nestedScrollEnabled={true}
                    >
                        <View style={styles.iconContainer}>
                            <Ionicons name={slide.icon} size={60} color="#4CAF50" />
                        </View>

                        <Text style={styles.title}>{slide.title}</Text>
                        <Text style={styles.description}>{slide.description}</Text>

                        <View style={styles.tipBox}>
                            <Ionicons name="bulb" size={20} color="#FFD700" />
                            <Text style={styles.tipText}>{slide.tip}</Text>
                        </View>

                        <View style={styles.dotsContainer}>
                            {slides.map((_, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.dot,
                                        index === currentSlide && styles.activeDot
                                    ]}
                                />
                            ))}
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.navButton, currentSlide === 0 && styles.navButtonDisabled]}
                                onPress={prevSlide}
                                disabled={currentSlide === 0}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="arrow-back" size={20} color={currentSlide === 0 ? "#555" : "#4CAF50"} />
                                <Text style={[styles.navButtonText, currentSlide === 0 && styles.navButtonTextDisabled]}>
                                    Back
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.navButton, styles.nextButton]}
                                onPress={nextSlide}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.nextButtonText}>
                                    {currentSlide === slides.length - 1 ? "Start Practicing" : "Next"}
                                </Text>
                                <Ionicons name="arrow-forward" size={20} color="#000" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity onPress={handleClose} style={styles.skipButton} activeOpacity={0.7}>
                            <Text style={styles.skipText}>Skip Tutorial</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

export default InterviewTutorial;

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.92)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContainer: {
        backgroundColor: "#000",
        borderRadius: 20,
        padding: 25,
        width: "90%",
        maxWidth: 420,
        maxHeight: "85%",
        borderWidth: 2,
        borderColor: "#4CAF50",
        shadowColor: "#4CAF50",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 15,
    },
    scrollContent: {
        alignItems: "center",
        paddingBottom: 20,
    },
    closeButton: {
        position: "absolute",
        top: 12,
        right: 12,
        padding: 6,
        zIndex: 10,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#0A0A0A",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 18,
        marginTop: 30,
        borderWidth: 2,
        borderColor: "#4CAF50",
        shadowColor: "#4CAF50",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 15,
        elevation: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: "800",
        color: "#FFFFFF",
        textAlign: "center",
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    description: {
        fontSize: 14,
        color: "#B8B8B8",
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 16,
        fontWeight: "400",
    },
    tipBox: {
        backgroundColor: "#1A1A1A",
        padding: 14,
        borderRadius: 12,
        width: "100%",
        borderLeftWidth: 3,
        borderLeftColor: "#FFD700",
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
        marginBottom: 20,
    },
    tipText: {
        flex: 1,
        fontSize: 12,
        color: "#FFD700",
        lineHeight: 18,
        fontWeight: "600",
    },
    dotsContainer: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 20,
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: "#333",
    },
    activeDot: {
        backgroundColor: "#4CAF50",
        width: 22,
    },
    buttonContainer: {
        flexDirection: "row",
        width: "100%",
        gap: 10,
        marginBottom: 12,
    },
    navButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1A1A1A",
        padding: 13,
        borderRadius: 10,
        gap: 7,
        borderWidth: 1,
        borderColor: "#333",
    },
    navButtonDisabled: {
        opacity: 0.3,
    },
    nextButton: {
        backgroundColor: "#4CAF50",
        borderColor: "#4CAF50",
    },
    navButtonText: {
        color: "#4CAF50",
        fontSize: 14,
        fontWeight: "700",
    },
    navButtonTextDisabled: {
        color: "#555",
    },
    nextButtonText: {
        color: "#000",
        fontSize: 14,
        fontWeight: "700",
    },
    skipButton: {
        padding: 10,
    },
    skipText: {
        color: "#888",
        fontSize: 12,
        textDecorationLine: "underline",
        fontWeight: "500",
    },
});