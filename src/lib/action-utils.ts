/**
 * Standard response format for server actions
 */
export type ActionResponse<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Wrapper for server actions to standardize error handling
 */
export async function withActionHandler<T>(
  action: () => Promise<T>
): Promise<ActionResponse<T>> {
  try {
    const data = await action();
    return { success: true, data };
  } catch (error) {
    console.error('Action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    };
  }
}

/**
 * Success messages for common actions
 */
export const SUCCESS_MESSAGES = {
  ACTIVITY_CREATED: 'Activity added successfully',
  ACTIVITY_UPDATED: 'Activity updated',
  ACTIVITY_DELETED: 'Activity deleted',
  HYDRATION_UPDATED: 'Hydration updated',
  PROFILE_UPDATED: 'Profile updated',
  MEASUREMENT_SAVED: 'Measurement saved',
} as const;

/**
 * Error messages for common scenarios
 */
export const ERROR_MESSAGES = {
  UNAUTHENTICATED: 'You must sign in',
  NETWORK_ERROR: 'Connection error',
  VALIDATION_ERROR: 'Invalid data',
  GENERIC_ERROR: 'Something went wrong',
} as const;
