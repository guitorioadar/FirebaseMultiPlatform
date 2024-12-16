import { Analytics as FirebaseAnalytics } from 'firebase/analytics';
import { FirebaseAnalyticsTypes } from '@react-native-firebase/analytics';
import { Platform } from 'react-native';

type WebAnalytics = FirebaseAnalytics;
type NativeAnalytics = FirebaseAnalyticsTypes.Module;


const initializeWeb = async () => {
    try {
        const { getAnalytics, logEvent, isSupported } = await import('firebase/analytics');
        const { app } = await import('../config/firebase.web');

        const analyticsSupported = await isSupported();
        if (!analyticsSupported) {
            console.log('Analytics not supported in this web environment');
            return null;
        }

        const analytics = getAnalytics(app);
        console.log('Web analytics initialized successfully');
        return { analytics, logEvent };
    } catch (error) {
        console.error('Failed to initialize web analytics:', error);
        return null;
    }
};

const initializeNative = async () => {
    try {
        const analytics = await import('@react-native-firebase/analytics');
        const instance = analytics.default();
        console.log('Native analytics initialized successfully');
        return instance;
    } catch (error) {
        console.error('Failed to initialize native analytics:', error);
        return null;
    }
};

const createAnalyticsService = () => {
    let analytics: WebAnalytics | NativeAnalytics | null = null;
    let webLogEvent: ((analytics: WebAnalytics, eventName: string, params?: any) => void) | null = null;

    const initialize = async () => {
        if (Platform.OS === 'web') {
            const result = await initializeWeb();
            if (result) {
                analytics = result.analytics;
                webLogEvent = result.logEvent;
            }
        } else {
            analytics = await initializeNative();
        }
    };

    const logEvent = async (analyticsInstance: WebAnalytics | NativeAnalytics | null, eventName: string, params = {}) => {
        if (!analytics) return;

        const prefixedEventName = `${Platform.OS}_${eventName}`;
        console.log('prefixedEventName', prefixedEventName);

        try {
            if (Platform.OS === 'web' && webLogEvent) {
                webLogEvent((analyticsInstance || analytics) as WebAnalytics, prefixedEventName, params);
            } else {
                await ((analyticsInstance || analytics) as NativeAnalytics).logEvent(prefixedEventName, params);
            }
        } catch (error) {
            console.error('Analytics error:', error);
        }
    };

    initialize();

    return {
        analytics,
        logEvent
    };
};

export const { analytics, logEvent } = createAnalyticsService();