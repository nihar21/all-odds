import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyBXC1_YjBXCtYHdiY_nQjTnyJs-sFhuQQY',
  authDomain: 'all-odds-f088a.firebaseapp.com',
  projectId: 'all-odds-f088a',
  storageBucket: 'all-odds-f088a.appspot.com',
  messagingSenderId: '1043649113634',
  appId: '1:1043649113634:web:067f3a847c6c1cbe7ce47b',
  measurementId: 'G-5TZZNE530M',
};

export const firebaseApp = initializeApp(firebaseConfig);

// Analytics only runs in supported browser contexts (skips SSR / unsupported envs).
isSupported()
  .then((supported) => {
    if (supported) getAnalytics(firebaseApp);
  })
  .catch(() => {
    /* analytics is best-effort */
  });
