export const TABLE_COLUMN_CONFIG = {
  agreement: [
    { field: 'agreement_no', headerName: 'Agreement No', editable: true, width: 160, validation: { required: true, maxLength: 20 } },
    { field: 'cs_carr_code', headerName: 'CS Carrier Code', width: 130, validation: { required: true, minLength: 2, maxLength: 3, pattern: /^[A-Z0-9]{2,3}$/ } },
    { field: 'cs_carr_desg_code', headerName: 'CS Carrier Designator', width: 160, validation: { required: true, maxLength: 10 } },
    { field: 'agrmnt_type', headerName: 'Agreement Type', width: 130, validation: { required: true, maxLength: 1, pattern: /^[A-Z]$/ } },
    { field: 'service_type', headerName: 'Service Type', width: 90, validation: { required: true, maxLength: 1, pattern: /^[A-Z]$/ } },
    { field: 'inv_mgmnt_type', headerName: 'Inventory Mgmt Type', width: 160, validation: { required: true, maxLength: 2, pattern: /^[A-Z]{2}$/ } },
    { field: 'agrmnt_actv_flag', headerName: 'Active Flag', width: 90, validation: { required: true, maxLength: 1, pattern: /^[A-Z]$/ } },
    { field: 'aplcbl_prid_from', headerName: 'Applicable From', width: 140, validation: { required: true, pattern: /^\d{4}-\d{2}-\d{2}$/ } },
    { field: 'aplcbl_prid_to', headerName: 'Applicable To', width: 90, validation: { required: true, pattern: /^\d{4}-\d{2}-\d{2}$/ } },
    { field: 'agrmnt_revw_date', headerName: 'Review Date', width: 90, validation: { pattern: /^\d{4}-\d{2}-\d{2}$/ } },
    { field: 'agrmnt_termntn_date', headerName: 'Termination Date', width: 150, validation: { pattern: /^\d{4}-\d{2}-\d{2}$/ } },
    { field: 'remarks', headerName: 'Remarks', flex: 1, minWidth: 100, validation: { maxLength: 500 } },
    { field: 'created_user', headerName: 'Created By', width: 120, editable: false, hidden: true },
    { field: 'created_date', headerName: 'Created Date', width: 80, editable: false, hidden: true },
    { field: 'updated_user', headerName: 'Updated By', width: 120, editable: false, hidden: true },
    { field: 'updated_date', headerName: 'Updated Date', width: 80, editable: false, hidden: true },

],
    airlines: [
      { field: 'id', headerName: 'ID', editable: false, width: 80 },
      { field: 'code', headerName: 'Airline Code', validation: { required: true, minLength: 2, maxLength: 3, pattern: /^[A-Z0-9]{2,3}$/ } },
      { field: 'name', headerName: 'Airline Name', validation: { required: true, maxLength: 100 } },
      { field: 'country', headerName: 'Country', validation: { required: true } },
      { field: 'active', headerName: 'Active' },
    ],
   
    flight_sector: [
        { field: 'sector_code', headerName: 'Sector Code', width: 160, validation: { required: true, minLength: 6, maxLength: 6, pattern: /^[A-Z]{6}$/ } },
        { field: 'opt_flight_number', headerName: 'Operating Flight No', width: 180, validation: { required: true, minLength: 1, maxLength: 5, pattern: /^\d{1,5}$/ } },
        { field: 'mrkt_flight_number', headerName: 'Marketing Flight No', width: 180, validation: { required: true, minLength: 1, maxLength: 5, pattern: /^\d{1,5}$/ } },
    ],
    // Add more tables as needed...
  };