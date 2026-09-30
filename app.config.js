module.exports = {
  expo: {
    name: 'Huni',
    slug: 'huni',
    scheme: 'huni',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    runtimeVersion: {
      policy: 'appVersion',
    },
    plugins: [
      'expo-router',
      'expo-location',
      'expo-secure-store',
      'expo-localization',
      [
        'expo-notifications',
        {
          icon: './assets/icon.png',
          color: '#FF7C63',
        },
      ],
      [
        'expo-splash-screen',
        {
          image: './assets/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#F5F3F0',
          dark: {
            backgroundColor: '#0E0E0F',
          },
        },
      ],
      '@maplibre/maplibre-react-native',
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'id.huni.app',
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'Huni menggunakan lokasimu untuk menampilkan properti terdekat dan memperkirakan waktu tempuh. Lokasi hanya diminta saat aplikasi digunakan.',
      },
    },
    android: {
      package: 'id.huni.app',
      adaptiveIcon: {
        backgroundColor: '#F5F3F0',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
      permissions: [
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.ACCESS_FINE_LOCATION',
      ],
      // On EAS, set this from the GOOGLE_SERVICES_JSON secret file env var
      // (see `eas env:create` below) so the real file never has to be
      // committed or manually uploaded to the builder.
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
      output: 'static',
    },
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: '67f1f517-f6a5-44f8-98e2-207b813eb9a2',
      },
    },
  },
};
