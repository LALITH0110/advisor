"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getQueueData } from "@/app/actions"
import { UserCircle, Users, Settings, X, Upload } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type Student = {
  id: string
  name: string
  position: number
}

type Booth = {
  id: string
  name: string
  currentStudent: Student | null
  status: "free" | "busy" | "closed"
}

type QueueData = {
  queue: Student[]
  booths: Booth[]
}

export function DisplayScreen({ initialData }: { initialData: QueueData }) {
  const [data, setData] = useState<QueueData>(initialData)
  const [showSettings, setShowSettings] = useState(false)
  const [backgroundImage, setBackgroundImage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('displayBackground') || ''
    }
    return ''
  })
  const [backgroundOverlay, setBackgroundOverlay] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('displayOverlay') || 'dark'
    }
    return 'dark'
  })

  useEffect(() => {
    const interval = setInterval(async () => {
      const newData = await getQueueData()
      setData(newData)
    }, 5000) // Increased from 2000ms to 5000ms to reduce Redis commands

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('displayBackground', backgroundImage)
    }
  }, [backgroundImage])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('displayOverlay', backgroundOverlay)
    }
  }, [backgroundOverlay])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setBackgroundImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const getOverlayGradient = () => {
    switch (backgroundOverlay) {
      case 'dark':
        return 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8))'
      case 'light':
        return 'linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.9))'
      case 'red':
        return 'linear-gradient(rgba(204, 0, 0, 0.5), rgba(204, 0, 0, 0.7))'
      case 'blue':
        return 'linear-gradient(rgba(0, 0, 139, 0.6), rgba(0, 100, 200, 0.7))'
      case 'none':
        return 'linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2))'
      default:
        return 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8))'
    }
  }

  const backgroundStyle = backgroundImage
    ? {
        backgroundImage: `${getOverlayGradient()}, url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    : {}

  return (
    <div className="min-h-screen bg-background p-8 relative" style={backgroundStyle}>
      {/* Settings Button */}
      <button
        onClick={() => setShowSettings(true)}
        className="fixed top-6 right-6 p-3 bg-white/90 hover:bg-white shadow-lg rounded-full border-2 border-iit-red/20 transition-all duration-200 z-50 hover:scale-110"
      >
        <Settings size={24} className="text-iit-red" />
      </button>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-iit-red">Display Settings</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Background Image Section */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Background Image
              </label>

              {/* Current Background Preview */}
              {backgroundImage && (
                <div className="mb-4 relative rounded-xl overflow-hidden border-2 border-iit-red/30">
                  <div
                    className="h-40 bg-cover bg-center"
                    style={{
                      backgroundImage: `${getOverlayGradient()}, url(${backgroundImage})`
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <span className="text-white text-sm font-medium px-3 py-1 bg-black/50 rounded">
                        Current Background
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setBackgroundImage('')
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('displayBackground', '')
                      }
                    }}
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                  >
                    <X size={14} className="mr-1" />
                    Remove
                  </Button>
                </div>
              )}

              {/* Upload Button */}
              <label className="flex items-center justify-center px-6 py-4 border-2 border-dashed border-iit-red/30 rounded-xl cursor-pointer hover:border-iit-red/50 hover:bg-iit-red/5 transition-all">
                <Upload size={20} className="mr-2 text-iit-red" />
                <span className="text-sm font-medium">Upload Custom Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {/* Overlay Filter Selection */}
              {backgroundImage && (
                <div className="mt-6">
                  <label className="block text-sm font-medium mb-3">
                    Image Overlay Filter
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {[
                      { id: 'dark', name: 'Dark', gradient: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)' },
                      { id: 'light', name: 'Light', gradient: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)' },
                      { id: 'red', name: 'IIT Red', gradient: 'linear-gradient(135deg, #cc0000 0%, #dc143c 100%)' },
                      { id: 'blue', name: 'Blue', gradient: 'linear-gradient(135deg, #00008b 0%, #0064c8 100%)' },
                      { id: 'none', name: 'Clear', gradient: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.2) 100%)' }
                    ].map((overlay) => (
                      <button
                        key={overlay.id}
                        onClick={() => setBackgroundOverlay(overlay.id)}
                        className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          backgroundOverlay === overlay.id
                            ? 'border-iit-red scale-105 shadow-lg'
                            : 'border-gray-300 hover:border-iit-red/50'
                        }`}
                      >
                        <div
                          className="absolute inset-0"
                          style={{ background: overlay.gradient }}
                        />
                        <div className="absolute inset-0 flex items-end justify-center pb-2">
                          <span className="text-white text-[10px] font-bold drop-shadow-lg bg-black/40 px-2 py-0.5 rounded">
                            {overlay.name}
                          </span>
                        </div>
                        {backgroundOverlay === overlay.id && (
                          <div className="absolute top-2 right-2 w-4 h-4 bg-iit-red rounded-full border-2 border-white shadow" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Help/Contact Section */}
            <div className="pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Need help?</p>
                <p className="mb-2">If any problems, contact:</p>
                <p>
                  <span className="font-bold text-foreground">Lalith Kothuru</span>{" "}
                  <a
                    href="mailto:lkothuru@hawk.illinoistech.edu"
                    className="text-iit-red hover:underline"
                  >
                    lkothuru@hawk.illinoistech.edu
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={() => setShowSettings(false)}
              className="bg-iit-red hover:bg-iit-red-dark text-white"
            >
              Save Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold text-iit-red">Welcome to Illinois Tech!</h1>
          <p className="text-2xl text-muted-foreground">Please take a seat and wait for your turn.</p>
        </div>

        {/* Booths Status */}
        <div className="grid md:grid-cols-3 gap-6">
          {data.booths.map((booth) => (
            <Card
              key={booth.id}
              className={`p-6 transition-all ${
                booth.status === "busy"
                  ? "border-2 border-iit-red bg-iit-red/5"
                  : booth.status === "closed"
                  ? "border-2 border-gray-400 bg-gray-100"
                  : "border-2 border-green-500 bg-green-50"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">{booth.name}</h2>
                  <Badge
                    variant={booth.status === "free" ? "secondary" : "default"}
                    className={`text-lg px-4 py-2 ${
                      booth.status === "free"
                        ? "bg-green-600 text-white"
                        : booth.status === "closed"
                        ? "bg-gray-500 text-white"
                        : "bg-iit-red text-white"
                    }`}
                  >
                    {booth.status === "free" ? "Available" : booth.status === "closed" ? "Closed" : "Busy"}
                  </Badge>
                </div>

                {booth.currentStudent ? (
                  <div className="bg-white p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <UserCircle className="w-10 h-10 text-iit-red" />
                      <div>
                        <p className="text-sm text-muted-foreground">Now Serving</p>
                        <p className="text-2xl font-bold">{booth.currentStudent.name}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-lg text-center">
                    <p className="text-xl text-muted-foreground">
                      {booth.status === "closed" ? "Booth Closed" : "Waiting..."}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Queue List */}
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-8 h-8 text-iit-red" />
            <h3 className="text-3xl font-semibold">Queue ({data.queue.length} waiting)</h3>
          </div>

          {data.queue.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-2xl text-muted-foreground">No students in queue</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {data.queue.map((student) => (
                <div key={student.id} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <div className="w-12 h-12 bg-iit-red text-white rounded-full flex items-center justify-center font-bold text-xl">
                    {student.position}
                  </div>
                  <span className="text-xl font-medium">{student.name}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
