// utils/responsive.ts
import { Dimensions, Platform, ScaledSize } from 'react-native';

// Get current dimensions
let { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 13 as reference)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

// Update dimensions when screen changes (handles rotation, split-screen)
Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
    SCREEN_WIDTH = window.width;
    SCREEN_HEIGHT = window.height;
});

// Device type definitions
export type DeviceType =
    | 'desktop'
    | 'tablet'
    | 'mobile-web'
    | 'small-phone'
    | 'medium-phone'
    | 'large-phone'
    | 'xl-phone';

/**
 * Determine device type based on screen dimensions
 */
export const getDeviceType = (): DeviceType => {
    if (Platform.OS === 'web') {
        // Web browser
        if (SCREEN_WIDTH >= 1024) return 'desktop';
        if (SCREEN_WIDTH >= 768) return 'tablet';
        return 'mobile-web';
    }

    // Mobile devices
    if (SCREEN_HEIGHT <= 667) return 'small-phone'; // iPhone SE, 8
    if (SCREEN_HEIGHT <= 812) return 'medium-phone'; // iPhone 12 mini, 13 mini
    if (SCREEN_HEIGHT <= 926) return 'large-phone'; // iPhone 13, 14, 15
    return 'xl-phone'; // iPhone 14 Pro Max, etc.
};

/**
 * Scale font size based on screen width
 */
export const scaleFont = (size: number): number => {
    const scale = SCREEN_WIDTH / BASE_WIDTH;
    const newSize = size * scale;
    return Math.round(newSize);
};

/**
 * Scale width based on screen dimensions
 */
export const scaleWidth = (size: number): number => {
    const scale = SCREEN_WIDTH / BASE_WIDTH;
    return Math.round(size * scale);
};

/**
 * Scale height based on screen dimensions
 */
export const scaleHeight = (size: number): number => {
    const scale = SCREEN_HEIGHT / BASE_HEIGHT;
    return Math.round(size * scale);
};

/**
 * Moderate scale - more subtle scaling with configurable factor
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
    const scale = SCREEN_WIDTH / BASE_WIDTH;
    return Math.round(size + (scale - 1) * size * factor);
};

/**
 * Get bottom spacing for tab bar based on device
 */
export const getTabBarHeight = (): number => {
    const deviceType = getDeviceType();

    switch (deviceType) {
        case 'desktop':
            return 0; // No tab bar on desktop
        case 'tablet':
            return Platform.OS === 'ios' ? 85 : 80;
        case 'small-phone':
            return Platform.OS === 'ios' ? 65 : 60;
        case 'medium-phone':
            return Platform.OS === 'ios' ? 75 : 70;
        case 'large-phone':
            return Platform.OS === 'ios' ? 95 : 90;
        case 'xl-phone':
            return Platform.OS === 'ios' ? 100 : 95;
        case 'mobile-web':
            return 80;
        default:
            return Platform.OS === 'ios' ? 95 : 90;
    }
};

/**
 * Get input container bottom padding (for chat, etc.)
 */
export const getInputBottomPadding = (): number => {
    const deviceType = getDeviceType();

    switch (deviceType) {
        case 'desktop':
            return 20; // No tab bar, just normal spacing
        case 'tablet':
            return Platform.OS === 'ios' ? 90 : 85;
        case 'small-phone':
            return Platform.OS === 'ios' ? 70 : 65;
        case 'medium-phone':
            return Platform.OS === 'ios' ? 80 : 75;
        case 'large-phone':
            return Platform.OS === 'ios' ? 100 : 95;
        case 'xl-phone':
            return Platform.OS === 'ios' ? 105 : 100;
        case 'mobile-web':
            return 85;
        default:
            return Platform.OS === 'ios' ? 100 : 95;
    }
};

/**
 * Get scroll view bottom padding
 */
export const getScrollBottomPadding = (): number => {
    const deviceType = getDeviceType();

    switch (deviceType) {
        case 'desktop':
            return 40;
        case 'tablet':
            return 100;
        case 'small-phone':
            return 80;
        case 'medium-phone':
            return 100;
        case 'large-phone':
            return 120;
        case 'xl-phone':
            return 130;
        case 'mobile-web':
            return 100;
        default:
            return 120;
    }
};

/**
 * Get safe area insets (for notch devices)
 */
export const getSafeAreaInsets = (): { top: number; bottom: number } => {
    // Devices with notch (iPhone X and later)
    const hasNotch = SCREEN_HEIGHT >= 812 && Platform.OS === 'ios';

    return {
        top: hasNotch ? 44 : 20,
        bottom: hasNotch ? 34 : 0,
    };
};

/**
 * Check if keyboard avoiding is needed
 */
export const needsKeyboardAvoiding = (): boolean => {
    return Platform.OS === 'ios' || getDeviceType() !== 'desktop';
};

/**
 * Get keyboard vertical offset
 */
export const getKeyboardVerticalOffset = (): number => {
    const deviceType = getDeviceType();

    if (Platform.OS !== 'ios') return 0;

    switch (deviceType) {
        case 'small-phone':
            return -10;
        case 'medium-phone':
        case 'large-phone':
        case 'xl-phone':
        default:
            return 0;
    }
};

/**
 * Modal max height based on device
 */
export const getModalMaxHeight = (): string => {
    const deviceType = getDeviceType();

    switch (deviceType) {
        case 'desktop':
            return '70%';
        case 'tablet':
            return '80%';
        case 'small-phone':
            return '90%';
        default:
            return '85%';
    }
};

/**
 * Responsive padding with moderate scaling
 */
export const getResponsivePadding = (base: number): number => {
    return moderateScale(base, 0.3);
};

/**
 * Get comprehensive device info for debugging
 */
export const getDeviceInfo = () => {
    return {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        deviceType: getDeviceType(),
        platform: Platform.OS,
        platformVersion: Platform.Version,
        tabBarHeight: getTabBarHeight(),
        inputBottomPadding: getInputBottomPadding(),
        scrollBottomPadding: getScrollBottomPadding(),
        safeAreaInsets: getSafeAreaInsets(),
    };
};

/**
 * Check if screen is small
 */
export const isSmallScreen = (): boolean => {
    return SCREEN_HEIGHT < 700 || SCREEN_WIDTH < 375;
};

/**
 * Check if screen is large
 */
export const isLargeScreen = (): boolean => {
    return SCREEN_HEIGHT > 900 || SCREEN_WIDTH > 414;
};

/**
 * Get current screen dimensions
 */
export const getScreenDimensions = (): { width: number; height: number } => {
    return {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    };
};

/**
 * Check if device is in landscape mode
 */
export const isLandscape = (): boolean => {
    return SCREEN_WIDTH > SCREEN_HEIGHT;
};

/**
 * Check if device is in portrait mode
 */
export const isPortrait = (): boolean => {
    return SCREEN_HEIGHT > SCREEN_WIDTH;
};

// Default export with all functions
export default {
    scaleFont,
    scaleWidth,
    scaleHeight,
    moderateScale,
    getTabBarHeight,
    getInputBottomPadding,
    getScrollBottomPadding,
    getSafeAreaInsets,
    needsKeyboardAvoiding,
    getKeyboardVerticalOffset,
    getModalMaxHeight,
    getResponsivePadding,
    getDeviceType,
    getDeviceInfo,
    isSmallScreen,
    isLargeScreen,
    getScreenDimensions,
    isLandscape,
    isPortrait,
};