import React from 'react';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import { DatePickerProps } from '@mui/x-date-pickers/DatePicker';

export const DatePicker = (props: DatePickerProps<Date>) => {
  return (
    <MuiDatePicker
      {...props}
      slotProps={{
        textField: {
          fullWidth: true,
          size: 'small',
        },
      }}
    />
  );
}; 