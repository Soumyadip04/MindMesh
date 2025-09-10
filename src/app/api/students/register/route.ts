import { NextRequest, NextResponse } from 'next/server';
import { studentsStore } from '@/lib/students-store';
import crypto from 'crypto';

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  enrollmentNumber: string;
  batch: string;
}

// Simple password hashing (in production, use bcrypt)
function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, 'salt', 1000, 64, 'sha512').toString('hex');
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateRegistrationData(data: unknown): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!data.email || typeof data.email !== 'string' || !validateEmail(data.email)) {
    errors.push('Valid email address is required');
  }

  if (!data.password || typeof data.password !== 'string' || data.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (!data.enrollmentNumber || typeof data.enrollmentNumber !== 'string' || data.enrollmentNumber.trim().length < 5) {
    errors.push('Valid enrollment number is required');
  }

  if (!data.batch || typeof data.batch !== 'string' || data.batch.trim().length < 2) {
    errors.push('Batch information is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();

    // Validate request data
    const validation = validateRegistrationData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          message: 'Validation failed', 
          errors: validation.errors 
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingStudents = await studentsStore.getAll();
    const existingStudent = existingStudents.find(
      student => 
        student.email.toLowerCase() === body.email.toLowerCase() ||
        student.enrollmentNumber === body.enrollmentNumber.trim()
    );

    if (existingStudent) {
      let message = 'Registration failed';
      if (existingStudent.email.toLowerCase() === body.email.toLowerCase()) {
        message = 'An account with this email already exists';
      } else if (existingStudent.enrollmentNumber === body.enrollmentNumber.trim()) {
        message = 'An account with this enrollment number already exists';
      }
      
      return NextResponse.json(
        { message },
        { status: 409 }
      );
    }

    // Hash password (in production, use bcrypt with proper salt)
    const hashedPassword = hashPassword(body.password);

    // Create new student record
    const newStudent = await studentsStore.add({
      name: body.name.trim(),
      email: body.email.toLowerCase().trim(),
      enrollmentNumber: body.enrollmentNumber.trim(),
      batch: body.batch.trim(),
      // Note: We don't store the password in the student record
      // In a real application, you'd have a separate authentication table
    });

    // Store password separately (simplified for demo)
    // In production, this would go to a separate authentication service/table
    const authData = {
      studentId: newStudent.id,
      email: newStudent.email,
      passwordHash: hashedPassword,
      createdAt: new Date().toISOString()
    };

    // Log the registration (in production, you'd store this properly)
    console.log('New student registered:', {
      id: newStudent.id,
      name: newStudent.name,
      email: newStudent.email,
      enrollmentNumber: newStudent.enrollmentNumber,
      batch: newStudent.batch,
      registeredAt: newStudent.joinedAt
    });

    // Return success response (don't include sensitive data)
    return NextResponse.json(
      { 
        message: 'Registration successful',
        student: {
          id: newStudent.id,
          name: newStudent.name,
          email: newStudent.email,
          enrollmentNumber: newStudent.enrollmentNumber,
          batch: newStudent.batch,
          joinedAt: newStudent.joinedAt
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error : 'Registration failed'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  );
}
