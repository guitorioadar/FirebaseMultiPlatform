import { Platform } from 'react-native';

class AnalyticsService {
    constructor() {
        this.isInitialized = false;
        this.initializeAttempts = 0;
        this.maxAttempts = 5;
        this.initialize();
    }

    async initialize() {
        if (Platform.OS === 'web') {
            // this.attemptWebInitialization();
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

    async logEvents(eventName, params = {}) {
        try {
            if (!this.analytics) {
                console.log('Analytics not initialized');
                return;
            }

            if (Platform.OS === 'web') {
                await this.logEvent(this.analytics, Platform.OS + '_' + eventName, params);
            } else {
                await this.analytics.logEvent(Platform.OS + '_' + eventName, params);
            }
        } catch (error) {
            console.error('Analytics error:', error);
        }
    }
}

export const analyticsService = new AnalyticsService();