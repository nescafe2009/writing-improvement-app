'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, TextField, Button,
  CircularProgress, Grid, Rating, useMediaQuery, useTheme
} from '@mui/material';
import Layout from '../components/layout/Layout';

export default function Review() {
  const theme = useTheme();
  const isMobileMQ = useMediaQuery(theme.breakpoints.down('sm'));
  const [isMobile, setIsMobile] = useState(false);
  const [essay, setEssay] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackType | null>(null);

  useEffect(() => {
    // 在客户端渲染时更新状态，避免hydration不匹配
    setIsMobile(isMobileMQ);
  }, [isMobileMQ]);

  interface FeedbackType {
    score: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    improvedEssay: string;
  }

  // 模拟的评价功能
  const handleSubmit = async () => {
    if (!essay.trim()) return;

    setLoading(true);
    // 模拟API请求延迟
    setTimeout(() => {
      const mockFeedback: FeedbackType = {
        score: 85,
        strengths: [
          '论点清晰，有说服力',
          '语言表达流畅',
          '结构组织合理'
        ],
        weaknesses: [
          '部分论据缺乏具体事例支持',
          '结尾部分略显仓促',
          '个别段落之间过渡不够自然'
        ],
        suggestions: [
          '增加具体的例子来支持您的论点',
          '扩展结论部分，强化中心思想',
          '注意段落之间的过渡，可以使用过渡词增强连贯性'
        ],
        improvedEssay: essay + '\n\n[这里是AI优化后的内容示例]'
      };
      setFeedback(mockFeedback);
      setLoading(false);
    }, 2000);
  };

  return (
    <Layout>
      <Typography variant="h4" component="h1" sx={{ 
        mb: isMobile ? 2 : 4, 
        fontWeight: 'bold',
        fontSize: isMobile ? '1.75rem' : '2.125rem'
      }}>
        AI作文批改
      </Typography>

      <Paper elevation={0} sx={{ 
        p: isMobile ? 2 : 4, 
        mb: isMobile ? 3 : 5, 
        borderRadius: 2, 
        bgcolor: '#f5f5f5' 
      }}>
        <Typography variant="h6" sx={{ 
          mb: isMobile ? 1.5 : 2, 
          fontSize: isMobile ? '1.1rem' : '1.25rem'
        }}>
          粘贴您的作文内容，获取AI评价和改进建议
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={isMobile ? 8 : 12}
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          placeholder="在此粘贴或输入您的作文内容..."
          variant="outlined"
          sx={{ mb: 2, bgcolor: 'white' }}
        />
        <Button
          variant="contained"
          color="primary"
          size={isMobile ? "medium" : "large"}
          onClick={handleSubmit}
          disabled={loading || !essay.trim()}
          fullWidth={isMobile}
          sx={{ minWidth: isMobile ? 'auto' : 120 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : '提交评价'}
        </Button>
      </Paper>

      {feedback && (
        <Paper elevation={0} sx={{ 
          p: isMobile ? 2 : 4, 
          borderRadius: 2, 
          bgcolor: '#f8f9fa' 
        }}>
          <Box sx={{ mb: isMobile ? 2 : 3, display: 'flex', alignItems: 'center', flexDirection: isMobile ? 'column' : 'row' }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 'bold', 
              mr: isMobile ? 0 : 2,
              mb: isMobile ? 1 : 0
            }}>
              总体评分:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant={isMobile ? "h5" : "h4"} color="primary" sx={{ mr: 1, fontWeight: 'bold' }}>
                {feedback.score}
              </Typography>
              <Rating value={feedback.score / 20} precision={0.5} readOnly sx={{ ml: 1 }} />
            </Box>
          </Box>

          <Grid container spacing={isMobile ? 2 : 3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ mb: isMobile ? 2 : 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: 'success.main' }}>
                  优点
                </Typography>
                <ul style={{ marginTop: 8, paddingLeft: isMobile ? 20 : 24 }}>
                  {feedback.strengths.map((item, index) => (
                    <li key={index}>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        {item}
                      </Typography>
                    </li>
                  ))}
                </ul>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ mb: isMobile ? 2 : 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: 'error.main' }}>
                  有待改进
                </Typography>
                <ul style={{ marginTop: 8, paddingLeft: isMobile ? 20 : 24 }}>
                  {feedback.weaknesses.map((item, index) => (
                    <li key={index}>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        {item}
                      </Typography>
                    </li>
                  ))}
                </ul>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: 'info.main' }}>
                  改进建议
                </Typography>
                <ul style={{ marginTop: 8, paddingLeft: isMobile ? 20 : 24 }}>
                  {feedback.suggestions.map((item, index) => (
                    <li key={index}>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        {item}
                      </Typography>
                    </li>
                  ))}
                </ul>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: isMobile ? 2 : 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              修改后的作文
            </Typography>
            <Paper variant="outlined" sx={{ p: isMobile ? 1.5 : 2, bgcolor: 'white' }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {feedback.improvedEssay}
              </Typography>
            </Paper>
          </Box>
        </Paper>
      )}
    </Layout>
  );
} 