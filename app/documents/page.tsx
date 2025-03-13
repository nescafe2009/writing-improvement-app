'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Tabs, Tab, Table, TableBody, TableCell, TableContainer, 
         TableHead, TableRow, Chip, IconButton, Button, CircularProgress, Alert, Snackbar,
         Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
         Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { Visibility as VisibilityIcon, Delete as DeleteIcon, Edit as EditIcon,
         BorderColor as BorderColorIcon, Psychology as PsychologyIcon, 
         School as SchoolIcon, Assignment as AssignmentIcon, Folder as FolderIcon,
         Refresh as RefreshIcon, DownloadForOffline as DownloadIcon,
         Close as CloseIcon, OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import Layout from '../components/layout/Layout';
import Link from 'next/link';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// 文档类型映射
const TAB_TYPES = [
  'all',         // 全部文档
  'outline',     // 提纲和写作建议
  'draft',       // 作文初稿
  'ai_review',   // AI评价
  'ai_improved', // AI修改稿
  'teacher_final' // 老师修改终稿
];

export default function Documents() {
  const [tabValue, setTabValue] = useState(0);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  
  // 删除确认对话框状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  
  // 预览对话框状态
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [documentToPreview, setDocumentToPreview] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 获取文档列表的函数
  const fetchDocuments = async (type = 'all') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/documents/list?type=${type}`);
      
      if (!response.ok) {
        throw new Error('获取文档列表失败');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setDocuments(data.documents || []);
      } else {
        throw new Error(data.error || '未知错误');
      }
    } catch (err: any) {
      console.error('获取文档列表错误:', err);
      setError(err.message || '获取文档列表失败');
      setSnackbarMessage('获取文档列表失败：' + (err.message || '未知错误'));
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载和标签页变化时获取文档
  useEffect(() => {
    const type = TAB_TYPES[tabValue];
    fetchDocuments(type);
  }, [tabValue]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // 打开删除确认对话框
  const handleOpenDeleteDialog = (document: any) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  // 关闭删除确认对话框
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDocumentToDelete(null);
  };

  // 确认删除文档
  const handleConfirmDelete = async () => {
    if (!documentToDelete) return;
    
    setDeleting(true);
    
    try {
      const response = await fetch(`/api/documents/delete?filePath=${encodeURIComponent(documentToDelete.id)}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        // 从列表中移除已删除的文档
        setDocuments(documents.filter(doc => doc.id !== documentToDelete.id));
        setSnackbarMessage(`文档 "${documentToDelete.title}" 已成功删除`);
        setSnackbarSeverity('success');
      } else {
        throw new Error(data.error || '删除失败');
      }
    } catch (error: any) {
      console.error('删除文档错误:', error);
      setSnackbarMessage(`删除失败: ${error.message || '未知错误'}`);
      setSnackbarSeverity('error');
    } finally {
      setDeleting(false);
      setOpenSnackbar(true);
      handleCloseDeleteDialog();
    }
  };

  const handleDeleteDocument = (document: any) => {
    handleOpenDeleteDialog(document);
  };

  const handleRefresh = () => {
    const type = TAB_TYPES[tabValue];
    fetchDocuments(type);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // 根据文档类型获取图标
  const getIconByType = (type: string): React.ReactElement => {
    switch (type) {
      case 'outline':
        return <AssignmentIcon fontSize="small" />;
      case 'draft':
        return <BorderColorIcon fontSize="small" />;
      case 'ai_review':
        return <PsychologyIcon fontSize="small" />;
      case 'ai_improved':
        return <PsychologyIcon fontSize="small" />;
      case 'teacher_final':
        return <SchoolIcon fontSize="small" />;
      default:
        return <VisibilityIcon fontSize="small" />;
    }
  };

  // 根据文档类型获取颜色
  const getColorByType = (type: string) => {
    switch (type) {
      case 'outline':
        return 'info';
      case 'draft':
        return 'default';
      case 'ai_review':
        return 'warning';
      case 'ai_improved':
        return 'secondary';
      case 'teacher_final':
        return 'success';
      default:
        return 'primary';
    }
  };

  // 根据文档类型获取状态文本
  const getStatusByType = (type: string) => {
    switch (type) {
      case 'outline':
        return '提纲和写作建议';
      case 'draft':
        return '作文初稿';
      case 'ai_review':
        return 'AI评价';
      case 'ai_improved':
        return 'AI修改稿';
      case 'teacher_final':
        return '老师修改终稿';
      default:
        return '未知状态';
    }
  };

  // 打开预览对话框
  const handleOpenPreviewDialog = (document: any) => {
    // 对于DOCX文件，创建Google Docs Viewer URL
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(document.url)}&embedded=true`;
    setPreviewUrl(viewerUrl);
    setDocumentToPreview(document);
    setPreviewDialogOpen(true);
  };

  // 关闭预览对话框
  const handleClosePreviewDialog = () => {
    setPreviewDialogOpen(false);
    setDocumentToPreview(null);
    setPreviewUrl('');
  };

  // 下载文档
  const handleDownloadDocument = (docItem: any) => {
    // 确保代码只在客户端执行
    if (typeof window !== 'undefined' && window.document) {
      // 创建临时链接并点击下载
      const link = window.document.createElement('a');
      link.href = docItem.url;
      link.target = '_blank';
      link.download = docItem.title + '.docx';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    }
  };

  // 在新窗口打开预览
  const handleOpenInNewWindow = (document: any) => {
    // 确保代码只在客户端执行
    if (typeof window !== 'undefined') {
      // 对于DOCX文件，创建Google Docs Viewer URL
      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(document.url)}`;
      window.open(viewerUrl, '_blank');
    }
  };

  return (
    <Layout>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
            文档管理中心
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            管理您的作文和批改记录。
          </Typography>
        </div>
        <IconButton onClick={handleRefresh} disabled={loading}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="document tabs"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '.MuiTab-root': {
                minWidth: { xs: 'auto', sm: 100 },
                px: { xs: 1, sm: 2 },
                py: { xs: 0.5, sm: 1 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }
            }}
          >
            <Tab 
              label="全部文档" 
              icon={<FolderIcon fontSize="small" />} 
              iconPosition="start"
            />
            <Tab 
              label="提纲和写作建议" 
              icon={<AssignmentIcon fontSize="small" />} 
              iconPosition="start"
            />
            <Tab 
              label="作文初稿" 
              icon={<BorderColorIcon fontSize="small" />} 
              iconPosition="start"
            />
            <Tab 
              label="AI评价" 
              icon={<PsychologyIcon fontSize="small" />} 
              iconPosition="start"
            />
            <Tab 
              label="AI修改稿" 
              icon={<PsychologyIcon fontSize="small" />} 
              iconPosition="start"
            />
            <Tab 
              label="老师修改终稿" 
              icon={<SchoolIcon fontSize="small" />} 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TabPanel value={tabValue} index={0}>
              <DocumentTable 
                documents={documents} 
                onDelete={handleDeleteDocument} 
                getIconByType={getIconByType}
                getColorByType={getColorByType}
                getStatusByType={getStatusByType}
                onPreview={handleOpenPreviewDialog}
                onDownload={handleDownloadDocument}
              />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <DocumentTable 
                documents={documents} 
                onDelete={handleDeleteDocument} 
                getIconByType={getIconByType}
                getColorByType={getColorByType}
                getStatusByType={getStatusByType}
                onPreview={handleOpenPreviewDialog}
                onDownload={handleDownloadDocument}
              />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <DocumentTable 
                documents={documents} 
                onDelete={handleDeleteDocument}
                getIconByType={getIconByType}
                getColorByType={getColorByType}
                getStatusByType={getStatusByType}
                onPreview={handleOpenPreviewDialog}
                onDownload={handleDownloadDocument}
              />
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
              <DocumentTable 
                documents={documents} 
                onDelete={handleDeleteDocument}
                getIconByType={getIconByType}
                getColorByType={getColorByType}
                getStatusByType={getStatusByType}
                onPreview={handleOpenPreviewDialog}
                onDownload={handleDownloadDocument}
              />
            </TabPanel>
            <TabPanel value={tabValue} index={4}>
              <DocumentTable 
                documents={documents} 
                onDelete={handleDeleteDocument}
                getIconByType={getIconByType}
                getColorByType={getColorByType}
                getStatusByType={getStatusByType}
                onPreview={handleOpenPreviewDialog}
                onDownload={handleDownloadDocument}
              />
            </TabPanel>
            <TabPanel value={tabValue} index={5}>
              <DocumentTable 
                documents={documents} 
                onDelete={handleDeleteDocument}
                getIconByType={getIconByType}
                getColorByType={getColorByType}
                getStatusByType={getStatusByType}
                onPreview={handleOpenPreviewDialog}
                onDownload={handleDownloadDocument}
              />
            </TabPanel>
          </>
        )}
      </Paper>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Link href="/new-essay" passHref>
          <Button variant="contained" color="primary" startIcon={<EditIcon />}>
            创建新作文
          </Button>
        </Link>
      </Box>

      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* 删除确认对话框 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        fullWidth
        maxWidth="xs"
        sx={{
          '.MuiDialog-paper': {
            m: { xs: 1, sm: 2 },
            width: { xs: 'calc(100% - 16px)', sm: '400px' }
          }
        }}
      >
        <DialogTitle id="delete-dialog-title" 
          sx={{ 
            pb: 1,
            fontSize: { xs: '1.1rem', sm: '1.25rem' }
          }}
        >
          确认删除
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            您确定要删除文档 "{documentToDelete?.title}" 吗？此操作无法撤销。
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button 
            onClick={handleCloseDeleteDialog} 
            disabled={deleting}
            variant={isMobile ? "outlined" : "text"}
            size={isMobile ? "medium" : "small"}
          >
            取消
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            autoFocus
            disabled={deleting}
            variant={isMobile ? "contained" : "text"}
            size={isMobile ? "medium" : "small"}
            startIcon={deleting ? <CircularProgress size={20} /> : null}
          >
            {deleting ? '删除中...' : '删除'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 文档预览对话框 */}
      <Dialog
        open={previewDialogOpen}
        onClose={handleClosePreviewDialog}
        aria-labelledby="preview-dialog-title"
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
        sx={{
          '.MuiDialog-paper': {
            m: { xs: 1, sm: 2, md: 3 }
          }
        }}
      >
        <DialogTitle id="preview-dialog-title" sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: { xs: 1.5, sm: 2 },
          fontSize: { xs: '1rem', sm: '1.25rem' }
        }}>
          <Typography 
            variant="h6" 
            component="div" 
            noWrap 
            sx={{ 
              maxWidth: { xs: '60%', sm: '70%' },
              fontSize: { xs: '0.9rem', sm: '1.25rem' }
            }}
          >
            {documentToPreview?.title}
          </Typography>
          {/* 只在客户端渲染这些按钮 */}
          {!isMobile && (
            <Box>
              <Tooltip title="在新窗口打开">
                <IconButton 
                  onClick={() => documentToPreview && handleOpenInNewWindow(documentToPreview)}
                  size="small"
                >
                  <OpenInNewIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="下载文档">
                <IconButton 
                  onClick={() => documentToPreview && handleDownloadDocument(documentToPreview)}
                  size="small"
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <IconButton 
                onClick={handleClosePreviewDialog}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </Box>
          )}
        </DialogTitle>
        <DialogContent sx={{ height: '70vh', padding: 0 }}>
          {previewUrl && typeof window !== 'undefined' && (
            <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <iframe 
                src={previewUrl}
                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                title="文档预览"
              />
            </Box>
          )}
        </DialogContent>
        {isMobile && (
          <DialogActions sx={{ justifyContent: 'space-between', p: 1.5 }}>
            <Button 
              variant="outlined"
              onClick={() => documentToPreview && handleDownloadDocument(documentToPreview)}
              startIcon={<DownloadIcon />}
            >
              下载
            </Button>
            <Button 
              variant="contained" 
              onClick={() => documentToPreview && handleOpenInNewWindow(documentToPreview)}
              startIcon={<OpenInNewIcon />}
              color="primary"
            >
              新窗口打开
            </Button>
            <Button 
              variant="outlined"
              onClick={handleClosePreviewDialog}
              startIcon={<CloseIcon />}
              color="error"
            >
              关闭
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </Layout>
  );
}

interface DocumentTableProps {
  documents: any[];
  onDelete: (document: any) => void;
  getIconByType: (type: string) => React.ReactElement;
  getColorByType: (type: string) => string;
  getStatusByType: (type: string) => string;
  onPreview?: (document: any) => void;
  onDownload?: (document: any) => void;
}

function DocumentTable({ 
  documents, 
  onDelete, 
  getIconByType, 
  getColorByType, 
  getStatusByType,
  onPreview = () => {},
  onDownload = () => {}
}: DocumentTableProps) {
  // 使用MUI的媒体查询钩子检测小屏幕
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  // 如果是小屏幕设备，使用卡片布局
  if (isSmallScreen) {
    return (
      <Box sx={{ mb: 2 }}>
        {documents.length > 0 ? (
          documents.map((doc) => (
            <Paper 
              key={doc.id} 
              elevation={1} 
              sx={{ 
                mb: 2, 
                p: 2, 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" noWrap sx={{ maxWidth: '70%' }}>
                  {doc.title}
                </Typography>
                <Chip
                  icon={getIconByType(doc.type)}
                  label={getStatusByType(doc.type)}
                  color={getColorByType(doc.type) as any}
                  size="small"
                />
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  日期: {doc.date}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  年级: {doc.grade}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  大小: {doc.size || '-'}KB
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<VisibilityIcon />} 
                  onClick={() => onPreview(doc)}
                  fullWidth
                >
                  预览
                </Button>
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<DownloadIcon />} 
                  onClick={() => onDownload(doc)}
                  fullWidth
                >
                  下载
                </Button>
                <Button 
                  variant="outlined" 
                  color="error" 
                  size="small" 
                  startIcon={<DeleteIcon />} 
                  onClick={() => onDelete(doc)}
                  fullWidth
                >
                  删除
                </Button>
              </Box>
            </Paper>
          ))
        ) : (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1">暂无文档</Typography>
          </Paper>
        )}
      </Box>
    );
  }

  // 大屏幕使用表格布局
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>标题</TableCell>
            <TableCell>日期</TableCell>
            <TableCell>年级</TableCell>
            <TableCell>类型</TableCell>
            <TableCell>大小(KB)</TableCell>
            <TableCell>操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {documents.length > 0 ? (
            documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>{doc.title}</TableCell>
                <TableCell>{doc.date}</TableCell>
                <TableCell>{doc.grade}</TableCell>
                <TableCell>
                  <Chip
                    icon={getIconByType(doc.type)}
                    label={getStatusByType(doc.type)}
                    color={getColorByType(doc.type) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>{doc.size || '-'}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex' }}>
                    <Tooltip title="预览文档">
                      <IconButton color="primary" size="small" onClick={() => onPreview(doc)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="下载文档">
                      <IconButton color="primary" size="small" onClick={() => onDownload(doc)}>
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="删除文档">
                      <IconButton color="error" size="small" onClick={() => onDelete(doc)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="center">
                暂无文档
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
} 