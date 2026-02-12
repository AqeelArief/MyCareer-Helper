import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ResumeTutorialProps {
  visible: boolean;
  onClose: () => void;
}

const ResumeTutorial: React.FC<ResumeTutorialProps> = ({ visible, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: "document-text" as const,
      title: "Welcome to Resume Builder",
      description: "Create a professional resume in 6 easy steps. You only need to fill in what applies to you.",
      tip: "Skip sections that don't apply - not everyone has work experience or certifications yet!"
    },
    {
      icon: "person" as const,
      title: "Personal Information",
      description: "Name, email, and phone are required. LinkedIn and portfolio links help, but aren't mandatory.",
      tip: "Use a professional email address that includes your name."
    },
    {
      icon: "school" as const,
      title: "Education Section",
      description: "Include your most recent or current education. GPA is optional - only add if it's 3.0 or higher.",
      tip: "List relevant coursework that relates to your target career field."
    },
    {
      icon: "briefcase" as const,
      title: "Experience & Projects",
      description: "Start each bullet point with action verbs like 'Developed', 'Led', or 'Managed'. Include measurable results when possible.",
      tip: "No work experience? Include volunteer work, school projects, or internships."
    },
    {
      icon: "flash" as const,
      title: "Skills Matter",
      description: "List technical skills, tools, and languages. Be honest - only include skills you can discuss in an interview.",
      tip: "Organize skills by category: Programming, Tools, Languages, etc."
    },
    {
      icon: "checkmark-circle" as const,
      title: "You're Ready!",
      description: "Your resume auto-saves as you type. Use the navigation buttons to move between sections.",
      tip: "Remember: Quality over quantity. A focused one-page resume is better than a cluttered two-pager."
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
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={28} color="#888" />
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name={slide.icon} size={60} color="#00D9FF" />
          </View>

          {/* Content */}
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.description}>{slide.description}</Text>

          {/* Tip Box */}
          <View style={styles.tipBox}>
            <Ionicons name="bulb" size={20} color="#FFD700" />
            <Text style={styles.tipText}>{slide.tip}</Text>
          </View>

          {/* Progress Dots */}
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

          {/* Navigation Buttons */}
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

          {/* Skip Tutorial */}
          <TouchableOpacity onPress={handleClose} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip Tutorial</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ResumeTutorial;

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