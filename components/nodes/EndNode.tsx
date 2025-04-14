import { Handle, Position } from "reactflow"

export function EndNode({ id }: { id: string }) {
  return (
    <div className="relative">
      <div className="rounded-lg border border-dashed border-red-500 p-1">
        <div className="w-[30px] h-[30px] bg-red-500 rounded-lg flex items-center justify-center shadow-sm">
          <div className="w-[12px] h-[12px] bg-white rounded-sm" />
        </div>
        <Handle
          type="target"
          position={Position.Left}
          id={`${id}-target`}
          className="w-1 h-1 !bg-blue-500"
        />
      </div>
      <div className="absolute top-[37.5px] left-1/2 transform -translate-x-1/2 whitespace-nowrap">
       
      </div>
    </div>
  )
}
