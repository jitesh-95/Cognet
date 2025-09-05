import { Box, Button, Paper, Typography } from "@mui/material";
import { Handle, NodeToolbar } from "@xyflow/react";

export const RootNode = (props) => {
  return (<>
    <NodeToolbar>
      <Button size="small" variant='contained' sx={{ p: 0, minWidth: '45px' }} onClick={() => props.onEdit(props)}>Edit</Button>
    </NodeToolbar>
    <Box sx={{ position: 'relative' }}>
      <Paper sx={{
        p: 1,
        textAlign: 'center',
        gap: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: "background.rootNode"
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>{props?.data?.label}</Typography>
        <Typography variant="body2">{props?.data?.content}</Typography>
      </Paper>
      <Handle type='source' position={props?.sourcePosition} style={{ position: "absolute" }} />
      <Handle type='target' position={props?.targetPosition} style={{ position: "absolute" }} />
    </Box>
  </>
  );
};

export const SubNode = (props) => {
  return (<>
    <NodeToolbar>
      <Button size="small" variant='contained' sx={{ p: 0, minWidth: '45px' }} onClick={() => props.onEdit(props)}>Edit</Button>
    </NodeToolbar>
    <Box sx={{ position: 'relative' }}>
      <Paper sx={{
        p: 1,
        textAlign: 'center',
        gap: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: "background.subNode"
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>{props?.data?.label}</Typography>
        <Typography variant="body2">{props?.data?.content}</Typography>
      </Paper>
      <Handle type='source' position={props?.sourcePosition} style={{ position: "absolute" }} />
      <Handle type='target' position={props?.targetPosition} style={{ position: "absolute" }} />
    </Box>
  </>
  );
};

export const DetailNode = (props) => {
  return (<>
    <NodeToolbar>
      <Button size="small" variant='contained' sx={{ p: 0, minWidth: '45px' }} onClick={() => props.onEdit(props)}>Edit</Button>
    </NodeToolbar>
    <Box sx={{ position: 'relative' }}>
      <Paper sx={{
        p: 1,
        textAlign: 'center',
        gap: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: "background.detailNode"
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>{props?.data?.label}</Typography>
        <Typography variant="body2">{props?.data?.content}</Typography>
      </Paper>
      <Handle type='source' position={props?.sourcePosition} style={{ position: "absolute" }} />
      <Handle type='target' position={props?.targetPosition} style={{ position: "absolute" }} />
    </Box>
  </>
  );
};