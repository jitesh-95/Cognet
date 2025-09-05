import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";
import { useState, useEffect } from "react";

const EditNode = ({ open, node, onClose, onCancel, onSave }) => {
  const [label, setLabel] = useState("");
  const [content, setContent] = useState("");

  const LABEL_MAX = 50;
  const CONTENT_MAX = 200;

  useEffect(() => {
    if (node) {
      setLabel(node?.label || "");
      setContent(node?.content || "");
    }
  }, [node]);

  const handleSave = () => {
    if (!node) return;
    onSave({ label, content });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} disableEnforceFocus disableRestoreFocus>
      <DialogTitle>Edit Node</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          name="label"
          label="Label"
          size="small"
          fullWidth
          autoFocus
          value={label}
          onChange={(e) => {
            if (e.target.value.length <= LABEL_MAX) setLabel(e.target.value);
          }}
        />
        <TextField
          margin="dense"
          name="content"
          label="Content"
          size="small"
          multiline
          rows={4} // textarea height
          fullWidth
          value={content}
          onChange={(e) => {
            if (e.target.value.length <= CONTENT_MAX) setContent(e.target.value);
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditNode;