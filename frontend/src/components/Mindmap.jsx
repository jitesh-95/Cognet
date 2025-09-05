"use client";
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
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
  MiniMap,
} from '@xyflow/react';
import { Backdrop, Box, Button, CircularProgress, InputAdornment, List, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Paper, TextField, Typography } from "@mui/material";
import { DetailNode, RootNode, SubNode } from "./CustomNodes";
import { useThemeMode } from "@/app/contexts/ThemeContext";
import SouthIcon from '@mui/icons-material/South';
import EastIcon from '@mui/icons-material/East';
import { useNotification } from "@/app/contexts/NotificationProvider";
import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import ExportMindmap from "./ExportMindmap";
import { getDynamicNodeHeight } from "@/app/utils";
import EditNode from "./EditNode";
import { usePathname } from "next/navigation";

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
  const [anchorEl, setAnchorEl] = useState(null);
  const { fitView, setCenter } = useReactFlow();
  const { showNotification } = useNotification();
  const [exportLoading, setExportLoading] = useState(false);
  const { darkMode } = useThemeMode();
  const pathname = usePathname();
  // search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [results, setResults] = useState([]);
  // editing
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingNode, setEditingNode] = useState(null); // {id, label, content}
  const [isDirty, setIsDirty] = useState(false);

  // menus
  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

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

  const onOptionClick = (option) => {
    onLayout({ direction: option });
    handleClose();
  };

  // ------------------- search functions-----------------------
  const debounceSearch = (query) => {
    if (query.length === 0) {
      setResults([]);
      setSearchLoading(false);
      return;
    }
    if (query.length > 2) {
      const filtered = nodes?.filter((n) =>
        n.data?.label?.toLowerCase()?.includes(query.toLowerCase())
      );
      setResults(filtered || []);
      setSearchLoading(false);
    }
  };

  // debounce search (3s)
  useEffect(() => {
    setSearchLoading(true);
    const handler = setTimeout(() => {
      debounceSearch(searchQuery);
    }, 2000);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // -------------------------selecting node for searching--------------------------------
  const handleSelectNode = (node) => {
    if (node?.position) {
      const zoom = 1.5;
      setCenter(node.position.x, node.position.y, { zoom, duration: 800 });
    } else {
      showNotification({ message: "Node position not found", status: "error" });
    }
    setResults([]);
    setSearchQuery(""); // clear field
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

  // saving permanently to localstorage
  const handlePermanentSave = () => {
    setIsDirty(false);
    showNotification({ message: 'Permanently saved successfully.', status: 'success' });
    switch (pathname) {
      case '/url-map': {
        return localStorage.setItem('graph-by-url', JSON.stringify({ graph: { nodes, edges }, title: data?.title }));
      }
      case '/file-map': {
        return localStorage.setItem('graph-by-file', JSON.stringify({ graph: { nodes, edges }, title: data?.title }));
      }
    }
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
      <Panel position="top-left" style={{ maxWidth: 300 }}>
        <Paper elevation={3} sx={{ px: 1.5, py: 1.2, backgroundColor: 'background.iconBackground' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>{data?.title}</Typography>
        </Paper>
      </Panel>

      <Panel position="top-center">
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Paper sx={{ p: 0.8, borderRadius: '4px', backgroundColor: 'background.iconBackground' }}>
            <TextField
              label="Search Nodes"
              variant="outlined"
              fullWidth
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{ input: { endAdornment: <InputAdornment position="end">{searchLoading ? <CircularProgress size='20px' /> : null}</InputAdornment> } }}
            />
          </Paper>
          {results.length > 0 && (
            <List dense sx={{ mt: 1, bgcolor: "background.paper", borderRadius: 1, maxHeight: 200, overflow: "auto" }}>
              {results.map((node) => (
                <ListItemButton key={node.id} onClick={() => handleSelectNode(node)}>
                  <Typography variant="body2">{node.data?.label}</Typography>
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>
      </Panel>

      <Panel position="top-right">
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 1 }}>
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <Paper sx={{ p: 0.8, borderRadius: '4px' }}>
              <TextField
                label="Search Nodes"
                variant="outlined"
                fullWidth
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                slotProps={{ input: { endAdornment: <InputAdornment position="end">{searchLoading ? <CircularProgress size='20px' /> : null}</InputAdornment> } }}
              />
            </Paper>
            {results.length > 0 && (
              <List dense sx={{ mt: 1, bgcolor: "background.paper", borderRadius: 1, maxHeight: 200, overflow: "auto" }}>
                {results.map((node) => (
                  <ListItemButton key={node.id} onClick={() => handleSelectNode(node)}>
                    <Typography variant="body2">{node.data?.label}</Typography>
                  </ListItemButton>
                ))}
              </List>
            )}
          </Box>
          {isDirty && <Button size="small" variant="contained" onClick={handlePermanentSave}>Save</Button>}
          {/* export button */}
          <ExportMindmap nodes={nodes} edges={edges} setLoading={setExportLoading} />
          {/* layout button  */}
          <Button variant="contained" size="small" onClick={handleClick} startIcon={<ViewCompactIcon />}>Layout</Button>
        </Box>

        {/* layout menu */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
        >
          <MenuItem onClick={() => onOptionClick('DOWN')}>
            <ListItemIcon>
              <SouthIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Vertical</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => onOptionClick('RIGHT')}>
            <ListItemIcon>
              <EastIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Horizontal</ListItemText>
          </MenuItem>
        </Menu>
      </Panel>

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
