// Export des services
export * from './analyticsService';
export * from './chatService';
export * from './documentService';
export * from './errorService';
export * from './exportService';
export * from './geoLocationService';
export * from './loyaltyService';
export * from './notificationService';
export * from './paypalService';
export * from './promoCodeService';
export * from './recommendationService';
export * from './serviceManagementService';
export * from './stripeService';
export * from './tontineService';
export * from './whatsappService';

// Types communs
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: any;
}
