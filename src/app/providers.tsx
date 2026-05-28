'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      if (process.env.NODE_ENV === 'production') {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js').then(
            (registration) => {
              console.log('Service Worker registered with scope:', registration.scope)
            },
            (err) => {
              console.error('Service Worker registration failed:', err)
            }
          )
        })
      } else {
        // In development, unregister active service workers and clear cache to prevent stale chunks
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister().then((success) => {
              if (success) {
                console.log('Dev mode: Unregistered active service worker')
              }
            })
          }
        })
        if (typeof window !== 'undefined' && window.caches) {
          caches.keys().then((keys) => {
            keys.forEach((key) => caches.delete(key))
          })
        }
      }
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
