import type { ConfigContext, ExpoConfig } from '@expo/config';
import { Env } from '@kirz/expo-env';

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    name: Env.APP_NAME,
    description: `${Env.APP_NAME} Mobile App`,
    platforms: ['ios', 'android'],
    slug: Env.APP_BUNDLE_ID.toLowerCase().replaceAll('.', '-'),
    version: Env.APP_VERSION.toString(),
    orientation: 'portrait',
    icon: './assets/images/splash.png',
    userInterfaceStyle: 'light',
    backgroundColor: '#F8F8F8',
    scheme: Env.APP_BUNDLE_ID.toLowerCase().replaceAll('.', '-'),
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ['**/*'],
    newArchEnabled: true,
    ios: {
      supportsTablet: false,
      bundleIdentifier: Env.APP_BUNDLE_ID,
      googleServicesFile: './GoogleService-Info.plist',
      infoPlist: {
        NSMotionUsageDescription:
          'This app requires access to motion sensors to display raw sensor data directly to the user.',
        NSPhotoLibraryUsageDescription:
          'Your photos are used to identify duplicate entries only. None of your personal data will be uploaded to our servers.',
        NSContactsUsageDescription:
          'Your contacts are used to identify duplicate entries only. None of your personal data will be uploaded to our servers.',
        PHPhotoLibraryPreventAutomaticLimitedAccessAlert: true,
        NSCameraUsageDescription:
          'Please, provide access to your camera so application can take photos and use them. We will not upload any of your private data to our servers.',
        NSHealthShareUsageDescription:
          'We need access to your steps to track your activity',
      },
      entitlements: {
        // 'com.apple.security.application-groups': [
        //   'group.at.zm-cleaner-vpn.widget',
        // ],
        'com.apple.developer.authentication-services.autofill-credential-provider':
          true,
      },
    },
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/splash.png',
        backgroundColor: '#F8F8F8',
      },
      package: Env.APP_BUNDLE_ID.replaceAll('-', '_'),
    },
    plugins: [
      'expo-font',
      'expo-router',
      'expo-sqlite',
      'expo-localization',
      'expo-web-browser',
      [
        'react-native-permissions',
        {
          // Add setup_permissions to your Podfile (see iOS setup - steps 1, 2 and 3)
          iosPermissions: ['Camera', 'PhotoLibrary', 'Contacts'],
        },
      ],
      [
        './credential-provider.plugin',
        {
          devTeam: 'L427NWAC76',
          targetNameMainProject: 'docsapp',
        },
      ],
      [
        'expo-local-authentication',
        {
          faceIDPermission:
            'Allow $(PRODUCT_NAME) to use Face ID to protect your secret pictures and contacts.',
        },
      ],
      [
        'expo-build-properties',
        {
          ios: {
            useFrameworks: 'static',
            deploymentTarget: '16.6',
          },
          android: {},
        },
      ],
      [
        'app-icon-badge',
        {
          enabled: Env.NODE_ENV !== 'production',
          badges: [
            {
              text: Env.NODE_ENV,
              type: 'banner',
              color: 'black',
            },
          ],
        },
      ],
      [
        'expo-splash-screen',
        {
          backgroundColor: '#F8F8F8',
          image: './assets/images/splash.png',
          imageWidth: 125,
        },
      ],
      [
        'react-native-appsflyer',
        { shouldUseStrictMode: Env.APPSFLYER_USE_STRICT_MODE },
      ],
      [
        'react-native-fbsdk-next',
        {
          appID: Env.FACEBOOK_APP_ID,
          displayName: Env.FACEBOOK_DISPLAY_NAME,
          clientToken: Env.FACEBOOK_CLIENT_TOKEN,
          scheme: Env.FACEBOOK_SCHEME,
          advertiserIDCollectionEnabled:
            Env.FACEBOOK_ADVERTISER_ID_COLLECTION_ENABLED,
          autoLogAppEventsEnabled: Env.FACEBOOK_AUTO_LOG_APP_EVENTS_ENABLED,
        },
      ],
      '@react-native-firebase/app',
      [
        'expo-tracking-transparency',
        { userTrackingPermission: Env.IDFA_PERMISSION_TEXT },
      ],
      [
        'expo-user-identity',
        { iCloudContainerEnvironment: Env.IDENTITY_ICLOUD_CONTAINER_ENV },
      ],
    ],
  };
};
