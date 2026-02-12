// components/SimpleOfflineBanner.tsx
// This version doesn't require @react-native-community/netinfo

import { Ionicons } from '@expo/vector-icons';
import React, { ReactNode, createContext, useContext, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

// Create a context to manage offline state
interface OfflineContextType {
    showOfflineBanner: () => void;
    hideOfflineBanner: () => void;
}

const OfflineContext = createContext<OfflineContextType>({
    showOfflineBanner: () => { },
    hideOfflineBanner: () => { },
});

export const useOffline = () => useContext(OfflineContext);

// Provider component
export const OfflineProvider = ({ children }: { children: ReactNode }) => {
    const [isVisible, setIsVisible] = useState(false);
    const slideAnim = new Animated.Value(-100);

    const showOfflineBanner = () => {
        setIsVisible(true);
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
        }).start();

        // Auto-hide after 5 seconds
        setTimeout(() => {
            hideOfflineBanner();
        }, 5000);
    };

    const hideOfflineBanner = () => {
        Animated.timing(slideAnim, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setIsVisible(false);
        });
    };

    return (
        <OfflineContext.Provider value={{ showOfflineBanner, hideOfflineBanner }}>
            {children}
            {isVisible && (
                <Animated.View
                    style={[
                        styles.container,
                        { transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    <Ionicons name="cloud-offline" size={16} color="#FFD700" />
                    <Text style={styles.text}>Working Offline - Changes will sync later</Text>
                </Animated.View>
            )}
        </OfflineContext.Provider>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#2A1A0A',
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        zIndex: 1000,
        borderBottomWidth: 2,
        borderBottomColor: '#FFD700',
    },
    text: {
        color: '#FFD700',
        fontSize: 13,
        fontWeight: '700',
        flex: 1,
    },
});

// ==============================================
// USAGE EXAMPLE:
// ==============================================

// 1. Wrap your app with OfflineProvider in _layout.tsx:
/*
import { OfflineProvider } from './components/SimpleOfflineBanner';

export default function RootLayout() {
  return (
    <ResumeProvider>
      <OfflineProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          // ... rest of your screens
        </Stack>
      </OfflineProvider>
    </ResumeProvider>
  );
}
*/

// 2. Use in components when detecting offline errors:
/*
import { useOffline } from './components/SimpleOfflineBanner';

const MyComponent = () => {
  const { showOfflineBanner } = useOffline();

  const saveData = async () => {
    try {
      await setDoc(docRef, data);
    } catch (error: any) {
      if (error.code === 'unavailable') {
        showOfflineBanner(); // ✅ Show banner
      }
    }
  };
};
*/

// ==============================================
// OR EVEN SIMPLER: Just don't use any banner!
// Your app already works offline without it.
// ==============================================