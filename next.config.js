/** @type {import('next').NextConfig} */
module.exports = {
  output: 'standalone',
  experimental: {
    serverActions: true,
    instrumentationHook: true
  },
  i18n: {
    locales: ['en', 'sv'],
    defaultLocale: 'en',
    localeDetection: false
  }
};
