import React, { useState, useEffect, ReactNode } from 'react';
import {
  Box, AppBar, Toolbar, IconButton, Typography, Drawer, List,
  ListItem, ListItemButton, ListItemIcon, ListItemText, Container, useTheme,
  CssBaseline, Divider, useMediaQuery, Avatar
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard as DashboardIcon, Create as CreateIcon,
  RateReview as RateReviewIcon, Psychology as PsychologyIcon,
  Folder as FolderIcon, AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobileMQ = useMediaQuery(theme.breakpoints.down('md'));
  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // 在客户端渲染时更新状态，避免hydration不匹配
    setIsMobile(isMobileMQ);
  }, [isMobileMQ]);

  const menuItems = [
    { text: '我的主页', icon: <DashboardIcon />, href: '/' },
    { text: '新建作文', icon: <CreateIcon />, href: '/new-essay' },
    { text: 'AI助手', icon: <PsychologyIcon />, href: '/assistant' },
    { text: 'AI批改', icon: <RateReviewIcon />, href: '/review' },
    { text: '文档管理', icon: <FolderIcon />, href: '/documents' },
  ];

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawerContent = (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: isMobile ? 2 : 3,
          background: theme.palette.primary.main,
          color: 'white',
        }}
      >
        <Avatar 
          src="/avatar.png" 
          alt="用户头像" 
          sx={{ 
            width: isMobile ? 60 : 70, 
            height: isMobile ? 60 : 70, 
            mb: 1,
            border: '2px solid white' 
          }} 
        />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          王小明
        </Typography>
        <Typography variant="body2">
          三年级学生
        </Typography>
      </Box>
      <Divider />
      <List sx={{ mt: isMobile ? 1 : 2 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link href={item.href} key={item.text} style={{ textDecoration: 'none', color: 'inherit' }}>
              <ListItem disablePadding>
                <ListItemButton
                  sx={{ 
                    py: isMobile ? 1 : 1.5, 
                    px: isMobile ? 2 : 3,
                    backgroundColor: isActive ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.08)',
                    },
                  }}
                  onClick={isMobile ? toggleDrawer : undefined}
                >
                  <ListItemIcon sx={{ 
                    color: isActive ? theme.palette.primary.main : 'inherit',
                    minWidth: isMobile ? 40 : 56
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontWeight: isActive ? 'bold' : 'normal',
                      color: isActive ? theme.palette.primary.main : 'inherit',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </Link>
          );
        })}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton sx={{ py: isMobile ? 1 : 1.5, px: isMobile ? 2 : 3 }}>
            <ListItemIcon sx={{ minWidth: isMobile ? 40 : 56 }}>
              <AccountCircleIcon />
            </ListItemIcon>
            <ListItemText primary="个人设置" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton sx={{ py: isMobile ? 1 : 1.5, px: isMobile ? 2 : 3 }}>
            <ListItemIcon sx={{ minWidth: isMobile ? 40 : 56 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="退出登录" />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar sx={{ height: isMobile ? 64 : 72 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontSize: isMobile ? '1.2rem' : '1.5rem',
              fontWeight: 'bold'
            }}
          >
            小作家AI平台
          </Typography>
          <Avatar src="/avatar.png" alt="用户头像" sx={{ display: { xs: 'flex', md: 'none' }, width: 34, height: 34 }} />
        </Toolbar>
      </AppBar>
      
      {/* 桌面端永久显示的侧边栏 */}
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        {drawerContent}
      </Drawer>
      
      {/* 移动端可切换显示的侧边栏 */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={toggleDrawer}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: '85%',
            maxWidth: 280,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: isMobile ? 2 : 3,
          width: '100%',
          ml: { md: '240px' },
          mt: isMobile ? '64px' : '72px',
        }}
      >
        <Container 
          maxWidth={false} 
          disableGutters
          sx={{ 
            py: isMobile ? 1 : 2,
            px: isMobile ? 0.5 : 2,
            maxWidth: { xs: '100%', sm: '100%', md: 'lg' },
            overflowX: 'hidden'
          }}
        >
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 