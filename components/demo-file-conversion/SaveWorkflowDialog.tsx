"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface SaveWorkflowDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string) => void
}

export function SaveWorkflowDialog({ isOpen, onClose, onSave }: SaveWorkflowDialogProps) {
  const [workflowName, setWorkflowName] = useState("")
  const [error, setError] = useState("")

  const handleSave = () => {
    if (!workflowName.trim()) {
      setError("Please enter a workflow name")
      return
    }

    onSave(workflowName)
    setWorkflowName("")
    setError("")
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Save Workflow" className="w-[400px]">
      <div className="p-4">
        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-md text-blue-800 text-sm mb-4">
            Your workflow will be saved both to your browser's local storage and as a downloadable file. You can reload
            saved workflows from the sidebar or by uploading the file.
          </div>

          <div className="space-y-2">
            <Label htmlFor="workflowName">Workflow Name</Label>
            <Input
              id="workflowName"
              value={workflowName}
              onChange={(e) => {
                setWorkflowName(e.target.value)
                setError("")
              }}
              placeholder="Enter workflow name"
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <p className="text-xs text-gray-500">
              The workflow will be saved as "{workflowName.replace(/\s+/g, "-").toLowerCase() || "workflow"}.json"
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="workflowDescription">Description (optional)</Label>
            <Textarea
              id="workflowDescription"
              placeholder="Enter a description for this workflow"
              className="min-h-[80px]"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Workflow</Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

