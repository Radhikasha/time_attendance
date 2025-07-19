import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { AccessTime as ClockIcon } from '@mui/icons-material';

const RealTimeClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card elevation={3} sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column">
          <Box display="flex" alignItems="center" mb={1}>
            <ClockIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" color="primary">
              Current Time
            </Typography>
          </Box>
          
          <Typography 
            variant="h3" 
            component="div" 
            sx={{ 
              fontFamily: 'monospace',
              fontWeight: 'bold',
              color: 'primary.main',
              textAlign: 'center',
              mb: 1
            }}
          >
            {formatTime(currentTime)}
          </Typography>
          
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ textAlign: 'center' }}
          >
            {formatDate(currentTime)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RealTimeClock;
