import { Box, Button, Dialog, Divider, Stack, Typography } from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

interface DeleteConfirmationDialogProps {
  open: boolean;
  title: string;
  description?: string;
  items?: string[];
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmationDialog({
  open,
  title,
  description,
  items,
  confirmLabel = 'Delete',
  onClose,
  onConfirm,
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          border: '1px solid #ECECEE',
          boxShadow: '0 1px 2px rgba(16,24,40,0.04), 0 40px 80px -24px rgba(16,24,40,0.45)',
        },
      }}
    >
      <Box sx={{ p: { xs: 3, sm: 3.5 } }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
              color: '#DC2626',
              bgcolor: 'rgba(220,38,38,0.10)',
            }}
          >
            <DeleteOutlineRoundedIcon />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
              {title}
            </Typography>
            {description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, lineHeight: 1.6 }}>
                {description}
              </Typography>
            )}
          </Box>
        </Stack>

        {items && items.length > 0 && (
          <Box sx={{ mt: 2, pl: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              This will permanently remove:
            </Typography>
            <Stack spacing={0.75} sx={{ mt: 1 }}>
              {items.map(item => (
                <Stack key={item} direction="row" spacing={1.25} alignItems="center">
                  <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#DC2626', flexShrink: 0 }} />
                  <Typography variant="body2" color="text.secondary">
                    {item}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        )}

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, fontWeight: 600 }}>
          This action cannot be undone.
        </Typography>

        <Divider sx={{ my: 2.5 }} />

        <Stack direction="row" spacing={1.25} justifyContent="flex-end">
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{ fontWeight: 600, borderColor: '#E0E0E3', color: 'text.primary', px: 2.25, '&:hover': { borderColor: '#C9C9CE', bgcolor: '#FAFAFB' } }}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            variant="contained"
            autoFocus
            sx={{
              fontWeight: 700,
              px: 2.5,
              bgcolor: '#DC2626',
              boxShadow: '0 8px 20px -12px rgba(220,38,38,0.8)',
              '&:hover': { bgcolor: '#B91C1C' },
            }}
          >
            {confirmLabel}
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
}
