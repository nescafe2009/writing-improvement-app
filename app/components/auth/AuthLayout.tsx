import React, { ReactNode } from 'react';
import { Box, Container, Paper, Typography, useTheme, useMediaQuery } from '@mui/material';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: theme.palette.background.default,
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              mb: 1, 
              fontWeight: 'bold',
              fontSize: { xs: '1.5rem', sm: '2rem' }
            }}
          >
            {title}
          </Typography>
          
          {subtitle && (
            <Typography 
              variant="body1" 
              color="text.secondary" 
              align="center"
              sx={{ mb: 3 }}
            >
              {subtitle}
            </Typography>
          )}
          
          {children}
        </Paper>
        
        <Box sx={{ textAlign: 'center', mt: 2, color: 'text.secondary' }}>
          <Typography variant="body2">小赵作文助手 © {new Date().getFullYear()}</Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default AuthLayout; 