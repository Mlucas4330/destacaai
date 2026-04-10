import Input from '@shared/components/Input'

interface ApiKeyInputProps {
  value: string
  onChange: (value: string) => void
}

const ApiKeyInput = ({ value, onChange }: ApiKeyInputProps) => {
  return (
    <Input
      label='API Key'
      type='password'
      value={value}
      onChange={onChange}
      placeholder='sk-...'
    />
  )
}

export default ApiKeyInput
