import { getQueueData } from "@/app/actions"
import { DisplayScreen } from "@/components/display-screen"

export const dynamic = "force-dynamic"

export default async function DisplayPage() {
  const data = await getQueueData()

  return <DisplayScreen initialData={data} />
}
