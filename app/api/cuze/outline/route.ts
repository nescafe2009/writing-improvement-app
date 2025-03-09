import { NextRequest, NextResponse } from 'next/server';
import { generateOutline } from '../service';

export async function POST(request: NextRequest) {
  try {
    const { topic, grade } = await request.json();

    if (!topic || !grade) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const result = await generateOutline(topic, grade);
    return NextResponse.json(result);
  } catch (error) {
    console.error('生成提纲API错误:', error);
    return NextResponse.json(
      { error: '生成提纲失败' },
      { status: 500 }
    );
  }
} 