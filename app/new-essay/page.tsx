'use client';

import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Grid, Snackbar, Alert } from '@mui/material';
import { Save as SaveIcon, Send as SendIcon } from '@mui/icons-material';
import Layout from '../components/layout/Layout';
import { useRouter } from 'next/navigation';

export default function NewEssay() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [grade, setGrade] = useState('三年级');
  const [saving, setSaving] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const handleSaveAsDraft = async () => {
    if (!title || !content) {
      setSnackbarMessage('请填写标题和内容');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    setSaving(true);
    try {
      // 这里可以添加保存到Firebase的逻辑
      // 模拟保存操作
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSnackbarMessage('草稿保存成功');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      
      // 保存成功后可以跳转到文档管理页面
      setTimeout(() => {
        router.push('/documents');
      }, 1500);
    } catch (error) {
      console.error('保存草稿错误:', error);
      setSnackbarMessage('保存草稿失败，请稍后重试');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!title || !content) {
      setSnackbarMessage('请填写标题和内容');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    setSaving(true);
    try {
      // 这里可以添加保存并提交批改的逻辑
      // 模拟操作
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSnackbarMessage('作文已提交批改');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      
      // 提交成功后跳转到批改页面
      setTimeout(() => {
        router.push('/review');
      }, 1500);
    } catch (error) {
      console.error('提交批改错误:', error);
      setSnackbarMessage('提交批改失败，请稍后重试');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          创建新作文
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          写下您的想法，创作精彩作文。
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Box component="form" sx={{ mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <TextField
                label="作文标题"
                variant="outlined"
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="请输入作文标题"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                label="年级"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                SelectProps={{
                  native: true,
                }}
                fullWidth
              >
                {['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="作文内容"
                variant="outlined"
                fullWidth
                multiline
                rows={15}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="请输入您的作文内容..."
              />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleSaveAsDraft}
            disabled={saving}
            startIcon={<SaveIcon />}
          >
            保存为草稿
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitForReview}
            disabled={saving}
            startIcon={<SendIcon />}
          >
            提交批改
          </Button>
        </Box>
      </Paper>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Layout>
  );
} 