import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Paper, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const LeaveRequest = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: null,
    endDate: null,
    reason: ''
  });
  const [errors, setErrors] = useState({});
  const [submittedRequest, setSubmittedRequest] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle', 'submitting', 'success', 'error'

  const leaveTypes = [
    'Sick Leave',
    'Vacation Leave',
    'Personal Leave',
    'Bereavement Leave',
    'Other'
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.leaveType) {
      newErrors.leaveType = 'Leave type is required';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'End date cannot be before start date';
    }
    
    if (!formData.reason.trim()) {
      newErrors.reason = 'Please provide a reason for leave';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleDateChange = (name, date) => {
    setFormData({
      ...formData,
      [name]: date
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setStatus('submitting');
      
      try {
        const token = localStorage.getItem('token');
        
        // Debug log the request data
        const requestData = {
          leaveType: formData.leaveType,
          startDate: formData.startDate.toISOString().split('T')[0],
          endDate: formData.endDate.toISOString().split('T')[0],
          reason: formData.reason
        };
        
        console.log('Submitting leave request with data:', requestData);
        console.log('Using token:', token ? 'Token exists' : 'No token found');
        
        const response = await fetch('http://localhost:5002/api/leaves', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestData)
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
          let errorMessage = 'Failed to submit leave request';
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
            console.error('Error response:', errorData);
          } catch (e) {
            console.error('Could not parse error response:', e);
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('Leave request successful:', data);
        
        setSubmittedRequest(data);
        setStatus('success');
        setFormData({
          leaveType: '',
          startDate: null,
          endDate: null,
          reason: ''
        });
        
        // Show success message
        toast.success('Leave request submitted successfully!');
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
        
      } catch (error) {
        console.error('Error in handleSubmit:', error);
        setStatus('error');
        toast.error(error.message || 'Failed to submit leave request. Please try again.');
      }
    }
  };
  
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getStatusChip = (status) => {
    const statusMap = {
      pending: { label: 'Pending Approval', color: 'warning', icon: <PendingActionsIcon /> },
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
        sx={{ fontWeight: 'bold' }}
      />
    );
  };

  if (status === 'success' && submittedRequest) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Leave Request Submitted
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Your request has been sent for approval
          </Typography>
          
          <Card variant="outlined" sx={{ maxWidth: 500, mx: 'auto', mt: 4, mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} textAlign="left">
                <Grid item xs={12} sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" component="div">
                    Request #{submittedRequest.id.toString().slice(-6)}
                  </Typography>
                  {getStatusChip(submittedRequest.status)}
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Leave Type</Typography>
                  <Typography>{submittedRequest.leaveType}</Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Submitted On</Typography>
                  <Typography>{formatDate(submittedRequest.submittedDate)}</Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Start Date</Typography>
                  <Typography>{formatDate(submittedRequest.startDate)}</Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">End Date</Typography>
                  <Typography>{formatDate(submittedRequest.endDate)}</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Reason</Typography>
                  <Typography>{submittedRequest.reason}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          <Box sx={{ mt: 3 }}>
            <Alert severity="info" sx={{ mb: 2, textAlign: 'left' }}>
              Your leave request has been submitted and is pending approval.
              You will be notified once it has been reviewed by the admin.
            </Alert>
            
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigate('/dashboard')}
              sx={{ mt: 2 }}
            >
              Back to Dashboard
            </Button>
            
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => setStatus('idle')}
              sx={{ mt: 2, ml: 2 }}
            >
              Submit Another Request
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Request Leave
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <FormControl fullWidth margin="normal" error={!!errors.leaveType}>
            <InputLabel id="leave-type-label">Leave Type</InputLabel>
            <Select
              labelId="leave-type-label"
              id="leaveType"
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
              label="Leave Type"
            >
              {leaveTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
            {errors.leaveType && <FormHelperText>{errors.leaveType}</FormHelperText>}
          </FormControl>
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={formData.startDate}
                onChange={(date) => handleDateChange('startDate', date)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    error={!!errors.startDate}
                    helperText={errors.startDate}
                  />
                )}
              />
              
              <DatePicker
                label="End Date"
                value={formData.endDate}
                onChange={(date) => handleDateChange('endDate', date)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    error={!!errors.endDate}
                    helperText={errors.endDate}
                  />
                )}
                minDate={formData.startDate}
              />
            </LocalizationProvider>
          </Box>
          
          <TextField
            margin="normal"
            fullWidth
            id="reason"
            label="Reason for Leave"
            name="reason"
            multiline
            rows={4}
            value={formData.reason}
            onChange={handleChange}
            error={!!errors.reason}
            helperText={errors.reason}
          />
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={() => status === 'idle' ? navigate('/dashboard') : setStatus('idle')}
              disabled={status === 'submitting'}
            >
              {status === 'idle' ? 'Cancel' : 'Back'}
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? 'Submitting...' : 'Submit Request'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LeaveRequest;
