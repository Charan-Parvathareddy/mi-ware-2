import { Handle, Position } from "reactflow"

export function StartNode({ id }: { id: string }) {
  return (
    <div className="relative">
      <div className="rounded-lg border border-dashed border-green-500 p-1">
        <div className="w-[30px] h-[30px] bg-green-500 rounded-lg flex items-center justify-center shadow-sm">
          <div className="w-0 h-0 border-l-[10px] border-l-white border-t-[7.5px] border-t-transparent border-b-[7.5px] border-b-transparent ml-1" />
        </div>
        <Handle
          type="source"
          position={Position.Right}
          id={`${id}-source`}
          className="w-1 h-1 !bg-blue-500"
        />
      </div>
      <div className="absolute top-[37.5px] left-1/2 transform -translate-x-1/2 whitespace-nowrap">
        
      </div>
    </div>
  )
}
