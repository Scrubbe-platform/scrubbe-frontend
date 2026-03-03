/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, {
  ReactNode,
  useCallback,
  useState,
  useRef,
  useEffect,
} from "react";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  NodeProps,
  ReactFlowProvider,
  Handle,
  Position,
  NodeTypes,
} from "reactflow";
import PlaybookTemplates from "./PlaybookTemplates";
import usePlaybookBuilderStore from "@/store/slices/playbookBuilder";
import Modal from "@/components/ui/Modal";
import PlaybookComment from "./PlaybookComment";
import { X } from "lucide-react";
import "reactflow/dist/style.css";
import BlockIpModal from "./playbookActionModal/BlockIpModal";
import FailedLoginModal from "./playbookActionModal/FailedLoginModal";
import JiraTicketModal from "./playbookActionModal/JiraTicketModal";
import LogEvent from "./playbookActionModal/LogEvent";
import PhisingEmail from "./playbookActionModal/PhisingEmail";
import SendAlertModal from "./playbookActionModal/SendAlertModal";
import SeverityModal from "./playbookActionModal/SeverityModal";
import SlackMessageModal from "./playbookActionModal/SlackMessageModal";
import UnauthorizedAccess from "./playbookActionModal/UnauthorizedAccess";
import SavePlaybookModal from "./SavePlaybookModal";
import { toast } from "sonner";

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const NODE_WIDTH = 180;
const NODE_HEIGHT = 60;

const nodeTypes: NodeTypes = {
  metric: MetricNode,
  trigger: TriggerNode,
  action: ActionNode,
};

function MetricNode({ id, data, selected }: NodeProps) {
  return <BlockNode id={id} data={data} selected={selected} />;
}
function TriggerNode({ id, data, selected }: NodeProps) {
  return <BlockNode id={id} data={data} selected={selected} />;
}
function ActionNode({ id, data, selected }: NodeProps) {
  return <BlockNode id={id} data={data} selected={selected} />;
}

interface BlockNodeProps {
  id: string;
  data: {
    label: string;
    configured: boolean;
    onConfig: (id: string) => void;
    onRemove: (id: string) => void;
    [key: string]: unknown;
  };
  selected: boolean;
}
function BlockNode({ id, data, selected }: BlockNodeProps) {
  const [hovered, setHovered] = useState(false);
  const borderColor = data.configured ? "border-blue-400" : "border-red-500";
  return (
    <div
      className={`relative w-[${NODE_WIDTH}px] h-[${NODE_HEIGHT}px] flex items-center justify-center rounded border-2 shadow bg-white cursor-pointer select-none ${borderColor} ${
        selected ? "ring-2 ring-blue-300" : ""
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        console.log("BlockNode clicked", id, data);
        if (typeof data.onConfig === "function") {
          data.onConfig(String(id));
        }
      }}
    >
      {/* Only render target handle if not a metric */}
      {data.type !== "metric" && (
        <Handle type="target" position={Position.Top} />
      )}
      <span className="font-semibold text-center w-full">{data.label}</span>
      <Handle type="source" position={Position.Bottom} />
      {hovered && (
        <button
          className="absolute top-1 right-1 p-1 bg-white rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100"
          onClick={(e) => {
            e.stopPropagation();
            if (typeof data.onRemove === "function") {
              data.onRemove(String(id));
            }
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

const PlaybookBuilder = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [actionId, setActionId] = useState(1);
  const { playbookActions, playbookMetrics, playbookTriggers } =
    usePlaybookBuilderStore();
  const [isOpenComment, setIsOpenComment] = useState(false);
  const [configuringNode, setConfiguringNode] = useState<Node | null>(null);
  const [savedPlaybook, setSavedPlaybook] = useState<any[]>([]);
  const [openSaveModal, setOpenSaveModal] = useState(false);
  console.log(JSON.stringify(savedPlaybook, null, 2));
  // Only one metric allowed
  const hasMetric = nodes.some((n) => n.type === "metric");
  // At least one trigger required for actions
  const hasTrigger = nodes.some((n) => n.type === "trigger");

  // Use a ref to always have the latest nodes for handler
  const nodesRef = useRef(nodes);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  // Helper to ensure all nodes have correct handlers
  const withHandlers = useCallback(
    (
      nodes: Node[],
      onConfig: (id: string) => void,
      onRemove: (id: string) => void
    ): Node[] => {
      return nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          onConfig,
          onRemove,
          type: n.data.type,
        },
      }));
    },
    []
  );

  // Drag/drop logic
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("type");
      const label = event.dataTransfer.getData("label");
      if (type === "metric" && hasMetric) {
        alert("Only one metric block is allowed.");
        return;
      }
      if (type === "trigger" && !hasMetric) {
        alert("Add a metric before adding triggers.");
        return;
      }
      if (type === "action" && !hasTrigger) {
        alert("Add a trigger before adding actions.");
        return;
      }
      // Fallback: use a simple offset from the mouse position
      const position = { x: event.clientX - 400, y: event.clientY - 150 };
      const newNode = {
        id: `block-${actionId}`,
        type,
        position,
        data: {
          label,
          configured: false,
          onConfig: handleConfigNode,
          onRemove: handleRemoveNode,
          type, // <-- add this
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      };
      setNodes((nds) => {
        const updatedNodes = withHandlers(
          [...nds, newNode],
          handleConfigNode,
          handleRemoveNode
        );
        // If it's a metric, open config modal for it
        if (type === "metric") {
          setConfiguringNode(newNode);
        }
        return updatedNodes;
      });
      setActionId((id) => id + 1);
    },
    [actionId, setNodes, hasMetric, hasTrigger]
  );

  // Enforce connection rules
  // Allow any node to connect to any other node
  const isValidConnection = (
    sourceType: string | undefined,
    targetType: string | undefined
  ) => {
    return !!(sourceType && targetType);
  };
  const onConnect = useCallback(
    (params: Edge | Connection) => {
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);
      if (!sourceNode || !targetNode) return;
      if (!isValidConnection(sourceNode.type, targetNode.type)) {
        alert("Invalid connection. Hierarchy: Metric > Triggers > Actions");
        return;
      }
      setEdges((eds) => addEdge(params, eds));
    },
    [nodes, setEdges]
  );

  const handleConfigNode = useCallback((nodeId: string) => {
    // Always search for the node by string id using the latest nodes
    const node = nodesRef.current.find((n) => n.id === nodeId) || null;
    setConfiguringNode(node);
  }, []);
  // Remove node and its edges
  function handleRemoveNode(nodeId: string) {
    setNodes((nds) =>
      withHandlers(
        nds.filter((n) => n.id !== nodeId),
        handleConfigNode,
        handleRemoveNode
      )
    );
    setEdges((eds) =>
      eds.filter((e) => e.source !== nodeId && e.target !== nodeId)
    );
  }

  // Open config modal

  // Save config
  function handleConfigSave(nodeId: string, config: any) {
    setNodes((nds) =>
      withHandlers(
        nds.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                data: {
                  ...n.data,
                  config,
                  configured: true,
                  type: n.data.type,
                },
              }
            : n
        ),
        handleConfigNode,
        handleRemoveNode
      )
    );
    setConfiguringNode(null);
  }

  const handleCloseModal = () => {
    setConfiguringNode(null);
  };

  // Config modal content
  function renderConfigModal() {
    if (!configuringNode) return null;
    const { data, id } = configuringNode;
    const label = data.label;
    const config = data.config;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setConfiguration = (data: any) => {
      handleConfigSave(id, data);
    };
    let content: ReactNode;
    switch (label) {
      case "Unauthorized access":
        content = (
          <UnauthorizedAccess
            closeModal={handleCloseModal}
            config={setConfiguration}
            initialConfig={config}
          />
        );
        break;
      case "Failed Login":
        content = (
          <FailedLoginModal
            closeModal={handleCloseModal}
            config={setConfiguration}
            initialConfig={config}
          />
        );
        break;
      case "Phishing Email":
        content = (
          <PhisingEmail
            closeModal={handleCloseModal}
            config={setConfiguration}
            initialConfig={config}
          />
        );
        break;
      case "Severity = High":
        content = (
          <SeverityModal
            closeModal={handleCloseModal}
            config={setConfiguration}
            initialConfig={config}
          />
        );
        break;
      case "Send Alert":
        content = (
          <SendAlertModal
            closeModal={handleCloseModal}
            config={setConfiguration}
            initialConfig={config}
          />
        );
        break;
      case "Block IP":
        content = (
          <BlockIpModal
            closeModal={handleCloseModal}
            config={setConfiguration}
            initialConfig={config}
          />
        );
        break;
      case "Log event":
        content = (
          <LogEvent
            config={setConfiguration}
            initialConfig={config}
            closeModal={handleCloseModal}
          />
        );
        break;
      case "Send Slack Message":
        content = <SlackMessageModal closeModal={handleCloseModal} />;
        break;
      case "Create Jira Ticket":
        content = <JiraTicketModal closeModal={handleCloseModal} />;
        break;
      default:
        content = <div>Unauthorized access</div>;
        break;
    }
    return (
      <Modal isOpen={!!configuringNode} onClose={handleCloseModal}>
        {content}
      </Modal>
    );
  }

  // Clear all
  const handleClear = () => {
    setNodes([]);
    setEdges([]);
  };
  const handleSave = (title: string) => {
    // Build a hierarchy: metrics > triggers > actions
    // 1. Build a map of nodes by id
    const nodeMap: Record<string, Node> = Object.fromEntries(
      nodes.map((n) => [n.id, n])
    );
    // 2. Build a map of children for each node
    const childrenMap: Record<string, string[]> = {};
    edges.forEach((e) => {
      if (!childrenMap[String(e.source)]) childrenMap[String(e.source)] = [];
      childrenMap[String(e.source)].push(String(e.target));
    });
    // 3. Recursively build the hierarchy
    type NodeTree = {
      id: string;
      type: string;
      label: string;
      configuration: any;
      configured: boolean;
      children: NodeTree[];
    };
    function buildNodeTree(nodeId: string): NodeTree | null {
      const node = nodeMap[String(nodeId)];
      if (!node) return null;
      const children = (childrenMap[String(nodeId)] || [])
        .map(buildNodeTree)
        .filter((c): c is NodeTree => !!c);
      return {
        id: String(node.id || ""),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type: node.type as any,
        label: node.data.label,
        configuration: Object.fromEntries(
          Object.entries(node.data).filter(
            ([k]) =>
              !["label", "onConfig", "onRemove", "type", "configured"].includes(
                k
              )
          )
        )?.config,
        configured: node.data.configured,
        children,
      };
    }
    // 4. Find all metric nodes (roots)
    const metricNodes = nodes.filter((n) => n.type === "metric");
    const hierarchy = metricNodes.map((m) => buildNodeTree(m.id));
    // 5. Show the result in a modal or alert
    setSavedPlaybook((prev) => [
      {
        title,
        nodes: hierarchy,
      },
      ...prev,
    ]);

    console.log("Playbook hierarchy:\n" + JSON.stringify(hierarchy, null, 2));
  };

  // --- LOAD FEATURE ---
  // Convert playbook hierarchy to nodes/edges
  function hierarchyToNodesEdges(hierarchy: any): {
    nodes: Node[];
    edges: Edge[];
  } {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const LEVEL_Y = 140; // vertical gap between levels
    const SIBLING_X = 220; // horizontal gap between siblings
    const ROOT_X = 400; // starting x for root
    const ROOT_Y = 50; // starting y for root

    // Helper to count total leaves under a node (for spacing)
    function countLeaves(node: any): number {
      if (!node.children || node.children.length === 0) return 1;
      return node.children
        .map(countLeaves)
        .reduce((a: any, b: any) => a + b, 0);
    }

    // Traverse with layout
    function traverse(
      node: any,
      parentId: string | null,
      depth: number,
      xOffset: number
    ): { width: number } {
      if (!node) return { width: 0 };
      const nodeId = String(
        node.id || `block-${Math.random().toString(36).slice(2, 8)}`
      );
      const leaves = countLeaves(node);
      // Center this node above its children
      let myX = xOffset;
      const myY = ROOT_Y + depth * LEVEL_Y;
      // If has children, position children and center this node
      const childXs: number[] = [];
      if (Array.isArray(node.children) && node.children.length > 0) {
        let childX = xOffset;
        for (const child of node.children) {
          const childLeaves = countLeaves(child);
          // Position child
          traverse(child, nodeId, depth + 1, childX);
          // Center next child after this one's width
          childXs.push(childX + (childLeaves * SIBLING_X) / 2);
          childX += childLeaves * SIBLING_X;
        }
        // Center this node above its children
        myX = (childXs[0] + childXs[childXs.length - 1]) / 2;
      }
      nodes.push({
        id: nodeId,
        type: node.type,
        position: { x: myX, y: myY },
        data: {
          label: node.label,
          configured: !!node.configured,
          config: node.configuration,
          onConfig: handleConfigNode,
          onRemove: handleRemoveNode,
          type: node.type,
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      });
      if (parentId) {
        edges.push({
          id: `${parentId}->${nodeId}`,
          source: parentId,
          target: nodeId,
        });
      }
      return { width: leaves * SIBLING_X };
    }

    // Support both array and single root
    if (Array.isArray(hierarchy)) {
      let x = ROOT_X;
      for (const root of hierarchy) {
        const leaves = countLeaves(root);
        traverse(root, null, 0, x);
        x += leaves * SIBLING_X;
      }
    } else {
      traverse(hierarchy, null, 0, ROOT_X);
    }
    return { nodes, edges };
  }

  // Handler for loading a playbook
  function handleLoadPlaybook(playbook: any) {
    if (nodes.length > 0) {
      return toast.error("Clear playbook canvas to load preset");
    }
    // Use playbook.nodes as the hierarchy root (array of root nodes)
    const hierarchy = playbook.nodes;
    const { nodes: loadedNodes, edges: loadedEdges } =
      hierarchyToNodesEdges(hierarchy);
    setNodes(withHandlers(loadedNodes, handleConfigNode, handleRemoveNode));
    setEdges(loadedEdges);

    toast.success(`Playbook loaded successfull`);
  }

  // Drag sources
  function handleDragStart(
    e: React.DragEvent<HTMLButtonElement>,
    type: string,
    label: string
  ) {
    if (!type) return;
    e.dataTransfer.setData("type", type);
    e.dataTransfer.setData("label", label);
  }

  return (
    <ReactFlowProvider>
      <div className="flex flex-col gap-4 p-6">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">
          Playbook Builder
        </h2>
        <div className="p-6 dark:bg-dark bg-white rounded-xl shadow w-full mx-auto flex flex-col gap-4">
          <div>
            <p className="text-lg font-bold dark:text-white">
              Build a Playbook
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-base">
              Drag and drop actions to create a security playbook. Use
              conditions for branching workflow
            </p>
          </div>
          <div className="flex gap-4 border-b dark:border-gray-700 border-gray-100 text-base">
            <div
              className={` px-4 py-2 border-b-2 dark:border-colorScBlue text-colorScBlue`}
            >
              Canvas
            </div>
            <div
              className=" px-4 py-2 text-gray-500 dark:text-gray-400 cursor-pointer"
              onClick={() => setIsOpenComment(true)}
            >
              Comment
            </div>
            <div className=" px-4 py-2 text-gray-500 dark:text-gray-400 cursor-pointer">
              History
            </div>
          </div>
          <PlaybookTemplates handleLoadPlaybook={handleLoadPlaybook} />
          <div className="flex flex-col gap-2">
            <p className="text-lg font-bold dark:text-white">Saved Playbook</p>
            <div className="flex gap-4 mb-6">
              {savedPlaybook.map((playbook, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 w-64 dark:bg-subDark bg-gray-50 flex flex-col justify-between"
                >
                  <div>
                    <div className="font-semibold mb-2 dark:text-white">
                      {playbook.title}
                    </div>
                    <div className="text-sm mb-4 dark:text-white">
                      {playbook.desc ??
                        "Respond to unauthorized access attempts with severity-based actions."}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      className="bg-blue-500 text-white rounded px-3 py-1"
                      onClick={() => handleLoadPlaybook(playbook)}
                    >
                      Load
                    </button>
                    <button
                      className="bg-rose-500 text-white rounded px-3 py-1"
                      onClick={() => {}}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-6 mb-4">
            {/* Metric Section */}
            <div>
              <div className="font-semibold mb-2 text-blue-700">Metric</div>
              <div className="flex flex-wrap gap-2 items-center">
                {playbookMetrics.map((metric) => (
                  <button
                    key={metric}
                    draggable={!hasMetric}
                    disabled={!!hasMetric}
                    onDragStart={(e) => handleDragStart(e, "metric", metric)}
                    className={`border border-blue-600 px-4 py-2 rounded bg-white text-blue-600 text-sm font-medium transition hover:bg-blue-600 hover:text-white ${
                      hasMetric ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {metric}
                  </button>
                ))}
                <button className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium ml-2">
                  + Add custom metric
                </button>
              </div>
            </div>
            {/* Trigger Section */}
            <div>
              <div className="font-semibold mb-2 text-blue-700">Trigger</div>
              <div className="flex flex-wrap gap-2 items-center">
                {playbookTriggers.map((trigger) => (
                  <button
                    key={trigger}
                    draggable={hasMetric}
                    disabled={!hasMetric}
                    onDragStart={(e) => handleDragStart(e, "trigger", trigger)}
                    className={`border border-blue-600 px-4 py-2 rounded bg-white text-blue-600 text-sm font-medium transition hover:bg-blue-600 hover:text-white ${
                      !hasMetric ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {trigger}
                  </button>
                ))}
                <button className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium ml-2">
                  + Add custom Trigger
                </button>
              </div>
            </div>
            {/* Action Section */}
            <div>
              <div className="font-semibold mb-2 text-blue-700">Action</div>
              <div className="flex flex-wrap gap-2 items-center">
                {playbookActions.map((action) => (
                  <button
                    key={action}
                    draggable={hasTrigger}
                    disabled={!hasTrigger}
                    onDragStart={(e) => handleDragStart(e, "action", action)}
                    className={`border border-blue-600 px-4 py-2 rounded bg-white text-blue-600 text-sm font-medium transition hover:bg-blue-600 hover:text-white ${
                      !hasTrigger ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {action}
                  </button>
                ))}
                <button className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium ml-2">
                  + Add custom action
                </button>
              </div>
            </div>
          </div>
          <div className="h-[500px] bg-gray-50 rounded-lg border dark:border-zinc-700 border-zinc-200">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              nodeTypes={nodeTypes}
              fitView
            />
          </div>
          <div className="flex gap-2 mt-4 dark:text-white text-base">
            <button onClick={handleClear} className="border px-3 py-1 rounded">
              Clear
            </button>
            <button className="border px-3 py-1 rounded">Undo</button>
            <button className="border px-3 py-1 rounded">Redo</button>
            <button className=" px-3 py-1 rounded bg-blue-500 text-white">
              Suggest
            </button>
            <button className="bg-blue-500 text-white px-3 py-1 rounded">
              Validate
            </button>
            <button
              onClick={() => setOpenSaveModal(true)}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Save
            </button>
            <button className="bg-blue-500 text-white px-3 py-1 rounded">
              Export
            </button>

            <SavePlaybookModal
              isOpen={openSaveModal}
              onClose={() => setOpenSaveModal(false)}
              onSave={handleSave}
            />
          </div>
        </div>
        {isOpenComment && (
          <Modal isOpen={isOpenComment} onClose={() => setIsOpenComment(false)}>
            <div className="text-lg font-semibold mb-4">Comment</div>
            <PlaybookComment />
          </Modal>
        )}
        {renderConfigModal()}
      </div>
    </ReactFlowProvider>
  );
};

export default PlaybookBuilder;
