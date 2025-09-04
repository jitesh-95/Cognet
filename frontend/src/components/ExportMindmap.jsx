import { Box, Button, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import React, { useState } from 'react';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import ELK from "elkjs/lib/elk.bundled.js";
import { getDynamicNodeHeight, getFileName } from '@/app/utils';

const ExportMindmap = ({ nodes, edges, originalNodes, originalEdges }) => {
  const [anchorDownload, setAnchorDownload] = useState(null);
  const openDownload = Boolean(anchorDownload);

  const handleClickDownload = (event) => setAnchorDownload(event.currentTarget);
  const handleCloseDownload = () => setAnchorDownload(null);

  const onDownloadOptionClick = (option) => {

  };

  const nodeColor = (node) => {
    switch (node.type) {
      case 'root':
        return '#6E83F4';
      case 'sub':
        return '#2C2F48';
      default:
        return '#1E1E1E';
    }
  };

  // --- helper: wrap text ---
  const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(" ");
    let line = "";
    const lines = [];
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        lines.push(line.trim());
        line = words[n] + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());
    lines?.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
    return lines.length;
  };

  // ------------------exporting---------------------
  //-----------------------for json------------------------
  const exportAsJSON = () => {
    const data = JSON.stringify({ originalNodes, originalEdges }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "mindmap.json";
    link.click();

    // Clean up
    URL.revokeObjectURL(url);
    link.remove();
    handleCloseDownload();
  };

  //-----------------------for Image------------------------

  // ✅ helper: draw rounded rect
  const drawRoundedRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  const exporAsImage = async () => {
    const padding = 50;
    const nodeWidth = 250;
    const contentFontSize = 12;
    const labelFontSize = 16;
    const lineHeight = 18;

    const elk = new ELK();

    // --- prepare elk graph ---
    const elkGraph = {
      id: "root",
      layoutOptions: {
        "elk.algorithm": "layered",
        "elk.layered.spacing.nodeNodeBetweenLayers": "150", // extra vertical gap
        "elk.spacing.nodeNode": "60",                       // extra horizontal gap
        'elk.layered.considerModelOrder': 'true',   // ✅ keep components apart
        'elk.spacing.componentComponent': '200',    // ✅ extra gap between separate graphs
      },
      children: nodes?.map(n => ({
        id: n.id,
        width: nodeWidth,
        height: getDynamicNodeHeight(n.data?.content || ""),
      })),
      edges: edges
    };

    // --- run layout ---
    const layout = await elk.layout(elkGraph);
    const nodePositions = {};
    layout.children?.forEach(c => {
      nodePositions[c.id] = { x: c.x, y: c.y, height: c.height };
    });

    // --- calculate canvas size ---
    const width = Math.max(...layout.children?.map(c => c.x + nodeWidth)) + padding;
    const height = Math.max(...layout.children?.map(c => c.y + c.height)) + padding;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const drawCtx = canvas.getContext("2d");

    drawCtx.fillStyle = "#ffffff";
    drawCtx.fillRect(0, 0, width, height);

    // --- draw edges ---
    drawCtx.strokeStyle = "#000";
    drawCtx.lineWidth = 2;
    edges?.forEach(edge => {
      const source = nodePositions[edge.source];
      const target = nodePositions[edge.target];
      if (!source || !target) return;
      drawCtx.beginPath();
      drawCtx.moveTo(source.x + nodeWidth / 2, source.y + source.height / 2);
      drawCtx.lineTo(target.x + nodeWidth / 2, target.y + target.height / 2);
      drawCtx.stroke();
    });

    // --- draw nodes ---
    nodes?.forEach(node => {
      const { x, y, height: nodeHeight } = nodePositions[node.id];
      const label = node.data?.label || "";
      const content = node.data?.content || "";

      // background rounded rect
      drawCtx.fillStyle =
        nodeColor(node);
      drawCtx.strokeStyle = "#000";
      drawCtx.lineWidth = 1;
      drawRoundedRect(drawCtx, x, y, nodeWidth, nodeHeight, 12);

      // label
      drawCtx.fillStyle = "#fff";
      drawCtx.font = `bold ${labelFontSize}px Arial`;
      drawCtx.fillText(label, x + 10, y + 20);

      // content
      drawCtx.fillStyle = "#ddd";
      drawCtx.font = `${contentFontSize}px Arial`;
      wrapText(drawCtx, content, x + 10, y + 40, nodeWidth - 20, lineHeight);
    });

    // --- download PNG ---
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = getFileName("mindmap", "png");
    link.click();
    link.remove();

    handleCloseDownload();
  };

  return (
    <Box>
      <Button variant="contained" size="small" startIcon={<DownloadIcon />} onClick={handleClickDownload}>Download</Button>
      {/* download menu */}
      <Menu
        anchorEl={anchorDownload}
        open={openDownload}
        onClose={handleCloseDownload}
      >
        <MenuItem onClick={exportAsJSON}>
          <ListItemIcon>
            <InsertDriveFileIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>JSON</ListItemText>
        </MenuItem>
        <MenuItem onClick={exporAsImage}>
          <ListItemIcon>
            <ImageIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>IMAGE</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => onDownloadOptionClick('PDF')}>
          <ListItemIcon>
            <PictureAsPdfIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>PDF</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default ExportMindmap;