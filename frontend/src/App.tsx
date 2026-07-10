import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'

// Lazy load all pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })))
const UploadData = lazy(() => import('./pages/UploadData').then(m => ({ default: m.UploadData })))
const StadiumConfig = lazy(() => import('./pages/StadiumConfig').then(m => ({ default: m.StadiumConfig })))
const FieldOperations = lazy(() => import('./pages/FieldOperations').then(m => ({ default: m.FieldOperations })))
const MatchDayCompanion = lazy(() => import('./pages/MatchDayCompanion').then(m => ({ default: m.MatchDayCompanion })))
const OpsCopilot = lazy(() => import('./pages/OpsCopilot').then(m => ({ default: m.OpsCopilot })))
const CommandCenter = lazy(() => import('./pages/CommandCenter').then(m => ({ default: m.CommandCenter })))
const AIRecommendations = lazy(() => import('./pages/AIRecommendations').then(m => ({ default: m.AIRecommendations })))
const Reports = lazy(() => import('./pages/Reports').then(m => ({ default: m.Reports })))
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })))

// Premium skeleton loader for Suspense
function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4 text-muted-foreground animate-pulse">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Loading Module...</p>
      </div>
    </div>
  )
}

function App() {
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
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
