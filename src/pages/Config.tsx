import ConfigForm from '@/features/config/components/ConfigForm'
import ClearData from '@/features/config/components/ClearData'

const Config = () => {
  return (
    <div className='flex flex-col gap-6 p-4'>
      <div>
        <h2 className='text-sm font-semibold text-navy'>Settings</h2>
        <p className='text-xs text-navy-muted mt-0.5'>Changes are saved automatically.</p>
      </div>

      <ConfigForm />

      <div className='border-t border-border pt-4'>
        <ClearData />
      </div>
    </div>
  )
}

export default Config
