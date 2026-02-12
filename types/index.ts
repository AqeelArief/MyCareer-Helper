// types/index.ts - Centralized type definitions for the app

// ============================================================================
// RESUME & CAREER DATA TYPES
// ============================================================================

export interface ResumeData {
    name: string;
    email: string;
    phone: string;
    experience: string;
    skills: string;
    additionalInfo: string;
  }
  
  export interface CareerPlanningData {
    targetField: string;
    careerGoal: string;
    priority: string;
    steps: string;
    focusSkills: string[];
  }
  
  export interface AppData extends ResumeData, CareerPlanningData {}
  
  // ============================================================================
  // CHAT & MESSAGE TYPES
  // ============================================================================
  
  export interface Message {
    id: number;
    text: string;
    sender: "user" | "bot";
    timestamp?: Date;
  }
  
  export interface ChatHistory {
    role: "user" | "model";
    parts: Array<{ text: string }>;
  }
  
  // ============================================================================
  // INTERVIEW TYPES
  // ============================================================================
  
  export interface InterviewQuestion {
    id: number;
    text: string;
    category: "behavioral" | "technical" | "situational" | "general";
    duration: number; // in seconds
  }
  
  export interface InterviewSession {
    id: string;
    startTime: Date;
    endTime?: Date;
    questionsAnswered: number;
    totalQuestions: number;
    completed: boolean;
  }
  
  export interface InterviewAnswer {
    questionId: number;
    answer: string;
    duration: number;
    timestamp: Date;
  }
  
  // ============================================================================
  // TIPS & RESOURCES TYPES
  // ============================================================================
  
  export interface Tip {
    id: number;
    title: string;
    description: string;
    icon: string;
    category?: "resume" | "interview" | "networking" | "general";
  }
  
  export interface Resource {
    id: number;
    title: string;
    description: string;
    url?: string;
    type: "article" | "video" | "tool" | "course";
  }
  
  // ============================================================================
  // NAVIGATION TYPES
  // ============================================================================
  
  export type RootStackParamList = {
    index: undefined;
    "(tabs)": undefined;
    MadeResume: undefined;
    MockInterview: undefined;
    Not_found: undefined;
    SignIn: undefined;
  };
  
  export type TabParamList = {
    ResumeBuilder: undefined;
    FieldFinder: undefined;
    Resources: undefined;
    MyCareer: undefined;
  };
  
  // ============================================================================
  // API TYPES
  // ============================================================================
  
  export interface GeminiApiResponse {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string;
        }>;
      };
      finishReason?: string;
    }>;
    error?: {
      message: string;
      code: number;
    };
  }
  
  export interface GeminiApiRequest {
    contents: ChatHistory[];
    systemInstruction?: {
      parts: Array<{ text: string }>;
    };
    generationConfig?: {
      temperature?: number;
      topK?: number;
      topP?: number;
      maxOutputTokens?: number;
    };
    tools?: any[];
  }
  
  export interface ApiError {
    message: string;
    code: number;
    details?: string;
  }
  
  // ============================================================================
  // FIREBASE TYPES
  // ============================================================================
  
  export interface FirestoreUserData extends AppData {
    createdAt?: Date;
    updatedAt?: Date;
    userId: string;
  }
  
  export interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
  }
  
  // ============================================================================
  // FORM VALIDATION TYPES
  // ============================================================================
  
  export interface ValidationResult {
    isValid: boolean;
    message?: string;
  }
  
  export interface FormErrors {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    experience?: string;
    skills?: string;
  }
  
  // ============================================================================
  // CONTEXT TYPES
  // ============================================================================
  
  export interface ResumeContextType {
    resumeData: ResumeData;
    setResumeData: (data: Partial<ResumeData>) => void;
    targetField: string;
    careerGoal: string;
    priority: string;
    steps: string;
    focusSkills: string[];
    isDataLoading: boolean;
    setTargetField: React.Dispatch<React.SetStateAction<string>>;
    setCareerGoal: React.Dispatch<React.SetStateAction<string>>;
    setPriority: React.Dispatch<React.SetStateAction<string>>;
    setSteps: React.Dispatch<React.SetStateAction<string>>;
    setFocusSkills: React.Dispatch<React.SetStateAction<string[]>>;
  }
  
  // ============================================================================
  // SKILL TYPES
  // ============================================================================
  
  export type SkillCategory = "technical" | "soft" | "business" | "design";
  
  export interface Skill {
    name: string;
    category: SkillCategory;
    level?: "beginner" | "intermediate" | "advanced" | "expert";
  }
  
  export interface SkillGroup {
    category: SkillCategory;
    skills: string[];
  }
  
  // ============================================================================
  // AUTH TYPES
  // ============================================================================
  
  export interface AuthUser {
    uid: string;
    email: string | null;
    displayName?: string | null;
    photoURL?: string | null;
  }
  
  export interface SignInCredentials {
    email: string;
    password: string;
  }
  
  export interface SignUpCredentials extends SignInCredentials {
    confirmPassword?: string;
  }
  
  // ============================================================================
  // COMPONENT PROP TYPES
  // ============================================================================
  
  export interface LoadingScreenProps {
    message?: string;
  }
  
  export interface SkillPickerProps {
    visible: boolean;
    onClose: () => void;
    selectedSkills: string[];
    onSkillToggle: (skill: string) => void;
  }
  
  export interface TipCardProps {
    tip: Tip;
    onPress?: () => void;
  }
  
  // ============================================================================
  // UTILITY TYPES
  // ============================================================================
  
  export type Nullable<T> = T | null;
  export type Optional<T> = T | undefined;
  export type AsyncFunction<T = void> = () => Promise<T>;
  
  // ============================================================================
  // EXPORT ALL
  // ============================================================================
  
  export default {
    // You can add default exports here if needed
  };