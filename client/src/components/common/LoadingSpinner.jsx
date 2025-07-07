import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingSpinner = ({ size = 40, message = 'Loading...', fullPage = false }) => {
  const spinner = (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={2}
    >
      <CircularProgress size={size} color="primary" />
      {message && (
        <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullPage) {
    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgcolor="background.paper"
        zIndex={1400}
      >
        {spinner}
      </Box>
    );
  }

  return spinner;
};

export default LoadingSpinner;
