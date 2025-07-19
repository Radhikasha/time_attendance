import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Divider,
  Badge
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  Pending as PendingIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, subDays } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const LeaveRequests = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState({
    from: null,
    to: null
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');
  const [adminComment, setAdminComment] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Mock data - replace with actual data from your API
  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 1,
      employee: { id: 1, name: 'John Doe', email: 'john@example.com' },
      leaveType: 'Annual Leave',
      startDate: '2023-07-15',
      endDate: '2023-07-18',
      days: 4,
      reason: 'Family vacation',
      status: 'pending',
      appliedOn: '2023-07-10T10:30:00Z',
      adminComment: ''
    },
    {
      id: 2,
      employee: { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      leaveType: 'Sick Leave',
      startDate: '2023-07-12',
      endDate: '2023-07-12',
      days: 1,
      reason: 'Doctor appointment',
      status: 'approved',
      appliedOn: '2023-07-09T14:20:00Z',
      adminComment: 'Approved as per policy'
    },
    {
      id: 3,
      employee: { id: 3, name: 'Mike Johnson', email: 'mike@example.com' },
      leaveType: 'Casual Leave',
      startDate: '2023-07-20',
      endDate: '2023-07-21',
      days: 2,
      reason: 'Personal work',
      status: 'rejected',
      appliedOn: '2023-07-08T09:15:00Z',
      adminComment: 'Rejected due to project deadline'
    },
    {
      id: 4,
      employee: { id: 4, name: 'Sarah Williams', email: 'sarah@example.com' },
      leaveType: 'Maternity Leave',
      startDate: '2023-08-01',
      endDate: '2023-11-30',
      days: 90,
      reason: 'Maternity leave',
      status: 'pending',
      appliedOn: '2023-07-05T11:45:00Z',
      adminComment: ''
    },
    {
      id: 5,
      employee: { id: 5, name: 'David Brown', email: 'david@example.com' },
      leaveType: 'Work From Home',
      startDate: '2023-07-17',
      endDate: '2023-07-17',
      days: 1,
      reason: 'Home maintenance work',
      status: 'approved',
      appliedOn: '2023-07-11T16:20:00Z',
      adminComment: 'Approved for one day'
    },
  ]);

  // Filter leave requests based on search and filters
  const filteredRequests = leaveRequests.filter(request => {
    // Filter by status
    if (statusFilter !== 'all' && request.status !== statusFilter) {
      return false;
    }
    
    // Filter by search term (employee name or email)
    if (searchTerm && 
        !request.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !request.employee.email.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by date range
    if (dateFilter.from || dateFilter.to) {
      const startDate = dateFilter.from ? new Date(dateFilter.from) : null;
      const endDate = dateFilter.to ? new Date(dateFilter.to) : null;
      const requestStartDate = new Date(request.startDate);
      
      if (startDate && requestStartDate < startDate) return false;
      if (endDate && requestStartDate > endDate) return false;
    }
    
    return true;
  });

  // Calculate summary stats
  const summaryStats = {
    total: leaveRequests.length,
    pending: leaveRequests.filter(r => r.status === 'pending').length,
    approved: leaveRequests.filter(r => r.status === 'approved').length,
    rejected: leaveRequests.filter(r => r.status === 'rejected').length,
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleDateFilterChange = (date, field) => {
    setDateFilter(prev => ({
      ...prev,
      [field]: date
    }));
    setPage(0);
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setViewDialogOpen(true);
  };

  const handleActionClick = (request, action) => {
    setSelectedRequest(request);
    setSelectedAction(action);
    setAdminComment('');
    setActionDialogOpen(true);
  };

  const handleActionConfirm = () => {
    if (!selectedRequest) return;
    
    // Update the leave request status
    const updatedRequests = leaveRequests.map(request => {
      if (request.id === selectedRequest.id) {
        return {
          ...request,
          status: selectedAction,
          adminComment: adminComment || request.adminComment,
          processedOn: new Date().toISOString()
        };
      }
      return request;
    });
    
    setLeaveRequests(updatedRequests);
    setActionDialogOpen(false);
    setViewDialogOpen(false);
    
    toast.success(`Leave request ${selectedAction} successfully`);
  };

  const handleRefresh = () => {
    // Refresh data from API
    console.log('Refreshing leave requests...');
    // Add your API call here
  };

  const handleExport = () => {
    // Export functionality
    console.log('Exporting leave requests...');
    toast.success('Export started successfully');
  };

  const getStatusChip = (status) => {
    const statusMap = {
      pending: { label: 'Pending', color: 'warning', icon: <PendingIcon /> },
      approved: { label: 'Approved', color: 'success', icon: <CheckIcon /> },
      rejected: { label: 'Rejected', color: 'error', icon: <CloseIcon /> },
      cancelled: { label: 'Cancelled', color: 'default', icon: <EventBusyIcon /> },
    };

    const statusInfo = statusMap[status] || { label: status, color: 'default', icon: null };
    
    return (
      <Chip 
        icon={statusInfo.icon}
        label={statusInfo.label}
        color={statusInfo.color}
        size="small"
        variant="outlined"
      />
    );
  };

  const getLeaveTypeColor = (type) => {
    const typeMap = {
      'annual': 'primary',
      'sick': 'secondary',
      'casual': 'info',
      'maternity': 'success',
      'paternity': 'success',
      'unpaid': 'error',
      'work from home': 'warning',
    };

    return typeMap[type.toLowerCase()] || 'default';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Leave Requests</Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={handleRefresh}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<FileDownloadIcon />}
            onClick={handleExport}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Requests</Typography>
              <Typography variant="h5">{summaryStats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Pending</Typography>
              <Typography variant="h5" color="warning.main">
                {summaryStats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Approved</Typography>
              <Typography variant="h5" color="success.main">
                {summaryStats.approved}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Rejected</Typography>
              <Typography variant="h5" color="error.main">
                {summaryStats.rejected}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <SearchIcon color="action" sx={{ mr: 1 }} />
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="From Date"
                value={dateFilter.from}
                onChange={(date) => handleDateFilterChange(date, 'from')}
                renderInput={(params) => (
                  <TextField {...params} fullWidth size="small" />
                )}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="To Date"
                value={dateFilter.to}
                onChange={(date) => handleDateFilterChange(date, 'to')}
                renderInput={(params) => (
                  <TextField {...params} fullWidth size="small" />
                )}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select
              fullWidth
              variant="outlined"
              size="small"
              label="Status"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              InputProps={{
                startAdornment: (
                  <FilterIcon color="action" sx={{ mr: 1 }} />
                ),
              }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDateFilter({ from: null, to: null });
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Leave Requests Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Leave Type</TableCell>
              <TableCell>Date Range</TableCell>
              <TableCell>Days</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Applied On</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRequests.length > 0 ? (
              filteredRequests
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((request) => (
                  <TableRow key={request.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{request.employee.name}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {request.employee.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={request.leaveType}
                        color={getLeaveTypeColor(request.leaveType)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                        {request.startDate} to {request.endDate}
                      </Box>
                    </TableCell>
                    <TableCell>{request.days} day{request.days > 1 ? 's' : ''}</TableCell>
                    <TableCell>
                      {getStatusChip(request.status)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(request.appliedOn), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small"
                            onClick={() => handleViewRequest(request)}
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
                                onClick={() => handleActionClick(request, 'approved')}
                              >
                                <CheckIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton 
                                size="small"
                                color="error"
                                onClick={() => handleActionClick(request, 'rejected')}
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
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <EventAvailableIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                    <Typography variant="subtitle1" color="textSecondary">
                      No leave requests found
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      {searchTerm || statusFilter !== 'all' || dateFilter.from || dateFilter.to 
                        ? 'Try adjusting your search or filter criteria'
                        : 'All caught up! No pending leave requests.'}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredRequests.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* View Leave Request Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Leave Request Details
          {selectedRequest && (
            <Chip 
              label={selectedRequest.status.toUpperCase()} 
              color={
                selectedRequest.status === 'approved' ? 'success' :
                selectedRequest.status === 'rejected' ? 'error' : 'warning'
              }
              size="small"
              sx={{ ml: 2, textTransform: 'uppercase' }}
            />
          )}
        </DialogTitle>
        <DialogContent dividers>
          {selectedRequest && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Employee</Typography>
                  <Typography gutterBottom>{selectedRequest.employee.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Employee ID</Typography>
                  <Typography gutterBottom>{selectedRequest.employee.id}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Leave Type</Typography>
                  <Typography gutterBottom>{selectedRequest.leaveType}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Duration</Typography>
                  <Typography gutterBottom>
                    {selectedRequest.days} day{selectedRequest.days > 1 ? 's' : ''}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">From</Typography>
                  <Typography gutterBottom>
                    {format(new Date(selectedRequest.startDate), 'EEEE, MMMM d, yyyy')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">To</Typography>
                  <Typography gutterBottom>
                    {format(new Date(selectedRequest.endDate), 'EEEE, MMMM d, yyyy')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Reason</Typography>
                  <Typography paragraph>{selectedRequest.reason}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Applied On</Typography>
                  <Typography>
                    {format(new Date(selectedRequest.appliedOn), 'MMMM d, yyyy hh:mm a')}
                  </Typography>
                </Grid>
                {selectedRequest.status !== 'pending' && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      {selectedRequest.status === 'approved' ? 'Approval' : 'Rejection'} Note
                    </Typography>
                    <Typography>
                      {selectedRequest.adminComment || 'No comments provided.'}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setViewDialogOpen(false)}
            color="inherit"
          >
            Close
          </Button>
          {selectedRequest?.status === 'pending' && (
            <>
              <Button 
                onClick={() => handleActionClick(selectedRequest, 'approved')}
                variant="contained"
                color="success"
                startIcon={<CheckIcon />}
              >
                Approve
              </Button>
              <Button 
                onClick={() => handleActionClick(selectedRequest, 'rejected')}
                variant="contained"
                color="error"
                startIcon={<CloseIcon />}
              >
                Reject
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog 
        open={actionDialogOpen} 
        onClose={() => setActionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedAction === 'approved' ? 'Approve' : 'Reject'} Leave Request
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            You are about to {selectedAction} the leave request for {selectedRequest?.employee.name}.
            {selectedAction === 'rejected' && ' Please provide a reason for rejection.'}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label={selectedAction === 'approved' ? 'Comments (Optional)' : 'Reason for Rejection*'}
            type="text"
            fullWidth
            multiline
            rows={3}
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
            variant="outlined"
            required={selectedAction === 'rejected'}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setActionDialogOpen(false)}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleActionConfirm}
            variant="contained"
            color={selectedAction === 'approved' ? 'success' : 'error'}
            disabled={selectedAction === 'rejected' && !adminComment.trim()}
          >
            Confirm {selectedAction}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveRequests;
