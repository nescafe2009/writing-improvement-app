import React, { useState, useEffect, ReactNode } from 'react';
import {
  Box, AppBar, Toolbar, IconButton, Typography, Drawer, List,
  ListItem, ListItemButton, ListItemIcon, ListItemText, Container, useTheme,
  CssBaseline, Divider, useMediaQuery, Avatar, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Button, Snackbar, Alert, CircularProgress
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard as DashboardIcon, Create as CreateIcon,
  RateReview as RateReviewIcon, Compare as CompareIcon,
  Folder as FolderIcon, AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon, Login as LoginIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

// 添加 ClientOnly 组件，用于仅在客户端渲染时显示内容
function ClientOnly({ children }: { children: ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  if (!hasMounted) {
    return null;
  }
  
  return <>{children}</>;
}

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const router = useRouter();
  // 默认为非移动端布局，避免服务端/客户端不匹配
  const isMobileMQ = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true, defaultMatches: false });
  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  
  // 添加用户状态
  const [userData, setUserData] = useState({
    name: '访客',
    grade: '未登录',
    avatar: '/images/default-avatar.png'
  });
  
  // 添加登录状态
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    // 在客户端渲染时更新状态，避免hydration不匹配
    setIsMobile(isMobileMQ);
    
    // 获取用户信息
    async function fetchUserProfile() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/auth/user');
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setUserData({
              name: data.user.name || '用户',
              grade: data.user.grade || '',
              avatar: data.user.avatar || '/images/default-avatar.png'
            });
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
            setUserData({
              name: '访客',
              grade: '未登录',
              avatar: '/images/default-avatar.png'
            });
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUserProfile();
    
    // 路由变化时检查是否需要刷新用户信息
    if (pathname === '/') {
      fetchUserProfile();
    }
    
    // 定期检查本地存储是否有用户信息更新标记
    const checkInterval = setInterval(() => {
      const lastUpdate = localStorage.getItem('userProfileUpdated');
      if (lastUpdate) {
        const currentTimestamp = parseInt(lastUpdate);
        // 如果上次更新在10秒内，则重新获取用户信息
        if (Date.now() - currentTimestamp < 10000) {
          localStorage.removeItem('userProfileUpdated'); // 清除标记
          fetchUserProfile();
        }
      }
    }, 1000); // 每秒检查一次
    
    return () => {
      clearInterval(checkInterval);
    };
  }, [isMobileMQ, pathname]);

  const menuItems = [
    { text: '我的主页', icon: <DashboardIcon />, href: '/' },
    { text: '新建作文', icon: <CreateIcon />, href: '/new-essay' },
    { text: 'AI批改', icon: <RateReviewIcon />, href: '/review' },
    { text: '老师修改', icon: <CompareIcon />, href: '/teacher-review' },
    { text: '作文管理', icon: <FolderIcon />, href: '/documents' },
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
        {isLoading ? (
          <CircularProgress size={60} sx={{ color: 'white', my: 2 }} />
        ) : (
          <>
            <Avatar 
              src={userData.avatar} 
              alt={userData.name} 
              sx={{ 
                width: isMobile ? 60 : 70, 
                height: isMobile ? 60 : 70, 
                mb: 1,
                border: '2px solid white' 
              }} 
            />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {userData.name}
            </Typography>
            <Typography variant="body2">
              {userData.grade}
            </Typography>
          </>
        )}
      </Box>
      <Divider />
      <List sx={{ mt: isMobile ? 1 : 2 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link href={isLoggedIn ? item.href : '/login'} key={item.text} style={{ textDecoration: 'none', color: 'inherit' }}>
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
        {isLoggedIn ? (
          <>
            <ListItem disablePadding>
              <Link href="/settings" style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
                <ListItemButton sx={{ py: isMobile ? 1 : 1.5, px: isMobile ? 2 : 3 }}>
                  <ListItemIcon sx={{ minWidth: isMobile ? 40 : 56 }}>
                    <AccountCircleIcon />
                  </ListItemIcon>
                  <ListItemText primary="个人设置" />
                </ListItemButton>
              </Link>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton 
                sx={{ py: isMobile ? 1 : 1.5, px: isMobile ? 2 : 3 }}
                onClick={() => setIsLogoutDialogOpen(true)}
              >
                <ListItemIcon sx={{ minWidth: isMobile ? 40 : 56 }}>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="退出登录" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <ListItem disablePadding>
            <Link href="/login" style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
              <ListItemButton sx={{ py: isMobile ? 1 : 1.5, px: isMobile ? 2 : 3 }}>
                <ListItemIcon sx={{ minWidth: isMobile ? 40 : 56 }}>
                  <LoginIcon />
                </ListItemIcon>
                <ListItemText primary="登录/注册" />
              </ListItemButton>
            </Link>
          </ListItem>
        )}
      </List>
    </>
  );

  // 处理登出功能
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (response.ok) {
        setIsLoggedIn(false);
        setUserData({
          name: '访客',
          grade: '未登录',
          avatar: '/images/default-avatar.png'
        });
        setSnackbarMessage('已成功退出登录');
        setSnackbarOpen(true);
        
        // 关闭登出确认对话框
        setIsLogoutDialogOpen(false);
        
        // 重定向到登录页面
        setTimeout(() => {
          router.push('/login');
        }, 1000);
      } else {
        throw new Error('退出登录失败');
      }
    } catch (error) {
      console.error('退出登录失败:', error);
      setSnackbarMessage('退出登录失败，请稍后重试');
      setSnackbarOpen(true);
      setIsLogoutDialogOpen(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <ClientOnly>
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
              小赵作文助手
            </Typography>
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
        
        {/* 登出确认对话框 */}
        <Dialog
          open={isLogoutDialogOpen}
          onClose={() => setIsLogoutDialogOpen(false)}
        >
          <DialogTitle>确认退出登录</DialogTitle>
          <DialogContent>
            <DialogContentText>
              您确定要退出登录吗？退出后需要重新登录才能使用全部功能。
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsLogoutDialogOpen(false)} color="primary">
              取消
            </Button>
            <Button onClick={handleLogout} color="primary" autoFocus>
              确认退出
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* 消息通知 */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={5000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity="success"
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </ClientOnly>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          width: '100%',
          ml: { md: '240px' },
          mt: { xs: '64px', md: '72px' },
        }}
      >
        <Container 
          maxWidth={false} 
          disableGutters
          sx={{ 
            py: { xs: 1, md: 2 },
            px: { xs: 0.5, md: 2 },
            maxWidth: { xs: '100%', sm: '100%', md: 'lg' },
            overflowX: 'hidden'
          }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            children
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 