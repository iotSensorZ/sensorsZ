declare module 'react-datepicker' {
    import { Component } from 'react';
  
    export interface ReactDatePickerProps {
      selected: Date;
      onChange: (date: Date | null) => void;
      // Add more props if needed
    }
  
    export default class ReactDatePicker extends Component<ReactDatePickerProps> {}
  }
  