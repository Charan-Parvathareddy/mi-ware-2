import { Handle, Position } from "reactflow"

export function StartNode({ id }: { id: string }) {
  return (
    <div className="relative">
      <div className="rounded-xl border-2 border-dashed border-green-500 p-2">
        <div className="w-[60px] h-[60px] bg-green-500 rounded-xl flex items-center justify-center">
          <div className="w-0 h-0 border-l-[20px] border-l-white border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent ml-2" />
        </div>
        <Handle type="source" position={Position.Right} id={`${id}-source`} className="w-2 h-2 !bg-blue-500" />
      </div>
      <div className="absolute top-[75px] left-1/2 transform -translate-x-1/2 whitespace-nowrap">
        <span className="text-sm font-medium">Start</span>
      </div>
    </div>
  )
}

