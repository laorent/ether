'use server';

import {NextResponse} from 'next/server';

export async function POST(req: Request) {
  try {
    const {password} = await req.json();
    const accessPassword = process.env.AETHER_PASSWORD;

    // If no password is set in env, access is granted.
    if (!accessPassword) {
      return NextResponse.json({success: true});
    }

    if (password === accessPassword) {
      return NextResponse.json({success: true});
    } else {
      return NextResponse.json({success: false}, {status: 401});
    }
  } catch (error) {
    return NextResponse.json({success: false, error: 'Internal Server Error'}, {status: 500});
  }
}

export async function GET() {
  const accessPassword = process.env.AETHER_PASSWORD;
  return NextResponse.json({isPasswordProtected: !!accessPassword});
}
