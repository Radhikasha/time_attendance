import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Button,
  Chip,
  CircularProgress,
  Avatar,
  IconButton,
  Link,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  EventNote as EventNoteIcon
} from '@mui/icons-material';
import {
  clearError as clearAdminError,
  fetchDashboardSummary,
  fetchEmployees,
  fetchEmployeeAttendance,
  fetchLeaveRequests,
  updateLeaveStatus
} from './adminSlice';

const SummaryCard = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <div>
          <Typography color="textSecondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4">{value}</Typography>
        </div>
        <Box
          bgcolor={`${color}.light`}
          color={`${color}.contrastText`}
          p={2}
          borderRadius="50%"
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { 
    summary, 
    employees, 
    leaveRequests, 
    loading,
    error 
  } = useSelector((state) => state.admin);
  const { user } = useSelector((state) => state.auth);
  
  // Debug logs
  useEffect(() => {
    console.log('Employees data:', employees);
    console.log('Leave requests data:', leaveRequests);
    console.log('Loading state:', loading);
    console.log('Error state:', error);
    
    // Check if we're getting any data at all
    if (employees && employees.length > 0) {
      console.log('First employee:', employees[0]);
    }
    
    if (leaveRequests && leaveRequests.length > 0) {
      console.log('First leave request:', leaveRequests[0]);
    }
  }, [employees, leaveRequests, loading, error]);

  // Fetch all leave requests
  const fetchAllLeaveRequests = async () => {
    try {
      console.log('Fetching leave requests from: http://localhost:5002/api/leaves');
      const token = localStorage.getItem('token');
      console.log('Using token:', token ? 'Token exists' : 'No token found');
      
      const response = await fetch('http://localhost:5002/api/leaves', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include' // Important for cookies/sessions
      });
      
      console.log('Leave requests response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch leave requests: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Received leave requests data:', data);
      
      dispatch({
        type: 'admin/fetchLeaveRequests/fulfilled',
        payload: Array.isArray(data) ? data : [data] // Ensure payload is an array
      });
      
    } catch (error) {
      console.error('Error in fetchAllLeaveRequests:', error);
      toast.error(`Error: ${error.message}`);
    }
  };

  // Handle approve/reject leave
  const handleUpdateLeaveStatus = async (leaveId, status) => {
    try {
      const response = await fetch(`http://localhost:5002/api/leaves/${leaveId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update leave status');
      }
      
      const updatedLeave = await response.json();
      
      // Update the leave in Redux store
      dispatch({
        type: 'admin/updateLeaveStatus/fulfilled',
        payload: updatedLeave
      });
      
      toast.success(`Leave request ${status} successfully`);
      
      // Refresh the list
      await fetchAllLeaveRequests();
      
    } catch (error) {
      console.error('Error updating leave status:', error);
      toast.error(error.message || 'Failed to update leave status');
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    console.log('Component mounted, user role:', user?.role);
    
    const fetchData = async () => {
      if (user?.role === 'admin') {
        try {
          console.log('Starting to fetch admin data...');
          
          // Fetch data sequentially for better error tracking
          try {
            console.log('Fetching dashboard summary...');
            await dispatch(fetchDashboardSummary());
          } catch (err) {
            console.error('Error fetching dashboard summary:', err);
          }
          
          try {
            console.log('Fetching employees...');
            await dispatch(fetchEmployees());
          } catch (err) {
            console.error('Error fetching employees:', err);
          }
          
          try {
            console.log('Fetching leave requests...');
            await fetchAllLeaveRequests();
          } catch (err) {
            console.error('Error fetching leave requests:', err);
          }
        } catch (err) {
          console.error('Error fetching admin data:', err);
        }
      }
    };

    fetchData();
  }, [dispatch, user]);

  const handleApproveLeave = (leaveId) => {
    handleUpdateLeaveStatus(leaveId, 'approved');
  };

  const handleRejectLeave = (leaveId) => {
    handleUpdateLeaveStatus(leaveId, 'rejected');
  };

  // Calculate working days between two dates
  const getWorkingDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    let count = 0;
    const curDate = new Date(start);
    
    while (curDate <= end) {
      const dayOfWeek = curDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
      curDate.setDate(curDate.getDate() + 1);
    }
    
    return count;
  };
  
  // Format date to readable string with time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  // Show loading state for dashboard
  if (loading.dashboard && !summary) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="error" gutterBottom>
          {error.message || 'An error occurred'}
        </Typography>
        {error.details && (
          <Box mt={2} p={2} bgcolor="#ffeeee" borderRadius={1}>
            <Typography variant="body2" color="error">
              {typeof error.details === 'object' 
                ? JSON.stringify(error.details, null, 2) 
                : error.details}
            </Typography>
          </Box>
        )}
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={() => {
            dispatch(clearAdminError());
            dispatch(fetchLeaveRequests());
          }}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <SummaryCard 
            title="Total Employees" 
            value={summary?.totalEmployees || 0} 
            icon={<Typography variant="h5">👥</Typography>}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryCard 
            title="Present Today" 
            value={summary?.presentToday || 0} 
            icon={<Typography variant="h5">✅</Typography>}
            color="success"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryCard 
            title="Pending Leaves" 
            value={summary?.pendingLeaves || 0} 
            icon={<Typography variant="h5">📅</Typography>}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Employees Table */}
      <Card sx={{ mb: 4 }}>
        <CardHeader 
          title={
            <Box display="flex" alignItems="center">
              <span>Employees</span>
              {loading.employees && (
                <CircularProgress size={24} sx={{ ml: 2 }} />
              )}
            </Box>
          }
          action={
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => dispatch(fetchEmployees())}
              disabled={loading.employees}
              startIcon={<RefreshIcon />}
            >
              {loading.employees ? 'Refreshing...' : 'Refresh'}
            </Button>
          }
        />
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Join Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading.employees ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress size={24} />
                    <Typography variant="body2" sx={{ mt: 1 }}>Loading employees...</Typography>
                  </TableCell>
                </TableRow>
              ) : employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body1" color="textSecondary">
                      No employees found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((employee) => (
                  <TableRow key={employee._id} hover>
                    <TableCell>{employee.employeeId || 'N/A'}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar 
                          sx={{ width: 32, height: 32, mr: 2, bgcolor: 'primary.main' }}
                        >
                          {employee.name ? employee.name.charAt(0).toUpperCase() : 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{employee.name}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {employee.role === 'admin' ? 'Administrator' : 'Employee'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Link href={`mailto:${employee.email}`} underline="hover">
                        {employee.email}
                      </Link>
                    </TableCell>
                    <TableCell>{employee.department || 'N/A'}</TableCell>
                    <TableCell>{employee.position || 'N/A'}</TableCell>
                    <TableCell>{formatDateTime(employee.createdAt)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={employee.isActive !== false ? 'Active' : 'Inactive'} 
                        color={employee.isActive !== false ? 'success' : 'default'}
                        size="small"
                        variant={employee.isActive === false ? 'outlined' : 'filled'}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          // View employee details
                          navigate(`/employees/${employee._id}`);
                        }}
                        title="View Details"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          // Edit employee
                          navigate(`/employees/${employee._id}/edit`);
                        }}
                        title="Edit"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {employees.length > 0 && (
          <Box p={2} display="flex" justifyContent="flex-end">
            <Typography variant="body2" color="textSecondary">
              Showing {employees.length} of {summary?.totalEmployees || 0} employees
            </Typography>
          </Box>
        )}
      </Card>

      {/* Leave Requests Management */}
      <Grid item xs={12}>
        <Card>
          <CardHeader 
            title="Pending Leave Requests"
            action={
              <Button 
                variant="outlined" 
                color="primary" 
                size="small" 
                startIcon={<RefreshIcon />}
                onClick={() => dispatch(fetchLeaveRequests())}
                disabled={loading.leaves}
              >
                Refresh
              </Button>
            }
          />
          <CardContent>
            {loading.leaves ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : leaveRequests && leaveRequests.length > 0 ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee</TableCell>
                      <TableCell>Leave Type</TableCell>
                      <TableCell>Period</TableCell>
                      <TableCell>Days</TableCell>
                      <TableCell>Reason</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leaveRequests
                      .filter(leave => leave.status === 'pending')
                      .map((leave) => (
                        <TableRow key={leave._id}>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar 
                                src={leave.employee?.avatar} 
                                alt={leave.employee?.name}
                                sx={{ width: 32, height: 32, mr: 1 }}
                              />
                              <Box>
                                <Typography variant="body2">
                                  {leave.employee?.name || 'N/A'}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {leave.employee?.position || ''}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>{leave.type || 'N/A'}</TableCell>
                          <TableCell>
                            {formatDateTime(leave.startDate)} - {formatDateTime(leave.endDate)}
                          </TableCell>
                          <TableCell>
                            {getWorkingDays(leave.startDate, leave.endDate)} days
                          </TableCell>
                          <TableCell>
                            <Tooltip title={leave.reason || 'No reason provided'}>
                              <IconButton size="small">
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={leave.status}
                              color={
                                leave.status === 'approved' 
                                  ? 'success' 
                                  : leave.status === 'rejected' 
                                    ? 'error' 
                                    : 'warning'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={1}>
                              {leave.status === 'pending' ? (
                                <>
                                  <Tooltip title="Approve">
                                    <IconButton 
                                      size="small" 
                                      color="success"
                                      onClick={() => handleApproveLeave(leave._id)}
                                    >
                                      <CheckIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Reject">
                                    <IconButton 
                                      size="small" 
                                      color="error"
                                      onClick={() => handleRejectLeave(leave._id)}
                                    >
                                      <CloseIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              ) : (
                                <Tooltip title={`Request ${leave.status}`}>
                                  <Chip 
                                    label={leave.status.toUpperCase()} 
                                    color={
                                      leave.status === 'approved' 
                                        ? 'success' 
                                        : leave.status === 'rejected' 
                                          ? 'error' 
                                          : 'default'
                                    }
                                    size="small"
                                    variant="outlined"
                                  />
                                </Tooltip>
                              )}
                              <Tooltip title="View Details">
                                <IconButton 
                                  size="small" 
                                  color="info"
                                  onClick={() => {
                                    // Show leave details in a dialog
                                    console.log('View leave details:', leave);
                                  }}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box textAlign="center" p={3}>
                <EventNoteIcon color="action" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  No Pending Leave Requests
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  There are no leave requests pending your approval.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Pending Leave Requests */}
      <Card>
        <CardHeader title="Pending Leave Requests" />
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaveRequests
                .filter(leave => leave.status === 'pending')
                .map((leave) => (
                  <TableRow key={leave._id}>
                    <TableCell>{leave.user?.name || 'N/A'}</TableCell>
                    <TableCell>{leave.leaveType}</TableCell>
                    <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>{leave.reason}</TableCell>
                    <TableCell>
                      <Chip 
                        label={leave.status} 
                        color={
                          leave.status === 'approved' ? 'success' : 
                          leave.status === 'rejected' ? 'error' : 'warning'
                        } 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="small" 
                        color="success" 
                        variant="outlined" 
                        sx={{ mr: 1 }}
                        onClick={() => handleApproveLeave(leave._id)}
                      >
                        Approve
                      </Button>
                      <Button 
                        size="small" 
                        color="error" 
                        variant="outlined"
                        onClick={() => handleRejectLeave(leave._id)}
                      >
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default AdminDashboard;
