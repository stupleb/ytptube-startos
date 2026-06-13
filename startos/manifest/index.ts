import { setupManifest } from '@start9labs/start-sdk'
import { long, short, filebrowserDescription } from './i18n'

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
      source: { dockerTag: 'ghcr.io/arabcoders/ytptube:v2.5.6' },
      arch: ['x86_64', 'aarch64'],
    },
  },
  alerts: {
    install: null,
    update: null,
    uninstall: null,
    restore: null,
    start: null,
    stop: null,
  },
  dependencies: {
    filebrowser: {
      description: filebrowserDescription,
      optional: true,
      metadata: {
        title: 'File Browser',
        icon: 'https://raw.githubusercontent.com/Start9Labs/filebrowser-startos/fbf1fefb51cca9731f2a9a9e6f790ca150aa9d04/icon.svg',
      },
    },
  },
})
