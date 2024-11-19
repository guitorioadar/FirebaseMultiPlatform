// import { Platform } from 'react-native';

// class AnalyticsService {
//     constructor() {
//         if (Platform.OS === 'web') {
//             this.initializeWeb();
//         } else {
//             this.initializeNative();
//         }
//     }

//     async initializeWeb() {
//         const {
//             getAnalytics,
//             logEvent,
//             setUserProperties,
//             setUserId,
//             setCurrentScreen
//         } = await import('firebase/analytics');
//         const { app } = await import('../config/firebase.web');

//         this.analytics = getAnalytics(app);
//         this.logEvent = logEvent;
//         this.setUserProperties = setUserProperties;
//         this.setUserId = setUserId;
//         this.setCurrentScreen = setCurrentScreen;
//     }

//     async initializeNative() {
//         const analytics = await import('@react-native-firebase/analytics');
//         this.analytics = analytics.default();
//     }

//     // Unified API methods
//     async logEvents(eventName, params = {}) {
//         try {
//             if (Platform.OS === 'web') {
//                 await this.logEvent(this.analytics, eventName, params);
//             } else {
//                 await this.analytics.logEvent(eventName, params);
//             }
//         } catch (error) {
//             console.error('Analytics error:', error);
//         }
//     }
// }

// export const analyticsService = new AnalyticsService();