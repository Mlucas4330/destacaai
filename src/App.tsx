import { AnimatePresence, motion } from 'framer-motion'
import { MemoryRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Briefcase, Settings } from 'lucide-react'
import Jobs from '@pages/Jobs'
import Config from '@pages/Config'
import AddJob from '@features/jobs/components/AddJob'
import GenerateCV from '@features/jobs/components/GenerateCV'
import useJobs from '@features/jobs/hooks/useJobs'
import useGeneratedCVs from '@features/jobs/hooks/useGeneratedCVs'

const NAV_LINK_CLASS = ({ isActive }: { isActive: boolean }) =>
  `flex flex-col items-center gap-0.5 py-2 px-6 text-xs transition-colors ${
    isActive ? 'text-accent-text font-semibold' : 'text-navy-muted hover:text-navy'
  }`

const Layout = () => {
  const { addJob } = useJobs()
  const { saveCV } = useGeneratedCVs()
  const location = useLocation()

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-1 overflow-auto'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className='h-full'
          >
            <Routes location={location}>
              <Route path='/' element={<Jobs />} />
              <Route path='/add-job' element={<AddJob onSave={addJob} />} />
              <Route path='/generate/:jobId' element={<GenerateCV onSaveCV={saveCV} />} />
              <Route path='/config' element={<Config />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>

      <nav className='flex border-t border-border bg-bg'>
        <NavLink to='/' end className={NAV_LINK_CLASS}>
          <Briefcase size={18} />
          Jobs
        </NavLink>
        <NavLink to='/config' className={NAV_LINK_CLASS}>
          <Settings size={18} />
          Settings
        </NavLink>
      </nav>
    </div>
  )
}

const App = () => {
  return (
    <MemoryRouter>
      <Layout />
      <Toaster
        position='bottom-center'
        toastOptions={{
          style: {
            background: '#1e2333',
            color: '#f7f6f3',
            fontSize: '13px',
            borderRadius: '12px',
            maxWidth: '320px',
          },
        }}
      />
    </MemoryRouter>
  )
}

export default App
