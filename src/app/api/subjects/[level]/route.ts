import { NextRequest } from 'next/server';
import { subjectsData } from '@/app/data/subjects';
import { NextResponse } from 'next/server';

// Type for subject data
export type SubjectEntry =
  | string[]
  | { name: string; code?: string; category?: string }[];

export type SubjectData = {
  [key: string]: SubjectEntry;
};

function normalizeLevel(input: string): string {
  return input.trim().toLowerCase().replace(/[\s-]/g, '_');
}

export async function GET(
  req: Request,
  { params }: { params: { level: string } }
) {
  if (!params.level || typeof params.level !== 'string') {
    return NextResponse.json(
      { error: 'Invalid level provided' },
      { status: 400 }
    );
  }

  const level = normalizeLevel(params.level);
  const subjects = subjectsData[level as keyof typeof subjectsData];

  if (!subjects) {
    return NextResponse.json(
      { error: 'Level not found' },
      { status: 404 }
    );
  }

  const url = new URL(req.url);
  const filter = url.searchParams.get('contains')?.toLowerCase();

  // let filteredSubjects = subjects;
  let filteredSubjects: SubjectEntry = subjects;

  if (filter) {
    if (Array.isArray(subjects)) {
      if (typeof subjects[0] === 'string') {
        // subjects is a string[]
        filteredSubjects = (subjects as string[]).filter((sub) =>
          sub.toLowerCase().includes(filter)
        );
      } else if (
        typeof subjects[0] === 'object' &&
        subjects[0] !== null &&
        'name' in subjects[0]
      ) {
        filteredSubjects = (subjects as unknown as Array<{ name: string }>).filter(
          (sub) =>
            typeof sub === 'object' &&
            sub !== null &&
            'name' in sub &&
            typeof (sub as any).name === 'string' &&
            (sub as any).name.toLowerCase().includes(filter)
        );
      }
    }
  }

  return new NextResponse(JSON.stringify({ level, subjects: filteredSubjects }), {
    headers: {
      'Cache-Control': 'public, max-age=86400',
      'Content-Type': 'application/json',
    },
  });
}