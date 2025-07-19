import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Button,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import AdminDashboard from '../features/admin/AdminDashboard';
import RealTimeClock from '../components/common/RealTimeClock';
import {
  AccessTime as AccessTimeIcon,
  EventBusy as EventBusyIcon,
  EventAvailable as EventAvailableIcon,
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  EventNote as EventNoteIcon,
  PendingActions as PendingActionsIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { 
  checkIn, 
  checkOut, 
  getMyAttendance,
  getTodaysAttendance,
  setTodayAttendance
} from '../features/attendance/attendanceSlice';
import { format, parseISO, differenceInHours, differenceInMinutes } from 'date-fns';

// Mock data for leave requests - all start as 'pending' until approved by admin
const mockLeaveRequests = [
  {
    id: 'LR-' + Math.floor(1000 + Math.random() * 9000),
    type: 'Sick Leave',
    startDate: '2025-07-10',
    endDate: '2025-07-12',
    status: 'pending',
    submittedDate: new Date().toISOString().split('T')[0],
    days: 3
  },
  {
    id: 'LR-' + Math.floor(1000 + Math.random() * 9000),
    type: 'Vacation',
    startDate: '2025-07-20',
    endDate: '2025-07-25',
    status: 'pending',
    submittedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    days: 5
  },
  {
    id: 'LR-' + Math.floor(1000 + Math.random() * 9000),
    type: 'Personal Leave',
    startDate: '2025-06-28',
    endDate: '2025-06-28',
    status: 'pending',
    submittedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    days: 1
  }
];

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [openLeaveStatus, setOpenLeaveStatus] = useState(false);
  const [loadingLeaveRequests, setLoadingLeaveRequests] = useState(false);
  
  // Navigate to leave request page
  const handleRequestLeave = () => {
    setOpenLeaveStatus(false);
    navigate('/attendance/request');
  };
  
  // Open leave status dialog
  const handleViewLeaveStatus = () => {
    setOpenLeaveStatus(true);
    fetchEmployeeLeaveRequests();
  };
  
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Format date range for leave requests
  const formatLeaveDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get status chip for leave request
  const getStatusChip = (status) => {
    const statusMap = {
      pending: { label: 'Pending', color: 'warning', icon: <PendingActionsIcon /> },
      approved: { label: 'Approved', color: 'success', icon: <CheckCircleOutlineIcon /> },
      rejected: { label: 'Rejected', color: 'error', icon: null }
    };
    
    const statusInfo = statusMap[status] || { label: 'Unknown', color: 'default' };
    
    return (
      <Chip
        label={statusInfo.label}
        color={statusInfo.color}
        icon={statusInfo.icon}
        variant="outlined"
        size="small"
        sx={{ minWidth: 100 }}
      />
    );
  };
  
  const { user } = useSelector((state) => state.auth);
  const { attendance, todayAttendance, loading, error } = useSelector((state) => state.attendance);
  
  // Fetch employee's leave requests
  const fetchEmployeeLeaveRequests = async () => {
    if (!user) return;
    
    setLoadingLeaveRequests(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5002/api/leaves/me`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch leave requests');
      }
      
      const data = await response.json();
      setLeaveRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      showSnackbar('Failed to load leave requests', 'error');
    } finally {
      setLoadingLeaveRequests(false);
    }
  };
  
  const [isLoading, setIsLoading] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Show snackbar message
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Handle check-in
  const handleCheckIn = async () => {
    try {
      setIsLoading(true);
      console.log('🔵 Starting check-in process...');
      
      await dispatch(checkIn()).unwrap();
      console.log('✅ Check-in action completed');
      
      // Force refresh the attendance data after check-in
      console.log('🔄 Refreshing attendance data...');
      await dispatch(getTodaysAttendance());
      await dispatch(getMyAttendance());
      
      console.log('✅ Attendance data refreshed');
      showSnackbar('Checked in successfully', 'success');
    } catch (error) {
      console.error('❌ Check-in failed:', error);
      
      // Handle specific error messages
      if (error.includes('already completed attendance')) {
        showSnackbar('Attendance already completed for today. Next check-in available tomorrow.', 'info');
      } else if (error.includes('already checked in')) {
        showSnackbar('You have already checked in today. You can now check out.', 'warning');
      } else {
        showSnackbar(error.message || 'Failed to check in', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle check-out
  const handleCheckOut = async () => {
    try {
      setIsLoading(true);
      
      // Make sure we have the latest attendance data
      await dispatch(getTodaysAttendance());
      
      // Get the current attendance record
      const currentAttendance = todayAttendance;
      
      if (!currentAttendance?._id) {
        throw new Error('No active check-in found for today. Please check in first.');
      }
      
      if (currentAttendance.checkOut) {
        throw new Error('You have already checked out today');
      }
      
      // Call checkOut with the attendance ID
      await dispatch(checkOut(currentAttendance._id)).unwrap();
      
      // Refresh the attendance data
      await dispatch(getTodaysAttendance());
      await dispatch(getMyAttendance());
      
      showSnackbar('Checked out successfully', 'success');
    } catch (error) {
      console.error('Check-out failed:', error);
      showSnackbar(error.message || 'Failed to check out', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Format attendance date for display
  const formatAttendanceDate = (dateString) => {
    if (!dateString) return '--/--/----';
    try {
      return format(parseISO(dateString), 'MM/dd/yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '--/--/----';
    }
  };

  // Toggle leave status dialog
  const handleOpenLeaveStatus = () => {
    setOpenLeaveStatus(true);
  };

  const handleCloseLeaveStatus = () => {
    setOpenLeaveStatus(false);
  };

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return '--:--';
    try {
      return format(parseISO(dateString), 'h:mm a');
    } catch (error) {
      console.error('Error formatting time:', error);
      return '--:--';
    }
  };

  // Calculate working hours (updated in real-time)
  const calculateWorkingHours = () => {
    if (!todayAttendance?.checkIn) return '--:--';
    
    const checkInTime = parseISO(todayAttendance.checkIn);
    const checkOutTime = todayAttendance.checkOut ? parseISO(todayAttendance.checkOut) : currentTime;
    
    const hours = differenceInHours(checkOutTime, checkInTime);
    const minutes = differenceInMinutes(checkOutTime, checkInTime) % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Get current attendance status
  const getCurrentStatus = () => {
    if (!todayAttendance) return 'not_checked_in';
    if (todayAttendance.checkOut) return 'checked_out';
    return 'checked_in';
  };

  const currentStatus = getCurrentStatus();

  // Debug logging to help identify the issue
  useEffect(() => {
    console.log('🔍 Dashboard Debug Info:');
    console.log('todayAttendance:', todayAttendance);
    console.log('currentStatus:', currentStatus);
    console.log('Clock Out Button Disabled:', currentStatus !== 'checked_in');
    
    if (!todayAttendance) {
      console.log('❌ No attendance data - user needs to check in first');
    } else if (todayAttendance.checkOut) {
      console.log('✅ User already checked out today:', todayAttendance.checkOut);
    } else if (todayAttendance.checkIn) {
      console.log('🟢 User is checked in - clock out should be enabled');
      console.log('🟢 Check-in time:', todayAttendance.checkIn);
    }
  }, [todayAttendance, currentStatus]);

  // Additional debug logging for button state
  useEffect(() => {
    console.log('🔘 Button State Update:');
    console.log('- Current Status:', currentStatus);
    console.log('- Clock In Disabled:', currentStatus === 'checked_in' || isLoading);
    console.log('- Clock Out Disabled:', currentStatus !== 'checked_in' || isLoading);
    console.log('- Is Loading:', isLoading);
  }, [currentStatus, isLoading]);

  // Get attendance status icon
  const getAttendanceStatusIcon = (status) => {
    switch (status) {
      case 'checked_in':
        return <LoginIcon color="primary" />;
      case 'checked_out':
        return <LogoutIcon color="secondary" />;
      case 'absent':
        return <EventBusyIcon color="error" />;
      default:
        return <ScheduleIcon color="disabled" />;
    }
  };
  
  // Get leave request status icon
  const getLeaveStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircleOutlineIcon color="success" sx={{ mr: 1 }} />;
      case 'rejected':
        return <CancelIcon color="error" sx={{ mr: 1 }} />;
      case 'pending':
      default:
        return <PendingActionsIcon color="warning" sx={{ mr: 1 }} />;
    }
  };

  // Calculate attendance stats with proper date grouping
  const calculateAttendanceStats = () => {
    if (!attendance || attendance.length === 0) {
      return {
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        averageHours: 0
      };
    }

    // Group attendance records by date and get the latest complete record for each day
    const attendanceByDate = {};
    
    attendance.forEach(record => {
      if (!record.date) return;
      
      const dateKey = new Date(record.date).toISOString().split('T')[0];
      
      // Keep only records that have both check-in and check-out (completed attendance)
      if (record.checkIn && record.checkOut) {
        // If multiple records for same date, keep the one with latest check-out
        if (!attendanceByDate[dateKey] || 
            new Date(record.checkOut) > new Date(attendanceByDate[dateKey].checkOut)) {
          attendanceByDate[dateKey] = record;
        }
      }
    });

    const validAttendanceRecords = Object.values(attendanceByDate);
    const totalDays = validAttendanceRecords.length;
    const presentDays = validAttendanceRecords.filter(record => record.status === 'present').length;
    const lateDays = validAttendanceRecords.filter(record => record.isLate).length;
    const totalHours = validAttendanceRecords.reduce((sum, record) => sum + (record.totalHours || 0), 0);
    const averageHours = totalDays > 0 ? (totalHours / totalDays).toFixed(1) : 0;

    return {
      totalDays,
      presentDays,
      absentDays: 0, // We only count completed attendance as present, no absent days logic here
      lateDays,
      averageHours
    };
  };

  const attendanceStats = calculateAttendanceStats();
  const { totalDays, presentDays, absentDays, lateDays, averageHours } = attendanceStats;

  // Fetch today's attendance and user's attendance history
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setIsLoading(true);
        
        // Fetch today's attendance specifically
        await dispatch(getTodaysAttendance());
        
        // Fetch attendance history
        const result = await dispatch(getMyAttendance()).unwrap();
        
        // Process recent activities to show only complete attendance (with both check-in and check-out)
        // and group by date to avoid showing multiple entries for the same day
        const processedActivities = [];
        const seenDates = new Set();
        
        // Sort by date descending to get most recent first (create a copy to avoid mutation)
        const sortedResult = [...result].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        for (const activity of sortedResult) {
          if (!activity.date) continue;
          
          const dateKey = new Date(activity.date).toISOString().split('T')[0];
          
          // Only include if we haven't seen this date and it has complete attendance
          if (!seenDates.has(dateKey) && activity.checkIn && activity.checkOut) {
            seenDates.add(dateKey);
            processedActivities.push(activity);
            
            // Limit to 5 most recent complete attendance records
            if (processedActivities.length >= 5) break;
          }
        }
        
        setRecentActivities(processedActivities);
      } catch (error) {
        console.error('Failed to fetch attendance:', error);
        showSnackbar('Failed to load attendance data', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role !== 'admin') {
      fetchAttendance();
    }
  }, [dispatch, user?.role]);

  // Fetch admin dashboard data
  const fetchAdminDashboardData = async () => {
    try {
      // This would typically be an API call to fetch admin dashboard data
      // For now, we'll just log to console
      console.log('Fetching admin dashboard data...');
      // Replace with actual API call:
      // const response = await fetch('/api/admin/dashboard');
      // const data = await response.json();
      // return data;
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      throw error;
    }
  };

  // Fetch attendance data for non-admin users
  const fetchAttendanceData = async () => {
    try {
      // This would typically be an API call to fetch user's attendance data
      // For now, we'll just log to console
      console.log('Fetching attendance data...');
      // Replace with actual API call:
      // const response = await fetch('/api/attendance');
      // const data = await response.json();
      // return data;
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      throw error;
    }
  };

  // Fetch recent activities for the user
  const fetchRecentActivities = async () => {
    try {
      // This would typically be an API call to fetch user's recent activities
      // For now, we'll just log to console
      console.log('Fetching recent activities...');
      // Replace with actual API call:
      // const response = await fetch('/api/activities/recent');
      // const data = await response.json();
      // setRecentActivities(data);
      // return data;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        if (user?.role === 'admin') {
          await fetchAdminDashboardData();
        } else {
          await Promise.all([
            fetchAttendanceData(),
            fetchRecentActivities(),
            fetchEmployeeLeaveRequests()
          ]);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Handle error (e.g., show error message to user)
      }
    };

    loadData();
  }, [dispatch, user?.role]);

  // Update current time every second for real-time working hours
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // If user is admin, render AdminDashboard
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  // Show loading state
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box textAlign="center" p={3}>
        <ErrorIcon color="error" style={{ fontSize: 48 }} />
        <Typography variant="h6" color="error" gutterBottom>
          Error loading attendance data
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => window.location.reload()}
          startIcon={<RefreshIcon />}
        >
          Retry
        </Button>
      </Box>
    );
  }



  return (
    <Box p={3}>
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.name || 'User'}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </Typography>
      </Box>

      {/* Real-Time Clock Widget */}
      <RealTimeClock />

      {/* Check-in/Check-out Card */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
                <Box mb={{ xs: 2, md: 0 }} textAlign={{ xs: 'center', md: 'left' }}>
                  <Typography variant="h6" gutterBottom>
                    Today's Attendance
                  </Typography>
                  
                  {/* Debug Status Display */}
                  <Box mb={2} p={1} sx={{ backgroundColor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Status: <strong>{currentStatus}</strong> | 
                      Clock Out Disabled: <strong>{String(currentStatus !== 'checked_in')}</strong>
                      {todayAttendance && (
                        <>
                          <br />Check-in: {todayAttendance.checkIn ? formatTime(todayAttendance.checkIn) : 'No'} | 
                          Check-out: {todayAttendance.checkOut ? formatTime(todayAttendance.checkOut) : 'No'}
                          {todayAttendance.totalHours && (
                            <> | Total: {todayAttendance.totalHours}h</>
                          )}
                        </>
                      )}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" mb={1}>
                    <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      Status: 
                      <Box component="span" ml={1} fontWeight="bold" color={
                        currentStatus === 'checked_in' ? 'success.main' : 
                        currentStatus === 'checked_out' ? 'info.main' : 'text.secondary'
                      }>
                        {currentStatus === 'checked_in' ? 'Checked In' : 
                         currentStatus === 'checked_out' ? 'Checked Out' : 'Not Checked In'}
                      </Box>
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Check In: {formatTime(todayAttendance?.checkIn)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Check Out: {formatTime(todayAttendance?.checkOut)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Working Hours: {calculateWorkingHours()}
                      </Typography>
                    </Grid>
                    {currentStatus === 'checked_out' && (
                      <Grid item xs={12}>
                        <Box 
                          sx={{ 
                            p: 1, 
                            backgroundColor: 'success.light', 
                            borderRadius: 1, 
                            mt: 1 
                          }}
                        >
                          <Typography variant="body2" color="success.contrastText" align="center">
                            ✅ Attendance completed for today! 
                            <br />
                            Next check-in available tomorrow.
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Box>
                
                <Box display="flex" flexDirection={{ xs: 'row', md: 'column' }} gap={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<LoginIcon />}
                    onClick={handleCheckIn}
                    disabled={currentStatus === 'checked_in' || currentStatus === 'checked_out' || isLoading}
                    fullWidth
                    title={
                      currentStatus === 'checked_in' ? 'Already checked in today' :
                      currentStatus === 'checked_out' ? 'Attendance completed for today' :
                      'Click to check in'
                    }
                  >
                    {isLoading ? <CircularProgress size={24} /> : 
                     currentStatus === 'checked_out' ? 'Completed Today' :
                     currentStatus === 'checked_in' ? 'Already Checked In' :
                     'Clock In'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="large"
                    startIcon={<LogoutIcon />}
                    onClick={handleCheckOut}
                    disabled={currentStatus !== 'checked_in' || isLoading}
                    fullWidth
                    title={
                      currentStatus === 'not_checked_in' ? 'Please check in first' :
                      currentStatus === 'checked_out' ? 'Already checked out today' :
                      'Click to check out'
                    }
                  >
                    {isLoading ? <CircularProgress size={24} /> : 
                     currentStatus === 'checked_out' ? 'Checked Out Today' :
                     currentStatus === 'not_checked_in' ? 'Check In First' :
                     'Clock Out'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    startIcon={<EventNoteIcon />}
                    onClick={handleRequestLeave}
                    fullWidth
                    sx={{ mb: 1 }}
                  >
                    Request Leave
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="large"
                    startIcon={<PendingActionsIcon />}
                    onClick={handleViewLeaveStatus}
                    fullWidth
                  >
                    View Leave Status
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today's Summary
              </Typography>
              {todayAttendance && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-around' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">Check In</Typography>
                    <Typography variant="h6">
                      {formatTime(todayAttendance.checkIn)}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">Check Out</Typography>
                    <Typography variant="h6">
                      {todayAttendance.checkOut ? formatTime(todayAttendance.checkOut) : '--:--'}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">Total Hours</Typography>
                    <Typography variant="h6">
                      {todayAttendance.totalHours || '--:--'}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {getAttendanceStatusIcon(todayAttendance.status)}
                      <Typography variant="body2" sx={{ ml: 1, textTransform: 'capitalize' }}>
                        {todayAttendance.status}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>


 {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EventAvailableIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6">{totalDays}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Days
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6">{presentDays}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Present Days
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EventBusyIcon color="error" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6">{absentDays}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Absent Days
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TimerIcon color="info" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6">{averageHours} hrs</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg. Hours/Day
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Leave Status Button */}
      <Grid container spacing={3} sx={{ mb: 2, mt: 2 }}>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<EventNoteIcon />}
            onClick={handleOpenLeaveStatus}
            fullWidth
            sx={{
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 'bold',
              borderRadius: 2,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
              },
            }}
          >
            View Leave Request Status
          </Button>
        </Grid>
      </Grid>

      {/* Leave Request Status Dialog */}
      <Dialog 
        open={openLeaveStatus} 
        onClose={() => setOpenLeaveStatus(false)} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <span>My Leave Requests</span>
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<RefreshIcon />}
              onClick={fetchEmployeeLeaveRequests}
              disabled={loadingLeaveRequests}
            >
              Refresh
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loadingLeaveRequests ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : leaveRequests.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Leave Type</TableCell>
                    <TableCell>Date Range</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Submitted On</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaveRequests.map((request) => (
                    <TableRow key={request._id} hover>
                      <TableCell>{request.leaveType}</TableCell>
                      <TableCell>
                        {formatLeaveDate(request.startDate)} - {formatLeaveDate(request.endDate)}
                      </TableCell>
                      <TableCell>
                        {Math.ceil((new Date(request.endDate) - new Date(request.startDate)) / (1000 * 60 * 60 * 24)) + 1} days
                      </TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>
                        <Typography noWrap>{request.reason}</Typography>
                      </TableCell>
                      <TableCell>
                        {getStatusChip(request.status)}
                      </TableCell>
                      <TableCell>
                        {formatDate(request.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box textAlign="center" p={4}>
              <EventNoteIcon color="disabled" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Leave Requests Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You haven't submitted any leave requests yet.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setOpenLeaveStatus(false);
                  navigate('/attendance/request');
                }}
                sx={{ mt: 2 }}
                startIcon={<EventNoteIcon />}
              >
                Request Leave
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLeaveStatus(false)}>Close</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              setOpenLeaveStatus(false);
              navigate('/attendance/request');
            }}
            startIcon={<EventNoteIcon />}
          >
            New Leave Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quick Stats and Recent Activities */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                This Month
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                  <ListItemText primary="Present" secondary={`${presentDays} days`} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><EventBusyIcon color="error" /></ListItemIcon>
                  <ListItemText primary="Absent" secondary={`${absentDays} days`} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><WarningIcon color="warning" /></ListItemIcon>
                  <ListItemText primary="Late Arrivals" secondary={`${lateDays} days`} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><TimerIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Avg. Hours/Day" secondary={`${averageHours} hrs`} />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={8}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activities
              </Typography>
              {recentActivities.length > 0 ? (
                <List>
                  {recentActivities.map((activity, index) => (
                    <React.Fragment key={activity._id || index}>
                      <ListItem>
                        <ListItemIcon>
                          {getAttendanceStatusIcon(activity.status || currentStatus)}
                        </ListItemIcon>
                        <ListItemText
                          primary={`${formatDate(activity.date)} - ${activity.status || 'N/A'}`}
                          secondary={`In: ${formatTime(activity.checkIn)} • Out: ${formatTime(activity.checkOut) || '--:--'} • ${activity.totalHours || '0.00'} hrs`}
                        />
                      </ListItem>
                      {index < recentActivities.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" py={4}>
                  <ScheduleIcon color="disabled" style={{ fontSize: 48 }} />
                  <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
                    No recent activities found
                  </Typography>
                </Box>
              )}
              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Button
                  size="small"
                  onClick={() => navigate('/attendance')}
                  disabled={loading}
                >
                  View All
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
