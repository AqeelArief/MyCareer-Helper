import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth } from "../firebase";
import GuestModeManager from "../utils/GuestModeManager";
import { sanitizeInput, validateEmail } from "../utils/helpers";

type RootStackParamList = {
  SignIn: undefined;
  Home: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "SignIn">;

export default function SignIn({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);

  const handleSignIn = async () => {
    // Check if Firebase auth is initialized
    if (!auth) {
      Alert.alert(
        "Configuration Error",
        "Firebase authentication is not configured. Please check your Firebase setup."
      );
      return;
    }

    // Validate inputs
    const sanitizedEmail = sanitizeInput(email).toLowerCase();

    if (!sanitizedEmail || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }

    if (!validateEmail(sanitizedEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    // Basic rate limiting (client-side)
    if (failedAttempts >= 5) {
      Alert.alert(
        "Too Many Attempts",
        "Too many failed login attempts. Please wait a few minutes before trying again."
      );
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, sanitizedEmail, password);

      // Reset failed attempts on success
      setFailedAttempts(0);

      // Check if there's a guest resume to transfer
      const hasGuestResume = await GuestModeManager.hasGuestResume();

      if (hasGuestResume) {
        // Transfer guest resume to authenticated user
        const transferred = await GuestModeManager.transferGuestResumeToUser();

        if (transferred) {
          // Clear guest mode
          await GuestModeManager.clearGuestMode();

          // Show success message
          Alert.alert(
            "Welcome Back! 🎉",
            "Your resume has been saved to your account!",
            [
              {
                text: "View Resume",
                onPress: () => {
                  navigation.replace("Home");
                  // Note: You may need to navigate to MadeResume here
                  // depending on your navigation structure
                }
              },
              {
                text: "Continue",
                onPress: () => navigation.replace("Home")
              }
            ]
          );
        } else {
          // Clear guest mode even if transfer failed
          await GuestModeManager.clearGuestMode();
          navigation.replace("Home");
        }
      } else {
        // No guest resume, normal sign in
        await GuestModeManager.clearGuestMode();
        navigation.replace("Home");
      }
    } catch (error: unknown) {
      const err = error as any;
      console.log("Error signing in:", err.message || err);

      let errorMessage = "Authentication failed. Please try again.";

      // Generic error messages to prevent account enumeration
      if (err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password.";
        setFailedAttempts(prev => prev + 1);
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your connection.";
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed attempts. Please try again later or reset your password.";
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = "This account has been disabled. Please contact support.";
      }

      Alert.alert("Sign In Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Career Helper Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#555"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading}
        maxLength={254}
        autoComplete="email"
        textContentType="emailAddress"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#555"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!loading}
        maxLength={128}
        autoComplete="password"
        textContentType="password"
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSignIn}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {loading ? "Signing In..." : "Sign In"}
        </Text>
      </TouchableOpacity>

      {failedAttempts >= 3 && (
        <Text style={styles.warningText}>
          {5 - failedAttempts} attempts remaining
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#000",
  },
  title: {
    fontSize: 28,
    marginBottom: 30,
    textAlign: "center",
    color: "#00D9FF",
    fontWeight: "800",
    letterSpacing: 1,
  },
  input: {
    borderWidth: 2,
    borderColor: "#1A1A1A",
    backgroundColor: "#0A0A0A",
    padding: 14,
    marginVertical: 10,
    borderRadius: 10,
    fontSize: 16,
    color: "#FFF",
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#00D9FF",
    padding: 16,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
    shadowColor: "#00D9FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#000",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  warningText: {
    color: "#FF6B6B",
    fontSize: 14,
    textAlign: "center",
    marginTop: 16,
    fontWeight: "600",
  },
});