import Constants from 'expo-constants';

// ── Google OAuth client IDs ─────────────────────────────────────────────────
// Pulled from app.json / app.config.js "extra" so real IDs never get
// hardcoded into source files. Add this to your app.json:
//
// {
//   "expo": {
//     ...
//     "extra": {
//       "googleAndroidClientId": "577480848489-clbu....apps.googleusercontent.com",
//       "googleWebClientId":     "577480848489-b7b8....apps.googleusercontent.com",
//       "googleIosClientId":     ""   // optional, leave blank if not using iOS yet
//     }
//   }
// }
//
// Or, if you use app.config.js with environment variables:
//
// extra: {
//   googleAndroidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID,
//   googleWebClientId:     process.env.GOOGLE_WEB_CLIENT_ID,
//   googleIosClientId:     process.env.GOOGLE_IOS_CLIENT_ID,
// }

const extra = Constants.expoConfig?.extra ?? (Constants as any).manifest?.extra ?? {};

export const GOOGLE_ANDROID_CLIENT_ID: string = extra.googleAndroidClientId ?? '';
export const GOOGLE_WEB_CLIENT_ID: string = extra.googleWebClientId ?? '';
export const GOOGLE_IOS_CLIENT_ID: string = extra.googleIosClientId ?? '';

if (__DEV__) {
  if (!GOOGLE_ANDROID_CLIENT_ID || !GOOGLE_WEB_CLIENT_ID) {
    console.warn(
      '⚠️ Google OAuth client IDs are missing. Add googleAndroidClientId and ' +
      'googleWebClientId to the "extra" field in app.json (see googleAuth.config.ts).',
    );
  }
}