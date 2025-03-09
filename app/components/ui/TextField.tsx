import React from 'react';
import { TextField as MuiTextField, TextFieldProps as MuiTextFieldProps } from '@mui/material';

interface TextFieldProps extends MuiTextFieldProps {}

const TextField: React.FC<TextFieldProps> = (props) => {
  return (
    <MuiTextField
      variant="outlined"
      fullWidth
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '8px',
          '& fieldset': {
            borderColor: '#E0E0E0',
          },
          '&:hover fieldset': {
            borderColor: '#BDBDBD',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#2196F3',
          },
        },
      }}
      {...props}
    />
  );
};

export default TextField; 