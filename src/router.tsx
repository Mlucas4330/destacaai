import { createMemoryRouter, redirect } from "react-router-dom";
import SignIn from "@/pages/SignIn"
import AddJob from "@/features/jobs/components/AddJob";
import GenerateCV from "@/features/jobs/components/GenerateCV";
import SignUp from "@/pages/SignUp";
import VerifyCode from "@/pages/VerifyCode";
import ForgotPassword from "@/pages/ForgotPassword";
import Config from "@/pages/Config";
import { STORAGE_KEYS } from "@/shared/constants";
import NavBar from "@/shared/components/NavBar";
import Spinner from "@/shared/components/Spinner";
import Jobs from "@/pages/Jobs";
import { chromeStorageClient } from "@/lib/chromeStorageClient";

export const router = createMemoryRouter([
  {
    path: '/',
    loader: async () => {
      const pendingVerif = await chromeStorageClient.get(STORAGE_KEYS.PENDING_VERIFICATION)
      const pendingJob = await chromeStorageClient.get(STORAGE_KEYS.PENDING_DESCRIPTION)

      if (pendingVerif) return redirect('/verify-code')
      if (pendingJob) return redirect('/add-job')
      return redirect('/jobs')
    },
    element: <Spinner />
  },
  {
    element: <NavBar />,
    children: [
      { path: '/add-job', element: <AddJob /> },
      { path: '/generate/:jobId', element: <GenerateCV /> },
      { path: '/config', element: <Config /> },
      { path: '/jobs', element: <Jobs /> },
    ],
  },
  {
    children: [
      { path: '/sign-in', element: <SignIn /> },
      { path: '/sign-up', element: <SignUp /> },
      { path: '/verify-code', element: <VerifyCode /> },
      { path: '/forgot-password', element: <ForgotPassword /> },
    ],
  },
])
