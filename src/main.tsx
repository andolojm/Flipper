import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import Home from './pages/Home.tsx'
import ItemDetail from './pages/ItemDetail.tsx'
import TopMargins from './pages/TopMargins.tsx'
import ItemSets from './pages/ItemSets.tsx'
import Alchemy from './pages/Alchemy.tsx'
import Potions from './pages/Potions.tsx'
import Poison from './pages/Poison.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import ErrorScreen from './components/ErrorScreen.tsx'
import SplashScreen from './components/SplashScreen.tsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="error" element={<ErrorScreen />} />
          <Route element={
            <ErrorBoundary>
              <Suspense fallback={<SplashScreen />}>
                <App />
              </Suspense>
            </ErrorBoundary>
          }>
            <Route index element={<Home />} />
            <Route path="item/:id" element={<ItemDetail />} />
            <Route path="top-margins" element={<TopMargins />} />
            <Route path="item-sets" element={<ItemSets />} />
            <Route path="alchemy" element={<Alchemy />} />
            <Route path="potions" element={<Potions />} />
            <Route path="poison" element={<Poison />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
