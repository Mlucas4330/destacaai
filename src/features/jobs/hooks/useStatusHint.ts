import { useState } from 'react'

const STATUS_HINT_KEY = 'statusHintDismissed'

export function useStatusHint() {
  const [showHint, setShowHint] = useState(() => localStorage.getItem(STATUS_HINT_KEY) !== 'true')

  const dismissHint = () => {
    localStorage.setItem(STATUS_HINT_KEY, 'true')
    setShowHint(false)
  }

  return { showHint, dismissHint }
}
