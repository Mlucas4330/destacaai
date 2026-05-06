import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@/features/auth/stores/auth'
import Spinner from '@/shared/components/Spinner'
import { queryClient } from '@/lib/queryClient'
import { router } from '@/router'
import { chromeStorageClient } from '@/lib/storageClient'

const persister = createAsyncStoragePersister({
  storage: {
    getItem: (key) => chromeStorageClient.get<string>(key).then((v) => v ?? null),
    setItem: chromeStorageClient.set,
    removeItem: chromeStorageClient.remove,
  },
})

const App = () => {
  const isLoaded = useAuthStore((state) => state.isLoaded)

  if (!isLoaded) return <Spinner />

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      <RouterProvider router={router} />
      <Toaster
        position='bottom-center'
        toastOptions={{
          className: 'bg-navy text-bg text-xs rounded-xl max-w-xs font-ui',
          duration: 2000,
        }} />
    </PersistQueryClientProvider>
  )
}

export default App
