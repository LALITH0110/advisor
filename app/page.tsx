import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Users, Monitor, UserCircle } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-iit-red">IIT Queue System</h1>
          <p className="text-xl text-muted-foreground">Advising Department Queue Management</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/worker" className="block">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-iit-red">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-iit-red/10 rounded-full flex items-center justify-center">
                  <UserCircle className="w-6 h-6 text-iit-red" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">Worker Panel</h2>
                  <p className="text-muted-foreground mt-2">Manage booths and call next students</p>
                </div>
                <Button className="w-full">Access Panel</Button>
              </div>
            </Card>
          </Link>

          <Link href="/student" className="block">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-iit-red">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-iit-red/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-iit-red" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">Student Entry</h2>
                  <p className="text-muted-foreground mt-2">Join the queue and track your position</p>
                </div>
                <Button className="w-full">Join Queue</Button>
              </div>
            </Card>
          </Link>

          <Link href="/display" className="block">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-iit-red">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-iit-red/10 rounded-full flex items-center justify-center">
                  <Monitor className="w-6 h-6 text-iit-red" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">Display Screen</h2>
                  <p className="text-muted-foreground mt-2">Live queue status for lobby</p>
                </div>
                <Button className="w-full">View Display</Button>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
