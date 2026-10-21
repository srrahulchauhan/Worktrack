import { getAnalytics, isSupported } from "firebase/analytics";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBpj_ECupgONMI7sNqwKHQCXmEk24JNzoc",
  authDomain: "studyflow-4843c.firebaseapp.com",
  projectId: "studyflow-4843c",
  storageBucket: "studyflow-4843c.firebasestorage.app",
  messagingSenderId: "564269236188",
  appId: "1:564269236188:web:21b64a18785ac56b2d9919",
  measurementId: "G-70GPSBLQY7",
};

export const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);

export const analyticsReady =
  typeof window === "undefined"
    ? Promise.resolve(null)
    : isSupported()
        .then((supported) => (supported ? getAnalytics(firebaseApp) : null))
        .catch(() => null);
