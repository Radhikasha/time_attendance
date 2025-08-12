import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  Typography,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Paper,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  Fingerprint as FingerprintIcon,
  Lock as LockIcon,
  Notifications as NotificationsIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { updateUserProfile } from '../features/auth/authSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);
  const [editMode, setEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Form validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    department: Yup.string().required('Department is required'),
    position: Yup.string().required('Position is required'),
    employeeId: Yup.string().required('Employee ID is required'),
  });

  // Initialize form with user data
  const formik = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      department: user?.department || '',
      position: user?.position || '',
      employeeId: user?.employeeId || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await dispatch(updateUserProfile(values)).unwrap();
        setSnackbar({
          open: true,
          message: 'Profile updated successfully!',
          severity: 'success',
        });
        setEditMode(false);
      } catch (error) {
        setSnackbar({
          open: true,
          message: error || 'Failed to update profile',
          severity: 'error',
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Departments and positions for dropdowns
  const departments = [
    'Engineering',
    'Human Resources',
    'Marketing',
    'Finance',
    'Operations',
    'Sales',
    'Customer Support',
    'IT',
  ];

  const positions = [
    'Software Engineer',
    'HR Manager',
    'Marketing Specialist',
    'Financial Analyst',
    'Operations Manager',
    'Sales Representative',
    'Support Agent',
    'IT Administrator',
    'Team Lead',
    'Intern',
  ];

  // Handle snackbar close
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (editMode) {
      formik.resetForm();
    }
    setEditMode(!editMode);
  };

  // Handle notification toggle
  const handleNotificationToggle = (event) => {
    // Implement notification preference update logic here
    console.log('Notification preference changed:', event.target.checked);
  };

  return (
    <Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    fontSize: '3rem',
                    mb: 2,
                    bgcolor: 'primary.main',
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
                {editMode && (
                  <IconButton
                    color="primary"
                    aria-label="upload picture"
                    component="span"
                    sx={{
                      position: 'absolute',
                      bottom: 10,
                      right: 5,
                      backgroundColor: 'background.paper',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                )}
              </Box>
              <Typography variant="h6" gutterBottom>
                {user?.name}
              </Typography>
              <Typography color="textSecondary" variant="body2">
                {user?.position}
              </Typography>
              <Typography color="textSecondary" variant="body2">
                {user?.department}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant={editMode ? 'outlined' : 'contained'}
                  startIcon={editMode ? <CancelIcon /> : <EditIcon />}
                  onClick={toggleEditMode}
                  disabled={loading}
                >
                  {editMode ? 'Cancel' : 'Edit Profile'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card sx={{ mt: 3 }}>
            <CardHeader title="Account Settings" />
            <Divider />
            <List>
              <ListItem>
                <ListItemIcon>
                  <LockIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Change Password" />
                <ListItemSecondaryAction>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => console.log('Change password clicked')}
                  >
                    Change
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <NotificationsIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Email Notifications" />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    onChange={handleNotificationToggle}
                    defaultChecked
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Card>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader
              title="Personal Information"
              action={
                editMode && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={formik.handleSubmit}
                    disabled={!formik.isValid || formik.isSubmitting || loading}
                  >
                    {formik.isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                )
              }
            />
            <Divider />
            <CardContent>
              <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="name"
                      name="name"
                      label="Full Name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.name && Boolean(formik.errors.name)}
                      helperText={formik.touched.name && formik.errors.name}
                      disabled={!editMode || loading}
                      InputProps={{
                        startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="email"
                      name="email"
                      label="Email Address"
                      type="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email}
                      disabled={!editMode || loading}
                      InputProps={{
                        startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      id="department"
                      name="department"
                      label="Department"
                      value={formik.values.department}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.department && Boolean(formik.errors.department)}
                      helperText={formik.touched.department && formik.errors.department}
                      disabled={!editMode || loading}
                      InputProps={{
                        startAdornment: <BusinessIcon color="action" sx={{ mr: 1 }} />,
                      }}
                    >
                      {departments.map((dept) => (
                        <MenuItem key={dept} value={dept}>
                          {dept}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      id="position"
                      name="position"
                      label="Position"
                      value={formik.values.position}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.position && Boolean(formik.errors.position)}
                      helperText={formik.touched.position && formik.errors.position}
                      disabled={!editMode || loading}
                      InputProps={{
                        startAdornment: <WorkIcon color="action" sx={{ mr: 1 }} />,
                      }}
                    >
                      {positions.map((pos) => (
                        <MenuItem key={pos} value={pos}>
                          {pos}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="employeeId"
                      name="employeeId"
                      label="Employee ID"
                      value={formik.values.employeeId}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.employeeId && Boolean(formik.errors.employeeId)}
                      helperText={formik.touched.employeeId && formik.errors.employeeId}
                      disabled={!editMode || loading}
                      InputProps={{
                        startAdornment: <FingerprintIcon color="action" sx={{ mr: 1 }} />,
                      }}
                    />
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>

          {/* System Information (Read-only) */}
          <Card sx={{ mt: 3 }}>
            <CardHeader title="System Information" />
            <Divider />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Account Created"
                    secondary={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Last Login"
                    secondary={user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Account Status"
                    secondary={
                      <span style={{ color: 'green', fontWeight: 'bold' }}>Active</span>
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
