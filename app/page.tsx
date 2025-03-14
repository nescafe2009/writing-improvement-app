'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from './components/layout/Layout';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  CardActionArea,
  Skeleton,
  Alert
} from '@mui/material';
import {
  Create as CreateIcon,
  RateReview as RateReviewIcon,
  Folder as FolderIcon,
  School as SchoolIcon
} from '@mui/icons-material';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState('');
  
  // 用户数据统计状态
  const [userStats, setUserStats] = useState({
    completedEssays: 0,
    reviewedEssays: 0,
    averageScore: 0,
    improvementRate: 0,
    drafts: 0,
    outlines: 0,
    aiReviews: 0,
    aiImproved: 0,
    teacherReviewed: 0,
    totalFiles: 0,
  });
  
  // 获取用户统计数据
  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/user/stats');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserStats(data.stats);
        }
      }
    } catch (error) {
      console.error('获取用户统计数据失败:', error);
    }
  };
  
  // 检查用户登录状态
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/user');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setIsLoggedIn(true);
            setUserData(data.user);
            // 获取用户统计数据
            fetchUserStats();
          } else {
            setIsLoggedIn(false);
            // 未登录时不跳转，让用户可以看到主页
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('获取用户状态失败:', error);
        setError('获取用户状态失败');
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuth();
  }, []);
  
  return (
    <Layout>
      <Box sx={{ mb: 6 }}>
        {/* 欢迎信息 */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' }
            }}
          >
            {isLoggedIn 
              ? `欢迎回来，${userData?.name || '同学'}！` 
              : '欢迎使用小赵作文助手'}
          </Typography>
          
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            {isLoggedIn 
              ? '继续您的写作之旅，或探索我们的功能来提高您的写作技巧。' 
              : '小赵作文助手帮助学生改进写作技巧，让作文更出色。请登录以使用全部功能。'}
          </Typography>
          
          {!isLoggedIn && (
            <Box sx={{ mb: 3 }}>
              <Button 
                variant="contained" 
                color="primary"
                sx={{ mr: 2, px: 3, py: 1 }}
                onClick={() => router.push('/login')}
              >
                登录
              </Button>
              <Button 
                variant="outlined" 
                color="primary"
                sx={{ px: 3, py: 1 }}
                onClick={() => router.push('/register')}
              >
                注册
              </Button>
            </Box>
          )}
        </Box>
        
        {/* 用户统计数据卡片 - 仅在登录后显示 */}
        {isLoggedIn && (
          <Paper elevation={0} sx={{ 
            p: { xs: 2, md: 3 }, 
            mb: { xs: 3, md: 5 }, 
            borderRadius: 2, 
            bgcolor: '#f5f5f5',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              学习数据看板
            </Typography>
            <Box sx={{ mx: -1 }}>
              <Grid container spacing={0}>
                <Grid item xs={6} md={3} sx={{ p: 1 }}>
                  <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                    <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                      {userStats.completedEssays}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      完成作文数
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3} sx={{ p: 1 }}>
                  <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                    <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                      {userStats.reviewedEssays}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      批改作文数
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3} sx={{ p: 1 }}>
                  <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                    <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                      {userStats.averageScore}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      平均分数
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3} sx={{ p: 1 }}>
                  <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                    <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                      {userStats.improvementRate}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      进步率
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
            
            {/* 添加详细文档统计 */}
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
              文档详细分类
            </Typography>
            <Box sx={{ mx: -1 }}>
              <Grid container spacing={0}>
                <Grid item xs={4} sx={{ p: 1 }}>
                  <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                    <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold' }}>
                      {userStats.outlines}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      作文提纲
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4} sx={{ p: 1 }}>
                  <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                    <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold' }}>
                      {userStats.drafts}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      作文初稿
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4} sx={{ p: 1 }}>
                  <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                    <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold' }}>
                      {userStats.aiReviews}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      AI评价
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4} sx={{ p: 1 }}>
                  <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                    <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold' }}>
                      {userStats.aiImproved}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      AI修改
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4} sx={{ p: 1 }}>
                  <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                    <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold' }}>
                      {userStats.teacherReviewed}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      老师批改
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4} sx={{ p: 1 }}>
                  <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                    <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold' }}>
                      {userStats.totalFiles}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      总文档数
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        )}
        
        {/* 主要功能卡片 */}
        <Typography 
          variant="h5" 
          component="h2" 
          gutterBottom 
          sx={{ fontWeight: 'bold', mb: 2 }}
        >
          主要功能
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s', 
                '&:hover': { transform: 'translateY(-8px)' } 
              }}
            >
              <CardActionArea 
                sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                onClick={() => router.push(isLoggedIn ? '/new-essay' : '/login')}
              >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                  <CreateIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div" align="center">
                    新建作文
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    开始一篇新的作文，使用我们的写作辅助工具
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s', 
                '&:hover': { transform: 'translateY(-8px)' } 
              }}
            >
              <CardActionArea 
                sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                onClick={() => router.push(isLoggedIn ? '/review' : '/login')}
              >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                  <RateReviewIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div" align="center">
                    AI批改
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    使用AI智能批改功能，获取即时反馈和建议
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s', 
                '&:hover': { transform: 'translateY(-8px)' } 
              }}
            >
              <CardActionArea 
                sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                onClick={() => router.push(isLoggedIn ? '/teacher-review' : '/login')}
              >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                  <SchoolIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div" align="center">
                    老师修改
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    获取老师的专业修改和指导，提高写作水平
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s', 
                '&:hover': { transform: 'translateY(-8px)' } 
              }}
            >
              <CardActionArea 
                sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                onClick={() => router.push(isLoggedIn ? '/documents' : '/login')}
              >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                  <FolderIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div" align="center">
                    作文管理
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    查看和管理您的所有作文，跟踪写作进度
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
} 