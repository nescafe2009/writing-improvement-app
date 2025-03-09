'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Avatar,
  List, ListItem, IconButton, CircularProgress, useMediaQuery, useTheme
} from '@mui/material';
import { Send as SendIcon, Mic as MicIcon, Image as ImageIcon } from '@mui/icons-material';
import Layout from '../components/layout/Layout';

export default function Assistant() {
  const theme = useTheme();
  const isMobileMQ = useMediaQuery(theme.breakpoints.down('sm'));
  const [isMobile, setIsMobile] = useState(false);
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

  return (
    <Layout>
      <Typography variant="h4" component="h1" sx={{ 
        mb: isMobile ? 2 : 4, 
        fontWeight: 'bold',
        fontSize: isMobile ? '1.75rem' : '2.125rem'
      }}>
        AI写作助手
      </Typography>

      <Paper 
        elevation={0} 
        sx={{ 
          p: 0, 
          borderRadius: 2, 
          height: 'calc(100vh - 220px)', 
          minHeight: '400px',
          display: 'flex', 
          flexDirection: 'column'
        }}
      >
        {/* 消息区域 */}
        <Box sx={{ 
          flexGrow: 1, 
          p: isMobile ? 1.5 : 3, 
          overflow: 'auto',
          bgcolor: '#f5f7fb',
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
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
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block', 
                        mt: 1, 
                        textAlign: message.role === 'user' ? 'right' : 'left',
                        opacity: 0.6,
                        fontSize: isMobile ? '0.65rem' : '0.7rem',
                      }}
                    >
                      {message.time}
                    </Typography>
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
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
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
            placeholder="输入你的问题..."
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
      </Paper>
    </Layout>
  );
} 