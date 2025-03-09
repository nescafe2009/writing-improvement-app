import { NextRequest, NextResponse } from 'next/server';
import { getWritingSuggestions } from '../service';

export async function POST(request: NextRequest) {
  try {
    const { content, grade } = await request.json();

    if (!content || !grade) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const result = await getWritingSuggestions(content, grade);
    return NextResponse.json(result);
  } catch (error) {
    console.error('获取写作建议API错误:', error);
    return NextResponse.json(
      { error: '获取写作建议失败' },
      { status: 500 }
    );
  }
} 