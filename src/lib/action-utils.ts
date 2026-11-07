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
      error: error instanceof Error ? error.message : 'Si è verificato un errore',
    };
  }
}

/**
 * Success messages for common actions
 */
export const SUCCESS_MESSAGES = {
  ACTIVITY_CREATED: 'Attività aggiunta con successo',
  ACTIVITY_UPDATED: 'Attività aggiornata',
  ACTIVITY_DELETED: 'Attività eliminata',
  HYDRATION_UPDATED: 'Idratazione aggiornata',
  PROFILE_UPDATED: 'Profilo aggiornato',
  MEASUREMENT_SAVED: 'Misurazione salvata',
} as const;

/**
 * Error messages for common scenarios
 */
export const ERROR_MESSAGES = {
  UNAUTHENTICATED: 'Devi effettuare il login',
  NETWORK_ERROR: 'Errore di connessione',
  VALIDATION_ERROR: 'Dati non validi',
  GENERIC_ERROR: 'Qualcosa è andato storto',
} as const;
