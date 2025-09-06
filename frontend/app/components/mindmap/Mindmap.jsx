"use client";
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import '@xyflow/react/dist/style.css';
import ELK from "elkjs/lib/elk.bundled.js";
import {
  Background,
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Controls,
  ReactFlowProvider,
  MiniMap,
} from '@xyflow/react';
import { Backdrop, CircularProgress } from "@mui/material";
import { DetailNode, RootNode, SubNode } from "./CustomNodes";
import { useThemeMode } from "../../contexts/ThemeContext";
import { useNotification } from "../../contexts/NotificationProvider";

import { getDynamicNodeHeight } from "../../utils";
import EditNode from "./EditNode";
import MindmapPanels from "./MindmapPanels";

const elk = new ELK();

const elkOptions = {
  'elk.algorithm': 'layered',
  'elk.layered.spacing.nodeNodeBetweenLayers': '150',
  'elk.spacing.nodeNode': '60',
  'elk.layered.considerModelOrder': 'true',   // ✅ keep components apart
  'elk.spacing.componentComponent': '200',    // ✅ extra gap between separate graphs
  'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF', // better positioning
  'elk.spacing.base': '50',
  'elk.edgeRouting': 'SPLINES',
};

const getLayoutedElements = (nodes, edges, options = {}) => {
  const isHorizontal = options?.['elk.direction'] === 'RIGHT';

  const measureCanvas = document.createElement("canvas");
  const ctx = measureCanvas.getContext("2d");

  const graph = {
    id: 'root',
    layoutOptions: options,
    children: nodes?.map((node) => ({
      ...node,
      position: { x: 0, y: 0 },
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      width: 320, // adjust based on label+description
      height: getDynamicNodeHeight(node.data.graph?.content || "", ctx), // enough for content under label
    })),
    edges: edges,
  };

  return elk
    .layout(graph)
    .then((layoutedGraph) => ({
      nodes: layoutedGraph.children.map((node) => ({
        ...node,
        position: { x: node.x, y: node.y },
      })),
      edges: layoutedGraph.edges,
    }))
    .catch(console.error);
};

const Mindmap = ({ data }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const { fitView, setCenter } = useReactFlow();
  const { showNotification } = useNotification();
  const [exportLoading, setExportLoading] = useState(false);
  const { darkMode } = useThemeMode();

  // editing
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingNode, setEditingNode] = useState(null); // {id, label, content}
  const [isDirty, setIsDirty] = useState(false);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

  const onLayout = useCallback(
    ({ direction }) => {
      const opts = { 'elk.direction': direction, ...elkOptions };
      getLayoutedElements(data.graph?.nodes, data.graph?.edges, opts).then(
        ({ nodes: layoutedNodes, edges: layoutedEdges }) => {
          setNodes(layoutedNodes);
          setEdges(layoutedEdges);
          fitView();
        }
      );
    },
    [data, fitView]
  );

  useLayoutEffect(() => {
    onLayout({ direction: 'RIGHT', useInitialNodes: true }); // default vertical layout
  }, [data, onLayout]);

  const nodeColor = (node) => {
    switch (node.type) {
      case 'root':
        return '#367ccc';
      case 'sub':
        return '#437d8b';
      default:
        return '#1E1E1E';
    }
  };

  //---------------------- editing--------------------------------
  // edit handler
  const handleEditNode = (node) => {
    setShowEditModal(true);
    if (node) {
      setEditingNode({ id: node.id, label: node.data?.label, content: node.data?.content });
    }
  };

  // edit save handler
  const handleSaveNode = (updatedData) => {
    setNodes((nds) =>
      nds?.map((n) =>
        n.id === editingNode.id ? { ...n, data: { ...n.data, ...updatedData } } : n
      )
    );
    setEditingNode(null);
    setIsDirty(true);
    setShowEditModal(false);
    showNotification({ message: 'Node updated temporarily. Click SAVE to save permanently.', status: 'success' });
  };

  // ✅ Memoize nodeTypes to avoid React Flow warning
  const nodeTypes = useMemo(
    () => ({
      root: (props) => <RootNode {...props} onEdit={handleEditNode} />,
      sub: (props) => <SubNode {...props} onEdit={handleEditNode} />,
      detail: (props) => <DetailNode {...props} onEdit={handleEditNode} />,
    }),
    []
  );

  return (<div style={{ height: '90vh' }} id="mindmap-wrapper">
    <Backdrop
      sx={(theme) => ({ color: `${darkMode ? "rgba(255,255,255,0.5)" : 'rgba(77, 76, 76, 0.7)'}`, zIndex: theme.zIndex.drawer + 1 })}
      open={exportLoading}
    >
      <CircularProgress size='50px' color="inherit" />
    </Backdrop>
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitView
    >

      <MindmapPanels title={data?.title} isDirty={isDirty} setIsDirty={setIsDirty} onLayout={onLayout} setCenter={setCenter}
        nodes={nodes} edges={edges} setExportLoading={setExportLoading} />

      <Background />
      <Controls className={darkMode ? "mindmap-controls-dark" : "mindmap-controls-light"} />
      <MiniMap pannable zoomable nodeStrokeWidth={3} nodeColor={nodeColor} bgColor={darkMode ? "rgba(255,255,255,0.5)" : 'rgba(77, 76, 76, 0.7)'} />
    </ReactFlow>

    {/* node editing  */}
    <EditNode
      open={showEditModal}
      node={editingNode}
      onClose={() => { }}
      onCancel={() => setShowEditModal(false)}
      onSave={handleSaveNode}
    />
  </div>
  );
};

export default ({ data }) => (
  <ReactFlowProvider>
    <Mindmap data={data} />
  </ReactFlowProvider>
);
