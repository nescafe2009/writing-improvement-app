import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';

interface ButtonProps extends MuiButtonProps {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <MuiButton
      variant="contained"
      sx={{
        borderRadius: '8px',
        textTransform: 'none',
        fontWeight: 600,
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        },
      }}
      {...props}
    >
      {children}
    </MuiButton>
  );
};

export default Button; 