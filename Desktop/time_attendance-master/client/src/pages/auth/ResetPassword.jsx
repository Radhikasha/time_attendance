import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
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
  Paper,
  Container,
  Grid,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { resetPassword } from '../../features/auth/authSlice';
import AuthLayout from '../../layouts/AuthLayout';

const validationSchema = Yup.object({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
});

const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useParams();
  const { loading, message } = useSelector((state) => state.auth);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [loadingToken, setLoadingToken] = useState(true);

  // Check if token is valid
  useEffect(() => {
    const validateToken = async () => {
      try {
        // Here you would typically make an API call to validate the token
        // For now, we'll simulate a token check
        setTimeout(() => {
          setTokenValid(true);
          setLoadingToken(false);
        }, 1000);
      } catch (err) {
        setError('Invalid or expired reset token');
        setLoadingToken(false);
      }
    };

    if (token) {
      validateToken();
    } else {
      setError('No reset token provided');
      setLoadingToken(false);
    }
  }, [token]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      setSuccess('');
      await dispatch(resetPassword({ token, password: values.password })).unwrap();
      setSuccess('Password has been reset successfully. You can now log in with your new password.');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setError(error || 'Failed to reset password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (loadingToken) {
    return (
      <AuthLayout title="Validating Token">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>Validating reset token...</Typography>
        </Box>
      </AuthLayout>
    );
  }

  if (!tokenValid) {
    return (
      <AuthLayout title="Invalid Token">
        <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 500, textAlign: 'center' }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Invalid or Expired Link
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            The password reset link is invalid or has expired. Please request a new one.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/forgot-password"
            sx={{ mt: 2 }}
          >
            Request New Reset Link
          </Button>
        </Paper>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset Password">
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 500 }}>
        <Typography variant="h5" component="h1" align="center" gutterBottom>
          Create New Password
        </Typography>
        <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
          Please enter your new password below.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success ? (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        ) : (
          <Formik
            initialValues={{
              password: '',
              confirmPassword: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
              <Form>
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  margin="normal"
                  variant="outlined"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  disabled={loading}
                  InputProps={{
                    startAdornment: <LockIcon color="action" sx={{ mr: 1 }} />,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm New Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  margin="normal"
                  variant="outlined"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                  helperText={touched.confirmPassword && errors.confirmPassword}
                  disabled={loading}
                  InputProps={{
                    startAdornment: <LockIcon color="action" sx={{ mr: 1 }} />,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={handleClickShowConfirmPassword}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="caption" color="textSecondary">
                    Password must contain at least:
                  </Typography>
                  <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                    <li>
                      <Typography variant="caption" color={values.password.length >= 8 ? 'success.main' : 'text.secondary'}>
                        8 characters
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="caption" color={/[A-Z]/.test(values.password) ? 'success.main' : 'text.secondary'}>
                        1 uppercase letter
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="caption" color={/[a-z]/.test(values.password) ? 'success.main' : 'text.secondary'}>
                        1 lowercase letter
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="caption" color={/\d/.test(values.password) ? 'success.main' : 'text.secondary'}>
                        1 number
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="caption" color={/[!@#$%^&*]/.test(values.password) ? 'success.main' : 'text.secondary'}>
                        1 special character (!@#$%^&*)
                      </Typography>
                    </li>
                  </ul>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={isSubmitting || loading}
                >
                  {isSubmitting || loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </Form>
            )}
          </Formik>
        )}

        <Grid container justifyContent="center" sx={{ mt: 2 }}>
          <Grid item>
            <Link component={RouterLink} to="/login" variant="body2">
              Back to Sign In
            </Link>
          </Grid>
        </Grid>
      </Paper>
    </AuthLayout>
  );
};

export default ResetPassword;
