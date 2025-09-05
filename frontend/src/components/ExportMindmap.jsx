import { Box, Button, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import React, { useState } from 'react';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import ELK from "elkjs/lib/elk.bundled.js";
import { buildElkGraph, getFileName } from '@/app/utils';
import jsPDF from 'jspdf';

const ExportMindmap = ({ nodes, edges, setLoading }) => {
  const [anchorDownload, setAnchorDownload] = useState(null);
  const openDownload = Boolean(anchorDownload);

  const handleClickDownload = (event) => setAnchorDownload(event.currentTarget);
  const handleCloseDownload = () => setAnchorDownload(null);

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

  // --- helper: functions ---
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

  // run elk layout
  const runLayout = async (elkGraph) => {
    const elk = new ELK();
    return await elk.layout(elkGraph);
  };

  // calculate required dimensions
  const calculateDimensions = (layout, nodeWidth, baseNodeHeight, padding) => {
    const width = Math.max(...layout.children.map(c => c.x + nodeWidth)) + padding;
    const height = Math.max(...layout.children.map(c => c.y + baseNodeHeight)) + padding;
    return { width, height };
  };

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

  // ------------------exporting---------------------

  //-----------------------for json------------------------
  const exportAsJSON = () => {
    setLoading(true);
    handleCloseDownload();
    const data = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = getFileName("mindmap", "json");
    link.click();

    // Clean up
    URL.revokeObjectURL(url);
    link.remove();
    setLoading(false);
  };

  //-----------------------for Image------------------------
  const exporAsImage = async () => {
    setLoading(true);
    handleCloseDownload();

    const padding = 50;
    const nodeWidth = 320;
    const contentFontSize = 12;
    const labelFontSize = 16;
    const lineHeight = 18;
    const baseNodeHeight = 70;

    // --- prepare elk graph ---
    const elkGraph = buildElkGraph(nodes, edges, { nodeWidth, baseNodeHeight, contentFontSize, lineHeight });

    // --- run layout ---
    const layout = await runLayout(elkGraph);
    const nodePositions = {};
    layout.children?.forEach(c => {
      nodePositions[c.id] = { x: c.x, y: c.y, height: c.height };
    });

    // --- calculate canvas size ---
    const { width, height } = calculateDimensions(layout, nodeWidth, baseNodeHeight, padding);

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

    setLoading(false);
  };

  // ----------------------for PDF --------------------------
  const exportAsPDF = async () => {
    setLoading(true);
    handleCloseDownload();

    const padding = 50;
    const nodeWidth = 320;
    const baseNodeHeight = 70;
    const contentFontSize = 12;
    const labelFontSize = 16;
    const lineHeight = 18;
    const borderRadius = 12;

    const elkGraph = buildElkGraph(nodes, edges, { nodeWidth, baseNodeHeight, contentFontSize, lineHeight });
    const layout = await runLayout(elkGraph);
    const { width, height } = calculateDimensions(layout, nodeWidth, baseNodeHeight, padding);

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [width, height],
    });

    // draw edges
    pdf.setLineWidth(1.5);
    edges?.forEach(edge => {
      const s = layout.children.find(c => c.id === edge.source);
      const t = layout.children.find(c => c.id === edge.target);
      if (!s || !t) return;
      pdf.line(s.x + nodeWidth / 2, s.y + baseNodeHeight / 2, t.x + nodeWidth / 2, t.y + baseNodeHeight / 2);
    });

    // draw nodes
    layout.children?.forEach(c => {
      const node = nodes?.find(n => n.id === c.id);
      const label = node?.data?.label || "";
      const content = node?.data?.content || "";

      const nodeHeight = c.height;

      const fillColor = nodeColor(node);
      pdf.setFillColor(fillColor);
      pdf.setDrawColor(0, 0, 0);
      pdf.roundedRect(c.x, c.y, nodeWidth, nodeHeight, borderRadius, borderRadius, "FD");

      pdf.setTextColor("#ffffff");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(labelFontSize);
      pdf.text(label, c.x + 10, c.y + 20);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(contentFontSize);
      pdf.setTextColor("#dddddd");
      const wrapped = pdf.splitTextToSize(content, nodeWidth - 20);
      pdf.text(wrapped, c.x + 10, c.y + 40);
    });

    pdf.save(getFileName("mindmap", "pdf"));
    setLoading(false);
  };

  return (
    <Box>
      <Button variant="contained" size="small" startIcon={<DownloadIcon />} fullWidth onClick={handleClickDownload}>Download</Button>
      {/* download menu */}
      <Menu
        anchorEl={anchorDownload}
        open={openDownload}
        onClose={handleCloseDownload}
        autoFocus
        disableAutoFocusItem
      >
        <MenuItem onClick={exporAsImage}>
          <ListItemIcon>
            <ImageIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>IMAGE</ListItemText>
        </MenuItem>
        <MenuItem onClick={exportAsPDF}>
          <ListItemIcon>
            <PictureAsPdfIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>PDF</ListItemText>
        </MenuItem>
        <MenuItem onClick={exportAsJSON}>
          <ListItemIcon>
            <InsertDriveFileIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>JSON</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default ExportMindmap;