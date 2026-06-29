import Sidebar from '@/components/layouts/Sidebar'
import HorizontalBar from '@/components/composed/HorizontalBar'

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface-base">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <HorizontalBar />
        {children}
      </main>
    </div>
  )
}
