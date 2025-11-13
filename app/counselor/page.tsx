import { getQueueData } from "@/app/actions"
import { WorkerPanel } from "@/components/worker-panel"
import { HelpCircle } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function WorkerPage() {
  const data = await getQueueData()

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 relative">
      {/* Help Icon */}
      <div className="fixed top-6 right-6 z-50 group">
        <div className="relative">
          <HelpCircle className="w-6 h-6 text-iit-red cursor-help" />
          <div className="absolute right-0 top-8 w-72 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            <p className="mb-2">If any problems, contact:</p>
            <p className="font-bold mb-1">Lalith Kothuru</p>
            <a href="mailto:lkothuru@hawk.illinoistech.edu" className="text-iit-red-light hover:underline break-all">
              lkothuru@hawk.illinoistech.edu
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <WorkerPanel initialData={data} />
      </div>
    </div>
  )
}
