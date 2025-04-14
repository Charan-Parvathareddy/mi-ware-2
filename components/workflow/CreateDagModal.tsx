"use client"

import type React from "react"

import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Clock } from "lucide-react"
import { setDagId } from "@/data/data-service"

interface CreateDagModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateDag: (name: string, schedule: string) => Promise<any>
}

export function CreateDagModal({ isOpen, onClose, onCreateDag }: CreateDagModalProps) {
  const [name, setName] = useState("")
  const [schedule, setSchedule] = useState("* * * * *")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError("Workflow name is required")
      return
    }

    setIsLoading(true)

    try {
      const result = await onCreateDag(name, schedule)

      // Store the dag_id for future use
      if (result && result.dag_id) {
        setDagId(result.dag_id)
      }

      // Reset form
      setName("")
      setSchedule("* * * * *")
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create workflow")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Workflow" className="w-[500px]">
      <div className="p-4">
        <div className="bg-blue-50 p-3 rounded-md text-blue-800 text-sm mb-4">
          This will create a new workflow (DAG) with the specified name and schedule. The workflow will be active
          immediately after creation.
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700">
              Workflow Name
            </Label>
            <div className="relative">
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter workflow name"
                className="pl-10"
              />
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule" className="text-gray-700">
              Schedule (Cron Format)
            </Label>
            <div className="relative">
              <Input
                id="schedule"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="* * * * *"
                className="pl-10"
              />
              <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500">
              Format: minute hour day month weekday (e.g., "* * * * *" for every minute)
            </p>
          </div>

          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-500 border border-red-200">{error}</div>}

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Workflow"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
