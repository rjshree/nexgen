// components/UserMenu.js
import React, { useEffect, useState } from 'react';
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { deepOrange } from "@mui/material/colors";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";

const UserMenu = ({ anchorEl, setAnchorEl, user_name }) => {
    const [initials, setInitials] = useState('');
    useEffect(() => {
        // Calculate initials from the user_name prop
        if (user_name) {
          const words = user_name.trim().split(" ");
          const initials = words.map((word) => word[0]).join("");
          setInitials(initials.toUpperCase());
        }
      }, [user_name]);

    const settings = ["Profile", "Account", "Logout"];

    const handleOpenUserMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <Tooltip title="Click to view details">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar sx={{ bgcolor: deepOrange[500] }}>{initials}</Avatar>
                </IconButton>
            </Tooltip>
            <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleCloseUserMenu}
            >
                {settings.map((setting) => (
                    <MenuItem key={setting} onClick={handleCloseUserMenu}>
                        <Typography textAlign="center">{setting}</Typography>
                    </MenuItem>
                ))}
            </Menu>
        </div>
    );
};

export default UserMenu;
