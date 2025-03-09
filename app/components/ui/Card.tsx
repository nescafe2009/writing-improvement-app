import React from 'react';
import { Card as MuiCard, CardContent, CardProps as MuiCardProps } from '@mui/material';

interface CardProps extends MuiCardProps {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, ...props }) => {
  return (
    <MuiCard
      sx={{
        borderRadius: '12px',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
      }}
      {...props}
    >
      <CardContent>{children}</CardContent>
    </MuiCard>
  );
};

export default Card; 