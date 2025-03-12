'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Paper, TextField, Button,
  CircularProgress, Grid, Rating, useMediaQuery, useTheme,
  Divider, IconButton, Alert, Snackbar, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent
} from '@mui/material';
import {
  PhotoLibrary as PhotoLibraryIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  Download as DownloadIcon
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
  const [grade, setGrade] = useState<string>(''); // 年级状态
  
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

  // 计算当前年级的函数
  const calculateCurrentGrade = (): string => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JavaScript月份从0开始
    
    // 基准：
    // 2024年上半年是5年级上学期
    // 2024年下半年是5年级下学期
    // 2025年上半年是初一上学期
    
    // 上海学制：小学5年（1-5年级），初中4年（6-9年级，对应初一至初四），高中3年（10-12年级）
    
    // 上学期：2-7月，下学期：9-1月
    const isFirstHalf = currentMonth >= 2 && currentMonth <= 7;
    const isSecondHalf = currentMonth >= 9 || currentMonth == 1;
    
    if (currentYear == 2024) {
      if (isFirstHalf) {
        return "5"; // 2024上半年：5年级上学期
      } else if (isSecondHalf) {
        return "5"; // 2024下半年：5年级下学期
      }
    } else if (currentYear == 2025) {
      if (isFirstHalf) {
        return "6"; // 2025上半年：初一上学期
      } else if (isSecondHalf) {
        return "6"; // 2025下半年：初一下学期
      }
    } else if (currentYear > 2025) {
      // 2025年之后
      const yearDiff = currentYear - 2025;
      const baseGrade = 6; // 2025年上半年是初一(6)
      
      if (isFirstHalf) {
        // 上半年
        const calculatedGrade = baseGrade + yearDiff;
        return Math.min(12, calculatedGrade).toString();
      } else if (isSecondHalf) {
        // 下半年
        const calculatedGrade = baseGrade + yearDiff;
        return Math.min(12, calculatedGrade).toString();
      }
    } else if (currentYear < 2024) {
      // 2024年之前，按每年递减一个年级计算
      const yearDiff = 2024 - currentYear;
      const baseGrade = 5; // 2024年上半年是5年级
      
      if (isFirstHalf) {
        // 上半年
        const calculatedGrade = baseGrade - yearDiff;
        return Math.max(1, calculatedGrade).toString();
      } else if (isSecondHalf) {
        // 下半年
        const calculatedGrade = baseGrade - yearDiff;
        return Math.max(1, calculatedGrade).toString();
      }
    }
    
    // 默认返回5年级（如果月份不在定义的学期范围内）
    return "5";
  };

  // 在组件加载时设置默认年级
  useEffect(() => {
    setGrade(calculateCurrentGrade());
  }, []);

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

  // 处理年级变化
  const handleGradeChange = (event: SelectChangeEvent) => {
    setGrade(event.target.value);
  };

  // 模拟的评价功能
  const handleSubmit = async () => {
    if (!essay.trim()) return;

    setLoading(true);
    
    try {
      // 发送请求到DeepSeek评价API
      const response = await fetch('/api/essay/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ essay }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '评价请求失败');
      }

      const feedbackData = await response.json();
      setFeedback(feedbackData);
    } catch (error: any) {
      console.error('作文评价错误:', error);
      setErrorMessage(`评价失败: ${error.message}`);
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // 添加处理下载的函数
  const handleDownload = async () => {
    if (!feedback || !feedback.improvedEssay || !essay) {
      setErrorMessage('没有可下载的内容');
      setOpenSnackbar(true);
      return;
    }
    
    try {
      setLoading(true); // 开始加载状态
      
      // 提取作文标题 - 使用文本的前几个字或第一行作为标题
      const essayTitle = essay.split('\n')[0].trim().substring(0, 20) || '作文';
      
      // 调用新API保存多个文档
      const response = await fetch('/api/documents/save-multiple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: essayTitle,
          essay: essay, // 原始作文
          feedback: feedback, // 包含了改进后的作文和反馈信息
          grade: grade, // 添加年级信息
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '保存文档失败');
      }

      const data = await response.json();
      
      if (data.improvedFile.url) {
        // 创建一个隐藏的链接并触发下载
        const link = document.createElement('a');
        link.href = data.improvedFile.url;
        link.download = data.improvedFile.fileName; // 使用服务器提供的文件名
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 显示成功消息
        setErrorMessage('作文已成功保存至云端，AI修改版本已下载！');
        setOpenSnackbar(true);
      } else {
        // 显示成功消息但没有下载链接
        setErrorMessage('作文已成功保存至云端！');
        setOpenSnackbar(true);
      }
    } catch (error: any) {
      console.error('处理文档错误:', error);
      setErrorMessage(`保存失败: ${error.message}`);
      setOpenSnackbar(true);
    } finally {
      setLoading(false); // 结束加载状态
    }
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
              
              {/* 年级选择和提交按钮放在同一行 - 在窄屏上也保持水平排列 */}
              <Box sx={{ 
                mt: 3, 
                mb: 3, 
                display: 'flex', 
                flexDirection: 'row', // 始终保持水平排列
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2
              }}>
                <FormControl sx={{ 
                  width: '25%', // 从30%减小到25%
                  minWidth: 80, // 从100px减小到80px
                }}>
                  <InputLabel id="grade-select-label">年级</InputLabel>
                  <Select
                    labelId="grade-select-label"
                    id="grade-select"
                    value={grade}
                    label="年级"
                    onChange={handleGradeChange}
                    size="small" // 始终使用小尺寸
                  >
                    <MenuItem value="1">一年级</MenuItem>
                    <MenuItem value="2">二年级</MenuItem>
                    <MenuItem value="3">三年级</MenuItem>
                    <MenuItem value="4">四年级</MenuItem>
                    <MenuItem value="5">五年级</MenuItem>
                    <MenuItem value="6">初一</MenuItem>
                    <MenuItem value="7">初二</MenuItem>
                    <MenuItem value="8">初三</MenuItem>
                    <MenuItem value="9">初四</MenuItem>
                    <MenuItem value="10">高一</MenuItem>
                    <MenuItem value="11">高二</MenuItem>
                    <MenuItem value="12">高三</MenuItem>
                  </Select>
                </FormControl>
                
                <Button
                  variant="contained"
                  color="primary"
                  size="small" // 始终使用小尺寸
                  onClick={handleSubmit}
                  disabled={loading || !essay.trim()}
                  sx={{ 
                    width: '70%', // 从65%增加到70%
                    minWidth: 90, // 从100px减小到90px
                  }}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : '提交评价'}
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                修改后的作文
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
              >
                确认AI修改并下载
              </Button>
            </Box>
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
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={errorMessage.includes('成功') ? 'success' : 'error'} 
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Layout>
  );
} 