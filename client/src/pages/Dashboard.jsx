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
  EventAvailable as EventAvailableIcon,
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { 
  checkIn, 
  checkOut, 
  getMyAttendance,
  setTodayAttendance
} from '../features/attendance/attendanceSlice';
import { format, parseISO, differenceInHours, differenceInMinutes } from 'date-fns';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { user } = useSelector((state) => state.auth);
  const { attendance, todayAttendance, loading, error } = useSelector((state) => state.attendance);
  
  const [isLoading, setIsLoading] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);
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
      showSnackbar('Checked out successfully', 'success');
    } catch (error) {
      console.error('Check-out failed:', error);
      showSnackbar(error.message || 'Failed to check out', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '--/--/----';
    try {
      return format(parseISO(dateString), 'MM/dd/yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '--/--/----';
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
    const checkOutTime = todayAttendance.checkOut ? parseISO(todayAttendance.checkOut) : new Date();
    
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
  const lateDays = attendance?.filter(record => record?.isLate).length || 0;
  const averageHours = totalDays > 0 
    ? (attendance.reduce((sum, record) => sum + (record.totalHours || 0), 0) / totalDays).toFixed(1)
    : 0;

  // Fetch today's attendance and user's attendance history
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setIsLoading(true);
        // Set today's attendance from the existing data
        if (attendance?.length > 0) {
          const today = format(new Date(), 'yyyy-MM-dd');
          const todayRecord = attendance.find(record => 
            record.date && record.date.startsWith(today)
          );
          if (todayRecord) {
            dispatch(setTodayAttendance(todayRecord));
          }
        }
        // Fetch attendance history
        const result = await dispatch(getMyAttendance()).unwrap();
        // Set recent activities (last 5 records)
        setRecentActivities(result.slice(0, 5));
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
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
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
                  </Grid>
                </Box>
                
                <Box display="flex" flexDirection={{ xs: 'row', md: 'column' }} gap={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<LoginIcon />}
                    onClick={handleCheckIn}
                    disabled={currentStatus === 'checked_in' || isLoading}
                    fullWidth
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
                    fullWidth
                  >
                    {isLoading ? <CircularProgress size={24} /> : 'Clock Out'}
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
                      {getStatusIcon(todayAttendance.status)}
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
                          {getStatusIcon(activity.status)}
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

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<AccessTimeIcon />}
            onClick={() => navigate('/attendance')}
            sx={{ p: 2, height: '100%', justifyContent: 'flex-start' }}
          >
            <Box>
              <Typography variant="subtitle1">View Attendance</Typography>
              <Typography variant="body2" color="text.secondary">
                Check your attendance history
              </Typography>
            </Box>
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<EventAvailableIcon />}
            onClick={() => navigate('/attendance/request')}
            sx={{ p: 2, height: '100%', justifyContent: 'flex-start' }}
          >
            <Box>
              <Typography variant="subtitle1">Request Leave</Typography>
              <Typography variant="body2" color="text.secondary">
                Submit a leave request
              </Typography>
            </Box>
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<EventBusyIcon />}
            onClick={() => navigate('/attendance/report')}
            sx={{ p: 2, height: '100%', justifyContent: 'flex-start' }}
          >
            <Box>
              <Typography variant="subtitle1">Attendance Report</Typography>
              <Typography variant="body2" color="text.secondary">
                Generate reports
              </Typography>
            </Box>
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<TimerIcon />}
            onClick={() => navigate('/profile')}
            sx={{ p: 2, height: '100%', justifyContent: 'flex-start' }}
          >
            <Box>
              <Typography variant="subtitle1">My Profile</Typography>
              <Typography variant="body2" color="text.secondary">
                Update your details
              </Typography>
            </Box>
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
