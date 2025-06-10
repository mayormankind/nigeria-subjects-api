import { NextRequest, NextResponse } from 'next/server';
import { subjectsData } from '@/app/data/subjects';

export type SubjectEntry =
  | string[]
  | { name: string; code?: string; category?: string }[];

export type SubjectData = {
  [key: string]: SubjectEntry;
};

function normalizeLevel(input: string): string {
  return input.trim().toLowerCase().replace(/[\s-]/g, '_');
}

export async function GET(req: NextRequest) {
  // Extract level from pathname
  // Example pathname: /api/subjects/100_level
  const segments = req.nextUrl.pathname.split('/').filter(Boolean);
  // segments = ['api', 'subjects', '100_level']
  const levelRaw = segments[segments.length - 1] || '';
  const level = normalizeLevel(levelRaw);

  if (!level || typeof level !== 'string') {
    return NextResponse.json({ error: 'Invalid level provided' }, { status: 400 });
  }

  const subjects = subjectsData[level as keyof typeof subjectsData];

  if (!subjects) {
    return NextResponse.json({ error: 'Level not found' }, { status: 404 });
  }

  const filter = req.nextUrl.searchParams.get('contains')?.toLowerCase();
  let filteredSubjects: SubjectEntry = subjects;

  if (filter && Array.isArray(subjects)) {
    if (typeof subjects[0] === 'string') {
      filteredSubjects = (subjects as string[]).filter((sub) =>
        sub.toLowerCase().includes(filter)
      );
    } else if (
      typeof subjects[0] === 'object' &&
      subjects[0] !== null &&
      'name' in subjects[0]
    ) {
      filteredSubjects = (subjects as unknown as { name: string }[]).filter(
        (sub) =>
          typeof sub.name === 'string' &&
          sub.name.toLowerCase().includes(filter)
      );
    }
  }

  return NextResponse.json({ level, subjects: filteredSubjects }, {
    headers: {
      'Cache-Control': 'public, max-age=86400',
    }
  });
}
