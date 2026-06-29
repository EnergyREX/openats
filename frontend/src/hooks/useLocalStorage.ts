'use client'

import { useCallback, useSyncExternalStore } from 'react'

/**
 * Suscripción a una clave de `localStorage` vía `useSyncExternalStore`.
 *
 * En SSR/hidratación devuelve `null` (snapshot de servidor) y React re-renderiza
 * con el valor real tras hidratar, sin mismatch ni setState en efectos. Las
 * escrituras hechas con el setter notifican a todos los componentes suscritos
 * en esta pestaña; el evento nativo `storage` cubre los cambios de otras pestañas.
 */

const localChanges = new EventTarget()
const CHANGE_EVENT = 'local-storage-change'

function subscribe(callback: () => void): () => void {
  window.addEventListener('storage', callback)
  localChanges.addEventListener(CHANGE_EVENT, callback)
  return () => {
    window.removeEventListener('storage', callback)
    localChanges.removeEventListener(CHANGE_EVENT, callback)
  }
}

export function useLocalStorageItem(
  key: string,
): [string | null, (value: string | null) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(key),
    () => null,
  )

  const setValue = useCallback(
    (next: string | null) => {
      if (next === null) localStorage.removeItem(key)
      else localStorage.setItem(key, next)
      localChanges.dispatchEvent(new Event(CHANGE_EVENT))
    },
    [key],
  )

  return [value, setValue]
}
