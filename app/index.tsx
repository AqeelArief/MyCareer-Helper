import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import { GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth } from "../firebase";
import GuestModeManager from "../utils/GuestModeManager";

const GUEST_MODE_KEY = '@guest_mode_active';

export default function Index() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [firebaseReady, setFirebaseReady] = useState(false);
  const router = useRouter();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const EMAIL_DOMAIN = "@mycareerhelper.app";

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1.05,
        tension: 40,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 40,
        friction: 5,
        useNativeDriver: true,
      }).start();
    });

    // Continuous pulse animation for logo
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    if (auth) {
      console.log("✅ Firebase Auth is available");
      setFirebaseReady(true);
    } else {
      console.error("❌ Firebase Auth not initialized - check .env file");
      Alert.alert(
        "Configuration Error",
        "Firebase is not configured. Please:\n\n1. Check .env file exists in project root\n2. All variables start with EXPO_PUBLIC_\n3. Restart app with: npx expo start -c"
      );
    }

    return () => pulse.stop();
  }, []);

  const validateUsername = (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9._]{3,}$/;
    return usernameRegex.test(username.trim());
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const getFullEmail = (username: string): string => {
    return username.trim().toLowerCase() + EMAIL_DOMAIN;
  };

  const handleSignUp = async () => {
    if (!firebaseReady || !auth) {
      Alert.alert("Please Wait", "Firebase is still initializing. Please try again in a moment.");
      return;
    }

    if (!validateUsername(username)) {
      Alert.alert("Invalid Username", "Username must be at least 3 characters and contain only letters, numbers, dots, or underscores.");
      return;
    }
    if (!validatePassword(password)) {
      Alert.alert("Weak Password", "Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match. Please try again.");
      return;
    }

    setLoading(true);
    const fullEmail = getFullEmail(username);

    try {
      console.log("🔐 Creating account for:", fullEmail);
      await createUserWithEmailAndPassword(auth, fullEmail, password);
      await GuestModeManager.clearGuestMode();
      console.log("✅ Account created successfully!");
      Alert.alert("Success! 🎉", "Your account has been created. Welcome to MyCareer Helper!");
      setTimeout(() => router.replace("/(tabs)/ResumeBuilder"), 500);
    } catch (error: any) {
      console.error("❌ Sign up error:", error.code, error.message);
      let errorMessage = "Failed to create account.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This username is already taken. Try signing in or choose a different username.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid username format.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password must be at least 6 characters long.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your internet connection.";
      } else {
        errorMessage = `Error: ${error.message}`;
      }
      Alert.alert("Sign Up Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!firebaseReady || !auth) {
      Alert.alert("Please Wait", "Firebase is still initializing. Please try again in a moment.");
      return;
    }

    if (!username.trim() || !password) {
      Alert.alert("Missing Fields", "Please enter both username and password.");
      return;
    }

    setLoading(true);
    const fullEmail = getFullEmail(username);

    try {
      console.log("🔐 Signing in:", fullEmail);
      await signInWithEmailAndPassword(auth, fullEmail, password);
      await GuestModeManager.clearGuestMode();
      console.log("✅ Signed in successfully!");
      setTimeout(() => router.replace("/(tabs)/ResumeBuilder"), 500);
    } catch (error: any) {
      console.error("❌ Sign in error:", error.code, error.message);
      let errorMessage = "Invalid username or password.";
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this username. Try signing up first.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid username format.";
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid username or password. Please check and try again.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your internet connection.";
      } else {
        errorMessage = `Error: ${error.message}`;
      }
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = async () => {
    try {
      await AsyncStorage.setItem(GUEST_MODE_KEY, 'true');
      console.log("👤 Guest mode activated");

      Alert.alert(
        "Welcome, Guest! 👋",
        "You can explore the app, but some features are limited. Create a free account anytime to unlock everything!",
        [
          {
            text: "Got it!",
            onPress: () => {
              setTimeout(() => router.replace("/(tabs)/ResumeBuilder"), 300);
            }
          }
        ]
      );
    } catch (error) {
      console.error("Error setting guest mode:", error);
      Alert.alert("Error", "Could not enter guest mode. Please try again.");
    }
  };

  const handleGoogleSignIn = async () => {
    if (!firebaseReady || !auth) {
      Alert.alert("Please Wait", "Firebase is still initializing.");
      return;
    }

    if (Platform.OS !== 'web') {
      Alert.alert(
        "Google Sign-In",
        "Google Sign-In is currently only available on the web version. Please use username/password authentication on mobile, or visit the web app to sign in with Google.",
        [{ text: "OK" }]
      );
      return;
    }

    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const currentAuth = auth;
      const result = await signInWithPopup(currentAuth, provider);
      await GuestModeManager.clearGuestMode();
      console.log("✅ Google Sign-In successful!");
      if (result.user) {
        setTimeout(() => router.replace("/(tabs)/ResumeBuilder"), 500);
      }
    } catch (error: any) {
      console.error("❌ Google Sign-In error:", error);
      let errorMessage = "Failed to sign in with Google.";
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign-in cancelled.";
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "Pop-up blocked. Please allow pop-ups for this site.";
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = "Sign-in cancelled.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your connection.";
      } else {
        errorMessage = error.message || "An error occurred during sign-in.";
      }
      Alert.alert("Google Sign-In Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setUsername("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [
                  { scale: logoScale },
                  { scale: pulseAnim }
                ]
              }
            ]}
          >
            <Ionicons name="briefcase" size={60} color="#00D9FF" />
          </Animated.View>

          <Text style={styles.title}>MyCareer Helper</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? "Create your free account" : "Welcome back"}
          </Text>

          {!firebaseReady && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#00D9FF" />
              <Text style={styles.loadingText}>Connecting to Firebase...</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#00D9FF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#555"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              editable={!loading && firebaseReady}
            />
            <Text style={styles.domainText}>{EMAIL_DOMAIN}</Text>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#00D9FF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password (min. 6 characters)"
              placeholderTextColor="#555"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!loading && firebaseReady}
            />
          </View>

          {isSignUp && (
            <View style={[styles.inputContainer, styles.fadeIn]}>
              <Ionicons name="lock-closed" size={20} color="#FFD700" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#555"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!loading && firebaseReady}
              />
              {confirmPassword && password !== confirmPassword && (
                <Ionicons name="close-circle" size={20} color="#FF6B6B" style={{ marginLeft: -30 }} />
              )}
              {confirmPassword && password === confirmPassword && (
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" style={{ marginLeft: -30 }} />
              )}
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, (loading || !firebaseReady) && styles.buttonDisabled]}
            onPress={isSignUp ? handleSignUp : handleSignIn}
            disabled={loading || !firebaseReady}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
            </Text>
          </TouchableOpacity>

          {Platform.OS === 'web' && !isSignUp && (
            <>
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.divider} />
              </View>

              <TouchableOpacity
                style={[styles.googleButton, (loading || !firebaseReady) && styles.buttonDisabled]}
                onPress={handleGoogleSignIn}
                disabled={loading || !firebaseReady}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-google" size={22} color="#DB4437" />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </TouchableOpacity>
            </>
          )}

          {!isSignUp && (
            <TouchableOpacity
              style={styles.guestButton}
              onPress={handleGuestMode}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Ionicons name="person-outline" size={20} color="#888" />
              <Text style={styles.guestButtonText}>Continue as Guest</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.switchButton}
            onPress={toggleMode}
            disabled={loading || !firebaseReady}
            activeOpacity={0.7}
          >
            <Text style={styles.switchText}>
              {isSignUp
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>

          {!firebaseReady && (
            <Text style={styles.warningText}>
              ⚠️ Make sure your .env file is configured with Firebase credentials
            </Text>
          )}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 40,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logoContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#0A1A1A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 3,
    borderColor: "#00D9FF",
    shadowColor: "#00D9FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  title: {
    color: "#00D9FF",
    fontSize: 34,
    fontWeight: "900",
    marginBottom: 10,
    textAlign: "center",
    letterSpacing: 1.2,
  },
  subtitle: {
    color: "#B8B8B8",
    fontSize: 17,
    marginBottom: 40,
    textAlign: "center",
    fontWeight: "500",
  },
  inputContainer: {
    width: "100%",
    maxWidth: 400,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0A0A0A",
    borderWidth: 2,
    borderColor: "#1A1A1A",
    borderRadius: 14,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  fadeIn: {
    borderColor: "#FFD70050",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    padding: 16,
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  domainText: {
    color: "#555",
    fontSize: 14,
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#00D9FF",
    padding: 18,
    borderRadius: 14,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#00D9FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: "#000",
    fontWeight: "900",
    fontSize: 18,
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#333",
  },
  dividerText: {
    color: "#888",
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: "600",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    padding: 17,
    borderRadius: 14,
    width: "100%",
    maxWidth: 400,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  googleButtonText: {
    color: "#1F1F1F",
    fontWeight: "700",
    fontSize: 16,
  },
  guestButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#1A1A1A",
    padding: 16,
    borderRadius: 14,
    width: "100%",
    maxWidth: 400,
    marginTop: 16,
    borderWidth: 2,
    borderColor: "#333",
  },
  guestButtonText: {
    color: "#888",
    fontWeight: "700",
    fontSize: 16,
  },
  switchButton: {
    marginTop: 24,
    padding: 8,
  },
  switchText: {
    color: "#00D9FF",
    fontSize: 15,
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 20,
    padding: 14,
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  loadingText: {
    color: "#00D9FF",
    fontSize: 14,
    fontWeight: "600",
  },
  warningText: {
    color: "#FFD700",
    fontSize: 13,
    textAlign: "center",
    marginTop: 20,
    paddingHorizontal: 20,
    fontWeight: "500",
  },
});