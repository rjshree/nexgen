import React, { useRef } from "react";
import { styled, useTheme } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import { Box, Toolbar, CssBaseline, Typography, Divider, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip, Collapse } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

// import { LogoIcon } from "../icons";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { deepOrange } from "@mui/material/colors";

import Link from "next/link";
import { useRouter } from "next/router";
import HomeIcon from "@mui/icons-material/HomeOutlined";

import DnsIcon from '@mui/icons-material/Dns';


const menuItems = [
  {
    id: 1,
    label: "Home",
    icon: <HomeIcon fontSize="large" />,
    title: "Home",
    link: "/",
  },
  
  {
    id: 2,
    label: "Master Data",
    icon: (<DnsIcon fontSize="large" />),
    link: "/dashboard",
    // allowedRoles: ['Admin'], 
  }
 
];
const drawerWidth = 240;

const settings = ["Profile", "Account", "Logout"];

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default function MiniDrawer({ user_name, tab_name, isAdmin, displayComponent }) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const router = useRouter();
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const stringAvatar = ({ user_name }) => {
    if (!user_name) {
      console.error("user_name is undefined");
      return {
        sx: {
          bgcolor: deepOrange[500],
        },
        children: "",
      };
    } else {
      const words = user_name.trim().split(" ");

      // Extract the first and last words
      const firstWord = words[0];
      const lastWord = words[words.length - 1];
     

      // Create a new word using the first letters of the first and last words
      const initials = `${firstWord.charAt(0)}${lastWord.charAt(0)}`;
      
      return {
        sx: {
          bgcolor: deepOrange[500],
        },
        children: initials,
      };
    }
  };
  const SubMenuComponent = ({ item, icon, open, router, expandMenu }) => {
    return (
      <Collapse
        in={expandMenu}
        timeout="auto"
        unmountOnExit
        key={item.label}
      >
        <Link
          key={item.label}
          href={item.link}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <List component="div" disablePadding>
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: open ? "initial" : "center",
                px: 2.5,
              }}
              selected={item.link === router.pathname}
            >
              <Tooltip title={item.label}>
                <ListItemIcon
                  sx={{
                    fontSize: "medium",
                    minWidth: 50,
                    mr: open ? 1 : "auto",
                    justifyContent: "center",
                    marginLeft: { xs: 0.01, sm: 0.2 },
                    pl: open ? 4 : "auto",
                  }}
                >
                  {icon}
                </ListItemIcon>
              </Tooltip>
              <ListItemText
                sx={{
                  opacity: open ? 1 : 0,
                  fontFamily: "inherit",
                }}
                primary={item.label}
              />
            </ListItemButton>
          </List>
        </Link>
      </Collapse>
    );
  };
  return (
    <Box sx={{ display: "flex", height: "90%" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open} sx={{ backgroundColor: "#263238" }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 1.5,
              ...(open && { display: "none" }),
            }}
          >
            <MenuIcon />
          </IconButton>
          {/* <LogoIcon /> */}

          <Typography
            variant="h6"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              ml: 2,
              display: { xs: "none", md: "flex" },

              fontWeight: 500,
              fontFamily: "inherit",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            {tab_name}
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}> </Box>
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar {...stringAvatar({ user_name })} />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {menuItems.map(({ icon, ...menu }) => {
            return ( !menu.allowedRoles ||
              (isAdmin && menu.allowedRoles[0] === "Admin") ? (
              <Link
                key={menu.id}
                href={menu.link}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <ListItem
                  key={menu.id}
                  disablePadding
                  sx={{ display: "block" }}
                >
                  <ListItemButton
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? "initial" : "center",
                      px: 2.5,
                      "&.Mui-selected": {
                        backgroundColor: "#01579b",
                        color: "white",
                        "&:hover": {
                          backgroundColor: "#01579b",
                      },
                    }}}
                    selected={menu.link === router.pathname}
                  >
                    <Tooltip title={menu.label}>
                      <ListItemIcon
                        sx={{
                          fontSize: "large",
                          minWidth: 50,
                          mr: open ? 1 : "auto",
                          justifyContent: "center",
                          color:
                            menu.link === router.pathname ? "white" : "black",
                        }}
                      >
                        {icon}
                      </ListItemIcon>
                    </Tooltip>
                    <ListItemText
                      primary={menu.label}
                      sx={{ opacity: open ? 1 : 0, fontFamily: "inherit" }}
                    />
                  </ListItemButton>
                </ListItem>

                {menu.submenu &&
                  menu.submenu.map(({ icon, ...item }) =>
                    !item.allowedRoles ||
                    (isAdmin && item.allowedRoles[0] === "Admin") ? (
                        <SubMenuComponent
                          key={item.label}
                          item={item}
                          icon={icon}
                          open={open}
                          router={router}
                          expandMenu={expandMenu}
                        />
                    ) : null
                  )}
              </Link>
            ) : null);
          })}  
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 0.5, width: "97%" }}>
        {displayComponent}
      </Box>
    </Box>
  );
}
