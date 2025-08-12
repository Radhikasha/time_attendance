import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import LeaveForm from '../components/LeaveForm';
import LeaveList from '../components/LeaveList';

const LeavePage = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Leave Management
        </Typography>
        
        {/* Leave Request Form */}
        <Box sx={{ mb: 6 }}>
          <LeaveForm />
        </Box>
        
        {/* Leave Requests List */}
        <Box>
          <LeaveList />
        </Box>
      </Box>
    </Container>
  );
};

export default LeavePage;
