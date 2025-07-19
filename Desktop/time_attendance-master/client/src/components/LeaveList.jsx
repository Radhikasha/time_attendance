import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyLeaveRequests } from '../features/leave/leaveSlice';
import { format, parseISO } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  CircularProgress,
} from '@mui/material';

const getStatusColor = (status) => {
  switch (status) {
    case 'approved':
      return 'success';
    case 'rejected':
      return 'error';
    case 'pending':
    default:
      return 'warning';
  }
};

const LeaveList = () => {
  const dispatch = useDispatch();
  const { myLeaveRequests, loading, error } = useSelector((state) => state.leave);

  useEffect(() => {
    dispatch(getMyLeaveRequests());
  }, [dispatch]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box my={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (myLeaveRequests.length === 0) {
    return (
      <Box my={2}>
        <Typography>No leave requests found.</Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} elevation={3} sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ p: 2 }}>
        My Leave Requests
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Leave Type</TableCell>
            <TableCell>Start Date</TableCell>
            <TableCell>End Date</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Reason</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {myLeaveRequests.map((leave) => (
            <TableRow key={leave._id}>
              <TableCell sx={{ textTransform: 'capitalize' }}>
                {leave.leaveType}
              </TableCell>
              <TableCell>
                {format(parseISO(leave.startDate), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell>
                {format(parseISO(leave.endDate), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell>
                {Math.ceil(
                  (new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24) + 1
                )}{' '}
                days
              </TableCell>
              <TableCell>
                <Chip
                  label={leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                  color={getStatusColor(leave.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>{leave.reason}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default LeaveList;
