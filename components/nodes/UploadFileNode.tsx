"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Handle, Position, useReactFlow } from "reactflow"
import { Check, X, AlertTriangle, FileUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface UploadFileNodeProps {
  id: string
  data: {
    label: string
    type: string
    executed?: boolean
    outputData?: any
    error?: string
  }
  selected: boolean
}

export function UploadFileNode({ id, data, selected }: UploadFileNodeProps) {
  const { deleteElements } = useReactFlow()
  const [isUploading, setIsUploading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent opening the upload modal
    deleteElements({ nodes: [{ id }] })
  }

  const openUploadModal = () => {
    // Only open if we haven't already uploaded a file successfully
    if (!data.outputData) {
      setIsDialogOpen(true)
    }
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    setUploadedFile(file)
    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("subfolder", "")

      // Make the API call
      const response = await fetch("http://localhost:3002/uploads/", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      
      // Update node data with the result
      const event = new CustomEvent("node:update", {
        detail: {
          id,
          data: {
            ...data,
            executed: true,
            outputData: result,
            error: null,
          },
        },
      })
      document.dispatchEvent(event)
      
      // Close dialog
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Upload error:", error)

      // Update node data with the error
      const event = new CustomEvent("node:update", {
        detail: {
          id,
          data: {
            ...data,
            executed: true,
            error: error instanceof Error ? error.message : "Upload failed",
          },
        },
      })
      document.dispatchEvent(event)
    } finally {
      setIsUploading(false)
    }
  }

  // Determine node style
  let borderColor = selected ? "border-blue-500" : "border-gray-200"

  // If there's an error, use red styling
  if (data.error) {
    borderColor = "border-red-500"
  } else if (data.executed) {
    borderColor = "border-green-500"
  }

  return (
    <>
      <div
        className={`relative flex flex-col items-center justify-center w-[120px] h-[80px] border-2 ${borderColor} rounded-xl bg-white cursor-pointer transition-all duration-200 hover:shadow-md`}
        data-category="file-conversion"
        data-id={id}
        onClick={openUploadModal}
        onDoubleClick={(e) => e.stopPropagation()}
      >
        {data.executed && !data.error && (
          <div className="absolute -top-2 -left-2 bg-green-500 text-white rounded-full p-1 z-10">
            <Check className="w-3 h-3" />
          </div>
        )}

        {data.executed && data.error && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full p-1 z-10">
                  <AlertTriangle className="w-3 h-3" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{data.error}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {selected && (
          <button
            onClick={handleClose}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-10"
          >
            <X className="w-3 h-3" />
          </button>
        )}

        <Handle type="target" position={Position.Left} id={`${id}-left`} className="w-2 h-2 !bg-blue-500" />
        <Handle type="source" position={Position.Right} id={`${id}-right`} className="w-2 h-2 !bg-blue-500" />

        <div className="flex items-center gap-2 mb-1">
          <div className="p-1 bg-blue-50 rounded-md">
            <FileUp className="w-4 h-4 text-blue-500" />
          </div>
          <h3 className="font-semibold text-gray-800 text-xs">{data.label}</h3>
        </div>

        {data.outputData ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-[10px] text-green-600 cursor-help truncate max-w-[100px]">
                  {uploadedFile?.name || data.outputData.original_filename}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">File stored at: {data.outputData.filepath}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div className="text-[10px] text-blue-500">
            {isUploading ? "Uploading..." : "Click to Upload"}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-medium">Upload File</DialogTitle>
          </DialogHeader>

          <div className="p-6">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
              onClick={handleFileSelect}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              
              {isUploading ? (
                <div className="py-6">
                  <div className="mb-4 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                  <p className="text-sm text-gray-600">Uploading file...</p>
                </div>
              ) : (
                <div className="space-y-3 py-6">
                  <div className="flex items-center justify-center">
                    <div className="rounded-full bg-blue-100 p-3">
                      <FileUp className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-800">
                    Click to select a file
                  </div>
                  <div className="text-xs text-gray-500">
                    Support for documents, images, and more
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="rounded-lg px-4"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleFileSelect}
                disabled={isUploading}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4"
              >
                {isUploading ? "Uploading..." : "Select File"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}