import React from 'react';
import {
  GridActionsCellItem,
  GridRowModes,
} from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';

// CSPR_AGREEMENT columns config
export const agreementHeaderConfig = {
  agreement_no: { headerName: 'Agreement No', width: 180, editable: true },
  cs_carr_code: { headerName: 'CS Carrier Code', width: 160, editable: true },
  cs_carr_desg_code: { headerName: 'CS Carrier Desg Code', width: 200, editable: true },
  service_type: { headerName: 'Service Type', width: 160, editable: true },
};

// CSPM_Airlines columns config
export const cspmAirlinesHeaderConfig = {
  carrier_code: { headerName: 'Carrier Code', width: 160, editable: true },
  partner_carrier_code: { headerName: 'Partner Carrier Code', width: 200, editable: true },
  desg_code: { headerName: 'Desg Code', width: 160, editable: true },
  partner_desg_code: { headerName: 'Partner Desg Code', width: 200, editable: true },
};

// CSPM_AGRFLT_SECTORS columns config
export const sectorsHeaderConfig = {
  sector_code: { headerName: 'Sector Code', width: 180, editable: true },
  opt_flight_number: { headerName: 'Opt Flight Number', width: 200, editable: true },
  mrkt_flight_number: { headerName: 'Mrkt Flight Number', width: 200, editable: true },
};

export const createColumns = (headerConfig) => {
  return Object.keys(headerConfig).map((key) => ({
    field: key,
    headerName: headerConfig[key].headerName,
    width: headerConfig[key].width,
    editable: headerConfig[key].editable,
    renderHeader: () => (
      <strong style={{ textAlign: 'left' }}>
        {headerConfig[key].headerName}
      </strong>
    ),
  }));
};

export const getActions = (state, handleSaveClick, handleCancelClick, handleEditClick, handleDelete) => (params) => {
  const { id } = params;
  const isInEditMode = state.rowModesModel[id]?.mode === GridRowModes.Edit;

  if (isInEditMode) {
    return [
      <GridActionsCellItem
        icon={<SaveIcon />}
        label="Save"
        sx={{ color: 'primary.main' }}
        onClick={() => handleSaveClick(id)}
      />,
      <GridActionsCellItem
        icon={<CancelIcon />}
        label="Cancel"
        className="textPrimary"
        onClick={() => handleCancelClick(id)}
        color="inherit"
      />,
    ];
  }

  return [
    <GridActionsCellItem
      icon={<EditIcon />}
      label="Edit"
      className="textPrimary"
      onClick={() => handleEditClick(id)}
      color="inherit"
    />,
    <GridActionsCellItem
      icon={<DeleteIcon />}
      label="Delete"
      onClick={() => handleDelete(id)}
      color="inherit"
    />,
  ];
};

// New record templates

export const getNewRecord = (rows, metadata, additionalFields = {}) => {
  const maxId = Math.max(...rows.map(row => row.id || 0), 0);

  const record = {
    id: maxId + 1,
    isNew: true,
    ...additionalFields
  };

  metadata.columns.forEach(col => {
    if (!record.hasOwnProperty(col.field)) {
      record[col.field] = "";
    }
  });

  return record;
};
