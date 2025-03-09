import React, { useState } from 'react';
import Link from 'next/link';
import { AppBar, Toolbar, Typography, Box, IconButton, Avatar, Drawer, List, ListItem, ListItemIcon, ListItemText, useMediaQuery, useTheme } from '@mui/material';
import { Home as HomeIcon, Edit as EditIcon, Assistant as AssistantIcon, 
         FolderOpen as FolderIcon, History as HistoryIcon, Menu as MenuIcon } from '@mui/icons-material';

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:600px)');

  const menuItems = [
    { label: '首页', icon: <HomeIcon />, href: '/' },
    { label: 'AI智能助手', icon: <AssistantIcon />, href: '/assistant' },
    { label: 'AI作文批改', icon: <EditIcon />, href: '/review' },
    { label: '文档管理', icon: <FolderIcon />, href: '/documents' },
    { label: '历史轨迹', icon: <HistoryIcon />, href: '/history' },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <AppBar position="static" color="default" elevation={0} sx={{ 
      backgroundColor: 'white',
      borderBottom: '1px solid #f0f0f0'
    }}>
      <Toolbar sx={{ 
        justifyContent: 'space-between',
        height: isMobile ? '64px' : '72px',
        px: isMobile ? 2 : 3
      }}>
        <Typography variant="h6" component="div" sx={{ 
          fontWeight: 'bold', 
          color: '#333',
          fontSize: isMobile ? '1.1rem' : '1.25rem'
        }}>
          小学生作文提升
        </Typography>
        
        {isMobile ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ width: 32, height: 32, mr: 1 }}>小</Avatar>
              <IconButton 
                color="primary" 
                aria-label="菜单" 
                edge="end" 
                onClick={toggleMobileMenu}
                sx={{ ml: 1 }}
              >
                <MenuIcon />
              </IconButton>
            </Box>

            <Drawer
              anchor="right"
              open={mobileMenuOpen}
              onClose={toggleMobileMenu}
              PaperProps={{
                sx: { width: '70%', maxWidth: '320px' }
              }}
            >
              <Box sx={{ pt: 2, pb: 2 }}>
                <List>
                  {menuItems.map((item) => (
                    <Link key={item.href} href={item.href} passHref style={{ textDecoration: 'none', color: 'inherit' }}>
                      <ListItem button onClick={toggleMobileMenu} sx={{ py: 1.5 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.label} />
                      </ListItem>
                    </Link>
                  ))}
                </List>
              </Box>
            </Drawer>
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href} passHref>
                <IconButton color="primary" aria-label={item.label}>
                  {item.icon}
                </IconButton>
              </Link>
            ))}
            <Avatar sx={{ width: 36, height: 36, ml: 2 }}>小</Avatar>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 