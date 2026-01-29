import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export interface ApiError {
  error: string
  details?: Array<{ field: string; message: string }>
}

export function validationErrorResponse(error: ZodError): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error: 'Validation failed',
      details: error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    },
    { status: 400 },
  )
}

export function notFoundResponse(resource: string = 'Resource'): NextResponse<ApiError> {
  return NextResponse.json(
    { error: `${resource} not found` },
    { status: 404 },
  )
}

export function unauthorizedResponse(message: string = 'Authentication required'): NextResponse<ApiError> {
  return NextResponse.json(
    { error: message },
    { status: 401 },
  )
}

export function forbiddenResponse(message: string = 'Access forbidden'): NextResponse<ApiError> {
  return NextResponse.json(
    { error: message },
    { status: 403 },
  )
}

export function conflictResponse(message: string): NextResponse<ApiError> {
  return NextResponse.json(
    { error: message },
    { status: 409 },
  )
}

export function serverErrorResponse(message: string = 'Internal server error'): NextResponse<ApiError> {
  return NextResponse.json(
    { error: message },
    { status: 500 },
  )
}

export function badRequestResponse(message: string): NextResponse<ApiError> {
  return NextResponse.json(
    { error: message },
    { status: 400 },
  )
}
