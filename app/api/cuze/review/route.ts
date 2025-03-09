import { NextRequest, NextResponse } from 'next/server';
import { reviewEssay } from '../service';

export async function POST(request: NextRequest) {
  try {
    const { content, grade } = await request.json();

    if (!content || !grade) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const result = await reviewEssay(content, grade);
    return NextResponse.json(result);
  } catch (error) {
    console.error('批改作文API错误:', error);
    return NextResponse.json(
      { error: '批改作文失败' },
      { status: 500 }
    );
  }
} 