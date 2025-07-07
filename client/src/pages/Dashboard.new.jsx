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
    try {
      setIsLoading(true);
      await dispatch(checkIn()).unwrap();
      await dispatch(getTodaysAttendance());
      showSnackbar('Checked in successfully', 'success');
    } catch (error) {
      console.error('Check-in failed:', error);
      showSnackbar(error.message || 'Failed to check in', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle check-out
  const handleCheckOut = async () => {
    try {
      setIsLoading(true);
      await dispatch(checkOut()).unwrap();
      await dispatch(getTodaysAttendance());
      showSnackbar('Checked out successfully', 'success');
    } catch (error) {
      console.error('Check-out failed:', error);
      showSnackbar(error.message || 'Failed to check out', 'error');
    } finally {
      setIsLoading(false);
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

  // Calculate working hours
  const calculateWorkingHours = () => {
    if (!todayAttendance?.checkIn) return '--:--';
    
    const checkInTime = parseISO(todayAttendance.checkIn);
    const checkOutTime = todayAttendance.checkOut 
      ? parseISO(todayAttendance.checkOut) 
      : new Date();
    
    const hours = differenceInHours(checkOutTime, checkInTime);
    const minutes = differenceInMinutes(checkOutTime, checkInTime) % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
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

  // Calculate attendance stats
  const totalDays = attendance?.length || 0;
  const presentDays = attendance?.filter(record => record?.status === 'present').length || 0;
  const absentDays = totalDays - presentDays;
  const averageHours = totalDays > 0 
    ? (attendance.reduce((sum, record) => sum + (record.totalHours || 0), 0) / totalDays).toFixed(1)
    : 0;

  // Fetch attendance data on component mount
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setIsLoading(true);
        await dispatch(getTodaysAttendance());
        await dispatch(getMyAttendance());
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
                      <Typography variant="body2" color="text.secondary">
                        Working Hours: {calculateWorkingHours()}
                      </Typography>
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
