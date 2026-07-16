import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Skeleton } from './components/ui/Skeleton'

// Lazy load all pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })))
const UploadData = lazy(() => import('./pages/UploadData').then(m => ({ default: m.UploadData })))
const StadiumConfig = lazy(() => import('./pages/StadiumConfig').then(m => ({ default: m.StadiumConfig })))
const FieldOperations = lazy(() => import('./pages/FieldOperations').then(m => ({ default: m.FieldOperations })))
const MatchDayCompanion = lazy(() => import('./pages/MatchDayCompanion').then(m => ({ default: m.MatchDayCompanion })))
const OpsCopilot = lazy(() => import('./pages/OpsCopilot').then(m => ({ default: m.OpsCopilot })))
const CommandCenter = lazy(() => import('./pages/CommandCenter').then(m => ({ default: m.CommandCenter })))
const AIRecommendations = lazy(() => import('./pages/AIRecommendations').then(m => ({ default: m.AIRecommendations })))
const TournamentIntelligence = lazy(() => import('./pages/TournamentIntelligence').then(m => ({ default: m.TournamentIntelligence })))
const Reports = lazy(() => import('./pages/Reports').then(m => ({ default: m.Reports })))
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })))

// Premium skeleton loader for Suspense
function PageLoader() {
  return (
    <div className="flex-1 p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="w-48 h-6" />
          <Skeleton className="w-32 h-4" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  )
}

import { useAIOptionsStore } from './store/useAIOptionsStore'
const Welcome = lazy(() => import('./pages/Welcome').then(m => ({ default: m.Welcome })))

function App() {
  const { aiMode } = useAIOptionsStore()

  if (aiMode === null) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Welcome />
      </Suspense>
    )
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="stadium-config" element={<StadiumConfig />} />
            <Route path="upload" element={<UploadData />} />
            <Route path="operations" element={<FieldOperations />} />
            <Route path="companion" element={<MatchDayCompanion />} />
            <Route path="copilot" element={<OpsCopilot />} />
            <Route path="command-center" element={<CommandCenter />} />
            <Route path="recommendations" element={<AIRecommendations />} />
            <Route path="intelligence" element={<TournamentIntelligence />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
