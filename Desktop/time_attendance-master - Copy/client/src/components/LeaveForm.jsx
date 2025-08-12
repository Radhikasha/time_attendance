import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createLeaveRequest, clearLeaveError } from '../features/leave/leaveSlice';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import {
  TextField,
  Button,
  MenuItem,
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const LeaveForm = () => {
  const dispatch = useDispatch();
  const { requestStatus, error } = useSelector((state) => state.leave);
  
  const [formData, setFormData] = useState({
    leaveType: 'vacation',
    startDate: null,
    endDate: null,
    reason: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearLeaveError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (requestStatus === 'succeeded') {
      toast.success('Leave request submitted successfully');
      setFormData({
        leaveType: 'vacation',
        startDate: null,
        endDate: null,
        reason: '',
      });
    }
  }, [requestStatus]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (name, date) => {
    setFormData({
      ...formData,
      [name]: date,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const leaveRequest = {
      ...formData,
      startDate: format(formData.startDate, 'yyyy-MM-dd'),
      endDate: format(formData.endDate, 'yyyy-MM-dd'),
    };
    
    dispatch(createLeaveRequest(leaveRequest));
  };

  const leaveTypes = [
    { value: 'vacation', label: 'Vacation' },
    { value: 'sick', label: 'Sick Leave' },
    { value: 'personal', label: 'Personal Leave' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        New Leave Request
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'grid', gap: 2 }}>
          <FormControl fullWidth error={!!errors.leaveType}>
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
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
            {errors.leaveType && (
              <FormHelperText>{errors.leaveType}</FormHelperText>
            )}
          </FormControl>

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
            />
          </LocalizationProvider>

          <TextField
            label="Reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            multiline
            rows={4}
            fullWidth
            error={!!errors.reason}
            helperText={errors.reason}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={requestStatus === 'loading'}
            >
              {requestStatus === 'loading' ? 'Submitting...' : 'Submit Leave Request'}
            </Button>
          </Box>
        </Box>
      </form>
    </Paper>
  );
};

export default LeaveForm;
