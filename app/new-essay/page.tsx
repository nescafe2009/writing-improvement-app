'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, Typography, Paper, TextField, Button, Grid, Snackbar, Alert,
  Tabs, Tab, Avatar, List, ListItem, CircularProgress, IconButton, Divider,
  useTheme, useMediaQuery
} from '@mui/material';
import { 
  Save as SaveIcon, Send as SendIcon, Psychology as PsychologyIcon,
  Mic as MicIcon, Image as ImageIcon
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
      style={{ height: '100%' }}
    >
      {value === index && (
        <Box sx={{ height: '100%' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function NewEssay() {
  const theme = useTheme();
  // 避免服务端渲染不匹配
  const isMobileMQ = useMediaQuery(theme.breakpoints.down('sm'), { noSsr: true, defaultMatches: false });
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [grade, setGrade] = useState('三年级');
  const [saving, setSaving] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [tabValue, setTabValue] = useState(0);
  
  // AI助手相关状态
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: '你好！我是你的AI写作助手。我可以帮你构思作文、提供写作建议或回答相关问题。请告诉我你需要什么帮助？',
      time: new Date().toLocaleTimeString()
    }
  ]);

  useEffect(() => {
    // 在客户端渲染时更新状态，避免hydration不匹配
    setIsMobile(isMobileMQ);
  }, [isMobileMQ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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

  // AI助手发送消息处理函数
  const handleSend = async () => {
    if (!input.trim()) return;
    
    // 添加用户消息
    setMessages([...messages, { 
      role: 'user', 
      content: input.trim(),
      time: new Date().toLocaleTimeString()
    }]);
    setInput('');
    setLoading(true);
    
    // 模拟AI响应
    setTimeout(() => {
      let response;
      if (input.toLowerCase().includes('写作')) {
        response = '写作是表达思想和情感的艺术。好的写作需要清晰的结构、生动的语言和有深度的内容。建议你可以先确定一个明确的主题，然后围绕这个主题收集素材，最后按照"开头-主体-结尾"的结构来组织你的文章。';
      } else if (input.toLowerCase().includes('建议') || input.toLowerCase().includes('提纲')) {
        response = '为你提供一个简单的作文提纲结构：\n\n1. 开头：引出主题，吸引读者\n2. 主体部分：\n   - 第一段：主要论点1\n   - 第二段：主要论点2\n   - 第三段：主要论点3\n3. 结尾：总结前面的内容，给出结论或展望\n\n记得每个论点都要有相关的例子或细节支持，使文章更有说服力。';
      } else {
        response = '我理解你的问题。作为写作助手，我可以帮你构思作文内容、提供写作技巧、润色文章表达或者回答你关于写作的问题。你有更具体的写作需求吗？';
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response,
        time: new Date().toLocaleTimeString()
      }]);
      
      setLoading(false);
    }, 1000);
  };

  // 将AI建议应用到作文内容
  const applyToEssay = (content: string) => {
    setContent(prev => prev + '\n\n' + content);
    setTabValue(0); // 切换回编辑标签
    setSnackbarMessage('AI建议已添加到作文');
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
  };

  return (
    <Layout>
      <Box sx={{ mb: { xs: 2, md: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          创建新作文
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          写下您的想法，创作精彩作文。AI助手随时为您提供写作建议。
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ 
        p: 0, 
        borderRadius: 2,
        height: 'calc(100vh - 220px)',
        minHeight: '500px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <ClientOnly>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="作文编辑标签"
              variant={isMobile ? "fullWidth" : "standard"}
            >
              <Tab 
                label="编辑作文" 
                icon={<SaveIcon />} 
                iconPosition="start"
                sx={{ py: 1.5 }}
              />
              <Tab 
                label="AI助手" 
                icon={<PsychologyIcon />} 
                iconPosition="start"
                sx={{ py: 1.5 }}
              />
            </Tabs>
          </Box>
        </ClientOnly>

        <TabPanel value={tabValue} index={0}>
          <Box component="form" sx={{ 
            p: { xs: 2, md: 3 }, 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column' 
          }}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={8}>
                <TextField
                  label="作文标题"
                  variant="outlined"
                  fullWidth
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="请输入作文标题"
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
            </Grid>
            
            <TextField
              label="作文内容"
              variant="outlined"
              fullWidth
              multiline
              rows={isMobile ? 12 : 16}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="请输入您的作文内容..."
              sx={{ mb: 2, flexGrow: 1 }}
            />

            <ClientOnly>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 'auto' }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setTabValue(1)}
                  startIcon={<PsychologyIcon />}
                >
                  获取AI建议
                </Button>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
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
              </Box>
            </ClientOnly>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ 
            height: '100%',
            display: 'flex', 
            flexDirection: 'column'
          }}>
            {/* 消息区域 */}
            <Box sx={{ 
              flexGrow: 1, 
              p: isMobile ? 1.5 : 2, 
              overflow: 'auto',
              bgcolor: '#f5f7fb',
            }}>
              <List sx={{ width: '100%', p: 0 }}>
                {messages.map((message, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                      alignItems: 'flex-start',
                      mb: 2,
                      px: isMobile ? 0.5 : 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                        alignItems: 'flex-start',
                        maxWidth: '80%',
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: message.role === 'user' ? 'primary.main' : 'secondary.main',
                          width: isMobile ? 32 : 40,
                          height: isMobile ? 32 : 40,
                          mx: 1,
                        }}
                      >
                        {message.role === 'user' ? 'ME' : 'AI'}
                      </Avatar>
                      <Box
                        sx={{
                          p: isMobile ? 1.5 : 2,
                          borderRadius: 2,
                          bgcolor: message.role === 'user' ? '#e3f2fd' : 'white',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                          position: 'relative',
                        }}
                      >
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            overflowWrap: 'break-word',
                            whiteSpace: 'pre-line',
                            fontSize: isMobile ? '0.9rem' : '1rem',
                          }}
                        >
                          {message.content}
                        </Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mt: 1
                        }}>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              opacity: 0.6,
                              fontSize: isMobile ? '0.65rem' : '0.7rem',
                            }}
                          >
                            {message.time}
                          </Typography>
                          
                          {message.role === 'assistant' && (
                            <Button 
                              size="small" 
                              variant="text" 
                              color="primary"
                              onClick={() => applyToEssay(message.content)}
                              sx={{ ml: 1, minWidth: 0, p: '2px 8px', fontSize: '0.7rem' }}
                            >
                              应用到作文
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </ListItem>
                ))}
                {loading && (
                  <ListItem
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                      mb: 2,
                      px: isMobile ? 0.5 : 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: 'secondary.main',
                          width: isMobile ? 32 : 40,
                          height: isMobile ? 32 : 40,
                          mx: 1,
                        }}
                      >
                        AI
                      </Avatar>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: 'white',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                        }}
                      >
                        <CircularProgress size={20} thickness={5} />
                      </Box>
                    </Box>
                  </ListItem>
                )}
                <div ref={messagesEndRef} />
              </List>
            </Box>

            {/* 输入区域 */}
            <Box
              sx={{
                p: isMobile ? 1.5 : 2,
                borderTop: 1,
                borderColor: 'divider',
                bgcolor: 'white',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Box
                sx={{
                  display: { xs: 'none', sm: 'flex' },
                  gap: 1,
                  mr: 1
                }}
              >
                <IconButton size={isMobile ? "small" : "medium"} color="primary">
                  <MicIcon fontSize={isMobile ? "small" : "medium"} />
                </IconButton>
                <IconButton size={isMobile ? "small" : "medium"} color="primary">
                  <ImageIcon fontSize={isMobile ? "small" : "medium"} />
                </IconButton>
              </Box>
              
              <TextField
                fullWidth
                size={isMobile ? "small" : "medium"}
                placeholder="向AI助手提问，获取写作建议..."
                variant="outlined"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                sx={{
                  mr: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 4,
                  },
                }}
              />
              
              <Button
                variant="contained"
                color="primary"
                disableElevation
                size={isMobile ? "small" : "medium"}
                onClick={handleSend}
                disabled={!input.trim() || loading}
                endIcon={<SendIcon />}
                sx={{
                  borderRadius: 2,
                  minWidth: isMobile ? 'auto' : '80px',
                  px: isMobile ? 1.5 : 2,
                }}
              >
                {isMobile ? '' : '发送'}
              </Button>
            </Box>
          </Box>
        </TabPanel>
      </Paper>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Layout>
  );
} 