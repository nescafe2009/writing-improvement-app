'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  IconButton, 
  Typography, 
  Menu, 
  Container, 
  Avatar, 
  Button, 
  Tooltip, 
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Settings as SettingsIcon,
  BugReport as BugReportIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  Edit as EditIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { isLoggedIn, getUserProfile, logoutUser } from '../../lib/client-auth';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const router = useRouter();
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // 检查用户是否已登录
  const loggedIn = isLoggedIn();
  const userProfile = getUserProfile();
  
  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  const toggleDrawer = (open: boolean) => {
    setDrawerOpen(open);
  };
  
  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push('/login');
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  // 导航项
  const navItems = [
    { text: '首页', href: '/', icon: <HomeIcon /> },
    { text: '写作', href: '/writing', icon: <EditIcon /> },
    { text: '仪表盘', href: '/dashboard', icon: <DashboardIcon /> },
  ];
  
  // 用户菜单项
  const userMenuItems = loggedIn 
    ? [
        { text: '个人资料', href: '/profile', icon: <PersonIcon /> },
        { text: '设置', href: '/settings', icon: <SettingsIcon /> },
        { text: '登录调试', href: '/login-debug', icon: <BugReportIcon /> },
      ]
    : [
        { text: '登录', href: '/login', icon: <LoginIcon /> },
        { text: '注册', href: '/register', icon: <PersonIcon /> },
      ];

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* 桌面版Logo */}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            小赵作文助手
          </Typography>

          {/* 移动版菜单按钮 */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="菜单"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={() => toggleDrawer(true)}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            
            {/* 侧边抽屉菜单 */}
            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={() => toggleDrawer(false)}
            >
              <Box
                sx={{ width: 250 }}
                role="presentation"
                onClick={() => toggleDrawer(false)}
                onKeyDown={() => toggleDrawer(false)}
              >
                <List>
                  {navItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                      <ListItemButton component={Link} href={item.href}>
                        <ListItemIcon>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
                
                <Divider />
                
                <List>
                  {userMenuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                      <ListItemButton component={Link} href={item.href}>
                        <ListItemIcon>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                  
                  {loggedIn && (
                    <ListItem disablePadding>
                      <ListItemButton onClick={handleLogout}>
                        <ListItemIcon>
                          <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText primary="登出" />
                      </ListItemButton>
                    </ListItem>
                  )}
                </List>
              </Box>
            </Drawer>
          </Box>

          {/* 移动版Logo */}
          <Typography
            variant="h5"
            noWrap
            component={Link}
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            小赵作文助手
          </Typography>

          {/* 桌面版导航菜单 */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {navItems.map((item) => (
              <Button
                key={item.text}
                component={Link}
                href={item.href}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
                startIcon={item.icon}
              >
                {item.text}
              </Button>
            ))}
          </Box>

          {/* 用户菜单 */}
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="打开设置">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar 
                  alt={userProfile?.name || "用户"} 
                  src={userProfile?.avatar || "/static/images/avatar/default.jpg"} 
                />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {userMenuItems.map((item) => (
                <MenuItem 
                  key={item.text} 
                  onClick={handleCloseUserMenu}
                  component={Link}
                  href={item.href}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <Typography textAlign="center">{item.text}</Typography>
                </MenuItem>
              ))}
              
              {loggedIn && (
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon />
                  </ListItemIcon>
                  <Typography textAlign="center">登出</Typography>
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 