'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, TextField, Button, Grid, Snackbar, Alert,
  Card, CardContent, Collapse, Tooltip, CircularProgress, IconButton,
  useTheme, useMediaQuery
} from '@mui/material';
import { 
  Download as DownloadIcon, AutoAwesome as AutoAwesomeIcon, 
  ExpandMore as ExpandMoreIcon, Check as CheckIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import Layout from '../components/layout/Layout';
import { useRouter } from 'next/navigation';

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

interface OutlineItem {
  title: string;
  content: string;
  subItems?: OutlineItem[];
}

interface WritingGuide {
  outline: OutlineItem[];
  suggestions: string[];
  keyPoints: string[];
  references?: string[];
  filename?: string;
}

export default function NewEssay() {
  const theme = useTheme();
  // 避免服务端渲染不匹配
  const isMobileMQ = useMediaQuery(theme.breakpoints.down('sm'), { noSsr: true, defaultMatches: false });
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [grade, setGrade] = useState('三年级');
  const [saving, setSaving] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  
  // 提纲生成相关状态
  const [generatingOutline, setGeneratingOutline] = useState(false);
  const [writingGuide, setWritingGuide] = useState<WritingGuide | null>(null);
  const [outlineExpanded, setOutlineExpanded] = useState(true);

  useEffect(() => {
    // 在客户端渲染时更新状态，避免hydration不匹配
    setIsMobile(isMobileMQ);
  }, [isMobileMQ]);

  // 获取AI建议
  const handleGetAIAdvice = async () => {
    if (!title.trim()) {
      setSnackbarMessage('请先输入作文题目');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }
    
    setGeneratingOutline(true);
    
    try {
      // 调用DeepSeek API获取AI写作建议
      const response = await fetch('/api/deepseek/writing-advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title, 
          grade 
        }),
      });

      if (!response.ok) {
        throw new Error('获取AI建议失败');
      }

      const data = await response.json();
      
      // 将API返回的数据转换为WritingGuide格式
      const apiOutline: WritingGuide = {
        outline: data.outline || [],
        suggestions: data.suggestions || [],
        keyPoints: data.keyPoints || [],
        references: data.references || [],
        filename: title + '_作文提纲.docx'
      };
      
      setWritingGuide(apiOutline);
      setSnackbarMessage('AI写作建议生成成功');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } catch (error) {
      console.error('获取AI建议错误:', error);
      setSnackbarMessage('获取AI建议失败，请稍后重试');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setGeneratingOutline(false);
    }
  };

  // 下载提纲DOCX文档并保存到服务器
  const handleDownloadOutline = async () => {
    if (!writingGuide) {
      setSnackbarMessage('请先获取AI写作建议');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }
    
    // 显示保存中状态
    setSaving(true);
    
    try {
      // 调用API保存文档到服务器
      const response = await fetch('/api/documents/save-outline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          grade,
          writingGuide
        }),
      });
      
      if (!response.ok) {
        throw new Error('保存文档失败');
      }
      
      const data = await response.json();
      
      // 使用返回的URL创建下载链接
      if (data.fileUrl) {
        const link = document.createElement('a');
        link.href = data.fileUrl;
        link.target = '_blank';
        link.download = data.fileName || (title + '_作文提纲.docx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setSnackbarMessage('文档已保存到服务器并开始下载');
        setSnackbarSeverity('success');
      } else {
        setSnackbarMessage('文档已保存到服务器');
        setSnackbarSeverity('success');
      }
    } catch (error) {
      console.error('保存文档错误:', error);
      setSnackbarMessage('保存文档失败，请稍后重试');
      setSnackbarSeverity('error');
    } finally {
      setSaving(false);
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Layout>
      <Box sx={{ mb: { xs: 2, md: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          获取AI写作建议
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          输入作文题目，AI助手将为您提供写作建议和提纲结构。
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ 
        p: { xs: 2, md: 3 }, 
        borderRadius: 2,
        minHeight: '500px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={8}>
              <TextField
                label="作文题目"
                variant="outlined"
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="请输入作文题目"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 1, height: '100%' }}>
                <TextField
                  select
                  label="年级"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  SelectProps={{
                    native: true,
                  }}
                  fullWidth
                  sx={{ flexGrow: 1 }}
                >
                  {['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </TextField>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleGetAIAdvice}
                  disabled={generatingOutline || !title.trim()}
                  startIcon={generatingOutline ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                  sx={{ minWidth: 120, whiteSpace: 'nowrap' }}
                >
                  {generatingOutline ? '生成中...' : '获取AI建议'}
                </Button>
              </Box>
            </Grid>
          </Grid>
          
          {generatingOutline ? (
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                flexGrow: 1,
                p: 3,
                bgcolor: '#f5f5f5',
                borderRadius: 2,
                textAlign: 'center'
              }}
            >
              <CircularProgress size={60} sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                正在生成AI写作建议...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                DeepSeek AI正在为"{title}"创建专业的写作指导<br />
                这可能需要几秒钟时间
              </Typography>
            </Box>
          ) : writingGuide ? (
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              <Card variant="outlined">
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      cursor: 'pointer' 
                    }}
                    onClick={() => setOutlineExpanded(!outlineExpanded)}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      AI写作建议 (由DeepSeek提供)
                    </Typography>
                    <Box>
                      <Tooltip title="确认并下载AI建议DOCX">
                        <IconButton size="small" onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadOutline();
                        }}>
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <IconButton 
                        size="small"
                        sx={{
                          transform: outlineExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s',
                        }}
                      >
                        <ExpandMoreIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  {/* 其余部分保持不变 */}

                  <Collapse in={outlineExpanded}>
                    <Box sx={{ mt: 1.5 }}>
                      <Typography variant="body2" fontWeight="bold" gutterBottom>
                        提纲结构:
                      </Typography>
                      <Box sx={{ ml: 2, mb: 2 }}>
                        {writingGuide.outline.map((section, index) => (
                          <Box key={index} sx={{ mb: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                              {index + 1}. {section.title}
                            </Typography>
                            <Typography variant="body2" sx={{ ml: 2 }}>
                              {section.content}
                            </Typography>
                            {section.subItems && section.subItems.length > 0 && (
                              <Box sx={{ ml: 2 }}>
                                {section.subItems.map((subItem, subIndex) => (
                                  <Box key={subIndex} sx={{ mt: 0.5 }}>
                                    <Typography variant="body2" fontWeight="bold">
                                      • {subItem.title}
                                    </Typography>
                                    <Typography variant="body2" sx={{ ml: 2 }}>
                                      {subItem.content}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            )}
                          </Box>
                        ))}
                      </Box>
                      
                      <Typography variant="body2" fontWeight="bold" gutterBottom>
                        写作建议:
                      </Typography>
                      <Box sx={{ ml: 2, mb: 2 }}>
                        {writingGuide.suggestions.map((suggestion, index) => (
                          <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                            • {suggestion}
                          </Typography>
                        ))}
                      </Box>
                      
                      <Typography variant="body2" fontWeight="bold" gutterBottom>
                        关键点:
                      </Typography>
                      <Box sx={{ ml: 2 }}>
                        {writingGuide.keyPoints.map((point, index) => (
                          <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                            • {point}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            </Box>
          ) : (
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                flexGrow: 1,
                p: 3,
                bgcolor: '#f5f5f5',
                borderRadius: 2,
                textAlign: 'center'
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                等待生成AI写作建议
              </Typography>
              <Typography variant="body2" color="text.secondary">
                请输入作文题目并点击"获取AI建议"按钮<br />
                AI将为您生成作文提纲和写作建议
              </Typography>
            </Box>
          )}

          <ClientOnly>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleDownloadOutline}
                disabled={saving || !writingGuide}
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <FileDownloadIcon />}
              >
                {saving ? '保存中...' : '确认并下载AI建议'}
              </Button>
            </Box>
          </ClientOnly>
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