import { useState, useEffect, useCallback } from 'react'
import type { Config, LLMProvider } from '@shared/types'
import { DEFAULT_CONFIG } from '@shared/constants'

const useConfig = () => {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG)

  useEffect(() => {
    chrome.storage.local.get('config', (result: { config?: Config }) => {
      if (result.config) setConfig(result.config)
    })
  }, [])

  const updateConfig = useCallback((partial: Partial<Config>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...partial }
      chrome.storage.local.set({ config: updated })
      return updated
    })
  }, [])

  const setApiKey = useCallback((apiKey: string) => updateConfig({ apiKey }), [updateConfig])
  const setProvider = useCallback((provider: LLMProvider) => updateConfig({ provider }), [updateConfig])

  return { config, setApiKey, setProvider }
}

export default useConfig
