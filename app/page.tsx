'use client';

import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Paper, useMediaQuery, useTheme } from '@mui/material';
import { Assignment as AssignmentIcon, Lightbulb as LightbulbIcon, 
         RateReview as RateReviewIcon, Folder as FolderIcon, 
         Compare as CompareIcon } from '@mui/icons-material';
import Layout from './components/layout/Layout';
import Link from 'next/link';

// 添加 ClientOnly 组件，用于仅在客户端渲染时显示内容
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  if (!hasMounted) {
    return null;
  }
  
  return <>{children}</>;
}

export default function Home() {
  const theme = useTheme();
  // 默认为非移动端布局，避免服务端/客户端不匹配
  const isMobile = useMediaQuery('(max-width:600px)', { noSsr: true, defaultMatches: false });
  const [isMobileView, setIsMobileView] = useState(false);
  
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
      title: '新建作文',
      description: '开始新作文并获取AI写作建议',
      icon: <AssignmentIcon fontSize="medium" color="primary" />,
      href: '/new-essay',
    },
    {
      title: 'AI作文批改',
      description: '实时评价和修改建议',
      icon: <RateReviewIcon fontSize="medium" color="primary" />,
      href: '/review',
    },
    {
      title: '老师修改',
      description: '上传老师批改并分析对比',
      icon: <CompareIcon fontSize="medium" color="primary" />,
      href: '/teacher-review',
    },
    {
      title: '作文管理',
      description: '查看和管理您的作文',
      icon: <FolderIcon fontSize="medium" color="primary" />,
      href: '/documents',
    },
  ];

  return (
    <Layout>
      <Box sx={{ mb: { xs: 3, md: 6 } }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          欢迎回来，小作文家！
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          继续提升你的写作能力，探索更多精彩内容。
        </Typography>
      </Box>

      {/* 数据统计卡片 */}
      <Paper elevation={0} sx={{ 
        p: { xs: 2, md: 3 }, 
        mb: { xs: 3, md: 6 }, 
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
                  {stats.completedEssays}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  完成作文数
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3} sx={{ p: 1 }}>
              <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                  {stats.reviewedEssays}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  批改作文数
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3} sx={{ p: 1 }}>
              <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                  {stats.averageScore}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  平均分数
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3} sx={{ p: 1 }}>
              <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
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
      <Typography variant="h6" sx={{ mb: { xs: 1.5, md: 2 }, fontWeight: 'bold' }}>
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
                    p: { xs: 1.5, md: 3 },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderRadius: 2,
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: { xs: 'translateY(-3px)', md: 'translateY(-5px)' },
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <ClientOnly>
                    {link.icon}
                  </ClientOnly>
                  <Typography variant="subtitle1" sx={{ 
                    mt: { xs: 1, md: 2 }, 
                    fontWeight: 'bold', 
                    textAlign: 'center',
                    fontSize: { xs: '0.95rem', md: '1.25rem' }
                  }}>
                    {link.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    mt: 1, 
                    textAlign: 'center',
                    fontSize: { xs: '0.75rem', md: '0.875rem' }
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