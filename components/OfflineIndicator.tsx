// components/OfflineIndicator.tsx
// Add this to your app to show offline status

import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

export const OfflineIndicator = () => {
    const [isOffline, setIsOffline] = useState(false);
    const slideAnim = new Animated.Value(-100);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            const offline = !state.isConnected;
            setIsOffline(offline);

            if (offline) {
                // Slide down when offline
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 8,
                }).start();
            } else {
                // Slide up when back online
                Animated.timing(slideAnim, {
                    toValue: -100,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            }
        });

        return () => unsubscribe();
    }, []);

    if (!isOffline) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                { transform: [{ translateY: slideAnim }] }
            ]}
        >
            <Ionicons name="cloud-offline" size={16} color="#FFD700" />
            <Text style={styles.text}>Offline - Changes will sync when connected</Text>
        </Animated.View>
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

// To use this component, add it to your root layout:
// 
// import { OfflineIndicator } from './components/OfflineIndicator';
// 
// <View style={{ flex: 1 }}>
//   <OfflineIndicator />
//   {/* Rest of your app */}
// </View>

// Note: You need to install @react-native-community/netinfo:
// npm install @react-native-community/netinfo