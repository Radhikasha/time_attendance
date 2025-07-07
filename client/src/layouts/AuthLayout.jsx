import React from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(8),
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: 500,
  margin: '0 auto',
  marginTop: theme.spacing(8),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[3],
}));

const Logo = styled('div')({
  margin: '20px 0',
  fontSize: '2rem',
  fontWeight: 'bold',
  color: '#1976d2',
  textAlign: 'center',
});

const AuthLayout = ({ children, title }) => {
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Logo>TimeTrack</Logo>
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          {title}
        </Typography>
        <StyledPaper elevation={3}>
          {children}
        </StyledPaper>
      </Box>
    </Container>
  );
};

export default AuthLayout;
