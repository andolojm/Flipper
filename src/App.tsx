import { useNavigate, Outlet } from 'react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import Header from './components/Header'
import { mappingQuery, latestPricesQuery, fiveMinPricesQuery, oneHourPricesQuery } from './lib/queries'
import type { MappingItem } from './types/osrs'

function App() {
  const navigate = useNavigate()

  const { data: mapping } = useSuspenseQuery<MappingItem[]>(mappingQuery)
  useSuspenseQuery(latestPricesQuery)
  useSuspenseQuery(fiveMinPricesQuery)
  useSuspenseQuery(oneHourPricesQuery)

  return (
    <>
      <Header items={mapping} onSelect={(item) => navigate(`/item/${item.id}`)} />
      <main className="pt-14">
        <Outlet />
      </main>
    </>
  )
}

export default App
