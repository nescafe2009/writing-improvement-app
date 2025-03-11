'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Paper, TextField, Button,
  CircularProgress, Grid, Rating, useMediaQuery, useTheme,
  Divider, IconButton, Alert, Snackbar
} from '@mui/material';
import {
  PhotoLibrary as PhotoLibraryIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import Layout from '../components/layout/Layout';

export default function Review() {
  const theme = useTheme();
  const isMobileMQ = useMediaQuery(theme.breakpoints.down('sm'));
  const [isMobile, setIsMobile] = useState(false);
  const [essay, setEssay] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackType | null>(null);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [ocrStatus, setOcrStatus] = useState('idle'); // idle, processing, success, error
  const [ocrText, setOcrText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 在客户端渲染时更新状态，避免hydration不匹配
    setIsMobile(isMobileMQ);
  }, [isMobileMQ]);

  useEffect(() => {
    // 当有OCR文本时，自动填充到文本框
    if (ocrText && ocrStatus === 'success') {
      setEssay(ocrText);
    }
  }, [ocrText, ocrStatus]);

  interface FeedbackType {
    score: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    improvedEssay: string;
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    
    // 检查文件类型
    const invalidFiles = newFiles.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      setErrorMessage('请只上传图片文件');
      setOpenSnackbar(true);
      return;
    }

    // 更新上传的图片列表
    const updatedImages = [...uploadedImages, ...newFiles];
    setUploadedImages(updatedImages);

    // 生成图片预览URL
    const newImageUrls = newFiles.map(file => URL.createObjectURL(file));
    setImageUrls([...imageUrls, ...newImageUrls]);

    // 重置文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    // 释放URL，避免内存泄漏
    URL.revokeObjectURL(imageUrls[index]);

    // 移除图片
    const newImages = [...uploadedImages];
    newImages.splice(index, 1);
    setUploadedImages(newImages);

    // 移除URL
    const newUrls = [...imageUrls];
    newUrls.splice(index, 1);
    setImageUrls(newUrls);
  };

  const processOCR = async () => {
    if (uploadedImages.length === 0) {
      setErrorMessage('请先上传图片');
      setOpenSnackbar(true);
      return;
    }

    setOcrStatus('processing');

    try {
      // 创建FormData对象用于上传图片
      const formData = new FormData();
      uploadedImages.forEach((file) => {
        formData.append('images', file);
      });

      // 发送请求到后端API
      const response = await fetch('/api/ocr/process', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || `OCR处理失败: ${response.status}`);
      }
      
      if (data.text) {
        setOcrText(data.text);
        setEssay(data.text);
        setOcrStatus('success');
      } else {
        throw new Error(data.error || data.message || '文字识别失败，未返回识别结果');
      }
    } catch (error: any) {
      console.error('OCR处理错误:', error);
      setOcrStatus('error');
      setErrorMessage(`图片文字识别失败: ${error.message}`);
      setOpenSnackbar(true);
    }
  };

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

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
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
        mb: isMobile ? 3 : 5, 
        borderRadius: 2, 
        bgcolor: '#f5f5f5',
        p: 3
      }}>
        <Typography variant="h6" sx={{ 
          mb: isMobile ? 1.5 : 2, 
          fontSize: isMobile ? '1.1rem' : '1.25rem'
        }}>
          上传作文图片，AI将自动识别文字
        </Typography>
        
        {/* 隐藏的文件输入 */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: 'none' }}
          multiple
        />
        
        {/* 上传按钮区域 */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<PhotoLibraryIcon />}
            onClick={triggerFileInput}
            sx={{ width: '100%', maxWidth: 300 }}
          >
            从相册选择
          </Button>
        </Box>
        
        {/* 图片预览区域 */}
        {imageUrls.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
              已上传图片 ({imageUrls.length})
            </Typography>
            <Grid container spacing={2}>
              {imageUrls.map((url, index) => (
                <Grid item xs={6} sm={4} md={3} key={index}>
                  <Box
                    sx={{
                      position: 'relative',
                      paddingTop: '100%', // 1:1 宽高比
                      borderRadius: 1,
                      overflow: 'hidden',
                      border: '1px solid #e0e0e0',
                      bgcolor: 'white',
                    }}
                  >
                    <Box
                      component="img"
                      src={url}
                      alt={`图片 ${index + 1}`}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        p: 1,
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 5,
                        right: 5,
                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                      }}
                      onClick={() => removeImage(index)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
        
        {/* OCR处理按钮 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<UploadIcon />}
            onClick={processOCR}
            disabled={uploadedImages.length === 0 || ocrStatus === 'processing'}
            sx={{ minWidth: 200 }}
          >
            {ocrStatus === 'processing' ? (
              <>
                <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                正在识别...
              </>
            ) : (
              '识别图片文字'
            )}
          </Button>
          
          {ocrStatus === 'success' && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              文字识别成功！
            </Alert>
          )}
          
          {/* 识别结果预览 */}
          {ocrStatus === 'success' && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                识别结果预览
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, maxHeight: '300px', overflow: 'auto', bgcolor: 'white' }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {essay}
                </Typography>
              </Paper>
              
              {/* 提交按钮 */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size={isMobile ? "medium" : "large"}
                  onClick={handleSubmit}
                  disabled={loading || !essay.trim()}
                  sx={{ minWidth: isMobile ? '100%' : 200 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : '提交评价'}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
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

      {/* 错误提示 */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Layout>
  );
} 