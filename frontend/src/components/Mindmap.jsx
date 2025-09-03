"use client";
import React, { useCallback, useLayoutEffect } from "react";
import '@xyflow/react/dist/style.css';
import ELK from "elkjs/lib/elk.bundled.js";
import {
  Background,
  ReactFlow,
  addEdge,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Controls,
  ReactFlowProvider,
} from '@xyflow/react';
import { Box, Button } from "@mui/material";
import { DetailNode, RootNode, SubNode } from "./CustomNodes";

const elk = new ELK();

const elkOptions = {
  'elk.algorithm': 'layered',
  'elk.layered.spacing.nodeNodeBetweenLayers': '100',
  'elk.spacing.nodeNode': '80',
};

const getLayoutedElements = (nodes, edges, options = {}) => {
  const isHorizontal = options?.['elk.direction'] === 'RIGHT';

  const graph = {
    id: 'root',
    layoutOptions: options,
    children: nodes.map((node) => ({
      ...node,
      position: { x: 0, y: 0 },
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      width: 200, // adjust based on label+description
      height: 70, // enough for content under label
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

const nodeTypes = {
  root: RootNode,
  sub: SubNode,
  detail: DetailNode
}

const Mindmap = ({ data }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

  const onLayout = useCallback(
    ({ direction }) => {
      const opts = { 'elk.direction': direction, ...elkOptions };

      getLayoutedElements(data?.nodes, data?.edges, opts).then(
        ({ nodes: layoutedNodes, edges: layoutedEdges }) => {
          setNodes(layoutedNodes);
          setEdges(layoutedEdges);
          fitView();
        }
      );
    },
    [nodes, edges]
  );

  useLayoutEffect(() => {
    onLayout({ direction: 'DOWN', useInitialNodes: true }); // default vertical layout
  }, []);

  return (<div style={{ height: '90vh' }}>
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitView
    >
      <Panel position="top-right">
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" size="small" onClick={() => onLayout({ direction: 'DOWN' })}>Vertical</Button>
          <Button variant="contained" size="small" onClick={() => onLayout({ direction: 'RIGHT' })}>Horizontal</Button>
        </Box>
      </Panel>
      <Background />
      <Controls />
    </ReactFlow>
  </div>
  );
};

export default ({ data }) => (
  <ReactFlowProvider>
    <Mindmap data={data} />
  </ReactFlowProvider>
);
