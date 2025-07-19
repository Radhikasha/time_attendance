import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  CircularProgress,
  Alert,
  Grid,
  MenuItem,
} from '@mui/material';
import { register, clearErrors } from '../features/auth/authSlice';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
  role: Yup.string()
    .oneOf(['employee', 'admin'], 'Invalid role')
    .required('Role is required'),
  department: Yup.string().required('Department is required'),
  position: Yup.string().required('Position is required'),
  employeeId: Yup.string().required('Employee ID is required'),
});

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

const roles = [
  { value: 'employee', label: 'Employee' },
  { value: 'admin', label: 'Administrator' },
];

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    // Clear any previous errors
    dispatch(clearErrors());
    
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [dispatch, isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      setFormError(error);
    }
  }, [error]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setFormError('');
      // Remove confirmPassword from the values before submitting
      const { confirmPassword, ...userData } = values;
      await dispatch(register(userData)).unwrap();
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      setFormError(error || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Typography component="h1" variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
        Create a new account
      </Typography>
      
      {formError && (
        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
          {formError}
        </Alert>
      )}
      
      <Formik
        initialValues={{
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'employee',
          department: '',
          position: '',
          employeeId: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
          <Form>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Full Name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email Address"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  id="role"
                  name="role"
                  label="Role"
                  value={values.role}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.role && Boolean(errors.role)}
                  helperText={touched.role && errors.role}
                  margin="normal"
                >
                  {roles.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label="Password"
                  type="password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                  helperText={touched.confirmPassword && errors.confirmPassword}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  id="department"
                  name="department"
                  label="Department"
                  value={values.department}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.department && Boolean(errors.department)}
                  helperText={touched.department && errors.department}
                  disabled={loading}
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
                  value={values.position}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.position && Boolean(errors.position)}
                  helperText={touched.position && errors.position}
                  disabled={loading}
                >
                  {positions.map((pos) => (
                    <MenuItem key={pos} value={pos}>
                      {pos}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="employeeId"
                  name="employeeId"
                  label="Employee ID"
                  value={values.employeeId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.employeeId && Boolean(errors.employeeId)}
                  helperText={touched.employeeId && errors.employeeId}
                  disabled={loading}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting || loading}
            >
              {isSubmitting || loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign Up'
              )}
            </Button>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Sign In
              </Link>
            </Box>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default Register;
