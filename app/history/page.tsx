'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Timeline, TimelineItem, TimelineSeparator, 
         TimelineConnector, TimelineContent, TimelineDot, TimelineOppositeContent } from '@mui/material';
import { Edit as EditIcon, RateReview as RateReviewIcon, 
         Save as SaveIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import Layout from '../components/layout/Layout';
import Link from 'next/link';

// 模拟数据
const mockHistory = [
  {
    id: '1',
    type: 'create',
    title: '我的暑假生活',
    date: '2023-08-15 09:30',
    description: '创建了新作文',
    documentId: '1',
  },
  {
    id: '2',
    type: 'edit',
    title: '我的暑假生活',
    date: '2023-08-15 10:45',
    description: '编辑了作文内容',
    documentId: '1',
  },
  {
    id: '3',
    type: 'review',
    title: '我的暑假生活',
    date: '2023-08-15 11:20',
    description: '提交了作文批改',
    documentId: '1',
    score: 85,
  },
  {
    id: '4',
    type: 'create',
    title: '我的家乡',
    date: '2023-09-05 14:15',
    description: '创建了新作文',
    documentId: '2',
  },
  {
    id: '5',
    type: 'review',
    title: '我的家乡',
    date: '2023-09-05 16:30',
    description: '提交了作文批改',
    documentId: '2',
    score: 92,
  },
];

export default function History() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    // 这里可以从Firebase获取数据
    setHistory(mockHistory);
  }, []);

  const getIconByType = (type: string) => {
    switch (type) {
      case 'create':
        return <EditIcon />;
      case 'edit':
        return <SaveIcon />;
      case 'review':
        return <RateReviewIcon />;
      default:
        return <VisibilityIcon />;
    }
  };

  const getColorByType = (type: string) => {
    switch (type) {
      case 'create':
        return 'primary';
      case 'edit':
        return 'info';
      case 'review':
        return 'success';
      default:
        return 'grey';
    }
  };

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          历史轨迹
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          查看您的作文创作和批改历史记录。
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Timeline position="alternate">
          {history.map((item) => (
            <TimelineItem key={item.id}>
              <TimelineOppositeContent color="text.secondary">
                {item.date}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot color={getColorByType(item.type) as any}>
                  {getIconByType(item.type)}
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                    {item.title}
                  </Typography>
                  <Typography>{item.description}</Typography>
                  {item.score && (
                    <Typography variant="body2" color="text.secondary">
                      得分: {item.score}
                    </Typography>
                  )}
                  <Box sx={{ mt: 1 }}>
                    <Link href={`/documents/${item.documentId}`} passHref>
                      <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
                        查看详情
                      </Typography>
                    </Link>
                  </Box>
                </Paper>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Paper>
    </Layout>
  );
} 