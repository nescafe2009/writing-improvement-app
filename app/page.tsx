'use client';

import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Paper, useMediaQuery } from '@mui/material';
import { Assignment as AssignmentIcon, Lightbulb as LightbulbIcon, 
         RateReview as RateReviewIcon, Folder as FolderIcon } from '@mui/icons-material';
import Layout from './components/layout/Layout';
import Link from 'next/link';

export default function Home() {
  // 使用useState和useEffect来避免SSR hydration不匹配问题
  const [isMobileView, setIsMobileView] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');
  
  useEffect(() => {
    // 在客户端渲染时更新状态
    setIsMobileView(isMobile);
  }, [isMobile]);
  
  // 模拟数据
  const stats = {
    completedEssays: 12,
    reviewedEssays: 8,
    averageScore: 85,
    improvementRate: 15,
  };

  const quickLinks = [
    {
      title: 'AI智能助手',
      description: '获取写作提纲和建议',
      icon: <LightbulbIcon fontSize={isMobileView ? "medium" : "large"} color="primary" />,
      href: '/assistant',
    },
    {
      title: 'AI作文批改',
      description: '实时评价和修改建议',
      icon: <RateReviewIcon fontSize={isMobileView ? "medium" : "large"} color="primary" />,
      href: '/review',
    },
    {
      title: '新建作文',
      description: '开始一篇新的作文',
      icon: <AssignmentIcon fontSize={isMobileView ? "medium" : "large"} color="primary" />,
      href: '/new-essay',
    },
    {
      title: '文档管理',
      description: '查看和管理您的作文',
      icon: <FolderIcon fontSize={isMobileView ? "medium" : "large"} color="primary" />,
      href: '/documents',
    },
  ];

  return (
    <Layout>
      <Box sx={{ mb: isMobileView ? 3 : 6 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          欢迎回来，小作家！
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          继续提升你的写作能力，探索更多精彩内容。
        </Typography>
      </Box>

      {/* 数据统计卡片 */}
      <Paper elevation={0} sx={{ 
        p: isMobileView ? 2 : 3, 
        mb: isMobileView ? 3 : 6, 
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
                <Typography variant={isMobileView ? "h5" : "h4"} color="primary" sx={{ fontWeight: 'bold' }}>
                  {stats.completedEssays}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  完成作文数
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3} sx={{ p: 1 }}>
              <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                <Typography variant={isMobileView ? "h5" : "h4"} color="primary" sx={{ fontWeight: 'bold' }}>
                  {stats.reviewedEssays}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  批改作文数
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3} sx={{ p: 1 }}>
              <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                <Typography variant={isMobileView ? "h5" : "h4"} color="primary" sx={{ fontWeight: 'bold' }}>
                  {stats.averageScore}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  平均分数
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3} sx={{ p: 1 }}>
              <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                <Typography variant={isMobileView ? "h5" : "h4"} color="primary" sx={{ fontWeight: 'bold' }}>
                  {stats.improvementRate}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  进步率
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* 快速入口 */}
      <Typography variant="h6" sx={{ mb: isMobileView ? 1.5 : 2, fontWeight: 'bold' }}>
        快速入口
      </Typography>
      <Box sx={{ width: '100%', mx: -1 }}>
        <Grid container spacing={0}>
          {quickLinks.map((link, index) => (
            <Grid item xs={6} md={3} key={index} sx={{ p: 1 }}>
              <Link href={link.href} style={{ textDecoration: 'none' }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: isMobileView ? 1.5 : 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderRadius: 2,
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: isMobileView ? 'translateY(-3px)' : 'translateY(-5px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  {link.icon}
                  <Typography variant={isMobileView ? "subtitle1" : "h6"} sx={{ 
                    mt: isMobileView ? 1 : 2, 
                    fontWeight: 'bold', 
                    textAlign: 'center',
                    fontSize: isMobileView ? '0.95rem' : '1.25rem'
                  }}>
                    {link.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    mt: 1, 
                    textAlign: 'center',
                    fontSize: isMobileView ? '0.75rem' : '0.875rem'
                  }}>
                    {link.description}
                  </Typography>
                </Paper>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Layout>
  );
} 