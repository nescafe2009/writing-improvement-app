import { NextResponse } from 'next/server';

// DeepSeek API配置
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

export async function POST(request: Request) {
  try {
    const { title, grade } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: '作文题目不能为空' },
        { status: 400 }
      );
    }

    // 检查API密钥是否配置
    if (!DEEPSEEK_API_KEY) {
      console.error('DeepSeek API配置缺失');
      
      // 如果API密钥未配置，返回模拟数据（开发环境使用）
      return NextResponse.json(getMockData(title, grade));
    }

    // 调用DeepSeek API
    const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          {
            role: 'system',
            content: `你是一位专业的写作指导老师，擅长为${grade}学生提供作文指导。请为以下作文题目提供详细的写作建议，包括提纲结构、写作建议和关键点。请确保返回JSON格式的响应，包含以下字段：outline（提纲，数组），suggestions（写作建议，数组），keyPoints（关键点，数组），references（参考资料，数组）。`
          },
          {
            role: 'user',
            content: `请为题目"${title}"提供详细的写作建议，结果必须是JSON格式。`
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API请求失败: ${response.status}`);
    }

    const data = await response.json();
    
    // 解析DeepSeek API返回的JSON响应
    let parsedContent;
    try {
      // 根据DeepSeek API响应格式提取内容
      // DeepSeek可能直接返回JSON或者需要从消息内容中解析
      if (data.choices && data.choices[0].message.content) {
        const contentString = data.choices[0].message.content;
        // 检查返回的内容是否已经是JSON对象
        if (typeof contentString === 'object') {
          parsedContent = contentString;
        } else {
          // 尝试解析JSON字符串
          parsedContent = JSON.parse(contentString);
        }
      } else {
        throw new Error('DeepSeek API响应格式不符合预期');
      }
    } catch (error) {
      console.error('解析DeepSeek API响应失败:', error);
      // 如果解析失败，返回模拟数据
      return NextResponse.json(getMockData(title, grade));
    }

    // 返回处理后的数据
    return NextResponse.json({
      outline: parsedContent.outline || [],
      suggestions: parsedContent.suggestions || [],
      keyPoints: parsedContent.keyPoints || [],
      references: parsedContent.references || []
    });

  } catch (error) {
    console.error('处理请求错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 模拟数据函数（当API密钥未配置或API调用失败时使用）
function getMockData(title: string, grade: string) {
  return {
    outline: [
      {
        title: '开头',
        content: '引入主题，介绍' + title + '的基本背景和重要性',
        subItems: []
      },
      {
        title: '主体部分',
        content: '',
        subItems: [
          {
            title: '第一部分',
            content: title + '的主要特点或第一个重要方面',
            subItems: []
          },
          {
            title: '第二部分',
            content: title + '的进一步探讨或第二个重要方面',
            subItems: []
          },
          {
            title: '第三部分',
            content: title + '的深层意义或影响',
            subItems: []
          }
        ]
      },
      {
        title: '结尾',
        content: '总结主要观点，展望未来或给出个人见解',
        subItems: []
      }
    ],
    suggestions: [
      '使用具体的例子和细节支持你的论点',
      '注意段落之间的过渡和连贯性',
      '可以适当引用名人名言或相关统计数据增加说服力',
      '尝试使用多样的句型和词汇，避免重复',
      '确保你的观点清晰且有逻辑性'
    ],
    keyPoints: [
      '关注' + title + '的核心内容和主要特征',
      '考虑不同角度和观点',
      '结合个人经历或观察增加文章真实感',
      '注意论证逻辑的严密性',
      '保持语言表达的流畅和生动'
    ],
    references: [
      '《写作指南》',
      '相关新闻或报道',
      '教科书或参考资料'
    ]
  };
} 