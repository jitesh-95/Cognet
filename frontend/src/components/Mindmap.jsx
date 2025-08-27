"use client";
import React from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

const nodes = [
  { id: "1", position: { x: 0, y: 0 }, data: { label: "LangChain" } },
  { id: "2", position: { x: -150, y: 100 }, data: { label: "LLMs" } },
  { id: "3", position: { x: 150, y: 100 }, data: { label: "Prompting" } },
  { id: "4", position: { x: -150, y: 200 }, data: { label: "Tools" } },
  { id: "5", position: { x: 150, y: 200 }, data: { label: "Chains" } },
  { id: "6", position: { x: 0, y: 300 }, data: { label: "Agents" } },
];

const edges = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e1-3", source: "1", target: "3" },
  { id: "e2-4", source: "2", target: "4" },
  { id: "e3-5", source: "3", target: "5" },
  { id: "e5-6", source: "5", target: "6" },
];

export default function Mindmap() {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
