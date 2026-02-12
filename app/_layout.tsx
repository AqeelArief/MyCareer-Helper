import { Stack } from "expo-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import GuestModeManager from "../utils/GuestModeManager";
import { ResumeProvider } from "./_context/ResumeContext";

export default function RootLayout() {

  // Initialize guest mode for unauthenticated users
  useEffect(() => {
    const auth = getAuth();

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // User is not signed in - enable guest mode
        await GuestModeManager.enableGuestMode();
        console.log('✅ Guest mode enabled');
      } else {
        // User is signed in - ensure guest mode is cleared
        // (This happens automatically during sign in, but double-check here)
        const isGuest = await GuestModeManager.isGuestMode();
        if (isGuest) {
          await GuestModeManager.clearGuestMode();
          console.log('✅ Guest mode cleared for authenticated user');
        }
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <ResumeProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        {/* Modal screens */}
        <Stack.Screen
          name="MadeResume"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="MockInterview"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="FieldSpecificInterview"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="Not_found"
          options={{}}
        />
      </Stack>
    </ResumeProvider>
  );
}