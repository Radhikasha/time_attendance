import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField,
  Chip,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Check as CheckIcon, 
  Close as CloseIcon, 
  Visibility as VisibilityIcon 
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getAllAttendanceRequests, 
  updateAttendanceRequestStatus 
} from '../../features/attendance/attendanceSlice';
import { toast } from 'react-toastify';

const AttendanceRequests = () => {
  const dispatch = useDispatch();
  const { allRequests, loading } = useSelector((state) => state.attendance);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [status, setStatus] = useState('pending');
  const [adminComment, setAdminComment] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);

  useEffect(() => {
    dispatch(getAllAttendanceRequests(status));
  }, [dispatch, status]);

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };

  const handleApprove = async (request) => {
    try {
      await dispatch(updateAttendanceRequestStatus({
        requestId: request._id,
        status: 'approved',
        adminComment: adminComment || 'Request approved by admin'
      })).unwrap();
      
      toast.success('Request approved successfully');
      setOpenDialog(false);
      setAdminComment('');
    } catch (error) {
      toast.error(error || 'Failed to approve request');
    }
  };

  const handleReject = async (request) => {
    try {
      if (!adminComment.trim()) {
        toast.error('Please provide a reason for rejection');
        return;
      }
      
      await dispatch(updateAttendanceRequestStatus({
        requestId: request._id,
        status: 'rejected',
        adminComment
      })).unwrap();
      
      toast.success('Request rejected successfully');
      setOpenDialog(false);
      setAdminComment('');
    } catch (error) {
      toast.error(error || 'Failed to reject request');
    }
  };

  const handleOpenDialog = (request, action) => {
    setSelectedRequest(request);
    setOpenDialog(true);
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setOpenViewDialog(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Attendance Requests
          </Typography>
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={status}
              label="Filter by Status"
              onChange={handleStatusChange}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="">All Requests</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Paper elevation={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : allRequests.length > 0 ? (
                  allRequests.map((request) => (
                    <TableRow key={request._id}>
                      <TableCell>
                        {request.user?.name || 'N/A'}
                        <Typography variant="body2" color="text.secondary">
                          {request.user?.employeeId || ''}
                        </Typography>
                      </TableCell>
                      <TableCell>{request.type}</TableCell>
                      <TableCell>{formatDate(request.date)}</TableCell>
                      <TableCell>
                        {request.type === 'regularization' && (
                          <>
                            <div>In: {formatTime(request.checkIn)}</div>
                            <div>Out: {formatTime(request.checkOut)}</div>
                          </>
                        )}
                        {request.type !== 'regularization' && 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={request.status} 
                          color={getStatusColor(request.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              color="info"
                              onClick={() => handleViewDetails(request)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          {request.status === 'pending' && (
                            <>
                              <Tooltip title="Approve">
                                <IconButton 
                                  size="small" 
                                  color="success"
                                  onClick={() => handleApprove(request)}
                                >
                                  <CheckIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="Reject">
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => handleReject(request)}
                                >
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No {status ? status : ''} requests found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* View Details Dialog */}
      <Dialog 
        open={openViewDialog} 
        onClose={() => setOpenViewDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Request Details</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Employee:</strong> {selectedRequest.user?.name || 'N/A'}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Employee ID:</strong> {selectedRequest.user?.employeeId || 'N/A'}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Request Type:</strong> {selectedRequest.type}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Date:</strong> {formatDate(selectedRequest.date)}
              </Typography>
              
              {selectedRequest.type === 'regularization' && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Check-in:</strong> {formatTime(selectedRequest.checkIn)}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Check-out:</strong> {formatTime(selectedRequest.checkOut)}
                  </Typography>
                </>
              )}
              
              <Typography variant="subtitle1" gutterBottom>
                <strong>Status:</strong>{' '}
                <Chip 
                  label={selectedRequest.status} 
                  color={getStatusColor(selectedRequest.status)}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                <strong>Reason:</strong>
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 2, backgroundColor: 'grey.50' }}>
                {selectedRequest.reason || 'No reason provided'}
              </Paper>
              
              {selectedRequest.adminComment && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Admin Comment:</strong>
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'grey.50' }}>
                    {selectedRequest.adminComment}
                  </Paper>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Approval/Rejection Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Comment (Optional)</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Comment"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
            placeholder="Add any additional comments..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => handleReject(selectedRequest)}
            color="error"
            variant="outlined"
          >
            Reject
          </Button>
          <Button 
            onClick={() => handleApprove(selectedRequest)}
            color="primary"
            variant="contained"
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AttendanceRequests;
