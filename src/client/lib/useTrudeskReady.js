import { useEffect } from 'react'
// $ доступен глобально через window.$

export default function useTrudeskReady (callback) {
  useEffect(() => {
    $(window).on('trudesk:ready', () => {
      if (typeof callback === 'function') return callback()
    })
  }, [])
}
