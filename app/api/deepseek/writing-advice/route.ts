import { NextResponse } from 'next/server';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = 'sk-033ee6e752ca421cb6c6379ce3efc944';

export async function POST(request: Request) {
  try {
    const { title, grade } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: '请提供作文题目' },
        { status: 400 }
      );
    }

    // 构建提示词
    const prompt = `
你是一位经验丰富的${grade}语文老师，请为学生提供以下作文题目的写作指导：
"${title}"

请提供以下内容：
1. 作文提纲结构（包括开头、主体和结尾部分）
2. 写作建议（至少3条）
3. 需要注意的关键点（至少3条）
4. 可能的参考资料或素材（如有）

请以JSON格式返回，格式如下：
{
  "outline": [
    {
      "title": "开头",
      "content": "开头部分的写作内容",
      "subItems": [
        {
          "title": "引入方式",
          "content": "具体的引入方法建议"
        }
      ]
    },
    {
      "title": "主体",
      "content": "主体部分的写作内容",
      "subItems": []
    },
    {
      "title": "结尾",
      "content": "结尾部分的写作内容",
      "subItems": []
    }
  ],
  "suggestions": [
    "写作建议1",
    "写作建议2",
    "写作建议3"
  ],
  "keyPoints": [
    "关键点1",
    "关键点2",
    "关键点3"
  ],
  "references": [
    "参考资料1",
    "参考资料2"
  ]
}
`;

    // 调用DeepSeek API
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('DeepSeek API错误:', errorData);
      return NextResponse.json(
        { error: '调用AI服务失败' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // 解析DeepSeek返回的内容
    try {
      // 从AI回复中提取JSON
      const content = data.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonContent = JSON.parse(jsonMatch[0]);
        return NextResponse.json(jsonContent);
      } else {
        // 如果无法提取JSON，尝试手动解析内容
        return NextResponse.json({
          outline: [
            {
              title: "开头",
              content: "AI未能提供结构化数据，请重试",
              subItems: []
            }
          ],
          suggestions: ["请重新生成"],
          keyPoints: ["请重新生成"],
          references: []
        });
      }
    } catch (parseError) {
      console.error('解析AI回复错误:', parseError);
      return NextResponse.json(
        { error: '解析AI回复失败' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('处理请求错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}