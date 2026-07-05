import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sg.habitrabbit',
  appName: 'Habit Rabbit',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
};

export default config;
