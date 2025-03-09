'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, Grid, Snackbar, Alert, 
  TextField, List, ListItem, ListItemText, ListItemIcon,
  Divider, Chip, CircularProgress, useTheme, useMediaQuery, 
  Card, CardContent, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  Compare as CompareIcon,
  InsertDriveFile as FileIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import Layout from '../components/layout/Layout';
import { useRouter } from 'next/navigation';

interface FileWithPreview extends File {
  preview?: string;
}

export default function TeacherReview() {
  const theme = useTheme();
  const isMobileMQ = useMediaQuery(theme.breakpoints.down('sm'));
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const [originalEssay, setOriginalEssay] = useState<FileWithPreview | null>(null);
  const [teacherReview, setTeacherReview] = useState<FileWithPreview | null>(null);
  const [studentName, setStudentName] = useState('');
  const [essayTitle, setEssayTitle] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [reviewDate, setReviewDate] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const fileInputRefOriginal = useRef<HTMLInputElement>(null);
  const fileInputRefTeacher = useRef<HTMLInputElement>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');

  useEffect(() => {
    setIsMobile(isMobileMQ);
  }, [isMobileMQ]);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleOriginalUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setSnackbarMessage('请上传DOCX格式的文件');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
        return;
      }
      setOriginalEssay(file);
      setSnackbarMessage('初稿上传成功');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    }
  };

  const handleTeacherReviewUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setSnackbarMessage('请上传DOCX格式的文件');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
        return;
      }
      setTeacherReview(file);
      setSnackbarMessage('老师修改稿上传成功');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    }
  };

  const handleUploadOriginalClick = () => {
    if (fileInputRefOriginal.current) {
      fileInputRefOriginal.current.click();
    }
  };

  const handleUploadTeacherClick = () => {
    if (fileInputRefTeacher.current) {
      fileInputRefTeacher.current.click();
    }
  };

  const handleCompare = async () => {
    if (!originalEssay || !teacherReview) {
      setSnackbarMessage('请先上传初稿和老师修改稿');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    if (!studentName || !essayTitle || !teacherName || !reviewDate) {
      setSnackbarMessage('请填写完整的基本信息');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    setAnalyzing(true);
    
    // 模拟AI分析过程
    setTimeout(() => {
      const mockComparisonResult = {
        summary: {
          totalChanges: 28,
          majorChanges: 7,
          minorChanges: 21,
          improvementAreas: ['语法', '词汇选择', '段落组织', '论证逻辑']
        },
        changes: [
          {
            type: 'major',
            original: '这是一个很好的观点，但是缺乏支持论据。',
            revised: '这是一个很好的观点，但需要具体事例和数据来支持。我建议加入近期的研究数据和专家观点，使论证更有说服力。',
            category: '论证深度',
            analysis: '老师强调了论证需要具体事例和数据支持，并提供了明确的改进建议。'
          },
          {
            type: 'minor',
            original: '我认为这个问题很重要。',
            revised: '由此可见，这个问题具有重大意义。',
            category: '表达方式',
            analysis: '修改使表达更加正式，避免了第一人称的使用，符合学术写作规范。'
          },
          {
            type: 'major',
            original: '最后，这个问题需要解决。',
            revised: '综上所述，针对这一问题，我们应当从政策制定、教育引导及社会参与三个层面共同发力，才能取得实质性进展。',
            category: '结论深度',
            analysis: '老师大幅加强了结论部分，从单一笼统的表述扩展为多层次、有条理的总结，并提出了具体的解决方向。'
          },
          {
            type: 'minor',
            original: '人们都知道环境保护很重要。',
            revised: '环境保护的重要性已成为全球共识。',
            category: '措辞精确性',
            analysis: '避免了"人们都知道"这类模糊表述，使论述更加准确有力。'
          }
        ],
        recommendations: [
          '注意论证时需要提供充分的事实依据和数据支持',
          '避免使用过于口语化的表达，保持学术写作的正式性',
          '结论部分需要全面概括文章要点，并提出有深度的见解',
          '注意措辞的精确性，避免模糊空泛的表述',
          '加强段落之间的逻辑连贯性，使文章结构更加紧密'
        ]
      };

      setComparisonResult(mockComparisonResult);
      setAnalyzing(false);

      setSnackbarMessage('分析完成');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    }, 3000);
  };

  const handleSaveArchive = async () => {
    // 模拟保存到数据库
    setSnackbarMessage('修改分析已归档保存');
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
    
    // 实际应用中可以在这里添加保存到数据库的逻辑
    setTimeout(() => {
      router.push('/documents');
    }, 1500);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Layout>
      <Box sx={{ mb: isMobile ? 2 : 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          老师修改
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          上传老师批改的作文，AI将分析修改内容，帮助您归纳总结提升点。
        </Typography>
      </Box>

      <Grid container spacing={isMobile ? 2 : 3}>
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: isMobile ? 2 : 3, 
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              基本信息
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="学生姓名"
                  variant="outlined"
                  fullWidth
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="作文标题"
                  variant="outlined"
                  fullWidth
                  value={essayTitle}
                  onChange={(e) => setEssayTitle(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="批改老师"
                  variant="outlined"
                  fullWidth
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="批改日期"
                  type="date"
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={reviewDate}
                  onChange={(e) => setReviewDate(e.target.value)}
                />
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
              文件上传
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <input
                  ref={fileInputRefOriginal}
                  type="file"
                  accept=".docx"
                  style={{ display: 'none' }}
                  onChange={handleOriginalUpload}
                />
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<CloudUploadIcon />}
                  onClick={handleUploadOriginalClick}
                  sx={{ 
                    py: 1.5, 
                    border: '1px dashed',
                    height: '100%',
                    textTransform: 'none'
                  }}
                >
                  上传作文初稿
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <input
                  ref={fileInputRefTeacher}
                  type="file"
                  accept=".docx"
                  style={{ display: 'none' }}
                  onChange={handleTeacherReviewUpload}
                />
                <Button
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  startIcon={<CloudUploadIcon />}
                  onClick={handleUploadTeacherClick}
                  sx={{ 
                    py: 1.5, 
                    border: '1px dashed',
                    height: '100%',
                    textTransform: 'none'
                  }}
                >
                  上传老师修改稿
                </Button>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                已上传文件:
              </Typography>
              <List dense>
                {originalEssay && (
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <FileIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={originalEssay.name} 
                      secondary={`${(originalEssay.size / 1024).toFixed(1)} KB`} 
                    />
                    <Chip 
                      label="初稿" 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  </ListItem>
                )}
                {teacherReview && (
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <FileIcon fontSize="small" color="secondary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={teacherReview.name} 
                      secondary={`${(teacherReview.size / 1024).toFixed(1)} KB`} 
                    />
                    <Chip 
                      label="老师修改稿" 
                      size="small" 
                      color="secondary" 
                      variant="outlined" 
                    />
                  </ListItem>
                )}
              </List>
            </Box>
            
            <Box sx={{ mt: 'auto', pt: 3 }}>
              <Button
                variant="contained"
                fullWidth
                color="primary"
                size="large"
                startIcon={<CompareIcon />}
                onClick={handleCompare}
                disabled={analyzing || !originalEssay || !teacherReview}
              >
                {analyzing ? '分析对比中...' : '开始分析对比'}
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: isMobile ? 2 : 3, 
              borderRadius: 2,
              minHeight: 450,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              修改分析结果
            </Typography>
            
            {analyzing && (
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: 'rgba(255,255,255,0.8)',
                  zIndex: 10
                }}
              >
                <CircularProgress size={60} sx={{ mb: 2 }} />
                <Typography variant="body1">
                  正在分析文档差异...
                </Typography>
              </Box>
            )}
            
            {comparisonResult ? (
              <Box sx={{ overflow: 'auto', flex: 1 }}>
                <Card sx={{ mb: 2, bgcolor: '#f8f9fa' }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      总体分析
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                          <Typography variant="h5" color="primary" fontWeight="bold">
                            {comparisonResult.summary.totalChanges}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            总修改数
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                          <Typography variant="h5" color="error" fontWeight="bold">
                            {comparisonResult.summary.majorChanges}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            重要修改
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                          <Typography variant="h5" color="info" fontWeight="bold">
                            {comparisonResult.summary.minorChanges}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            细节修改
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                          <Typography variant="h5" color="success" fontWeight="bold">
                            {comparisonResult.summary.improvementAreas.length}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            提升领域
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    需要提升的领域:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {comparisonResult.summary.improvementAreas.map((area: string, index: number) => (
                      <Chip 
                        key={index} 
                        label={area} 
                        color="primary" 
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
                
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  详细修改分析:
                </Typography>
                
                {comparisonResult.changes.map((change: any, index: number) => (
                  <Accordion key={index} sx={{ mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Chip 
                          label={change.type === 'major' ? '重要修改' : '细节修改'} 
                          size="small" 
                          color={change.type === 'major' ? 'error' : 'info'}
                          sx={{ mr: 1 }}
                        />
                        <Typography sx={{ flexGrow: 1 }}>
                          {change.category}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" fontWeight="bold" color="text.secondary">
                          原文:
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 1, bgcolor: '#ffefef', mt: 0.5 }}>
                          <Typography variant="body2">
                            {change.original}
                          </Typography>
                        </Paper>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" fontWeight="bold" color="text.secondary">
                          修改后:
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 1, bgcolor: '#e6f4ea', mt: 0.5 }}>
                          <Typography variant="body2">
                            {change.revised}
                          </Typography>
                        </Paper>
                      </Box>
                      <Box>
                        <Typography variant="body2" fontWeight="bold" color="text.secondary">
                          分析:
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {change.analysis}
                        </Typography>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    学习建议:
                  </Typography>
                  <List>
                    {comparisonResult.recommendations.map((recommendation: string, index: number) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckIcon fontSize="small" color="success" />
                        </ListItemIcon>
                        <ListItemText primary={recommendation} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
                
                <Box sx={{ mt: 3, textAlign: 'right' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveArchive}
                  >
                    保存归档
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                flex: 1,
                p: 3
              }}>
                <DescriptionIcon color="disabled" sx={{ fontSize: 60, mb: 2, opacity: 0.3 }} />
                <Typography variant="body1" color="text.secondary" align="center">
                  请上传作文初稿和老师修改稿，然后点击"开始分析对比"按钮
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Layout>
  );
} 