// components/SimpleBottomNavigation.js
import React, { useEffect } from 'react';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import InfoIcon from '@mui/icons-material/Info';
import ContactsIcon from '@mui/icons-material/Contacts';
import { useRouter } from 'next/router';

const SimpleBottomNavigation = () => {
  const [value, setValue] = React.useState(0);
  const router = useRouter();

  useEffect(() => {    
    if (router.pathname === '/about') {
      setValue(1);
    } else {
      setValue(0);
    }
  }, [router.pathname]);

  const handleNavigation = (newValue) => {
    setValue(newValue);

    if (newValue === 0) {
      const emailAddress = 'your.email@example.com';
      const subject = 'Contact Us Inquiry';
      const body = 'Hello,';
      const mailtoURL = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoURL;
    } else if (newValue === 1) {
      // Toggle between about page and root based on the current route
      const targetRoute = router.pathname === '/about' ? '/' : '/about';
      router.push(targetRoute);
    }
  };

  return (
    <Box sx={{ background: 'black', position: 'fixed', bottom: 0, width: '100%', textAlign: 'center' }}>
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          handleNavigation(newValue);
        }}
        sx={{ background: 'black', color: 'white' }}
      >
        <BottomNavigationAction sx={{ color: 'white' }} label="Contact Us" icon={<ContactsIcon />} />
        <BottomNavigationAction sx={{ color: 'white' }} label={router.pathname === '/' ? 'About' : 'Back'} icon={<InfoIcon />} />
      </BottomNavigation>
    </Box>
  );
};

export default SimpleBottomNavigation;
