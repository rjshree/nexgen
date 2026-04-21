// components/AppBar.js
import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
// import { LogoIcon } from "../icons";
import Box from '@mui/material/Box';
import UserMenu from "./UserMenu";

const CustomAppBar = ({ user_name }) => {
    console.log('got the user_name', user_name);
    const [anchorElUser, setAnchorElUser] = React.useState(null);

    return (
      <AppBar position="static" style={{ backgroundColor: "black" }}>
        <Toolbar>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="h6"
              component="a"
              style={{
                color: "white",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
              }}
            >
              {/* <LogoIcon /> */}
              <Typography
                variant="h6"
                component="span"
                sx={{
                //   fontFamily: "inherit",
                  fontWeight: "500",
                  fontSize: "2rem",
                  color: "white",
                  marginLeft: "10px",
                }}
              >
                Revenue Optimization - Apps Portal
              </Typography>
            </Typography>
          </div>

          <div style={{ marginLeft: "auto", display: "flex" }}>
            <Box sx={{ flexGrow: 0 }}>
              <UserMenu
                anchorEl={anchorElUser}
                setAnchorEl={setAnchorElUser}
                user_name={user_name}
              />
            </Box>
          </div>
        </Toolbar>
      </AppBar>
    );
};

export default CustomAppBar;
