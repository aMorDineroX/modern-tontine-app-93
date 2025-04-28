// Export des services
export * from './analyticsService';
export * from './chatService';
export * from './documentService';
export * from './errorService';
export * from './exportService';
export * from './geoLocationService';
export * from './notificationService';
export * from './paypalService';
export * from './serviceManagementService';
export * from './tontineService';
export * from './whatsappService';

// Types communs
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: any;
}
