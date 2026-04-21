// SelectOptionComponent.js
import React from 'react';
import { Box, Button, Grid } from '@mui/material';

class SelectOptionComponent extends React.Component {
  render() {
    const { selectedValue, optionList, onChange, handleOpenAddModal, toggleUploadModal } = this.props;
    console.log("Rendering SelectOptionComponent with airline:", selectedValue, optionList);

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}> {/* Adjust the width for different screen sizes */}
          <Box sx={{ marginTop: '10px', marginLeft: '20px', display: 'flex', alignItems: 'center' }}>
            <label htmlFor="airline-select" style={{ whiteSpace: 'nowrap', marginRight: '10px' }}>
              *Select an option:
            </label>
            <select
              inputProps={{
                name: 'airline',
                id: 'airline-select',
              }}
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                backgroundColor: '#fff',
                color: '#333',
                fontWeight: 'normal',
                fontSize: '14px',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23000\' width=\'18px\' height=\'18px\'%3E%3Cpath d=\'M7 10l5 5 5-5z\'/%3E%3C/svg%3E")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px top 50%',
                verticalAlign: 'top',
                marginRight: '10px',
                width: '100%', // Full width on small screens, adjust as needed
                maxWidth: '350px', // Maximum width to prevent overflow
                minWidth: '150px',
              }}
              defaultValue={selectedValue}
              onChange={onChange}
              id="airline-select"
              name="airline-select"
            >
              {optionList.map((option, index) => (
                <option key={index} value={option.code}>
                  {option.name}
                </option>
              ))}
            </select>
           
          </Box>
        </Grid>
      </Grid>
    );
  }
}

export default SelectOptionComponent;
