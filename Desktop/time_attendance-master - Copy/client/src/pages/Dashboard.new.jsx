import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
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
  useMediaQuery
} from '@mui/material';
import AdminDashboard from '../features/admin/AdminDashboard';
import {
  AccessTime as AccessTimeIcon,
  EventBusy as EventBusyIcon,
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { 
  checkIn, 
  checkOut, 
  getTodaysAttendance, 
  getMyAttendance 
} from '../features/attendance/attendanceSlice';
import { format, parseISO, differenceInHours, differenceInMinutes } from 'date-fns';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { user } = useSelector((state) => state.auth);
  const { attendance, todayAttendance, loading, error } = useSelector(
    (state) => state.attendance
  );
  
  const [isLoading, setIsLoading] = useState(false);
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
    if (isLoading) return; // Prevent multiple clicks
    
    try {
      console.log('Starting check-in process...');
      setIsLoading(true);
      
      // First, refresh the attendance data
      console.log('Refreshing attendance data...');
      await dispatch(getTodaysAttendance());
      await dispatch(getMyAttendance());
      
      // Get fresh state after refresh
      const state = store.getState().attendance;
      console.log('Current attendance state before check-in:', state);
      
      // Check if already checked in
      if (state.todayAttendance?.checkIn && !state.todayAttendance.checkOut) {
        throw new Error('You have already checked in today and not checked out yet');
      }
      
      // Show confirmation
      const confirmCheckIn = window.confirm('Are you sure you want to check in now?');
      if (!confirmCheckIn) {
        console.log('User cancelled check-in');
        setIsLoading(false);
        return;
      }
      
      console.log('Dispatching check-in action...');
      const resultAction = await dispatch(checkIn());
      
      // Check if the action was successful
      if (checkIn.fulfilled.match(resultAction)) {
        console.log('Check-in successful, refreshing data...');
        // Refresh attendance data
        await Promise.all([
          dispatch(getTodaysAttendance()),
          dispatch(getMyAttendance())
        ]);
        
        // Verify the check-in was recorded
        const updatedState = store.getState().attendance;
        if (updatedState.todayAttendance?.checkIn) {
          console.log('Check-in verified:', updatedState.todayAttendance);
          showSnackbar('Checked in successfully!', 'success');
        } else {
          console.error('Check-in verification failed:', updatedState);
          throw new Error('Check-in was not recorded properly. Please try again.');
        }
      } else {
        throw new Error(resultAction.error?.message || 'Failed to process check-in');
      }
    } catch (error) {
      console.error('Check-in failed:', error);
      let errorMessage = error.message || 'Failed to check in. Please try again.';
      
      // Provide more specific error messages
      if (errorMessage.includes('already checked in')) {
        errorMessage = 'You are already checked in for today.';
      } else if (errorMessage.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      showSnackbar(errorMessage, 'error');
    } finally {
      if (isLoading) {
        console.log('Resetting loading state');
        setIsLoading(false);
      }
    }
  };

  // Handle check-out
  const store = useStore();
  
  const handleCheckOut = async () => {
    if (isLoading) return; // Prevent multiple clicks
    
    try {
      setIsLoading(true);
      
      // First, refresh the attendance data
      console.log('Refreshing attendance data...');
      await dispatch(getTodaysAttendance());
      await dispatch(getMyAttendance());
      
      // Get fresh state after refresh
      const state = store.getState().attendance;
      console.log('Current attendance state:', state);
      
      // Try to find today's attendance record
      const today = new Date().toISOString().split('T')[0];
      let todayAttendance = state.todayAttendance || {};
      
      // If we don't have today's attendance in todayAttendance, check myAttendance
      if ((!todayAttendance._id || !todayAttendance.checkIn) && state.myAttendance) {
        console.log('Checking myAttendance for today\'s record...');
        const todaysRecord = state.myAttendance.find(record => 
          record.date && record.date.startsWith(today) && record.checkIn && !record.checkOut
        );
        
        if (todaysRecord) {
          console.log('Found today\'s record in myAttendance:', todaysRecord);
          todayAttendance = { ...todaysRecord };
        }
      }
      
      // Check if already checked out
      if (todayAttendance.checkOut) {
        throw new Error('You have already checked out today');
      }
      
      // Check if checked in
      if (!todayAttendance.checkIn) {
        throw new Error('Please check in first before checking out');
      }

      // Get the attendance ID
      const attendanceId = todayAttendance._id;
      
      if (!attendanceId) {
        console.error('No attendance ID found for today');
        throw new Error('Could not find your check-in record. Please check in first.');
      }

      // Calculate working hours
      const checkInTime = new Date(todayAttendance.checkIn);
      const checkOutTime = new Date();
      const minutesWorked = Math.floor((checkOutTime - checkInTime) / (1000 * 60));
      const hours = Math.floor(minutesWorked / 60);
      const minutes = minutesWorked % 60;
      
      const confirmCheckOut = window.confirm(
        `You have worked for ${hours}h ${minutes}m.\nAre you sure you want to check out now?`
      );
      
      if (!confirmCheckOut) {
        setIsLoading(false);
        return;
      }
      
      console.log('Attempting check-out with ID:', attendanceId);
      
      // Perform check-out with the attendance ID in the request body
      const result = await dispatch(checkOut({ attendanceId }));
      
      if (checkOut.fulfilled.match(result)) {
        // Show success message with working hours
        showSnackbar(
          `Checked out successfully! Total work time: ${hours}h ${minutes}m`,
          'success'
        );

        // Refresh data
        console.log('Refreshing attendance data after check-out...');
        await Promise.all([
          dispatch(getTodaysAttendance()),
          dispatch(getMyAttendance())
        ]);
      } else {
        throw new Error(result.error?.message || 'Failed to process check-out');
      }
    } catch (error) {
      console.error('Check-out failed:', error);
      // Provide more user-friendly error messages
      let errorMessage = 'Failed to check out. Please try again.';
      
      if (error.message) {
        if (error.message.includes('No active check-in') || 
            error.message.includes('No check-in record') ||
            error.message.includes('check in first')) {
          errorMessage = 'No active check-in found. Please check in first.';
        } else {
          errorMessage = error.message;
        }
      }
      
      showSnackbar(errorMessage, 'error');
    } finally {
      if (isLoading) {
        setIsLoading(false);
      }
    }
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

  // Helper function to calculate time difference in minutes
  const getTimeDifferenceInMinutes = (start, end) => {
    if (!start || !end) return 0;
    try {
      const startTime = typeof start === 'string' ? new Date(start) : start;
      const endTime = typeof end === 'string' ? new Date(end) : end;
      return Math.floor((endTime - startTime) / (1000 * 60)); // Convert ms to minutes
    } catch (error) {
      console.error('Error calculating time difference:', error);
      return 0;
    }
  };

  // Format minutes to HH:MM
  const formatMinutesToHHMM = (totalMinutes) => {
    if (isNaN(totalMinutes) || totalMinutes < 0) return '00:00';
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Calculate today's working hours
  const calculateWorkingHours = () => {
    if (!todayAttendance?.checkIn) return '00:00';
    
    const checkInTime = todayAttendance.checkIn;
    const checkOutTime = todayAttendance.checkOut || new Date().toISOString();
    
    const totalMinutes = getTimeDifferenceInMinutes(checkInTime, checkOutTime);
    return formatMinutesToHHMM(totalMinutes);
  };
  
  // Calculate total working hours for the selected period
  const calculateTotalWorkingHours = () => {
    if (!Array.isArray(attendance) || attendance.length === 0) return '00:00';
    
    let totalMinutes = 0;
    
    attendance.forEach(record => {
      if (record.checkIn && record.checkOut) {
        totalMinutes += getTimeDifferenceInMinutes(record.checkIn, record.checkOut);
      }
    });
    
    return formatMinutesToHHMM(totalMinutes);
  };
  
  // Calculate total working days
  const calculateWorkingDays = () => {
    if (!Array.isArray(attendance) || attendance.length === 0) return 0;
    return attendance.filter(record => record.status === 'present').length;
  };

  // Get current status
  const getCurrentStatus = () => {
    if (!todayAttendance) return 'not_checked_in';
    if (todayAttendance.checkOut) return 'checked_out';
    return 'checked_in';
  };

  const currentStatus = getCurrentStatus();

  // Get status icon
  const getStatusIcon = (status) => {
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

  // Calculate attendance stats safely
  const attendanceData = Array.isArray(attendance) ? attendance : [];
  const totalDays = attendanceData.length;
  const presentDays = attendanceData.filter(record => record?.status === 'present').length;
  const absentDays = Math.max(0, totalDays - presentDays);
  const averageHours = totalDays > 0 
    ? (attendanceData.reduce((sum, record) => {
        const hours = parseFloat(record?.totalHours) || 0;
        return sum + hours;
      }, 0) / totalDays).toFixed(1)
    : 0;

  // Fetch attendance data on component mount
  useEffect(() => {
    let isMounted = true;
    
    const fetchAttendance = async () => {
      if (!isMounted) return;
      
      try {
        setIsLoading(true);
        // Fetch in parallel for better performance
        await Promise.all([
          dispatch(getTodaysAttendance()),
          dispatch(getMyAttendance())
        ]);
      } catch (error) {
        console.error('Failed to fetch attendance:', error);
        if (isMounted) {
          showSnackbar(error.message || 'Failed to load attendance data', 'error');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (user?.role !== 'admin') {
      fetchAttendance();
    }

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [dispatch, user?.role, showSnackbar]);

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
          Error Loading Dashboard
        </Typography>
        <Typography color="textSecondary" paragraph>
          {error.message || 'Failed to load dashboard data. Please try again later.'}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  // Redirect to admin dashboard if user is admin
  if (user?.role === 'admin') {
    return <AdminDashboard />;
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
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
        >
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

      <Grid container spacing={3}>
        {/* Today's Attendance Card */}
        <Grid item xs={12} md={8}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' }, 
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2
              }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Today's Attendance
                  </Typography>
                  <Box display="flex" alignItems="center" mb={2}>
                    <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      Status: {' '}
                      <Box 
                        component="span" 
                        color={
                          currentStatus === 'checked_in' ? 'success.main' :
                          currentStatus === 'checked_out' ? 'info.main' : 'text.secondary'
                        }
                        fontWeight="bold"
                      >
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
                      <Box display="flex" flexDirection="column" gap={1} mt={1}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <AccessTimeIcon color="primary" fontSize="small" />
                          <Typography variant="body2" color="text.secondary">
                            Today's Hours: <strong style={{ color: theme.palette.primary.main }}>{calculateWorkingHours()}</strong>
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={2}>
                          <AccessTimeIcon color="secondary" fontSize="small" />
                          <Typography variant="body2" color="text.secondary">
                            Period Total: <strong style={{ color: theme.palette.secondary.main }}>{calculateTotalWorkingHours()}</strong>
                            <span style={{ marginLeft: '16px' }}>•</span>
                            <span style={{ marginLeft: '16px' }}>
                              {calculateWorkingDays()} {calculateWorkingDays() === 1 ? 'day' : 'days'} worked
                            </span>
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
                
                <Box 
                  display="flex" 
                  flexDirection={{ xs: 'row', md: 'column' }} 
                  gap={2}
                  sx={{ width: { xs: '100%', md: 'auto' }, mt: { xs: 2, md: 0 } }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<LoginIcon />}
                    onClick={handleCheckIn}
                    disabled={currentStatus !== 'not_checked_in' || isLoading}
                    fullWidth={isMobile}
                  >
                    {isLoading ? <CircularProgress size={24} /> : 'Clock In'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="large"
                    startIcon={<LogoutIcon />}
                    onClick={handleCheckOut}
                    disabled={currentStatus !== 'checked_in' || isLoading}
                    fullWidth={isMobile}
                  >
                    {isLoading ? <CircularProgress size={24} /> : 'Clock Out'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Stats Card */}
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                This Month
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Present" 
                    secondary={`${presentDays} day${presentDays !== 1 ? 's' : ''}`} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <EventBusyIcon color="error" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Absent" 
                    secondary={`${absentDays} day${absentDays !== 1 ? 's' : ''}`} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TimerIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Avg. Hours/Day" 
                    secondary={`${averageHours} hr${averageHours !== 1 ? 's' : ''}`} 
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activities
              </Typography>
              {attendance && attendance.length > 0 ? (
                <List>
                  {attendance.slice(0, 5).map((record) => (
                    <React.Fragment key={record._id}>
                      <ListItem>
                        <ListItemIcon>
                          {getStatusIcon(record.status || '')}
                        </ListItemIcon>
                        <ListItemText
                          primary={format(parseISO(record.date), 'EEEE, MMMM d, yyyy')}
                          secondary={
                            <>
                              <span>In: {formatTime(record.checkIn)}</span>
                              {record.checkOut && (
                                <span> • Out: {formatTime(record.checkOut)}</span>
                              )}
                              {record.totalHours && (
                                <span> • {record.totalHours.toFixed(1)} hrs</span>
                              )}
                            </>
                          }
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" py={4}>
                  <ScheduleIcon color="disabled" fontSize="large" />
                  <Typography color="textSecondary" variant="subtitle1">
                    No attendance records found
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
