import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'ytptube',
  title: 'YTPTube',
  license: 'MIT',
  packageRepo: 'https://github.com/stupleb/ytptube-startos',
  upstreamRepo: 'https://github.com/arabcoders/ytptube',
  marketingUrl: 'https://github.com/arabcoders/ytptube',
  donationUrl: null,
  description: { short, long },
  volumes: ['startos', 'main', 'downloads'],
  images: {
    ytptube: {
      source: { dockerTag: 'ghcr.io/arabcoders/ytptube:v2.7.4' },
      arch: ['x86_64', 'aarch64'],
    },
  },
})
