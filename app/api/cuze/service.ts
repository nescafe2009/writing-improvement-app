// Cuze API服务

/**
 * 生成作文提纲
 * @param topic 作文主题
 * @param grade 年级
 * @returns 生成的提纲
 */
export async function generateOutline(topic: string, grade: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_CUZE_API_URL}/generate-outline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CUZE_API_KEY}`
      },
      body: JSON.stringify({
        topic,
        grade
      })
    });

    if (!response.ok) {
      throw new Error('生成提纲失败');
    }

    return await response.json();
  } catch (error) {
    console.error('生成提纲错误:', error);
    throw error;
  }
}

/**
 * 批改作文
 * @param content 作文内容
 * @param grade 年级
 * @returns 批改结果
 */
export async function reviewEssay(content: string, grade: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_CUZE_API_URL}/review-essay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CUZE_API_KEY}`
      },
      body: JSON.stringify({
        content,
        grade
      })
    });

    if (!response.ok) {
      throw new Error('批改作文失败');
    }

    return await response.json();
  } catch (error) {
    console.error('批改作文错误:', error);
    throw error;
  }
}

/**
 * 获取写作建议
 * @param content 当前内容
 * @param grade 年级
 * @returns 写作建议
 */
export async function getWritingSuggestions(content: string, grade: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_CUZE_API_URL}/writing-suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CUZE_API_KEY}`
      },
      body: JSON.stringify({
        content,
        grade
      })
    });

    if (!response.ok) {
      throw new Error('获取写作建议失败');
    }

    return await response.json();
  } catch (error) {
    console.error('获取写作建议错误:', error);
    throw error;
  }
} 