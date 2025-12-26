import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
}

@Injectable({
  providedIn: 'root',
})
export class ApiClientService {
  private readonly defaultDelay = 500; // Simulate network delay

  /**
   * Simulates a GET request to the backend
   */
  get<T>(endpoint: string, params?: Record<string, unknown>): Observable<ApiResponse<T>> {
    console.log(`[API GET] ${endpoint}`, params);
    // In a real implementation, this would make an HTTP call
    // For now, we'll return a mock response
    return of({ data: {} as T, success: true }).pipe(
      delay(this.defaultDelay),
      tap(() => console.log(`[API GET] ${endpoint} - Success`))
    );
  }

  /**
   * Simulates a POST request to the backend
   */
  post<T>(endpoint: string, body: unknown): Observable<ApiResponse<T>> {
    console.log(`[API POST] ${endpoint}`, body);
    return of({ data: {} as T, success: true }).pipe(
      delay(this.defaultDelay),
      tap(() => console.log(`[API POST] ${endpoint} - Success`))
    );
  }

  /**
   * Simulates a PUT request to the backend
   */
  put<T>(endpoint: string, body: unknown): Observable<ApiResponse<T>> {
    console.log(`[API PUT] ${endpoint}`, body);
    return of({ data: {} as T, success: true }).pipe(
      delay(this.defaultDelay),
      tap(() => console.log(`[API PUT] ${endpoint} - Success`))
    );
  }

  /**
   * Simulates a PATCH request to the backend
   */
  patch<T>(endpoint: string, body: unknown): Observable<ApiResponse<T>> {
    console.log(`[API PATCH] ${endpoint}`, body);
    return of({ data: {} as T, success: true }).pipe(
      delay(this.defaultDelay),
      tap(() => console.log(`[API PATCH] ${endpoint} - Success`))
    );
  }

  /**
   * Simulates a DELETE request to the backend
   */
  delete<T>(endpoint: string): Observable<ApiResponse<T>> {
    console.log(`[API DELETE] ${endpoint}`);
    return of({ data: {} as T, success: true }).pipe(
      delay(this.defaultDelay),
      tap(() => console.log(`[API DELETE] ${endpoint} - Success`))
    );
  }

  /**
   * Helper method to simulate a successful response
   */
  mockSuccess<T>(data: T, message?: string, customDelay?: number): Observable<ApiResponse<T>> {
    return of({ data, success: true, message }).pipe(
      delay(customDelay ?? this.defaultDelay)
    );
  }

  /**
   * Helper method to simulate an error response
   */
  mockError(message: string, code: string = 'ERROR', statusCode: number = 500, customDelay?: number): Observable<never> {
    const error: ApiError = { message, code, statusCode };
    return throwError(() => error).pipe(
      delay(customDelay ?? this.defaultDelay)
    );
  }

  /**
   * Simulates conditional response (success or error)
   */
  mockConditional<T>(
    condition: boolean,
    successData: T,
    errorMessage: string = 'Operation failed',
    customDelay?: number
  ): Observable<ApiResponse<T>> {
    if (condition) {
      return this.mockSuccess(successData, undefined, customDelay);
    }
    return this.mockError(errorMessage, 'VALIDATION_ERROR', 400, customDelay);
  }
}

