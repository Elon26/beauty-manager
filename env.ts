import z from 'zod';

export default {
  APP_ID: z.string(),
  APP_NAME: z.string(),
  APP_URL: z.string(),
  APP_BUNDLE_ID: z.string(),
  APP_VERSION: z.string(),
  APPSFLYER_DEV_KEY: z.string(),
  APPSFLYER_ONELINK_DOMAIN: z.string().optional(),

  APPSFLYER_USE_STRICT_MODE: z
    .string()
    .transform((x) => x === 'true')
    .optional()
    .default('false'),

  APPSFLYER_DEBUG_MODE: z
    .string()
    .transform((x) => x === 'true')
    .optional()
    .default('false'),

  APPSFLYER_APP_ID: z.string(),
  CONTACT_US: z.string(),
  PRIVACY_POLICY: z.string(),
  LICENCE_AGREEMENT: z.string(),
  TERMS_OF_USE: z.string(),
  PNLIGHT_ACCESS_TOKEN: z.string(),
  SENTRY_DSN: z.string(),
  SENTRY_DEBUG_MODE: z
    .string()
    .transform((x) => x === 'true')
    .optional()
    .default('false'),
  APPHUD_API_KEY: z.string(),
  FACEBOOK_APP_ID: z.string().default('[APP_ID]'),
  FACEBOOK_CLIENT_TOKEN: z.string(),
  FACEBOOK_DISPLAY_NAME: z.string().optional().default('[APP_NAME]'),
  FACEBOOK_SCHEME: z.string().optional().default('fb[FACEBOOK_APP_ID]'),
  FACEBOOK_ADVERTISER_ID_COLLECTION_ENABLED: z
    .string()
    .transform((x) => x === 'true')
    .optional()
    .default('true'),
  FACEBOOK_AUTO_LOG_APP_EVENTS_ENABLED: z
    .string()
    .transform((x) => x === 'true')
    .optional()
    .default('true'),
  SMARTLOOK_APP_ID: z.string(),
  IDFA_PERMISSION_TEXT: z
    .string()
    .optional()
    .default(
      'This identifier will be used to deliver personalized ads to you.'
    ),
  IDENTITY_ENABLE_ICLOUD: z
    .string()
    .transform((x) => x === 'true')
    .optional()
    .default('true'),
  IDENTITY_ICLOUD_CONTAINER_ENV: z.string().optional().default('Production'),
};
