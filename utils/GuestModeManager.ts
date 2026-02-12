// utils/GuestModeManager.ts - ENHANCED WITH RESUME TRANSFER
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import { Alert } from 'react-native';

const GUEST_MODE_KEY = '@guest_mode_active';
const GUEST_RESUME_DATA = '@guest_resume_data';
const RESUME_INTERACTION_COUNT = '@resume_interaction_count';
const ASSISTANT_INTERACTION_COUNT = '@assistant_interaction_count';
const INTERVIEW_INTERACTION_COUNT = '@interview_interaction_count';

interface ResumeData {
    name: string;
    email: string;
    phone: string;
    address: string;
    linkedin: string;
    website: string;
    school: string;
    degree: string;
    major: string;
    gpa: string;
    graduationDate: string;
    coursework: string;
    experiences: string;
    projects: string;
    technicalSkills: string;
    languages: string;
    certifications: string;
    activities: string;
}

class GuestModeManager {
    private static instance: GuestModeManager;

    private constructor() { }

    static getInstance(): GuestModeManager {
        if (!GuestModeManager.instance) {
            GuestModeManager.instance = new GuestModeManager();
        }
        return GuestModeManager.instance;
    }

    // Check if user is in guest mode
    async isGuestMode(): Promise<boolean> {
        try {
            const auth = getAuth();
            // If user is authenticated, they're not a guest
            if (auth?.currentUser) {
                return false;
            }

            const guestMode = await AsyncStorage.getItem(GUEST_MODE_KEY);
            return guestMode === 'true';
        } catch (error) {
            console.error('Error checking guest mode:', error);
            return false;
        }
    }

    // Enable guest mode
    async enableGuestMode(): Promise<void> {
        try {
            await AsyncStorage.setItem(GUEST_MODE_KEY, 'true');
            console.log('✅ Guest mode enabled');
        } catch (error) {
            console.error('Error enabling guest mode:', error);
        }
    }

    // ============================================
    // GUEST RESUME MANAGEMENT
    // ============================================

    /**
     * Save resume data for guest user
     */
    async saveGuestResume(resumeData: Partial<ResumeData>): Promise<void> {
        try {
            const isGuest = await this.isGuestMode();
            if (!isGuest) return; // Only save for guests

            await AsyncStorage.setItem(GUEST_RESUME_DATA, JSON.stringify(resumeData));
            console.log('✅ Guest resume saved to AsyncStorage');
        } catch (error) {
            console.error('Error saving guest resume:', error);
        }
    }

    /**
     * Get guest resume data
     */
    async getGuestResume(): Promise<Partial<ResumeData> | null> {
        try {
            const resumeStr = await AsyncStorage.getItem(GUEST_RESUME_DATA);
            if (resumeStr) {
                return JSON.parse(resumeStr);
            }
            return null;
        } catch (error) {
            console.error('Error getting guest resume:', error);
            return null;
        }
    }

    /**
     * Check if guest has built a resume
     */
    async hasGuestResume(): Promise<boolean> {
        const resume = await this.getGuestResume();
        return resume !== null && Object.keys(resume).length > 0;
    }

    /**
     * Transfer guest resume to authenticated user's Firestore
     */
    async transferGuestResumeToUser(): Promise<boolean> {
        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                console.error('No authenticated user to transfer resume to');
                return false;
            }

            // Get guest resume data
            const guestResume = await this.getGuestResume();

            if (!guestResume || Object.keys(guestResume).length === 0) {
                console.log('No guest resume to transfer');
                return false;
            }

            // Save to Firestore
            const db = getFirestore();
            const resumeRef = doc(db, 'resumes', user.uid);

            await setDoc(resumeRef, {
                ...guestResume,
                userId: user.uid,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });

            console.log('✅ Guest resume transferred to Firestore');

            // Clear guest resume after successful transfer
            await AsyncStorage.removeItem(GUEST_RESUME_DATA);

            return true;
        } catch (error) {
            console.error('Error transferring guest resume:', error);
            return false;
        }
    }

    /**
     * Show "View Resume" prompt for guests - they must sign up
     */
    showViewResumePrompt(onSignUp: () => void): void {
        Alert.alert(
            "Almost There! 🎉",
            "Your resume is ready! Create a free account to view, download, and access it anytime.",
            [
                {
                    text: "Not Now",
                    style: "cancel",
                },
                {
                    text: "Create Account",
                    style: "default",
                    onPress: onSignUp
                }
            ]
        );
    }

    // ============================================
    // INTERACTION TRACKING (EXISTING)
    // ============================================

    // Clear guest mode (when user signs in/up)
    async clearGuestMode(): Promise<void> {
        try {
            await AsyncStorage.removeItem(GUEST_MODE_KEY);
            await AsyncStorage.removeItem(RESUME_INTERACTION_COUNT);
            await AsyncStorage.removeItem(ASSISTANT_INTERACTION_COUNT);
            await AsyncStorage.removeItem(INTERVIEW_INTERACTION_COUNT);
            // Don't clear GUEST_RESUME_DATA here - we'll transfer it first
            console.log('✅ Guest mode cleared');
        } catch (error) {
            console.error('Error clearing guest mode:', error);
        }
    }

    // Track interactions and show upgrade prompt
    async trackResumeInteraction(onUpgrade: () => void): Promise<boolean> {
        const isGuest = await this.isGuestMode();
        if (!isGuest) return true; // Not a guest, allow action

        try {
            const countStr = await AsyncStorage.getItem(RESUME_INTERACTION_COUNT);
            const count = parseInt(countStr || '0', 10);
            const newCount = count + 1;

            await AsyncStorage.setItem(RESUME_INTERACTION_COUNT, newCount.toString());

            // Show prompt after 10 interactions (give them plenty of time to build)
            if (newCount >= 10) {
                this.showUpgradePrompt(
                    'Resume Builder',
                    'You\'re doing great! Create a free account to save your resume permanently.',
                    onUpgrade
                );
                return false; // Block action
            }

            return true; // Allow action
        } catch (error) {
            console.error('Error tracking resume interaction:', error);
            return true;
        }
    }

    async trackAssistantInteraction(onUpgrade: () => void): Promise<boolean> {
        const isGuest = await this.isGuestMode();
        if (!isGuest) return true;

        try {
            const countStr = await AsyncStorage.getItem(ASSISTANT_INTERACTION_COUNT);
            const count = parseInt(countStr || '0', 10);
            const newCount = count + 1;

            await AsyncStorage.setItem(ASSISTANT_INTERACTION_COUNT, newCount.toString());

            // Show prompt after 2 messages
            if (newCount >= 2) {
                this.showUpgradePrompt(
                    'AI Assistant',
                    'Loving the AI assistant? Create a free account to get unlimited career advice!',
                    onUpgrade
                );
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error tracking assistant interaction:', error);
            return true;
        }
    }

    async trackInterviewInteraction(onUpgrade: () => void): Promise<boolean> {
        const isGuest = await this.isGuestMode();
        if (!isGuest) return true;

        try {
            const countStr = await AsyncStorage.getItem(INTERVIEW_INTERACTION_COUNT);
            const count = parseInt(countStr || '0', 10);
            const newCount = count + 1;

            await AsyncStorage.setItem(INTERVIEW_INTERACTION_COUNT, newCount.toString());

            // Show prompt after 5 questions (give them more time)
            if (newCount >= 5) {
                this.showUpgradePrompt(
                    'Interview Practice',
                    'Keep practicing! Sign up for free to track your progress.',
                    onUpgrade
                );
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error tracking interview interaction:', error);
            return true;
        }
    }

    // Show upgrade prompt
    private showUpgradePrompt(
        feature: string,
        message: string,
        onUpgrade: () => void
    ): void {
        Alert.alert(
            `Unlock Full ${feature} 🚀`,
            message,
            [
                {
                    text: "Maybe Later",
                    style: "cancel",
                },
                {
                    text: "Sign Up Free",
                    style: "default",
                    onPress: onUpgrade
                }
            ]
        );
    }

    // Show initial guest welcome
    async showGuestWelcome(): Promise<void> {
        const isGuest = await this.isGuestMode();
        if (!isGuest) return;

        const hasSeenWelcome = await AsyncStorage.getItem('@guest_welcome_seen');
        if (hasSeenWelcome) return;

        Alert.alert(
            "Welcome, Guest! 👋",
            "You're exploring in guest mode. Create a free account anytime to save your work!",
            [
                {
                    text: "Got it!",
                    onPress: async () => {
                        await AsyncStorage.setItem('@guest_welcome_seen', 'true');
                    }
                }
            ]
        );
    }

    // Get interaction counts (for debugging/testing)
    async getInteractionCounts(): Promise<{
        resume: number;
        assistant: number;
        interview: number;
    }> {
        try {
            const resume = parseInt(await AsyncStorage.getItem(RESUME_INTERACTION_COUNT) || '0', 10);
            const assistant = parseInt(await AsyncStorage.getItem(ASSISTANT_INTERACTION_COUNT) || '0', 10);
            const interview = parseInt(await AsyncStorage.getItem(INTERVIEW_INTERACTION_COUNT) || '0', 10);

            return { resume, assistant, interview };
        } catch (error) {
            console.error('Error getting interaction counts:', error);
            return { resume: 0, assistant: 0, interview: 0 };
        }
    }

    // Reset interaction counts (useful for testing)
    async resetInteractionCounts(): Promise<void> {
        try {
            await AsyncStorage.removeItem(RESUME_INTERACTION_COUNT);
            await AsyncStorage.removeItem(ASSISTANT_INTERACTION_COUNT);
            await AsyncStorage.removeItem(INTERVIEW_INTERACTION_COUNT);
            console.log('✅ Interaction counts reset');
        } catch (error) {
            console.error('Error resetting interaction counts:', error);
        }
    }
}

export default GuestModeManager.getInstance();