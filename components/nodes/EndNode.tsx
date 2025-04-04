import { Handle, Position } from "reactflow"

export function EndNode({ id }: { id: string }) {
  return (
    <div className="relative">
      <div className="rounded-xl border-2 border-dashed border-red-500 p-2">
        <div className="w-[60px] h-[60px] bg-red-500 rounded-xl flex items-center justify-center">
          <div className="w-[24px] h-[24px] bg-white rounded-sm" />
        </div>
        <Handle type="target" position={Position.Left} id={`${id}-target`} className="w-2 h-2 !bg-blue-500" />
      </div>
      <div className="absolute top-[75px] left-1/2 transform -translate-x-1/2 whitespace-nowrap">
        <span className="text-sm font-medium">End</span>
      </div>
    </div>
  )
}

