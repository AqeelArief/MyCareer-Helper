/**
 * Interview Progress Manager - REACT NATIVE VERSION
 * Handles progress tracking with AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Question, QuestionProgress, getQuestionBank, shuffleArray } from './InterviewQuestionBank';

const QUESTIONS_PER_SESSION = 10;

export class InterviewProgressManager {
    /**
     * Get current user ID from AsyncStorage or create new one
     */
    private static async getUserId(): Promise<string> {
        const GUEST_ID_KEY = 'interview_user_id';
        let userId = await AsyncStorage.getItem(GUEST_ID_KEY);

        if (!userId) {
            // Create a persistent user ID
            userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await AsyncStorage.setItem(GUEST_ID_KEY, userId);
        }

        return userId;
    }

    /**
     * Get AsyncStorage key for progress
     */
    private static async getProgressKey(category: string): Promise<string> {
        const userId = await this.getUserId();
        const sanitizedCategory = category.replace(/\s+/g, '_');
        return `interview_progress_${userId}_${sanitizedCategory}`;
    }

    /**
     * Load progress from AsyncStorage
     */
    static async loadProgress(category: string): Promise<QuestionProgress | null> {
        try {
            const key = await this.getProgressKey(category);
            const stored = await AsyncStorage.getItem(key);

            if (stored) {
                const data = JSON.parse(stored);
                return {
                    userId: data.userId,
                    category: data.category,
                    askedQuestionIds: data.askedQuestionIds || [],
                    currentSessionQuestions: data.currentSessionQuestions || [],
                    currentQuestionIndex: data.currentQuestionIndex || 0,
                    lastUpdated: data.lastUpdated || Date.now(),
                };
            }

            return null;
        } catch (error) {
            console.error('Error loading interview progress:', error);
            return null;
        }
    }

    /**
     * Save progress to AsyncStorage
     */
    static async saveProgress(progress: QuestionProgress): Promise<void> {
        try {
            const key = await this.getProgressKey(progress.category);
            const dataToSave = {
                userId: await this.getUserId(),
                category: progress.category,
                askedQuestionIds: progress.askedQuestionIds,
                currentSessionQuestions: progress.currentSessionQuestions,
                currentQuestionIndex: progress.currentQuestionIndex,
                lastUpdated: Date.now(),
            };

            await AsyncStorage.setItem(key, JSON.stringify(dataToSave));
        } catch (error) {
            console.error('Error saving interview progress:', error);
        }
    }

    /**
     * Get next batch of questions (10 questions)
     * Intelligently picks from unasked questions or resets if all asked
     */
    static async getNextQuestions(category: string): Promise<{
        questions: Question[];
        progress: QuestionProgress;
        isResumingSession: boolean;
    }> {
        // Load existing progress
        let progress = await this.loadProgress(category);
        const questionBank = getQuestionBank(category);

        // Check if resuming an incomplete session
        if (progress &&
            progress.currentSessionQuestions.length > 0 &&
            progress.currentQuestionIndex < progress.currentSessionQuestions.length) {

            // Resume existing session
            const sessionQuestions = progress.currentSessionQuestions.map(id =>
                questionBank.find(q => q.id === id)!
            ).filter(q => q !== undefined);

            return {
                questions: sessionQuestions,
                progress,
                isResumingSession: true,
            };
        }

        // Start new session
        const userId = await this.getUserId();
        const askedIds = progress?.askedQuestionIds || [];

        // Get unasked questions
        let availableQuestions = questionBank.filter(q => !askedIds.includes(q.id));

        // If we've asked all questions, reset and start over
        if (availableQuestions.length < QUESTIONS_PER_SESSION) {
            console.log('All questions asked, resetting pool');
            availableQuestions = questionBank;
            progress = {
                userId,
                category,
                askedQuestionIds: [],
                currentSessionQuestions: [],
                currentQuestionIndex: 0,
                lastUpdated: Date.now(),
            };
        }

        // Shuffle and pick 10 questions
        const shuffled = shuffleArray(availableQuestions);
        const selectedQuestions = shuffled.slice(0, QUESTIONS_PER_SESSION);

        // Create new progress
        const newProgress: QuestionProgress = {
            userId,
            category,
            askedQuestionIds: progress?.askedQuestionIds || [],
            currentSessionQuestions: selectedQuestions.map(q => q.id),
            currentQuestionIndex: 0,
            lastUpdated: Date.now(),
        };

        // Save progress
        await this.saveProgress(newProgress);

        return {
            questions: selectedQuestions,
            progress: newProgress,
            isResumingSession: false,
        };
    }

    /**
     * Mark question as answered and move to next
     */
    static async markQuestionAnswered(
        category: string,
        questionId: string
    ): Promise<QuestionProgress> {
        const progress = await this.loadProgress(category);

        if (!progress) {
            throw new Error('No active session found');
        }

        // Add to asked questions if not already there
        if (!progress.askedQuestionIds.includes(questionId)) {
            progress.askedQuestionIds.push(questionId);
        }

        // Move to next question
        progress.currentQuestionIndex += 1;
        progress.lastUpdated = Date.now();

        // Save updated progress
        await this.saveProgress(progress);

        return progress;
    }

    /**
     * Complete session (mark all remaining questions as asked)
     */
    static async completeSession(category: string): Promise<void> {
        const progress = await this.loadProgress(category);

        if (!progress) return;

        // Mark all session questions as asked
        for (const questionId of progress.currentSessionQuestions) {
            if (!progress.askedQuestionIds.includes(questionId)) {
                progress.askedQuestionIds.push(questionId);
            }
        }

        // Clear current session
        progress.currentSessionQuestions = [];
        progress.currentQuestionIndex = 0;
        progress.lastUpdated = Date.now();

        await this.saveProgress(progress);
    }

    /**
     * Reset progress (start fresh)
     */
    static async resetProgress(category: string): Promise<void> {
        const userId = await this.getUserId();
        const newProgress: QuestionProgress = {
            userId,
            category,
            askedQuestionIds: [],
            currentSessionQuestions: [],
            currentQuestionIndex: 0,
            lastUpdated: Date.now(),
        };

        await this.saveProgress(newProgress);
    }

    /**
     * Get statistics
     */
    static async getStatistics(category: string): Promise<{
        totalQuestions: number;
        askedQuestions: number;
        remainingQuestions: number;
        percentageComplete: number;
    }> {
        const progress = await this.loadProgress(category);
        const questionBank = getQuestionBank(category);
        const totalQuestions = questionBank.length;
        const askedQuestions = progress?.askedQuestionIds.length || 0;
        const remainingQuestions = totalQuestions - askedQuestions;
        const percentageComplete = Math.round((askedQuestions / totalQuestions) * 100);

        return {
            totalQuestions,
            askedQuestions,
            remainingQuestions,
            percentageComplete,
        };
    }
}