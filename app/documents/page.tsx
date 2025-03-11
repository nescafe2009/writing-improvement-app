'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Tabs, Tab, Table, TableBody, TableCell, TableContainer, 
         TableHead, TableRow, Chip, IconButton, Button, CircularProgress, Alert, Snackbar } from '@mui/material';
import { Visibility as VisibilityIcon, Delete as DeleteIcon, Edit as EditIcon,
         BorderColor as BorderColorIcon, Psychology as PsychologyIcon, 
         School as SchoolIcon, Assignment as AssignmentIcon, Folder as FolderIcon,
         Refresh as RefreshIcon } from '@mui/icons-material';
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
  'all',      // 全部文档
  'outline',  // 提纲和写作建议
  'draft',    // 作文草稿
  'ai_revised', // AI修改初稿
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

  const handleDeleteDocument = async (id: string) => {
    try {
      // 这里可以添加调用删除API的逻辑
      setSnackbarMessage('删除功能尚未实现');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      
      // 临时从前端列表移除
      setDocuments(documents.filter(doc => doc.id !== id));
    } catch (error: any) {
      setSnackbarMessage('删除文档失败：' + (error.message || '未知错误'));
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
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
      case 'ai_revised':
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
      case 'ai_revised':
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
        return '提纲和建议';
      case 'draft':
        return '作文草稿';
      case 'ai_revised':
        return 'AI修改初稿';
      case 'teacher_final':
        return '老师修改终稿';
      default:
        return '未知状态';
    }
  };

  return (
    <Layout>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
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

      <Paper elevation={0} sx={{ borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="document tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab 
              label="全部文档" 
              icon={<FolderIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="提纲和写作建议" 
              icon={<AssignmentIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="作文草稿" 
              icon={<BorderColorIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="AI修改初稿" 
              icon={<PsychologyIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="老师修改终稿" 
              icon={<SchoolIcon />} 
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
              />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <DocumentTable 
                documents={documents} 
                onDelete={handleDeleteDocument} 
                getIconByType={getIconByType}
                getColorByType={getColorByType}
                getStatusByType={getStatusByType}
              />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <DocumentTable 
                documents={documents} 
                onDelete={handleDeleteDocument}
                getIconByType={getIconByType}
                getColorByType={getColorByType}
                getStatusByType={getStatusByType}
              />
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
              <DocumentTable 
                documents={documents} 
                onDelete={handleDeleteDocument}
                getIconByType={getIconByType}
                getColorByType={getColorByType}
                getStatusByType={getStatusByType}
              />
            </TabPanel>
            <TabPanel value={tabValue} index={4}>
              <DocumentTable 
                documents={documents} 
                onDelete={handleDeleteDocument}
                getIconByType={getIconByType}
                getColorByType={getColorByType}
                getStatusByType={getStatusByType}
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
    </Layout>
  );
}

interface DocumentTableProps {
  documents: any[];
  onDelete: (id: string) => void;
  getIconByType: (type: string) => React.ReactElement;
  getColorByType: (type: string) => string;
  getStatusByType: (type: string) => string;
}

function DocumentTable({ documents, onDelete, getIconByType, getColorByType, getStatusByType }: DocumentTableProps) {
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
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      <IconButton color="primary" size="small">
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </a>
                    <IconButton color="error" size="small" onClick={() => onDelete(doc.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
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