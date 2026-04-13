import CVUpload from './CVUpload'
import useConfig from '../hooks/useConfig'
import useCV from '../hooks/useCV'
import Button from '@shared/components/Button'
import { PROVIDERS } from '@shared/constants'
import Input from '@/shared/components/Input'

const providerVariants = {
  active: 'border-accent-text bg-accent text-accent-text',
  inactive: 'border-border text-navy-muted hover:border-navy-muted bg-transparent',
}

const ConfigForm = () => {
  const { config, setApiKey, setProvider } = useConfig()
  const { fileName, error, uploadCV, removeCV } = useCV()

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-1'>
        <label className='text-xs font-medium text-navy-muted'>LLM Provider</label>
        <div className='flex gap-2'>
          {PROVIDERS.map(({ value, label }) => (
            <Button
              key={value}
              type='button'
              onClick={() => setProvider(value)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${config.provider === value ? providerVariants.active : providerVariants.inactive}`}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <Input
        label='API Key'
        type='password'
        value={config.apiKey}
        onChange={setApiKey}
        placeholder='sk-...'
      />

      <CVUpload
        fileName={fileName}
        error={error}
        onUpload={uploadCV}
        onRemove={removeCV}
      />
    </div>
  )
}

export default ConfigForm
