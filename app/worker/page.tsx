import { getQueueData } from "@/app/actions"
import { WorkerPanel } from "@/components/worker-panel"

export const dynamic = "force-dynamic"

export default async function WorkerPage() {
  const data = await getQueueData()

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-iit-red">Counselor Panel</h1>
            <p className="text-muted-foreground mt-1">Manage booths and serve students</p>
          </div>
        </div>
        <WorkerPanel initialData={data} />
      </div>
    </div>
  )
}
