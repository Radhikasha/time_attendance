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
} from '@mui/material';
import { login, clearErrors } from '../features/auth/authSlice';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const Login = () => {
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
      await dispatch(login({ email: values.email, password: values.password })).unwrap();
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      setFormError(error || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Typography component="h1" variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
        Sign in to your account
      </Typography>
      
      {formError && (
        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
          {formError}
        </Alert>
      )}
      
      <Formik
        initialValues={{
          email: '',
          password: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
          <Form>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email && Boolean(errors.email)}
              helperText={touched.email && errors.email}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.password && Boolean(errors.password)}
              helperText={touched.password && errors.password}
              disabled={loading}
            />
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
                'Sign In'
              )}
            </Button>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link component={RouterLink} to="/register" variant="body2">
                Don't have an account? Sign Up
              </Link>
            </Box>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default Login;
