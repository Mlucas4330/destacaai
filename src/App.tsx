import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import GuestLimitModal from '@/features/auth/components/GuestLimitModal'
import { queryClient } from '@/lib/queryClient'
import { router } from '@/router'

const App = () => (
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
    <GuestLimitModal />
    <Toaster
      position='bottom-center'
      toastOptions={{
        className: 'bg-navy text-bg text-xs rounded-xl max-w-xs font-ui',
        duration: 2000
      }} />
  </QueryClientProvider>
)

export default App
