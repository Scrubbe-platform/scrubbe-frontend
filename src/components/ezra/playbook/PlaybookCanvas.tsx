import React from "react";
import ReactFlow, {
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
} from "reactflow";
import "reactflow/dist/style.css";

type PlaybookCanvasProps = {
  nodes: Node[];
  edges: Edge[];
  onDrop: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
};

const PlaybookCanvas: React.FC<PlaybookCanvasProps> = ({
  nodes,
  edges,
  onDrop,
  onDragOver,
  onNodesChange,
  onEdgesChange,
  onConnect,
}) => (
  <div
    className="border border-dashed rounded-lg dark:bg-subDark bg-gray-100"
    style={{ width: "100%", height: 400 }}
    onDrop={onDrop}
    onDragOver={onDragOver}
  >
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
    />
  </div>
);

export default PlaybookCanvas;
