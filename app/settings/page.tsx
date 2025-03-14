'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Avatar, 
  Grid, 
  Paper, 
  Divider, 
  IconButton, 
  Snackbar, 
  Alert,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  CircularProgress,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  PhotoCamera as PhotoCameraIcon, 
  Save as SaveIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import Layout from '../components/layout/Layout';

// 学校列表不再需要
// const SCHOOLS = [
//   '实验小学',
//   '第一小学',
//   '第二小学',
//   '华师附小',
//   '育才小学',
//   '其他'
// ];

// 年级列表
const GRADES = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'];

export default function Settings() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // 用户信息状态 - 移除邮箱字段
  const [userInfo, setUserInfo] = useState({
    name: '',
    school: '',
    grade: '',
    avatar: '',
  });
  
  // 表单状态
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  
  // 头像上传状态
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 加载用户信息
  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUserInfo({
              name: data.user.name || '',
              school: data.user.school || '',
              grade: data.user.grade || '',
              avatar: data.user.avatar || '',
            });
            if (data.user.avatar) {
              setAvatarPreview(data.user.avatar);
            }
          }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    }
    
    fetchUserProfile();
  }, []);
  
  // 清除特定字段的错误
  const clearFieldError = (fieldName: string) => {
    if (formErrors[fieldName]) {
      setFormErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };
  
  // 处理文本输入变化
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: value
    }));
    clearFieldError(name);
  };
  
  // 处理选择框变化
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: value
    }));
    clearFieldError(name);
  };
  
  // 触发文件选择
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };
  
  // 处理头像上传
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 文件类型检查
    if (!file.type.startsWith('image/')) {
      setSnackbarMessage('请选择图片文件');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    // 文件大小限制 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSnackbarMessage('图片大小不能超过5MB');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    // 创建预览
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // 上传头像
    setIsUploadingAvatar(true);
    
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUserInfo({
          ...userInfo,
          avatar: data.avatarUrl
        });
        setSnackbarMessage('头像上传成功');
        setSnackbarSeverity('success');
      } else {
        throw new Error(data.error || '上传失败');
      }
    } catch (error: any) {
      console.error('头像上传失败:', error);
      setSnackbarMessage(`头像上传失败: ${error.message || '未知错误'}`);
      setSnackbarSeverity('error');
    } finally {
      setIsUploadingAvatar(false);
      setSnackbarOpen(true);
    }
  };
  
  // 表单验证
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!userInfo.name.trim()) {
      errors.name = '请输入姓名';
    }
    
    if (!userInfo.school) {
      errors.school = '请输入学校';
    }
    
    if (!userInfo.grade) {
      errors.grade = '请选择年级';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // 保存个人设置
  const handleSaveSettings = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userInfo)
      });
      
      const data = await response.json();
      
      if (data.success) {
        // 设置本地存储标记，表示用户信息已更新
        localStorage.setItem('userProfileUpdated', Date.now().toString());
        
        setSnackbarMessage('个人信息保存成功');
        setSnackbarSeverity('success');
      } else {
        throw new Error(data.error || '保存失败');
      }
    } catch (error: any) {
      console.error('保存个人信息失败:', error);
      setSnackbarMessage(`保存失败: ${error.message || '未知错误'}`);
      setSnackbarSeverity('error');
    } finally {
      setIsSaving(false);
      setSnackbarOpen(true);
    }
  };
  
  return (
    <Layout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ 
          fontWeight: 'bold', 
          fontSize: { xs: '1.5rem', md: '2.125rem' },
          mb: 3
        }}>
          个人设置
        </Typography>
        
        <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
          <Grid container spacing={3}>
            {/* 头像上传部分 */}
            <Grid item xs={12} sm={4} sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              justifyContent: 'flex-start',
              pt: 3
            }}>
              <Box 
                sx={{
                  position: 'relative',
                  width: 120,
                  height: 120,
                  mb: 2
                }}
              >
                <Avatar 
                  src={avatarPreview || userInfo.avatar || '/images/default-avatar.png'} 
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                />
                {isUploadingAvatar && (
                  <Box 
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      borderRadius: '50%'
                    }}
                  >
                    <CircularProgress />
                  </Box>
                )}
              </Box>
              
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleAvatarChange}
              />
              
              <Button
                variant="outlined"
                startIcon={<PhotoCameraIcon />}
                onClick={handleAvatarClick}
                disabled={isUploadingAvatar}
                sx={{ mb: 1 }}
              >
                更换头像
              </Button>
              
              <Typography variant="caption" color="text.secondary" align="center">
                支持 JPG、PNG 格式，最大 5MB
              </Typography>
            </Grid>
            
            {/* 分隔线 - 只在移动设备上显示 */}
            {isMobile && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>
            )}
            
            {/* 个人信息表单 */}
            <Grid item xs={12} sm={8}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="姓名"
                    name="name"
                    value={userInfo.name}
                    onChange={handleTextChange}
                    error={!!formErrors.name}
                    helperText={formErrors.name || ''}
                    variant="outlined"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="学校"
                    name="school"
                    value={userInfo.school}
                    onChange={handleTextChange}
                    error={!!formErrors.school}
                    helperText={formErrors.school || ''}
                    variant="outlined"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth error={!!formErrors.grade}>
                    <InputLabel id="grade-label">年级</InputLabel>
                    <Select
                      labelId="grade-label"
                      name="grade"
                      value={userInfo.grade}
                      onChange={handleSelectChange}
                      label="年级"
                    >
                      {GRADES.map((grade) => (
                        <MenuItem key={grade} value={grade}>
                          {grade}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.grade && (
                      <Typography variant="caption" color="error">
                        {formErrors.grade}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
            
            {/* 保存按钮 */}
            <Grid item xs={12}>
              <Divider sx={{ mt: 2, mb: 3 }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={isSaving ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                >
                  {isSaving ? '保存中...' : '保存设置'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Layout>
  );
} 