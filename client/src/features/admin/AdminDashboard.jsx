import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  Link
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon
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
  
  // Fetch data on component mount
  useEffect(() => {
    if (user?.role === 'admin') {
      dispatch(fetchDashboardSummary());
      dispatch(fetchEmployees());
      dispatch(fetchLeaveRequests());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (user?.role === 'admin') {
      dispatch(fetchDashboardSummary());
      dispatch(fetchEmployees());
      dispatch(fetchLeaveRequests());
    }
  }, [dispatch, user]);

  // Format date to local string
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleApproveLeave = (leaveId) => {
    dispatch(updateLeaveStatus({ leaveId, status: 'approved' }));
  };

  const handleRejectLeave = (leaveId) => {
    dispatch(updateLeaveStatus({ leaveId, status: 'rejected' }));
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
              {loading ? (
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
                    <TableCell>{formatDate(employee.createdAt)}</TableCell>
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
