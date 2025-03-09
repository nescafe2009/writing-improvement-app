'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Tabs, Tab, Table, TableBody, TableCell, TableContainer, 
         TableHead, TableRow, Chip, IconButton, Button } from '@mui/material';
import { Visibility as VisibilityIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
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

// 模拟数据
const mockDocuments = [
  {
    id: '1',
    title: '我的暑假生活',
    date: '2023-08-15',
    grade: '三年级',
    status: '已批改',
    score: 85,
  },
  {
    id: '2',
    title: '我的家乡',
    date: '2023-09-05',
    grade: '三年级',
    status: '已批改',
    score: 92,
  },
  {
    id: '3',
    title: '我最喜欢的动物',
    date: '2023-09-20',
    grade: '三年级',
    status: '草稿',
    score: null,
  },
  {
    id: '4',
    title: '一次难忘的旅行',
    date: '2023-10-10',
    grade: '三年级',
    status: '已批改',
    score: 88,
  },
];

export default function Documents() {
  const [tabValue, setTabValue] = useState(0);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    // 这里可以从Firebase获取数据
    setDocuments(mockDocuments);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDeleteDocument = (id: string) => {
    // 这里可以添加删除文档的逻辑
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  const getFilteredDocuments = () => {
    if (tabValue === 0) return documents;
    if (tabValue === 1) return documents.filter(doc => doc.status === '已批改');
    return documents.filter(doc => doc.status === '草稿');
  };

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          文档管理中心
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          管理您的作文和批改记录。
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="document tabs">
            <Tab label="全部文档" />
            <Tab label="已批改" />
            <Tab label="草稿" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <DocumentTable documents={getFilteredDocuments()} onDelete={handleDeleteDocument} />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <DocumentTable documents={getFilteredDocuments()} onDelete={handleDeleteDocument} />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <DocumentTable documents={getFilteredDocuments()} onDelete={handleDeleteDocument} />
        </TabPanel>
      </Paper>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Link href="/new-essay" passHref>
          <Button variant="contained" color="primary" startIcon={<EditIcon />}>
            创建新作文
          </Button>
        </Link>
      </Box>
    </Layout>
  );
}

interface DocumentTableProps {
  documents: any[];
  onDelete: (id: string) => void;
}

function DocumentTable({ documents, onDelete }: DocumentTableProps) {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>标题</TableCell>
            <TableCell>日期</TableCell>
            <TableCell>年级</TableCell>
            <TableCell>状态</TableCell>
            <TableCell>分数</TableCell>
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
                    label={doc.status}
                    color={doc.status === '已批改' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{doc.score || '-'}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex' }}>
                    <Link href={`/documents/${doc.id}`} passHref>
                      <IconButton color="primary" size="small">
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Link>
                    <Link href={`/documents/edit/${doc.id}`} passHref>
                      <IconButton color="primary" size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Link>
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