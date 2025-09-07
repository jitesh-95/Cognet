"use client";

import { Box, Button, Paper, Typography } from "@mui/material";
import { Handle, NodeToolbar } from "@xyflow/react";
import { motion } from "framer-motion";

const nodeVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: "easeOut" } },
};

export const RootNode = (props) => {
  return (
    <motion.div initial="hidden" animate="visible" variants={nodeVariants}>
      <NodeToolbar>
        <Button
          size="small"
          variant="contained"
          sx={{ p: 0, minWidth: "45px" }}
          onClick={() => props.onEdit(props)}
        >
          Edit
        </Button>
      </NodeToolbar>
      <Box sx={{ position: "relative" }}>
        <Paper
          sx={{
            p: 1,
            textAlign: "center",
            gap: 1,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "background.rootNode",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {props?.data?.label}
          </Typography>
          <Typography variant="body2">{props?.data?.content}</Typography>
        </Paper>
        <Handle
          type="source"
          position={props?.sourcePosition}
          style={{ position: "absolute" }}
        />
        <Handle
          type="target"
          position={props?.targetPosition}
          style={{ position: "absolute" }}
        />
      </Box>
    </motion.div>
  );
};

export const SubNode = (props) => {
  return (
    <motion.div initial="hidden" animate="visible" variants={nodeVariants}>
      <NodeToolbar>
        <Button
          size="small"
          variant="contained"
          sx={{ p: 0, minWidth: "45px" }}
          onClick={() => props.onEdit(props)}
        >
          Edit
        </Button>
      </NodeToolbar>
      <Box sx={{ position: "relative" }}>
        <Paper
          sx={{
            p: 1,
            textAlign: "center",
            gap: 1,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "background.subNode",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {props?.data?.label}
          </Typography>
          <Typography variant="body2">{props?.data?.content}</Typography>
        </Paper>
        <Handle
          type="source"
          position={props?.sourcePosition}
          style={{ position: "absolute" }}
        />
        <Handle
          type="target"
          position={props?.targetPosition}
          style={{ position: "absolute" }}
        />
      </Box>
    </motion.div>
  );
};

export const DetailNode = (props) => {
  return (
    <motion.div initial="hidden" animate="visible" variants={nodeVariants}>
      <NodeToolbar>
        <Button
          size="small"
          variant="contained"
          sx={{ p: 0, minWidth: "45px" }}
          onClick={() => props.onEdit(props)}
        >
          Edit
        </Button>
      </NodeToolbar>
      <Box sx={{ position: "relative" }}>
        <Paper
          sx={{
            p: 1,
            textAlign: "center",
            gap: 1,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "background.detailNode",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {props?.data?.label}
          </Typography>
          <Typography variant="body2">{props?.data?.content}</Typography>
        </Paper>
        <Handle
          type="source"
          position={props?.sourcePosition}
          style={{ position: "absolute" }}
        />
        <Handle
          type="target"
          position={props?.targetPosition}
          style={{ position: "absolute" }}
        />
      </Box>
    </motion.div>
  );
};
