import { subjectsData } from '@/app/data/subjects';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { level: string } }
) {
  const level = params.level.toLowerCase(); 
  const subjects = (subjectsData as Record<string, string[]>)[level];

  if (!subjects) {
    return NextResponse.json(
      { error: 'Level not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    level,
    subjects,
  });
}
