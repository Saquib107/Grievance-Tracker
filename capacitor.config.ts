import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pgepl.grievance',
  appName: 'Grievance Tracker',
  webDir: 'public',
  server: {
    url: 'https://grievance-tracker-eight.vercel.app/',
    cleartext: true
  }
};

export default config;
