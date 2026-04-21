import React from 'react';
import Link from 'next/link';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

const CustomCard = ({ header, links }) => {
  return (
    <Card
      style={{
        border: '1px gray',
        color: 'white',
        width: '350px',
        height: '250px',
        transition: 'transform 0.3s',
      }}
      onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
      onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {/* Header with blue background */}
      <div
        style={{
          backgroundColor: '#1565c0',
          padding: '10px',
        }}
      >
        <Typography
          variant="h6"
          component="div"
          style={{
            color: 'white',
            marginTop: '5px',
            fontWeight: 'bold',
            fontSize: '1rem',
            textAlign: 'center',
          }}
        >
          {header}
        </Typography>
      </div>
      <CardContent>
        <List>
          {links.map((link, index) => (
            <Link href={link.path} key={index}>
                <ListItem
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '5px',
                    margin: '12px 0',
                    padding: '0',
                  }}
                >
                  <ListItemIcon
                    style={{
                      color: link.isActive ? 'gray' : 'darkgray',
                      marginRight: '4px',
                      minWidth: 'auto',
                      transition: 'color 0.3s',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.color = link.isActive ? '#2196f3' : 'darkgray')}
                    onMouseOut={(e) => (e.currentTarget.style.color = link.isActive ? 'gray' : 'darkgray')}
                  >
                    {link.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        component="div"
                        style={{
                          fontFamily: 'Arial',
                          color: link.isActive ? '#333333' : 'darkgray',
                          textDecoration: 'none',
                          cursor: link.isActive ? 'pointer' : 'default',
                          transition: 'color 0.3s',
                          fontSize: '1rem',
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.color = link.isActive ? '#2196f3' : 'darkgray')}
                        onMouseOut={(e) => (e.currentTarget.style.color = link.isActive ? '#333333' : 'darkgray')}
                      >
                        {link.text}
                      </Typography>
                    }
                  />
                </ListItem>
            </Link>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default CustomCard;
