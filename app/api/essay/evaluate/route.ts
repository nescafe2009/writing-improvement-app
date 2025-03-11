import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    // 获取请求体中的作文内容
    const { essay } = await request.json();

    if (!essay || typeof essay !== 'string' || essay.trim() === '') {
      return NextResponse.json(
        { error: '请提供有效的作文内容' },
        { status: 400 }
      );
    }

    // 构建提示词，指导DeepSeek模型生成评价和修改建议
    const prompt = `
你是小赵老师，一位有着20年教学经验的中文教师，特别擅长中小学作文指导和评价。请对以下学生作文进行专业评价和修改，可以要求苛刻一些：

${essay}

请从以下几个方面进行全面、细致且有针对性的评价：
1. 内容与主题（主题明确性、内容充实度、思想深度）
2. 结构与逻辑（段落组织、逻辑连贯性、首尾呼应）
3. 语言表达（用词准确性、句式多样性、语言生动性）
4. 创新与思考（创新思维、个人见解、思考深度）

评分标准：
90-100分：优秀，内容充实，结构完整，语言优美，有独到见解
80-89分：良好，内容较充实，结构合理，语言通顺，有一定思考
70-79分：中等，内容基本完整，结构较清晰，语言基本通顺，缺乏深度思考
60-69分：及格，内容简单，结构不够清晰，语言表达欠佳
60分以下：不及格，内容空洞，结构混乱，语言表达较差

请以JSON格式返回评价结果，格式如下：
{
  "score": 85,
  "strengths": ["优点1", "优点2", "优点3", "优点4", "优点5"],
  "weaknesses": ["缺点1", "缺点2", "缺点3", "缺点4", "缺点5"],
  "suggestions": ["建议1", "建议2", "建议3", "建议4", "建议5"],
  "improvedEssay": "修改后的作文全文（保持原作风格但提升质量）"
}

注意：
1. 评价要客观公正，肯定优点的同时指出不足
2. 建议要具体可行，针对性强，便于学生理解和实践
3. 修改后的作文应保留原作的基本内容和风格，但在各方面进行优化提升
4. 适合中小学生的阅读理解能力，不要使用过于复杂的词汇和句式
5. 请确保返回的是合法的JSON格式，不要包含任何额外的解释或文字
`;

    // 调用DeepSeek API
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        }
      }
    );

    // 解析API响应
    const responseContent = response.data.choices[0].message.content;
    
    // 尝试将返回内容解析为JSON
    let evaluationResult;
    try {
      // 查找JSON部分并解析
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        evaluationResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('无法从响应中提取JSON数据');
      }
    } catch (parseError) {
      console.error('解析DeepSeek响应失败:', parseError);
      console.log('原始响应:', responseContent);
      
      // 如果解析失败，返回错误
      return NextResponse.json(
        { error: '处理AI响应时出错，请稍后再试' },
        { status: 500 }
      );
    }

    // 返回评价结果
    return NextResponse.json(evaluationResult);

  } catch (error: any) {
    console.error('作文评价API错误:', error);
    return NextResponse.json(
      { error: `评价作文时出错: ${error.message || '未知错误'}` },
      { status: 500 }
    );
  }
} 