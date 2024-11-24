import { getAnalytics, Analytics } from 'firebase/analytics';
import type analytics from '@react-native-firebase/analytics';
import { Platform } from 'react-native';

type WebAnalytics = ReturnType<typeof getAnalytics>;
type NativeAnalytics = ReturnType<typeof analytics>;

class AnalyticsService {
    analytics!: WebAnalytics | NativeAnalytics;
    logEvent!:
        | ((analytics: WebAnalytics, eventName: string, params?: any) => void)
        | ((eventName: string, params?: any) => Promise<void>);

    constructor() {
        this.initialize();
    }

    async initialize() {
        if (Platform.OS === 'web') {
            this.initializeWeb();
        } else {
            this.initializeNative();
        }
    }


    async initializeWeb() {
        try {
            const {
                getAnalytics,
                logEvent,
                isSupported
            } = await import('firebase/analytics');
            const { app } = await import('../config/firebase.web');

            const analyticsSupported = await isSupported();

            if (analyticsSupported) {
                this.analytics = getAnalytics(app);
                this.logEvent = logEvent;
                console.log('Web analytics initialized successfully');
            } else {
                console.log('Analytics not supported in this web environment');
            }
        } catch (error) {
            console.error('Failed to initialize web analytics:', error);
        }
    }


    async initializeNative() {
        try {
            const analytics = await import('@react-native-firebase/analytics');
            this.analytics = analytics.default();
            console.log('Native analytics initialized successfully');
        } catch (error) {
            console.error('Failed to initialize native analytics:', error);
        }
    }

    async logEvents(eventName: string, params = {}) {
        if (!this.analytics) return;

        const prefixedEventName = `${Platform.OS}_${eventName}`;
        
        try {
            if (Platform.OS === 'web') {
                (this.logEvent as (analytics: WebAnalytics, eventName: string, params?: any) => void)(
                    this.analytics as WebAnalytics,
                    prefixedEventName,
                    params
                );
            } else {
                await (this.analytics as NativeAnalytics).logEvent(prefixedEventName, params);
            }
        } catch (error) {
            console.error('Analytics error:', error);
        }
    }
}

export const analyticsService = new AnalyticsService();