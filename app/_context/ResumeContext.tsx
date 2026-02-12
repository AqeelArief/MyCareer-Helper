import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { Dispatch, ReactNode, SetStateAction, createContext, useCallback, useEffect, useRef, useState } from "react";
import { Alert } from 'react-native';
import { auth as firebaseAuth, db as firebaseDb } from '../../firebase';
import { sanitizeInput, validateEmail } from '../../utils/helpers';

export interface ResumeData {
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
  technicalSkills: string;
  languages: string;
  certifications: string;
  projects: string;
  activities: string;
}

export interface CareerPlanningData {
  targetField: string;
  careerGoal: string;
  priority: string;
  steps: string;
  focusSkills: string[];
}

export interface AppData extends ResumeData, CareerPlanningData { }

export interface ResumeContextType {
  resumeData: ResumeData;
  setResumeData: (data: Partial<ResumeData>) => void;
  targetField: string;
  careerGoal: string;
  priority: string;
  steps: string;
  focusSkills: string[];
  isDataLoading: boolean;
  setTargetField: Dispatch<SetStateAction<string>>;
  setCareerGoal: Dispatch<SetStateAction<string>>;
  setPriority: Dispatch<SetStateAction<string>>;
  setSteps: Dispatch<SetStateAction<string>>;
  setFocusSkills: Dispatch<SetStateAction<string[]>>;
}

const initialData: AppData = {
  name: "",
  email: "",
  phone: "",
  address: "",
  linkedin: "",
  website: "",
  school: "",
  degree: "",
  major: "",
  gpa: "",
  graduationDate: "",
  coursework: "",
  experiences: "",
  technicalSkills: "",
  languages: "",
  certifications: "",
  projects: "",
  activities: "",
  targetField: "General Career Development",
  careerGoal: "",
  priority: "Landing a role with strong growth potential.",
  steps: "1. Update resume based on target field. 2. Network with professionals.",
  focusSkills: [],
};

const ResumeContext = createContext<ResumeContextType>({
  resumeData: {
    name: "",
    email: "",
    phone: "",
    address: "",
    linkedin: "",
    website: "",
    school: "",
    degree: "",
    major: "",
    gpa: "",
    graduationDate: "",
    coursework: "",
    experiences: "",
    technicalSkills: "",
    languages: "",
    certifications: "",
    projects: "",
    activities: "",
  },
  setResumeData: () => { },
  ...initialData,
  isDataLoading: true,
  setTargetField: () => { },
  setCareerGoal: () => { },
  setPriority: () => { },
  setSteps: () => { },
  setFocusSkills: () => { },
});

/**
 * Custom debounce hook for saving data
 */
const useDebounce = (callback: (...args: any[]) => void, delay: number) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  return useCallback((...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

/**
 * Validate and sanitize app data before saving
 */
const validateAndSanitizeData = (data: AppData): AppData => {
  return {
    ...data,
    name: sanitizeInput(data.name || ''),
    email: data.email ? (validateEmail(data.email) ? data.email.trim().toLowerCase() : '') : '',
    phone: sanitizeInput(data.phone || ''),
    address: sanitizeInput(data.address || ''),
    linkedin: sanitizeInput(data.linkedin || ''),
    website: sanitizeInput(data.website || ''),
    school: sanitizeInput(data.school || ''),
    degree: sanitizeInput(data.degree || ''),
    major: sanitizeInput(data.major || ''),
    gpa: sanitizeInput(data.gpa || ''),
    graduationDate: sanitizeInput(data.graduationDate || ''),
    coursework: sanitizeInput(data.coursework || '').substring(0, 2000),
    experiences: sanitizeInput(data.experiences || '').substring(0, 5000),
    technicalSkills: sanitizeInput(data.technicalSkills || '').substring(0, 2000),
    languages: sanitizeInput(data.languages || '').substring(0, 1000),
    certifications: sanitizeInput(data.certifications || '').substring(0, 2000),
    projects: sanitizeInput(data.projects || '').substring(0, 5000),
    activities: sanitizeInput(data.activities || '').substring(0, 2000),
    targetField: sanitizeInput(data.targetField || ''),
    careerGoal: sanitizeInput(data.careerGoal || '').substring(0, 1000),
    priority: sanitizeInput(data.priority || '').substring(0, 500),
    steps: sanitizeInput(data.steps || '').substring(0, 2000),
    focusSkills: (data.focusSkills || []).map(skill => sanitizeInput(skill).substring(0, 100)),
  };
};

export const ResumeProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dataLoadedFromFirestore, setDataLoadedFromFirestore] = useState(false);

  const [resumeDataState, setResumeDataState] = useState<ResumeData>(initialData);

  const [targetField, setTargetField] = useState<string>(initialData.targetField);
  const [careerGoal, setCareerGoal] = useState<string>(initialData.careerGoal);
  const [priority, setPriority] = useState<string>(initialData.priority);
  const [steps, setSteps] = useState<string>(initialData.steps);
  const [focusSkills, setFocusSkills] = useState<string[]>(initialData.focusSkills);

  // 1. Listen to Firebase Auth
  useEffect(() => {
    if (!firebaseAuth) {
      console.error("❌ Firebase Auth not initialized");
      setIsAuthReady(true);
      setIsDataLoading(false);
      return;
    }

    console.log("🔐 Setting up auth listener...");
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      console.log("🔐 Auth state changed:", user?.uid || "No user");
      setCurrentUser(user);
      setIsAuthReady(true);

      // Reset data loaded flag when user changes
      if (!user) {
        setDataLoadedFromFirestore(false);
        // Reset to initial data when logged out
        setResumeDataState(initialData);
        setTargetField(initialData.targetField);
        setCareerGoal(initialData.careerGoal);
        setPriority(initialData.priority);
        setSteps(initialData.steps);
        setFocusSkills(initialData.focusSkills);
        setIsDataLoading(false);
      } else {
        setDataLoadedFromFirestore(false);
      }
    });

    return () => unsubscribe();
  }, []);

  /**
   * Get complete app data
   */
  const getFullAppData = useCallback((): AppData => ({
    ...resumeDataState,
    targetField,
    careerGoal,
    priority,
    steps,
    focusSkills,
  }), [resumeDataState, targetField, careerGoal, priority, steps, focusSkills]);

  /**
   * Save data to Firestore with validation and sanitization
   */
  const saveToFirestore = useCallback(async (data: AppData) => {
    if (!firebaseDb || !currentUser) {
      console.warn("⚠️ Cannot save: Firebase not ready or user not logged in");
      return;
    }

    const userId = currentUser.uid;
    console.log("💾 Saving data for user:", userId);

    const docRef = doc(firebaseDb, `users/${userId}/resumeData/profile`);

    try {
      // Validate and sanitize data before saving
      const sanitizedData = validateAndSanitizeData(data);
      await setDoc(docRef, sanitizedData, { merge: true });
      console.log("✅ Data saved successfully to Firestore!");
    } catch (e: unknown) {
      const error = e as any;
      console.error("❌ Error saving document:", error);

      // Handle offline error gracefully
      if (error.code === 'unavailable' || error.message?.includes('offline')) {
        console.log("📱 App is offline - data will sync when back online");
        // Firestore will automatically retry when connection is restored
      } else if (error.code === 'permission-denied') {
        console.error("🔒 Permission denied - check Firestore security rules");
        Alert.alert(
          'Save Failed',
          'Permission denied. Please log in again.',
          [{ text: 'OK' }]
        );
      } else {
        console.error("Unexpected error:", error);
      }
    }
  }, [currentUser]);

  const debouncedSave = useDebounce(saveToFirestore, 1000);

  // 2. Load Data from Firestore (ONE-TIME on login)
  useEffect(() => {
    if (!firebaseDb || !isAuthReady || !currentUser || dataLoadedFromFirestore) {
      if (isAuthReady && !currentUser) {
        console.log("⚠️ No user logged in - using local data only");
        setIsDataLoading(false);
      }
      return;
    }

    const userId = currentUser.uid;
    const docRef = doc(firebaseDb, `users/${userId}/resumeData/profile`);

    console.log("📖 Loading data for user:", userId);
    setIsDataLoading(true);

    // Use getDoc for one-time load instead of onSnapshot
    const loadData = async () => {
      try {
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const loadedData = docSnap.data() as AppData;
          console.log("✅ Data loaded from Firestore for:", loadedData.name || "New User");

          // Update all state with loaded data
          setResumeDataState({
            name: loadedData.name || initialData.name,
            email: loadedData.email || initialData.email,
            phone: loadedData.phone || initialData.phone,
            address: loadedData.address || initialData.address,
            linkedin: loadedData.linkedin || initialData.linkedin,
            website: loadedData.website || initialData.website,
            school: loadedData.school || initialData.school,
            degree: loadedData.degree || initialData.degree,
            major: loadedData.major || initialData.major,
            gpa: loadedData.gpa || initialData.gpa,
            graduationDate: loadedData.graduationDate || initialData.graduationDate,
            coursework: loadedData.coursework || initialData.coursework,
            experiences: loadedData.experiences || initialData.experiences,
            technicalSkills: loadedData.technicalSkills || initialData.technicalSkills,
            languages: loadedData.languages || initialData.languages,
            certifications: loadedData.certifications || initialData.certifications,
            projects: loadedData.projects || initialData.projects,
            activities: loadedData.activities || initialData.activities,
          });

          setTargetField(loadedData.targetField || initialData.targetField);
          setCareerGoal(loadedData.careerGoal || initialData.careerGoal);
          setPriority(loadedData.priority || initialData.priority);
          setSteps(loadedData.steps || initialData.steps);
          setFocusSkills(loadedData.focusSkills || initialData.focusSkills);
        } else {
          console.log("📝 No existing data - will create new profile on first save");
        }

        setDataLoadedFromFirestore(true);
        setIsDataLoading(false);
      } catch (error: unknown) {
        const err = error as any;
        // Handle offline error gracefully - don't show error for offline status
        if (err.code === 'unavailable' || err.message?.includes('offline') || err.message?.includes('client is offline')) {
          console.log("📱 App is offline - starting with empty data. Will sync when online.");
          // Continue with default/empty data, user can still use the app
        } else if (err.code === 'permission-denied') {
          console.error("🔒 Permission denied - check Firestore rules");
        } else {
          console.log("⚠️ Could not load data:", err.message || err.code);
        }

        // Mark as loaded so app can continue even if offline
        setDataLoadedFromFirestore(true);
        setIsDataLoading(false);
      }
    };

    // Add a small delay to ensure network is ready
    const timeoutId = setTimeout(() => {
      loadData();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [isAuthReady, currentUser, dataLoadedFromFirestore]);

  // 3. Save Data to Firestore (Debounced, only after data is loaded)
  useEffect(() => {
    if (!isAuthReady || isDataLoading || !currentUser || !dataLoadedFromFirestore) {
      return;
    }

    const dataToSave = getFullAppData();
    console.log("🔄 Data changed, scheduling save...");
    debouncedSave(dataToSave);
  }, [resumeDataState, targetField, careerGoal, priority, steps, focusSkills, isAuthReady, isDataLoading, currentUser, dataLoadedFromFirestore, debouncedSave, getFullAppData]);

  /**
   * Update resume data with partial updates
   */
  const setResumeData = (data: Partial<ResumeData>) => {
    console.log("📝 Resume data updated:", Object.keys(data));
    setResumeDataState(prev => ({ ...prev, ...data }));
  };

  const contextValue: ResumeContextType = {
    resumeData: resumeDataState,
    setResumeData,
    targetField,
    setTargetField,
    careerGoal,
    setCareerGoal,
    priority,
    setPriority,
    steps,
    setSteps,
    focusSkills,
    setFocusSkills,
    isDataLoading,
  };

  return (
    <ResumeContext.Provider value={contextValue}>
      {children}
    </ResumeContext.Provider>
  );
};

export default ResumeContext;