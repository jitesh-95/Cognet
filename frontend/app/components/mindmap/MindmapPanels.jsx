import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, InputAdornment, List, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Menu, MenuItem, MenuList, Paper, styled, TextField, Typography } from '@mui/material';
import { Panel } from '@xyflow/react';
import React, { useEffect, useState } from 'react'
import ExportMindmap from './ExportMindmap';
import { SearchOutlined } from '@mui/icons-material';
import SouthIcon from '@mui/icons-material/South';
import EastIcon from '@mui/icons-material/East';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { useNotification } from '../../contexts/NotificationProvider';
import { usePathname } from 'next/navigation';

const MindmapPanels = ({ title, isDirty, setIsDirty, onLayout, setCenter, nodes, edges, setExportLoading }) => {
  const { showNotification } = useNotification();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openSearchModal, setOpenSearchModal] = useState(false);
  // search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [results, setResults] = useState([]);
  const open = Boolean(anchorEl);
  const pathname = usePathname();

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleCancelSearch = () => {
    setOpenSearchModal(false);
    setSearchQuery('');
    setResults([]);
  };

  const StyledListHeader = styled(ListSubheader)({
    backgroundImage: 'var(--Paper-overlay)',
  });

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

  // ------------------------search node------------------------------
  const handleSearchNode = () => {
    setOpenSearchModal(true);
    handleClose();
  };

  // -------------------------selecting node for searching--------------------------------
  const handleSelectNode = (node) => {
    setOpenSearchModal(false);
    if (node?.position) {
      const zoom = 1.5;
      setCenter(node.position.x, node.position.y, { zoom, duration: 800 });
    } else {
      showNotification({ message: "Node position not found", status: "error" });
    }
    setResults([]);
    setSearchQuery(""); // clear field
  };

  // saving permanently to localstorage
  const handlePermanentSave = () => {
    setIsDirty(false);
    showNotification({ message: 'Permanently saved successfully.', status: 'success' });
    switch (pathname) {
      case '/url-map': {
        return localStorage.setItem('graph-by-url', JSON.stringify({ graph: { nodes, edges }, title }));
      }
      case '/file-map': {
        return localStorage.setItem('graph-by-file', JSON.stringify({ graph: { nodes, edges }, title }));
      }
    }
  };

  return (
    <>
      {/* title box  */}
      <Panel position="top-left" style={{ maxWidth: 300 }}>
        <Paper elevation={3} sx={{ px: 1.5, py: 1.2, backgroundColor: 'background.iconBackground' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>{title}</Typography>
        </Paper>
      </Panel>

      <Panel position="top-right">
        <Box sx={{ display: 'flex', gap: 2 }}>
          {isDirty && <IconButton size="small" color='inherit' onClick={handlePermanentSave}
            sx={{ backgroundColor: 'primary.main', color: '#fff', '&:hover': { backgroundColor: 'primary.dark' } }}>
            <SaveIcon />
          </IconButton>}

          <IconButton color='inherit' size="small" sx={{ backgroundColor: 'primary.main', color: '#fff', '&:hover': { backgroundColor: 'primary.dark' } }} onClick={handleClick}>
            {open ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        </Box>

        {/* layout menu */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          slotProps={{
            list: {
              'aria-labelledby': 'basic-button',
              sx: {
                py: 0,
              },
            },
          }}
        >
          <MenuList dense>
            {/* layout options */}
            <StyledListHeader sx={{ lineHeight: '30px' }}>Layout</StyledListHeader>
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
            <Divider />

            {/* download options */}
            <StyledListHeader sx={{ lineHeight: '30px' }}>Download</StyledListHeader>
            <ExportMindmap nodes={nodes} edges={edges} setLoading={setExportLoading} closeMenu={handleClose} />
            <Divider />

            {/* search  */}
            <MenuItem onClick={handleSearchNode}>
              <ListItemIcon>
                <SearchOutlined fontSize="small" />
              </ListItemIcon>
              <ListItemText>Search Nodes</ListItemText>
            </MenuItem>

          </MenuList>
        </Menu>
      </Panel>

      {/* search node modal */}
      <Dialog open={openSearchModal} onClose={() => { }} disableEnforceFocus disableRestoreFocus>
        <DialogTitle>Search Node</DialogTitle>
        <DialogContent>
          <TextField
            label="Node Label"
            variant="outlined"
            placeholder='Min 3 Characters'
            autoFocus
            sx={{ width: 250, mt: 1 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                endAdornment:
                  <InputAdornment position="end">{searchLoading ? <CircularProgress size='20px' /> : null}</InputAdornment>
              }
            }}
          />

          {/* list of nodes based on entered query */}
          {results.length > 0 && (
            <List dense sx={{ mt: 1, bgcolor: "background.paper", borderRadius: 1, maxHeight: 200, overflow: "auto" }}>
              {results?.map((node) => (
                <ListItemButton key={node.id} onClick={() => handleSelectNode(node)}>
                  <Typography variant="body2">{node.data?.label}</Typography>
                </ListItemButton>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelSearch}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default MindmapPanels;