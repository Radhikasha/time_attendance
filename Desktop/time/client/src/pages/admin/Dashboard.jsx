import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  CardHeader,
  Divider
} from '@mui/material';
import {
  People as PeopleIcon,
  Today as TodayIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const Dashboard = () => {
  const theme = useTheme();

  // Mock data - replace with actual data from your API
  const stats = [
    { 
      title: 'Total Employees', 
      value: '24', 
      icon: <PeopleIcon fontSize="large" />,
      color: theme.palette.primary.main
    },
    { 
      title: 'Today\'s Attendance', 
      value: '18/24', 
      icon: <TodayIcon fontSize="large" />,
      color: theme.palette.success.main
    },
    { 
      title: 'Pending Requests', 
      value: '5', 
      icon: <PendingIcon fontSize="large" />,
      color: theme.palette.warning.main
    },
    { 
      title: 'Leave Requests', 
      value: '3', 
      icon: <ScheduleIcon fontSize="large" />,
      color: theme.palette.info.main
    },
  ];

  const recentActivities = [
    { id: 1, user: 'John Doe', action: 'submitted a leave request', time: '2 hours ago', status: 'pending' },
    { id: 2, user: 'Jane Smith', action: 'checked in late', time: '4 hours ago', status: 'approved' },
    { id: 3, user: 'Mike Johnson', action: 'requested attendance regularization', time: '1 day ago', status: 'pending' },
    { id: 4, user: 'Sarah Williams', action: 'updated profile information', time: '1 day ago', status: 'completed' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              elevation={3} 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderLeft: `4px solid ${stat.color}`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  transition: 'transform 0.3s ease-in-out',
                  boxShadow: theme.shadows[8],
                },
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box 
                    sx={{
                      backgroundColor: `${stat.color}20`,
                      borderRadius: '50%',
                      width: 60,
                      height: 60,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Activities */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box>
              {recentActivities.map((activity) => (
                <Box 
                  key={activity.id} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    mb: 2,
                    p: 1.5,
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <Box 
                    sx={{
                      backgroundColor: 
                        activity.status === 'approved' ? 'success.light' : 
                        activity.status === 'pending' ? 'warning.light' : 'grey.300',
                      borderRadius: '50%',
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                      color: 'white',
                    }}
                  >
                    {activity.status === 'approved' ? (
                      <CheckCircleIcon />
                    ) : activity.status === 'pending' ? (
                      <PendingIcon />
                    ) : (
                      <CancelIcon />
                    )}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1">
                      <strong>{activity.user}</strong> {activity.action}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {activity.time}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box>
              {[
                { text: 'Approve Requests', icon: <CheckCircleIcon />, path: '/admin/attendance-requests' },
                { text: 'View Employees', icon: <PeopleIcon />, path: '/admin/employees' },
                { text: 'Process Leave Requests', icon: <ScheduleIcon />, path: '/admin/leaves' },
                { text: 'Generate Reports', icon: <TodayIcon />, path: '/reports' },
              ].map((action, index) => (
                <Box 
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 1.5,
                    mb: 1,
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                  onClick={() => window.location.href = action.path}
                >
                  <Box 
                    sx={{
                      backgroundColor: 'primary.light',
                      borderRadius: '50%',
                      width: 36,
                      height: 36,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                      color: 'primary.contrastText',
                    }}
                  >
                    {action.icon}
                  </Box>
                  <Typography>{action.text}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
