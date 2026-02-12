import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface AssistantTutorialProps {
    visible: boolean;
    onClose: () => void;
}

const AssistantTutorial: React.FC<AssistantTutorialProps> = ({ visible, onClose }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            icon: "chatbubbles" as const,
            title: "Welcome to AI Career Assistant",
            description: "Get instant career advice, resume tips, and job search guidance. Your personal AI helper is here to support your career journey.",
            tip: "Think of this as having a career counselor available 24/7!"
        },
        {
            icon: "warning" as const,
            title: "Important: Each Message is Independent",
            description: "Each message you send is treated separately. The AI doesn't remember previous messages in the same conversation.",
            tip: "Be specific and include all relevant context in EVERY message you send."
        },
        {
            icon: "document-text" as const,
            title: "Include Full Context",
            description: "Instead of: 'What about engineering?' ask: 'What skills do I need for a software engineering role?'",
            tip: "Bad: 'Tell me more' • Good: 'What programming languages should I learn for data science?'"
        },
        {
            icon: "sparkles" as const,
            title: "Best Practices",
            description: "Be specific, mention your field or goal, and ask complete questions. Include details like your major, experience level, or target industry.",
            tip: "Example: 'I'm a computer science student. What should I include in my resume for internships?'"
        },
        {
            icon: "bulb" as const,
            title: "Quick Action Shortcuts",
            description: "Use the quick action buttons below to get started with common questions. These are pre-written to give you the best results.",
            tip: "Try 'Find jobs', 'Review resume', or 'Interview prep' to get started!"
        },
        {
            icon: "flash" as const,
            title: "Credit System",
            description: "You have limited AI messages. Use them wisely by asking clear, complete questions. Check your remaining credits in the top right corner.",
            tip: "Make every message count - be specific and thorough!"
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
                    <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                        <Ionicons name="close" size={28} color="#888" />
                    </TouchableOpacity>

                    <View style={styles.iconContainer}>
                        <Ionicons name={slide.icon} size={60} color="#00D9FF" />
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
                        >
                            <Ionicons name="arrow-back" size={20} color={currentSlide === 0 ? "#555" : "#00D9FF"} />
                            <Text style={[styles.navButtonText, currentSlide === 0 && styles.navButtonTextDisabled]}>
                                Back
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.navButton, styles.nextButton]}
                            onPress={nextSlide}
                        >
                            <Text style={styles.nextButtonText}>
                                {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
                            </Text>
                            <Ionicons name="arrow-forward" size={20} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={handleClose} style={styles.skipButton}>
                        <Text style={styles.skipText}>Skip Tutorial</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default AssistantTutorial;

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
        maxHeight: "75%",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#00D9FF",
        shadowColor: "#00D9FF",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 15,
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
        borderWidth: 2,
        borderColor: "#00D9FF",
        shadowColor: "#00D9FF",
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
        backgroundColor: "#00D9FF",
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
        backgroundColor: "#00D9FF",
        borderColor: "#00D9FF",
    },
    navButtonText: {
        color: "#00D9FF",
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