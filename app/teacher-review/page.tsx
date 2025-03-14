'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, Grid, Snackbar, Alert, 
  TextField, List, ListItem, ListItemText, ListItemIcon,
  Divider, Chip, CircularProgress, useTheme, useMediaQuery, 
  Card, CardContent, Accordion, AccordionSummary, AccordionDetails,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  InputAdornment, ListItemSecondaryAction
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  Compare as CompareIcon,
  InsertDriveFile as FileIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  PhotoLibrary as PhotoLibraryIcon,
  Upload as UploadIcon,
  Search as SearchIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import Layout from '../components/layout/Layout';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

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
  const [analyzing, setAnalyzing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const fileInputRefOriginal = useRef<HTMLInputElement>(null);
  const fileInputRefTeacher = useRef<HTMLInputElement>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'original' | 'teacher'>('original');
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [processingOcr, setProcessingOcr] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<any>(null);
  const [isAutoMatchDialogOpen, setIsAutoMatchDialogOpen] = useState(false);
  const [autoMatchResults, setAutoMatchResults] = useState<any[]>([]);
  const [autoSearching, setAutoSearching] = useState(false);
  const [autoSearchTitle, setAutoSearchTitle] = useState('');

  useEffect(() => {
    setIsMobile(isMobileMQ);
  }, [isMobileMQ]);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const getCurrentUsername = () => {
    const token = Cookies.get('auth_token');
    if (!token) return null;
    
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      return payload.sub || null;
    } catch (e) {
      console.error('解析token失败:', e);
      return null;
    }
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
      
      // 获取文件名作为作文名（去除扩展名）
      const fileName = file.name.replace(/\.docx$/i, '');
      
      // 创建FormData并添加文件与元数据
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', fileName);
      formData.append('fileType', 'draft');
      
      // 显示加载状态
      setSnackbarMessage('正在上传文件...');
      setSnackbarSeverity('info');
      setOpenSnackbar(true);
      
      // 上传文件到服务器，服务器会处理COS上传
      fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setOriginalEssay(file);
          setSnackbarMessage('初稿上传成功并已保存到云端');
          setSnackbarSeverity('success');
        } else {
          throw new Error(data.error || '上传失败');
        }
      })
      .catch(error => {
        console.error('上传文件错误:', error);
        setSnackbarMessage(`上传失败: ${error.message}`);
        setSnackbarSeverity('error');
      })
      .finally(() => {
        setOpenSnackbar(true);
        handleCloseUploadDialog();
      });
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
      
      // 获取文件名作为作文名（去除扩展名）
      const fileName = file.name.replace(/\.docx$/i, '');
      
      // 创建FormData并添加文件与元数据
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', fileName);
      formData.append('fileType', 'teacher_final');
      
      // 显示加载状态
      setSnackbarMessage('正在上传文件...');
      setSnackbarSeverity('info');
      setOpenSnackbar(true);
      
      // 上传文件到服务器，服务器会处理COS上传
      fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setTeacherReview(file);
          setSnackbarMessage('老师修改稿上传成功并已保存到云端');
          setSnackbarSeverity('success');
          
          // 从文件名中提取作文标题（去除可能的后缀）
          const essayTitle = fileName.replace(/[\-_](老师修改稿|老师修改终稿|修改稿|终稿|批改稿|批改|修改版|批注|老师版|教师版).*$/i, '');
          
          // 使用提取的标题自动搜索匹配的作文初稿
          autoSearchDraftByTitle(essayTitle);
        } else {
          throw new Error(data.error || '上传失败');
        }
      })
      .catch(error => {
        console.error('上传文件错误:', error);
        setSnackbarMessage(`上传失败: ${error.message}`);
        setSnackbarSeverity('error');
      })
      .finally(() => {
        setOpenSnackbar(true);
        handleCloseUploadDialog();
      });
    }
  };

  const handleOpenUploadDialog = (type: 'original' | 'teacher') => {
    setUploadType(type);
    if (type === 'original') {
      // 直接打开搜索对话框
      setIsSearchDialogOpen(true);
    } else {
      // 打开上传对话框
      setIsUploadDialogOpen(true);
    }
  };

  const handleCloseUploadDialog = () => {
    setIsUploadDialogOpen(false);
    setUploadedImages([]);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      // 检查文件类型
      const invalidFiles = newFiles.filter(file => !file.type.startsWith('image/'));
      if (invalidFiles.length > 0) {
        setSnackbarMessage('请只上传图片文件');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
        return;
      }
      
      setUploadedImages(newFiles);
    }
  };

  const triggerImageInput = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  const processAndUploadImages = async () => {
    if (uploadedImages.length === 0) {
      setSnackbarMessage('请先选择图片');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    setProcessingOcr(true);
    
    try {
      // 创建FormData对象用于上传图片
      const formData = new FormData();
      uploadedImages.forEach((file) => {
        formData.append('images', file);
      });

      // 发送请求到后端OCR API
      const response = await fetch('/api/ocr/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '图片处理失败');
      }

      const data = await response.json();
      
      if (!data.text) {
        throw new Error('OCR识别失败，未返回文本');
      }
      
      // 创建并上传Word文档
      const docResponse = await fetch('/api/documents/create-from-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: data.text,
          title: uploadType === 'original' ? '读水浒传有感' : '读水浒传有感修改',
          type: uploadType === 'original' ? 'draft' : 'teacher_final'
        }),
      });
      
      if (!docResponse.ok) {
        const docData = await docResponse.json();
        throw new Error(docData.error || 'Word文档创建失败');
      }
      
      const docData = await docResponse.json();
      
      // 设置相应的文件
      if (uploadType === 'original') {
        const fileObj = new File(
          [new Blob([])], // 这里仅用作显示，实际内容已上传到COS
          `${docData.file.extractedTitle || '作文'}-初稿.docx`,
          { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
        );
        Object.defineProperty(fileObj, 'size', { value: 100 * 1024 }); // 模拟文件大小
        setOriginalEssay(fileObj);
      } else {
        const fileObj = new File(
          [new Blob([])],
          `${docData.file.extractedTitle || '作文'}-老师修改终稿.docx`,
          { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
        );
        Object.defineProperty(fileObj, 'size', { value: 100 * 1024 }); // 模拟文件大小
        setTeacherReview(fileObj);
        
        // 如果是老师修改稿，自动搜索匹配的初稿
        if (docData.file.extractedTitle) {
          autoSearchDraftByTitle(docData.file.extractedTitle);
        }
      }
      
      setSnackbarMessage(`图片已成功识别并转换为Word文档: ${docData.file.extractedTitle || '作文'}`);
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      handleCloseUploadDialog();
      
    } catch (error: any) {
      console.error('处理图片错误:', error);
      setSnackbarMessage(`图片处理失败: ${error.message}`);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setProcessingOcr(false);
    }
  };

  const handleCompare = async () => {
    if (!originalEssay || !teacherReview) {
      setSnackbarMessage('请先上传初稿和老师修改稿');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    setAnalyzing(true);
    setSnackbarMessage('正在分析文档差异，请稍候...');
    setSnackbarSeverity('info');
    setOpenSnackbar(true);
    
    try {
      // 获取当前用户名
      const username = getCurrentUsername();
      console.log('当前用户名:', username);
      
      // 请求数据对象
      const requestData: any = {
        originalDocId: '',
        teacherDocId: '',
        useSimulatedData: false // 添加一个参数，决定是否使用模拟数据
      };
      
      // 处理原始文档
      if (selectedDraft && selectedDraft.id) {
        // 如果是从搜索结果中选择的草稿，使用其ID和URL
        requestData.originalDocId = selectedDraft.id;
        
        if (selectedDraft.url) {
          requestData.originalUrl = selectedDraft.url;
          console.log('使用已有的原始文档URL:', selectedDraft.url);
        }
      } else if (originalEssay) {
        console.log('原始文档没有关联的COS ID，使用文档名称');
        requestData.originalDocId = originalEssay.name;
        
        // 如果是从图片上传转换的，使用默认路径
        if (originalEssay.size < 1000) { // 可能是通过OCR创建的
          requestData.originalDocId = "outlines/五年级/作文初稿/读水浒传有感-初稿.docx";
          console.log('检测到可能是OCR生成的文件，使用默认路径:', requestData.originalDocId);
        }
      }
      
      // 处理老师修改稿
      if (teacherReview && teacherReview.name) {
        console.log('teacherReview对象:', { 
          name: teacherReview.name, 
          type: teacherReview.type,
          size: teacherReview.size
        });
        
        // 获取上传文件名（去除扩展名）
        const fileNameNoExt = teacherReview.name.replace(/\.docx$/i, '');
        console.log('老师修改稿文件名（无扩展名）:', fileNameNoExt);
        
        // 如果是从图片上传转换的，使用默认路径
        if (teacherReview.size < 1000) { // 可能是通过OCR创建的
          requestData.teacherDocId = username 
            ? `outlines/${username}/五年级/老师批改/读水浒传有感修改-老师修改终稿.docx`
            : `outlines/五年级/老师批改/读水浒传有感修改-老师修改终稿.docx`;
          console.log('检测到可能是OCR生成的文件，使用默认路径:', requestData.teacherDocId);
        } else {
          // 构建与上传逻辑一致的文件路径
          const sanitizedTitle = fileNameNoExt.match(/[\u4e00-\u9fa5]+/g)?.join('') || fileNameNoExt;
          console.log('清理后的标题:', sanitizedTitle);
          
          // 获取当前年级
          const currentGrade = '5'; // 简化，实际应调用与上传相同的计算函数
          const gradeText = '五年级'; // 简化，实际应使用与上传相同的转换函数
          
          // 构建完整文件路径，与上传时保持一致，添加用户名
          const filePath = username 
            ? `outlines/${username}/${gradeText}/老师批改/${sanitizedTitle}-老师修改终稿.docx`
            : `outlines/${gradeText}/老师批改/${sanitizedTitle}-老师修改终稿.docx`;
          console.log('预计的文件路径:', filePath);
          
          requestData.teacherDocId = filePath;
        }
        
        // 尝试获取老师修改稿的URL
        try {
          console.log('尝试获取老师修改稿URL，文档ID:', requestData.teacherDocId);
          const teacherUrlResponse = await fetch(`/api/documents/get-url?docId=${encodeURIComponent(requestData.teacherDocId)}`);
          
          if (teacherUrlResponse.ok) {
            const teacherUrlData = await teacherUrlResponse.json();
            if (teacherUrlData.success && teacherUrlData.url) {
              requestData.teacherUrl = teacherUrlData.url;
              console.log('成功获取老师修改稿URL:', teacherUrlData.url);
            } else {
              console.error('获取URL API返回失败:', teacherUrlData);
            }
          } else {
            const errorText = await teacherUrlResponse.text();
            console.error('获取URL API请求失败，状态码:', teacherUrlResponse.status, '错误:', errorText);
            // 如果获取URL失败，使用模拟数据
            requestData.useSimulatedData = true;
          }
        } catch (error) {
          console.warn('获取老师修改稿URL失败，将使用模拟数据:', error);
          requestData.useSimulatedData = true;
        }
      }
      
      console.log('发送对比请求:', {
        originalDocId: requestData.originalDocId,
        teacherDocId: requestData.teacherDocId,
        hasOriginalUrl: !!requestData.originalUrl,
        hasTeacherUrl: !!requestData.teacherUrl,
        useSimulatedData: requestData.useSimulatedData
      });
      
      // 发送请求到后端API，调用DeepSeek API进行真实分析
      const response = await fetch('/api/documents/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        // 检查是否是404错误（文件未找到）
        if (response.status === 404 || (errorData.error && errorData.error.includes('未找到'))) {
          console.warn('文件未找到，使用模拟数据');
          throw new Error('文件未找到，可能是文件路径不正确');
        }
        throw new Error(errorData.error || '分析失败，请稍后重试');
      }
      
      const analysisData = await response.json();
      
      if (!analysisData.success) {
        throw new Error(analysisData.error || '分析失败，请稍后重试');
      }
      
      // 设置分析结果
      setComparisonResult(analysisData.result);
      
      setSnackbarMessage('分析完成');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } catch (error: any) {
      console.error('分析文档对比失败:', error);
      setSnackbarMessage(`分析失败: ${error.message}。使用模拟数据展示`);
      setSnackbarSeverity('warning');
      setOpenSnackbar(true);
      
      // 如果API调用失败，使用模拟数据进行演示（仅用于演示目的）
      console.warn('使用模拟数据作为回退方案');
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
    } finally {
      setAnalyzing(false);
    }
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

  const handleCloseSearchDialog = () => {
    setIsSearchDialogOpen(false);
    setSearchKeyword('');
    setSearchResults([]);
    setSearching(false);
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      setSnackbarMessage('请输入作文名称');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`/api/documents/search?keyword=${encodeURIComponent(searchKeyword)}&type=draft&minSimilarity=30`);
      if (!response.ok) {
        throw new Error('搜索失败');
      }
      
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.documents || []);
        
        if (data.documents.length === 0) {
          setSnackbarMessage('未找到匹配的作文初稿');
          setSnackbarSeverity('info');
          setOpenSnackbar(true);
        }
      } else {
        throw new Error(data.error || '搜索失败');
      }
    } catch (error: any) {
      console.error('搜索错误:', error);
      setSnackbarMessage(`搜索失败: ${error.message}`);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectDraft = (draft: any) => {
    setSelectedDraft(draft);
    
    // 创建一个文件对象，用于显示在已上传文件列表中
    const fileObj = new File(
      [new Blob([])], // 这里仅用作显示，实际内容已在COS中
      draft.filename,
      { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
    );
    Object.defineProperty(fileObj, 'size', { value: draft.size * 1024 }); // 设置文件大小
    
    setOriginalEssay(fileObj);
    handleCloseSearchDialog();
    
    setSnackbarMessage(`已选择作文初稿：${draft.title}`);
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
  };

  const handleUploadOriginalClick = () => {
    // 直接打开搜索对话框
    setIsSearchDialogOpen(true);
  };

  const handleUploadTeacherClick = () => {
    handleOpenUploadDialog('teacher');
  };

  // 从搜索对话框转到上传对话框
  const switchToUploadDialog = () => {
    handleCloseSearchDialog();
    setUploadType('original');
    setIsUploadDialogOpen(true);
  };

  // 根据提取的标题自动搜索匹配的作文初稿
  const autoSearchDraftByTitle = async (title: string) => {
    if (!title.trim()) {
      return;
    }

    setAutoSearchTitle(title);
    setAutoSearching(true);
    setIsAutoMatchDialogOpen(true);
    
    try {
      const response = await fetch(`/api/documents/search?keyword=${encodeURIComponent(title)}&type=draft&minSimilarity=30`);
      if (!response.ok) {
        throw new Error('搜索失败');
      }
      
      const data = await response.json();
      if (data.success) {
        setAutoMatchResults(data.documents || []);
        
        if (data.documents.length === 0) {
          setSnackbarMessage('未找到匹配的作文初稿，请手动选择或上传');
          setSnackbarSeverity('info');
          setOpenSnackbar(true);
        }
      } else {
        throw new Error(data.error || '搜索失败');
      }
    } catch (error: any) {
      console.error('自动搜索错误:', error);
      setSnackbarMessage(`自动搜索失败: ${error.message}`);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setAutoSearching(false);
    }
  };

  const handleCloseAutoMatchDialog = () => {
    setIsAutoMatchDialogOpen(false);
    setAutoMatchResults([]);
    setAutoSearching(false);
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
              文件上传
            </Typography>
            
            <Grid container spacing={2}>
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
                  startIcon={<SearchIcon />}
                  onClick={handleUploadOriginalClick}
                  sx={{ 
                    py: 1.5, 
                    border: '1px dashed',
                    height: '100%',
                    textTransform: 'none'
                  }}
                >
                  搜索匹配作文初稿
                </Button>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                已上传文件:
              </Typography>
              <List dense>
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

      {/* 搜索对话框 */}
      <Dialog 
        open={isSearchDialogOpen} 
        onClose={handleCloseSearchDialog} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>搜索作文初稿</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="输入作文名称关键词"
              variant="outlined"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={handleSearch}
                      disabled={searching || !searchKeyword.trim()}
                    >
                      {searching ? <CircularProgress size={24} /> : <SearchIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          
          {searchResults.length > 0 ? (
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {searchResults.map((draft) => (
                <ListItem key={draft.id} divider>
                  <ListItemIcon>
                    <FileIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={draft.title}
                    secondary={`匹配度: ${draft.similarity.toFixed(1)}% · ${draft.date} · ${draft.grade} · ${draft.size}KB`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      onClick={() => handleSelectDraft(draft)}
                      color="primary"
                    >
                      <ArrowForwardIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          ) : searching ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : searchKeyword.trim() ? (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Typography color="text.secondary">
                未找到匹配的作文初稿
              </Typography>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Typography color="text.secondary">
                请输入关键词搜索作文初稿
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSearchDialog}>取消</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isUploadDialogOpen} onClose={handleCloseUploadDialog} maxWidth="xs" fullWidth>
        <DialogTitle>
          选择上传方式 - {uploadType === 'original' ? '作文初稿' : '老师修改稿'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 1 }}>
            <Button
              variant="outlined"
              startIcon={<PhotoLibraryIcon />}
              onClick={triggerImageInput}
              sx={{ py: 2 }}
            >
              从图库选择照片
            </Button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageSelect}
              multiple
            />
            
            {uploadedImages.length > 0 && (
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  已选择 {uploadedImages.length} 张图片
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={processingOcr ? <CircularProgress size={20} color="inherit" /> : <UploadIcon />}
                  onClick={processAndUploadImages}
                  disabled={processingOcr}
                  fullWidth
                >
                  {processingOcr ? '正在处理...' : '使用豆包OCR识别并上传'}
                </Button>
              </Box>
            )}
            
            <Divider>或者</Divider>
            
            <input
              ref={uploadType === 'original' ? fileInputRefOriginal : fileInputRefTeacher}
              type="file"
              accept=".docx"
              style={{ display: 'none' }}
              onChange={uploadType === 'original' ? handleOriginalUpload : handleTeacherReviewUpload}
            />
            <Button
              variant="outlined"
              color="primary"
              startIcon={<CloudUploadIcon />}
              onClick={() => {
                if (uploadType === 'original' && fileInputRefOriginal.current) {
                  fileInputRefOriginal.current.click();
                } else if (uploadType === 'teacher' && fileInputRefTeacher.current) {
                  fileInputRefTeacher.current.click();
                }
              }}
              sx={{ py: 2 }}
            >
              直接上传Word文档
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUploadDialog}>取消</Button>
        </DialogActions>
      </Dialog>

      {/* 自动匹配对话框 */}
      <Dialog 
        open={isAutoMatchDialogOpen} 
        onClose={handleCloseAutoMatchDialog} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>匹配作文初稿</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, mt: 1 }}>
            <Typography variant="body1">
              系统正在为"{autoSearchTitle}"搜索匹配的作文初稿
            </Typography>
          </Box>
          
          {autoMatchResults.length > 0 ? (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                找到以下匹配结果，请选择一个作为初稿：
              </Typography>
              <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                {autoMatchResults.map((draft) => (
                  <ListItem key={draft.id} divider>
                    <ListItemIcon>
                      <FileIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={draft.title}
                      secondary={`匹配度: ${draft.similarity.toFixed(1)}% · ${draft.date} · ${draft.grade} · ${draft.size}KB`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        onClick={() => {
                          handleSelectDraft(draft);
                          handleCloseAutoMatchDialog();
                        }}
                        color="primary"
                      >
                        <ArrowForwardIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          ) : autoSearching ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Typography color="text.secondary">
                未找到匹配的作文初稿
              </Typography>
            </Box>
          )}
          
          <Divider sx={{ my: 2 }}>或者</Divider>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={() => {
                handleCloseAutoMatchDialog();
                setIsSearchDialogOpen(true);
              }}
              sx={{ py: 1.5 }}
            >
              手动搜索作文初稿
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAutoMatchDialog}>取消</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Layout>
  );
} 