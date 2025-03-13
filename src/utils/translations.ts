export type Language = 'en' | 'fr' | 'es' | 'ar' | 'sw';

export const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
];

type TranslationKeys = {
  welcome: string;
  dashboard: string;
  groups: string;
  profile: string;
  signOut: string;
  signIn: string;
  signUp: string;
  forgotPassword: string;
  resetPassword: string;
  pageNotFound: string;
  goHome: string;
  email: string;
  password: string;
  fullName: string;
  confirmPassword: string;
  resetPasswordEmailSent: string;
  resetPasswordSuccess: string;
  newPassword: string;
  passwordNotMatch: string;
  invalidEmail: string;
  passwordRequired: string;
  nameRequired: string;
  confirmPasswordRequired: string;
  passwordsMustMatch: string;
  createGroup: string;
  groupName: string;
  groupDescription: string;
  create: string;
  cancel: string;
  groupNameRequired: string;
  groupDescriptionRequired: string;
  myGroups: string;
  noGroupsYet: string;
  createYourFirstGroup: string;
  members: string;
  active: string;
  pending: string;
  paid: string;
  search: string;
  noMembersYet: string;
  inviteMembers: string;
  settings: string;
  general: string;
  account: string;
  notifications: string;
  language: string;
  currency: string;
  darkMode: string;
  saveChanges: string;
  editProfile: string;
  memberSince: string;
  totalContributions: string;
  groupsJoined: string;
  upcomingPayments: string;
  actions: string;
  activity: string;
  upcoming: string;
  savedGroups: string;
  messages: string;
  noUpcomingPayments: string;
  nextPayout: string;
  noMessages: string;
  noMessagesDesc: string;
  checkOut: string;
  joinTontine: string;
  
  // Adding new translations for ContributionManager component
  contributions: string;
  addContribution: string;
  missed: string;
  frequency: string;
  
  // Social features translations
  share: string;
  copyLink: string;
  linkCopied: string;
  close: string;
  inviteFriends: string;
  inviteFriendsTitle: string;
  inviteByEmail: string;
  send: string;
  orShareLink: string;
  copied: string;
  copy: string;
  success: string;
  less: string;
  more: string;
  sendMessage: string;
  recentActivity: string;
  noRecentActivity: string;
  minute: string;
  minutes: string;
  hour: string;
  hours: string;
  day: string;
  days: string;
  ago: string;
  invitationSent: string;
  invitationSentDesc: string;
  
  // Adding all missing translation keys from errors
  contributionAmount: string;
  contributionFrequency: string;
  weekly: string;
  biweekly: string;
  monthly: string;
  startDate: string;
  payoutMethod: string;
  rotation: string;
  randomSelection: string;
  biddingSystem: string;
  contribution: string;
  depositWithdraw: string;
  lightMode: string;
  completed: string;
  progress: string;
  nextDue: string;
  payoutStatus: string;
  ready: string;
  yourGroups: string;
  manageGroups: string;
  groupsInfoText: string;
  searchGroups: string;
  filterByStatus: string;
  all: string;
  sortBy: string;
  name: string;
  date: string;
  amount: string;
  noGroupsFound: string;
  noMatchingGroups: string;
  createFirstGroup: string;
  recentMembers: string;
  groupSummary: string;
  totalGroups: string;
  activeGroups: string;
  totalMembers: string;
  avgContribution: string;
  trackContributions: string;
  payments: string;
  createNewGroup: string;
  availableBalance: string;
  viewAll: string;
  paymentCalendar: string;
  receivedPayout: string;
  hoursAgo: string;
  joinedGroup: string;
  yesterday: string;
  madeContribution: string;
  daysAgo: string;
  returnToDashboard: string;
  
  // Activity feed template strings
  activityContribution: string;
  activityPayout: string;
  activityJoin: string;
  activityCreation: string;
  
  // Add the missing premium key
  premium: string;
};

type TranslationsType = {
  en: TranslationKeys;
  fr: TranslationKeys;
  es: TranslationKeys;
  ar: TranslationKeys;
  sw: TranslationKeys;
};

export const translations: TranslationsType = {
  en: {
    welcome: 'Welcome',
    dashboard: 'Dashboard',
    groups: 'Groups',
    profile: 'Profile',
    signOut: 'Sign Out',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    forgotPassword: 'Forgot Password',
    resetPassword: 'Reset Password',
    pageNotFound: 'Page Not Found',
    goHome: 'Go Home',
    email: 'Email',
    password: 'Password',
    fullName: 'Full Name',
    confirmPassword: 'Confirm Password',
    resetPasswordEmailSent: 'Password reset email sent. Please check your inbox.',
    resetPasswordSuccess: 'Your password has been successfully reset.',
    newPassword: 'New Password',
    passwordNotMatch: 'Passwords do not match',
    invalidEmail: 'Invalid email address',
    passwordRequired: 'Password is required',
    nameRequired: 'Name is required',
    confirmPasswordRequired: 'Confirm password is required',
    passwordsMustMatch: 'Passwords must match',
    createGroup: 'Create Group',
    groupName: 'Group Name',
    groupDescription: 'Group Description',
    create: 'Create',
    cancel: 'Cancel',
    groupNameRequired: 'Group name is required',
    groupDescriptionRequired: 'Group description is required',
    myGroups: 'My Groups',
    noGroupsYet: 'No groups yet',
    createYourFirstGroup: 'Create your first group',
    members: 'Members',
    active: 'Active',
    pending: 'Pending',
    paid: 'Paid',
    search: 'Search',
    noMembersYet: 'No members yet',
    inviteMembers: 'Invite Members',
    settings: 'Settings',
    general: 'General',
    account: 'Account',
    notifications: 'Notifications',
    language: 'Language',
    currency: 'Currency',
    darkMode: 'Dark Mode',
    saveChanges: 'Save Changes',
    editProfile: 'Edit Profile',
    memberSince: 'Member Since',
    totalContributions: 'Total Contributions',
    groupsJoined: 'Groups Joined',
    upcomingPayments: 'Upcoming Payments',
    actions: 'Actions',
    activity: 'Activity',
    upcoming: 'Upcoming',
    savedGroups: 'Saved Groups',
    messages: 'Messages',
    noUpcomingPayments: 'No upcoming payments',
    nextPayout: 'Next Payout',
    noMessages: 'No messages',
    noMessagesDesc: 'You have no messages yet.',
    checkOut: 'Check out',
    joinTontine: 'Join this Tontine!',
    
    // Adding new translations for ContributionManager component
    contributions: 'Contributions',
    addContribution: 'Add Contribution',
    missed: 'Missed',
    frequency: 'Frequency',
    
    // Social features translations
    share: 'Share',
    copyLink: 'Copy Link',
    linkCopied: 'Link copied to clipboard',
    close: 'Close',
    inviteFriends: 'Invite Friends',
    inviteFriendsTitle: 'Invite your friends to join',
    inviteByEmail: 'Invite by email',
    send: 'Send',
    orShareLink: 'Or share this invitation link',
    copied: 'Copied',
    copy: 'Copy',
    success: 'Success',
    less: 'Less',
    more: 'More',
    sendMessage: 'Send Message',
    recentActivity: 'Recent Activity',
    noRecentActivity: 'No recent activity to show',
    activityContribution: '{user} contributed {amount} to {group}',
    activityPayout: '{user} received {amount} from {group}',
    activityJoin: '{user} joined {group}',
    activityCreation: '{user} created {group}',
    minute: 'minute',
    minutes: 'minutes',
    hour: 'hour',
    hours: 'hours',
    day: 'day',
    days: 'days',
    ago: 'ago',
    invitationSent: 'Invitation Sent',
    invitationSentDesc: 'Your friend will receive an invitation email shortly',
    
    // Adding all missing translations from error list
    contributionAmount: 'Contribution Amount',
    contributionFrequency: 'Contribution Frequency',
    weekly: 'Weekly',
    biweekly: 'Biweekly',
    monthly: 'Monthly',
    startDate: 'Start Date',
    payoutMethod: 'Payout Method',
    rotation: 'Rotation',
    randomSelection: 'Random Selection',
    biddingSystem: 'Bidding System',
    contribution: 'Contribution',
    depositWithdraw: 'Deposit/Withdraw',
    lightMode: 'Light Mode',
    completed: 'Completed',
    progress: 'Progress',
    nextDue: 'Next Due',
    payoutStatus: 'Payout Status',
    ready: 'Ready',
    yourGroups: 'Your Groups',
    manageGroups: 'Manage Groups',
    groupsInfoText: 'Create and join savings groups with friends, family or colleagues',
    searchGroups: 'Search Groups',
    filterByStatus: 'Filter by Status',
    all: 'All',
    sortBy: 'Sort by',
    name: 'Name',
    date: 'Date',
    amount: 'Amount',
    noGroupsFound: 'No groups found',
    noMatchingGroups: 'No matching groups',
    createFirstGroup: 'Create your first group',
    recentMembers: 'Recent Members',
    groupSummary: 'Group Summary',
    totalGroups: 'Total Groups',
    activeGroups: 'Active Groups',
    totalMembers: 'Total Members',
    avgContribution: 'Average Contribution',
    trackContributions: 'Track Contributions',
    payments: 'Payments',
    createNewGroup: 'Create New Group',
    availableBalance: 'Available Balance',
    viewAll: 'View All',
    paymentCalendar: 'Payment Calendar',
    receivedPayout: 'Received payout',
    hoursAgo: 'hours ago',
    joinedGroup: 'joined group',
    yesterday: 'yesterday',
    madeContribution: 'Made contribution',
    daysAgo: 'days ago',
    returnToDashboard: 'Return to Dashboard',
    
    // Add premium translation
    premium: 'Premium',
  },
  fr: {
    welcome: 'Bienvenue',
    dashboard: 'Tableau de bord',
    groups: 'Groupes',
    profile: 'Profil',
    signOut: 'Déconnexion',
    signIn: 'Connexion',
    signUp: 'Inscription',
    forgotPassword: 'Mot de passe oublié',
    resetPassword: 'Réinitialiser le mot de passe',
    pageNotFound: 'Page non trouvée',
    goHome: 'Retour à l\'accueil',
    email: 'Email',
    password: 'Mot de passe',
    fullName: 'Nom complet',
    confirmPassword: 'Confirmer le mot de passe',
    resetPasswordEmailSent: 'Email de réinitialisation du mot de passe envoyé. Veuillez vérifier votre boîte de réception.',
    resetPasswordSuccess: 'Votre mot de passe a été réinitialisé avec succès.',
    newPassword: 'Nouveau mot de passe',
    passwordNotMatch: 'Les mots de passe ne correspondent pas',
    invalidEmail: 'Adresse email invalide',
    passwordRequired: 'Le mot de passe est requis',
    nameRequired: 'Le nom est requis',
    confirmPasswordRequired: 'La confirmation du mot de passe est requise',
    passwordsMustMatch: 'Les mots de passe doivent correspondre',
    createGroup: 'Créer un groupe',
    groupName: 'Nom du groupe',
    groupDescription: 'Description du groupe',
    create: 'Créer',
    cancel: 'Annuler',
    groupNameRequired: 'Le nom du groupe est requis',
    groupDescriptionRequired: 'La description du groupe est requise',
    myGroups: 'Mes groupes',
    noGroupsYet: 'Aucun groupe pour le moment',
    createYourFirstGroup: 'Créer votre premier groupe',
    members: 'Membres',
    active: 'Actif',
    pending: 'En attente',
    paid: 'Payé',
    search: 'Rechercher',
    noMembersYet: 'Aucun membre pour le moment',
    inviteMembers: 'Inviter des membres',
    settings: 'Paramètres',
    general: 'Général',
    account: 'Compte',
    notifications: 'Notifications',
    language: 'Langue',
    currency: 'Devise',
    darkMode: 'Mode sombre',
    saveChanges: 'Enregistrer les modifications',
    editProfile: 'Modifier le profil',
    memberSince: 'Membre depuis',
    totalContributions: 'Contributions totales',
    groupsJoined: 'Groupes rejoints',
    upcomingPayments: 'Paiements à venir',
    actions: 'Actions',
    activity: 'Activité',
    upcoming: 'À venir',
    savedGroups: 'Groupes enregistrés',
    messages: 'Messages',
    noUpcomingPayments: 'Aucun paiement à venir',
    nextPayout: 'Prochain paiement',
    noMessages: 'Aucun message',
    noMessagesDesc: 'Vous n\'avez pas encore de messages.',
    checkOut: 'Découvrez',
    joinTontine: 'Rejoignez cette Tontine !',
    
    // Adding new translations for ContributionManager component
    contributions: 'Contributions',
    addContribution: 'Ajouter une Contribution',
    missed: 'Manquée',
    frequency: 'Fréquence',
    
    // Social features translations
    share: 'Partager',
    copyLink: 'Copier le lien',
    linkCopied: 'Lien copié dans le presse-papiers',
    close: 'Fermer',
    inviteFriends: 'Inviter des amis',
    inviteFriendsTitle: 'Invitez vos amis à rejoindre',
    inviteByEmail: 'Inviter par email',
    send: 'Envoyer',
    orShareLink: 'Ou partagez ce lien d\'invitation',
    copied: 'Copié',
    copy: 'Copier',
    success: 'Succès',
    less: 'Moins',
    more: 'Plus',
    sendMessage: 'Envoyer un message',
    recentActivity: 'Activité récente',
    noRecentActivity: 'Aucune activité récente à afficher',
    activityContribution: '{user} a contribué {amount} à {group}',
    activityPayout: '{user} a reçu {amount} de {group}',
    activityJoin: '{user} a rejoint {group}',
    activityCreation: '{user} a créé {group}',
    minute: 'minute',
    minutes: 'minutes',
    hour: 'heure',
    hours: 'heures',
    day: 'jour',
    days: 'jours',
    ago: 'il y a',
    invitationSent: 'Invitation Envoyée',
    invitationSentDesc: 'Votre ami recevra un email d\'invitation sous peu',
    
    // Adding all missing translations from error list
    contributionAmount: 'Montant de la contribution',
    contributionFrequency: 'Fréquence de contribution',
    weekly: 'Hebdomadaire',
    biweekly: 'Bimensuel',
    monthly: 'Mensuel',
    startDate: 'Date de début',
    payoutMethod: 'Méthode de paiement',
    rotation: 'Rotation',
    randomSelection: 'Sélection aléatoire',
    biddingSystem: 'Système d\'enchères',
    contribution: 'Contribution',
    depositWithdraw: 'Dépôt/Retrait',
    lightMode: 'Mode clair',
    completed: 'Terminé',
    progress: 'Progression',
    nextDue: 'Prochain paiement dû',
    payoutStatus: 'Statut de paiement',
    ready: 'Prêt',
    yourGroups: 'Vos groupes',
    manageGroups: 'Gérer les groupes',
    groupsInfoText: 'Créez et rejoignez des groupes d\'épargne avec des amis, la famille ou des collègues',
    searchGroups: 'Rechercher des groupes',
    filterByStatus: 'Filtrer par statut',
    all: 'Tous',
    sortBy: 'Trier par',
    name: 'Nom',
    date: 'Date',
    amount: 'Montant',
    noGroupsFound: 'Aucun groupe trouvé',
    noMatchingGroups: 'Aucun groupe correspondant',
    createFirstGroup: 'Créez votre premier groupe',
    recentMembers: 'Membres récents',
    groupSummary: 'Résumé du groupe',
    totalGroups: 'Total des groupes',
    activeGroups: 'Groupes actifs',
    totalMembers: 'Total des membres',
    avgContribution: 'Contribution moyenne',
    trackContributions: 'Suivre les contributions',
    payments: 'Paiements',
    createNewGroup: 'Créer un nouveau groupe',
    availableBalance: 'Solde disponible',
    viewAll: 'Voir tout',
    paymentCalendar: 'Calendrier de paiement',
    receivedPayout: 'A reçu un paiement',
    hoursAgo: 'heures',
    joinedGroup: 'a rejoint le groupe',
    yesterday: 'hier',
    madeContribution: 'A fait une contribution',
    daysAgo: 'jours',
    returnToDashboard: 'Retour au tableau de bord',
    
    // Add premium translation
    premium: 'Premium',
  },
  es: {
    welcome: 'Bienvenido',
    dashboard: 'Tablero',
    groups: 'Grupos',
    profile: 'Perfil',
    signOut: 'Cerrar sesión',
    signIn: 'Iniciar sesión',
    signUp: 'Registrarse',
    forgotPassword: 'Olvidé mi contraseña',
    resetPassword: 'Restablecer la contraseña',
    pageNotFound: 'Página no encontrada',
    goHome: 'Ir a la página de inicio',
    email: 'Correo electrónico',
    password: 'Contraseña',
    fullName: 'Nombre completo',
    confirmPassword: 'Confirmar contraseña',
    resetPasswordEmailSent: 'Se ha enviado un correo electrónico para restablecer la contraseña. Por favor, revise su bandeja de entrada.',
    resetPasswordSuccess: 'Su contraseña ha sido restablecida con éxito.',
    newPassword: 'Nueva contraseña',
    passwordNotMatch: 'Las contraseñas no coinciden',
    invalidEmail: 'Dirección de correo electrónico no válida',
    passwordRequired: 'Se requiere contraseña',
    nameRequired: 'Se requiere nombre',
    confirmPasswordRequired: 'Se requiere confirmar la contraseña',
    passwordsMustMatch: 'Las contraseñas deben coincidir',
    createGroup: 'Crear grupo',
    groupName: 'Nombre del grupo',
    groupDescription: 'Descripción del grupo',
    create: 'Crear',
    cancel: 'Cancelar',
    groupNameRequired: 'Se requiere el nombre del grupo',
    groupDescriptionRequired: 'Se requiere la descripción del grupo',
    myGroups: 'Mis grupos',
    noGroupsYet: 'Aún no hay grupos',
    createYourFirstGroup: 'Crea tu primer grupo',
    members: 'Miembros',
    active: 'Activo',
    pending: 'Pendiente',
    paid: 'Pagado',
    search: 'Buscar',
    noMembersYet: 'Aún no hay miembros',
    inviteMembers: 'Invitar miembros',
    settings: 'Ajustes',
    general: 'General',
    account: 'Cuenta',
    notifications: 'Notificaciones',
    language: 'Idioma',
    currency: 'Moneda',
    darkMode: 'Modo oscuro',
    saveChanges: 'Guardar cambios',
    editProfile: 'Editar perfil',
    memberSince: 'Miembro desde',
    totalContributions: 'Contribuciones totales',
    groupsJoined: 'Grupos unidos',
    upcomingPayments: 'Próximos pagos',
    actions: 'Acciones',
    activity: 'Actividad',
    upcoming: 'Próximo',
    savedGroups: 'Grupos guardados',
    messages: 'Mensajes',
    noUpcomingPayments: 'No hay próximos pagos',
    nextPayout: 'Próximo pago',
    noMessages: 'Sin mensajes',
    noMessagesDesc: 'Aún no tienes mensajes.',
    checkOut: 'Echa un vistazo',
    joinTontine: '¡Únete a esta Tontine!',
    
    // Adding new translations for ContributionManager component
    contributions: 'Contribuciones',
    addContribution: 'Añadir Contribución',
    missed: 'Perdidas',
    frequency: 'Frecuencia',
    
    // Social features translations
    share: 'Compartir',
    copyLink: 'Copiar enlace',
    linkCopied: 'Enlace copiado al portapapeles',
    close: 'Cerrar',
    inviteFriends: 'Invitar amigos',
    inviteFriendsTitle: 'Invita a tus amigos a unirse',
    inviteByEmail: 'Invitar por email',
    send: 'Enviar',
    orShareLink: 'O comparte este enlace de invitación',
    copied: 'Copiado',
    copy: 'Copiar',
    success: 'Éxito',
    less: 'Menos',
    more: 'Más',
    sendMessage: 'Enviar mensaje',
    recentActivity: 'Actividad reciente',
    noRecentActivity: 'No hay actividad reciente para mostrar',
    activityContribution: '{user} contribuyó {amount} a {group}',
    activityPayout: '{user} recibió {amount} de {group}',
    activityJoin: '{user} se unió a {group}',
    activityCreation: '{user} creó {group}',
    minute: 'minuto',
    minutes: 'minutos',
    hour: 'hora',
    hours: 'horas',
    day: 'día',
    days: 'días',
    ago: 'hace',
    invitationSent: 'Invitación enviada',
    invitationSentDesc: 'Tu amigo recibirá un correo de invitación en breve',
    
    // Adding all missing translations from error list
    contributionAmount: 'Monto de contribución',
    contributionFrequency: 'Frecuencia de contribución',
    weekly: 'Semanal',
    biweekly: 'Quincenal',
    monthly: 'Mensual',
    startDate: 'Fecha de inicio',
    payoutMethod: 'Método de pago',
    rotation: 'Rotación',
    randomSelection: 'Selección aleatoria',
    biddingSystem: 'Sistema de licitación',
    contribution: 'Contribución',
    depositWithdraw: 'Depositar/Retirar',
    lightMode: 'Modo claro',
    completed: 'Completado',
    progress: 'Progreso',
    nextDue: 'Próximo vencimiento',
    payoutStatus: 'Estado de pago',
    ready: 'Listo',
    yourGroups: 'Tus grupos',
    manageGroups: 'Administrar grupos',
    groupsInfoText: 'Crea y únete a grupos de ahorro con amigos, familiares o colegas',
    searchGroups: 'Buscar grupos',
    filterByStatus: 'Filtrar por estado',
    all: 'Todos',
    sortBy: 'Ordenar por',
    name: 'Nombre',
    date: 'Fecha',
    amount: 'Monto',
    noGroupsFound: 'No se encontraron grupos',
    noMatchingGroups: 'No hay grupos coincidentes',
    createFirstGroup: 'Crea tu primer grupo',
    recentMembers: 'Miembros recientes',
    groupSummary: 'Resumen de grupo',
    totalGroups: 'Total de grupos',
    activeGroups: 'Grupos activos',
    totalMembers: 'Total de miembros',
    avgContribution: 'Contribución promedio',
    trackContributions: 'Seguimiento de contribuciones',
    payments: 'Pagos',
    createNewGroup: 'Crear nuevo grupo',
    availableBalance: 'Saldo disponible',
    viewAll: 'Ver todo',
    paymentCalendar: 'Calendario de pagos',
    receivedPayout: 'Recibió pago',
    hoursAgo: 'horas atrás',
    joinedGroup: 'se unió al grupo',
    yesterday: 'ayer',
    madeContribution: 'Hizo una contribución',
    daysAgo: 'días atrás',
    returnToDashboard: 'Volver al tablero',
    
    // Add premium translation
    premium: 'Premium',
  },
  ar: {
    welcome: 'مرحبا',
    dashboard: 'لوحة التحكم',
    groups: 'المجموعات',
    profile: 'الملف الشخصي',
    signOut: 'تسجيل الخروج',
    signIn: 'تسجيل الدخول',
    signUp: 'إنشاء حساب',
    forgotPassword: 'نسيت كلمة المرور',
    resetPassword: 'إعادة تعيين كلمة المرور',
    pageNotFound: 'الصفحة غير موجودة',
    goHome: 'العودة إلى الصفحة الرئيسية',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    fullName: 'الاسم الكامل',
    confirmPassword: 'تأكيد كلمة المرور',
    resetPasswordEmailSent: 'تم إرسال رسالة بريد إلكتروني لإعادة تعيين كلمة المرور. يرجى التحقق من صندوق الوارد الخاص بك.',
    resetPasswordSuccess: 'تمت إعادة تعيين كلمة المرور بنجاح.',
    newPassword: 'كلمة مرور جديدة',
    passwordNotMatch: 'كلمات المرور غير متطابقة',
    invalidEmail: 'عنوان بريد إلكتروني غير صالح',
    passwordRequired: 'كلمة المرور مطلوبة',
    nameRequired: 'الاسم مطلوب',
    confirmPasswordRequired: 'تأكيد كلمة المرور مطلوب',
    passwordsMustMatch: 'يجب أن تتطابق كلمات المرور',
    createGroup: 'إنشاء مجموعة',
    groupName: 'اسم المجموعة',
    groupDescription: 'وصف المجموعة',
    create: 'إنشاء',
    cancel: 'إلغاء',
    groupNameRequired: 'اسم المجموعة مطلوب',
    groupDescriptionRequired: 'وصف المجموعة مطلوب',
    myGroups: 'مجموعاتي',
    noGroupsYet: 'لا توجد مجموعات حتى الآن',
    createYourFirstGroup: 'أنشئ مجموعتك الأولى',
    members: 'الأعضاء',
    active: 'نشط',
    pending: 'قيد الانتظار',
    paid: 'مدفوع',
    search: 'بحث',
    noMembersYet: 'لا يوجد أعضاء حتى الآن',
    inviteMembers: 'دعوة أعضاء',
    settings: 'الإعدادات',
    general: 'عام',
    account: 'الحساب',
    notifications: 'الإشعارات',
    language: 'اللغة',
    currency: 'العملة',
    darkMode: 'الوضع الداكن',
    saveChanges: 'حفظ التغييرات',
    editProfile: 'تعديل الملف الشخصي',
    memberSince: 'عضو منذ',
    totalContributions: 'إجمالي المساهمات',
    groupsJoined: 'المجموعات التي انضممت إليها',
    upcomingPayments: 'المدفوعات القادمة',
    actions: 'الإجراءات',
    activity: 'نشاط',
    upcoming: 'القادمة',
    savedGroups: 'المجموعات المحفوظة',
    messages: 'رسائل',
    noUpcomingPayments: 'لا توجد مدفوعات قادمة',
    nextPayout: 'الدفعة التالية',
    noMessages: 'لا توجد رسائل',
    noMessagesDesc: 'ليس لديك رسائل بعد.',
    checkOut: 'تحقق من',
    joinTontine: 'انضم إلى هذه التونتين!',
    
    // Adding new translations for ContributionManager component
    contributions: 'المساهمات',
    addContribution: 'إضافة مساهمة',
    missed: 'فائتة',
    frequency: 'التكرار',
    
    // Social features translations
    share: 'مشاركة',
    copyLink: 'نسخ الرابط',
    linkCopied: 'تم نسخ الرابط إلى الحافظة',
    close: 'إغلاق',
    inviteFriends: 'دعوة الأصدقاء',
    inviteFriendsTitle: 'ادعُ أصدقاءك للانضمام',
    inviteByEmail: 'دعوة عبر البريد الإلكتروني',
    send: 'إرسال',
    orShareLink: 'أو شارك رابط الدعوة هذا',
    copied: 'تم النسخ',
    copy: 'نسخ',
    success: 'نجاح',
    less: 'أقل',
    more: 'المزيد',
    sendMessage: 'إرسال رسالة',
    recentActivity: 'النشاط الأخير',
    noRecentActivity: 'لا يوجد نشاط حديث لعرضه',
    activityContribution: 'ساهم {user} بمبلغ {amount} في {group}',
    activityPayout: 'استلم {user} مبلغ {amount} من {group}',
    activityJoin: 'انضم {user} إلى {group}',
    activityCreation: 'أنشأ {user} مجموعة {group}',
    minute: 'دقيقة',
    minutes: 'دقائق',
    hour: 'ساعة',
    hours: 'ساعات',
    day: 'يوم',
    days: 'أيام',
    ago: 'منذ',
    invitationSent: 'تم إرسال الدعوة',
    invitationSentDesc: 'سيتلقى صديقك رسالة دعوة عبر البريد الإلكتروني قريبًا',
    
    // Adding all missing translations from error list
    contributionAmount: 'مبلغ المساهمة',
    contributionFrequency: 'تكرار المساهمة',
    weekly: 'أسبوعي',
    biweekly: 'نصف شهري',
    monthly: 'شهري',
    startDate: 'تاريخ البدء',
    payoutMethod: 'طريقة الدفع',
    rotation: 'التناوب',
    randomSelection: 'اختيار عشوائي',
    biddingSystem: 'نظام المزايدة',
    contribution: 'مساهمة',
    depositWithdraw: 'إيداع/سحب',
    lightMode: 'الوضع الفاتح',
    completed: 'مكتمل',
    progress: 'التقدم',
    nextDue: 'الاستحقاق التالي',
    payoutStatus: 'حالة الدفع',
    ready: 'جاهز',
    yourGroups: 'مجموعاتك',
    manageGroups: 'إدارة المجموعات',
    groupsInfoText: 'أنشئ وانضم إلى مجموعات الادخار مع الأصدقاء والعائلة أو الزملاء',
    searchGroups: 'البحث عن مجموعات',
    filterByStatus: 'تصفية حسب الحالة',
    all: 'الكل',
    sortBy: 'ترتيب حسب',
    name: 'الاسم',
    date: 'التاريخ',
    amount: 'المبلغ',
    noGroupsFound: 'لم يتم العثور على مجموعات',
    noMatchingGroups: 'لا توجد مجموعات مطابقة',
    createFirstGroup: 'إنشاء مجموعتك الأولى',
    recentMembers: 'الأعضاء الأخيرون',
    groupSummary: 'ملخص المجموعة',
    totalGroups: 'إجمالي المجموعات',
    activeGroups: 'المجموعات النشطة',
    totalMembers: 'إجمالي الأعضاء',
    avgContribution: 'متوسط المساهمة',
    trackContributions: 'تتبع المساهمات',
    payments: 'المدفوعات',
    createNewGroup: 'إنشاء مجموعة جديدة',
    availableBalance: 'الرصيد المتاح',
    viewAll: 'عرض الكل',
    paymentCalendar: 'تقويم المدفوعات',
    receivedPayout: 'استلم الدفعة',
    hoursAgo: 'ساعات مضت',
    joinedGroup: 'انضم إلى المجموعة',
    yesterday: 'أمس',
    madeContribution: 'قدم مساهمة',
    daysAgo: 'أيام مضت',
    returnToDashboard: 'العودة إلى لوحة التحكم',
    
    // Add premium translation
    premium: 'المميز',
  },
  sw: {
    welcome: 'Karibu',
    dashboard: 'Dashibodi',
    groups: 'Vikundi',
    profile: 'Wasifu',
    signOut: 'Ondoka',
    signIn: 'Ingia',
    signUp: 'Jisajili',
    forgotPassword: 'Umesahau Nenosiri',
    resetPassword: 'Weka Upya Nenosiri',
    pageNotFound: 'Ukurasa Haupatikani',
    goHome: 'Nenda Nyumbani',
    email: 'Barua pepe',
    password: 'Nenosiri',
    fullName: 'Jina Kamili',
