'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  TextField,
  Button,
  Box,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import AuthLayout from '../components/auth/AuthLayout';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // 检查用户是否已登录
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/user');
        if (response.ok) {
          // 用户已登录，重定向到主页
          router.push('/');
        }
      } catch (error) {
        // 忽略错误，可能是未登录状态
      }
    }
    
    checkAuth();
  }, [router]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 清除该字段的错误消息
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // 清除通用错误消息
    if (errorMessage) {
      setErrorMessage('');
    }
  };
  
  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };
  
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.username.trim()) {
      errors.username = '请输入用户名';
    }
    
    if (!formData.password) {
      errors.password = '请输入密码';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // 登录成功，重定向到主页
        router.push('/');
      } else {
        // 登录失败，显示错误消息
        setErrorMessage(data.error || '登录失败，请检查用户名和密码');
      }
    } catch (error) {
      setErrorMessage('登录过程中发生错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AuthLayout 
      title="用户登录" 
      subtitle="登录您的账号以使用小赵作文助手"
    >
      {errorMessage && (
        <Alert 
          severity="error" 
          sx={{ width: '100%', mb: 2 }}
        >
          {errorMessage}
        </Alert>
      )}
      
      <Box 
        component="form" 
        onSubmit={handleSubmit} 
        sx={{ width: '100%', mt: 1 }}
      >
        <TextField
          margin="normal"
          required
          fullWidth
          id="username"
          label="用户名"
          name="username"
          autoComplete="username"
          autoFocus
          value={formData.username}
          onChange={handleInputChange}
          error={!!formErrors.username}
          helperText={formErrors.username || ''}
          disabled={isLoading}
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="密码"
          id="password"
          autoComplete="current-password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleInputChange}
          error={!!formErrors.password}
          helperText={formErrors.password || ''}
          disabled={isLoading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="切换密码可见性"
                  onClick={toggleShowPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          sx={{ mt: 3, mb: 2, py: 1.2 }}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : '登录'}
        </Button>
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2">
            还没有账号？{' '}
            <Link href="/register" style={{ textDecoration: 'none', color: 'primary.main' }}>
              立即注册
            </Link>
          </Typography>
        </Box>
      </Box>
    </AuthLayout>
  );
} 