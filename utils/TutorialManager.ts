// utils/TutorialManager.ts - UPDATED FOR GUEST MODE
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth';
import GuestModeManager from './GuestModeManager';

type TutorialType = 'resume' | 'assistant' | 'interview';

class TutorialManager {
    private static instance: TutorialManager;
    private tutorials: Record<TutorialType, boolean> = {
        resume: false,
        assistant: false,
        interview: false,
    };
    private loaded: boolean = false;

    private constructor() { }

    static getInstance(): TutorialManager {
        if (!TutorialManager.instance) {
            TutorialManager.instance = new TutorialManager();
        }
        return TutorialManager.instance;
    }

    private async getStorageKey(): Promise<string> {
        const auth = getAuth();
        const userId = auth?.currentUser?.uid || 'guest';
        return `@tutorial_status_${userId}`;
    }

    async loadTutorialStatus(): Promise<void> {
        try {
            const key = await this.getStorageKey();
            const data = await AsyncStorage.getItem(key);

            if (data) {
                this.tutorials = JSON.parse(data);
                const auth = getAuth();
                console.log('✅ Tutorials loaded for user:', auth?.currentUser?.uid || 'guest');
            } else {
                // First time for this user - reset all tutorials
                this.tutorials = {
                    resume: false,
                    assistant: false,
                    interview: false,
                };
                console.log('📝 New user - all tutorials will show');
            }

            this.loaded = true;
        } catch (error) {
            console.error('Error loading tutorial status:', error);
            this.loaded = true;
        }
    }

    async markTutorialAsSeen(tutorial: TutorialType): Promise<void> {
        try {
            // Check if user is in guest mode
            const isGuest = await GuestModeManager.isGuestMode();

            if (isGuest) {
                // For guests, DON'T save tutorial status
                // This ensures tutorials show every time for guests
                console.log(`👋 Guest mode: Tutorial "${tutorial}" will show again next time`);
                return;
            }

            // For authenticated users, save tutorial status normally
            this.tutorials[tutorial] = true;
            const key = await this.getStorageKey();
            await AsyncStorage.setItem(key, JSON.stringify(this.tutorials));
            console.log(`✅ Tutorial marked as seen: ${tutorial}`);
        } catch (error) {
            console.error('Error saving tutorial status:', error);
        }
    }

    async hasSeen(tutorial: TutorialType): Promise<boolean> {
        // Check if user is in guest mode
        const isGuest = await GuestModeManager.isGuestMode();

        if (isGuest) {
            // Guests ALWAYS see tutorials (never marked as seen)
            console.log(`👋 Guest mode: Tutorial "${tutorial}" will be shown`);
            return false;
        }

        // For authenticated users, check normal status
        return this.tutorials[tutorial] === true;
    }

    isLoaded(): boolean {
        return this.loaded;
    }

    // Reset tutorials for current user (useful for testing or manual reset)
    async resetAllTutorials(): Promise<void> {
        try {
            this.tutorials = {
                resume: false,
                assistant: false,
                interview: false,
            };
            const key = await this.getStorageKey();
            await AsyncStorage.setItem(key, JSON.stringify(this.tutorials));
            console.log('🔄 All tutorials reset for current user');
        } catch (error) {
            console.error('Error resetting tutorials:', error);
        }
    }

    // Clear tutorial data when user logs out
    async clearTutorialsOnLogout(): Promise<void> {
        this.tutorials = {
            resume: false,
            assistant: false,
            interview: false,
        };
        this.loaded = false;
        console.log('🚪 Tutorial data cleared for logout');
    }
}

export default TutorialManager.getInstance();