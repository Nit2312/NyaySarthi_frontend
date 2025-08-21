"use client"

import { useState, useEffect } from "react"
import { ApiService } from "@/lib/api-service"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff } from "lucide-react"

export function ApiStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        await ApiService.checkHealth()
        setIsConnected(true)
      } catch (error) {
        console.error('API connection failed:', error)
        setIsConnected(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkConnection()
  }, [])

  if (isLoading) {
    return (
      <Badge variant="outline" className="glass border-white/20">
        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse mr-2" />
        Checking API...
      </Badge>
    )
  }

  return (
    <Badge 
      variant="outline" 
      className={`glass border-white/20 ${isConnected ? 'text-green-400' : 'text-red-400'}`}
    >
      {isConnected ? (
        <>
          <Wifi className="w-3 h-3 mr-1" />
          API Connected
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3 mr-1" />
          API Disconnected
        </>
      )}
    </Badge>
  )
}
