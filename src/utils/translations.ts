export type Language = 'fr' | 'en' | 'es' | 'ar' | 'sw';

export type TranslationKeys = {
  welcome: string;
  trackContributions: string;
  createNewGroup: string;
  totalContributions: string;
  availableBalance: string;
  activeGroups: string;
  nextPayout: string;
  yourGroups: string;
  viewAll: string;
  paymentCalendar: string;
  recentMembers: string;
  recentActivity: string;
  receivedPayout: string;
  joinedGroup: string;
  madeContribution: string;
  hoursAgo: string;
  yesterday: string;
  daysAgo: string;
  members: string;
  contribution: string;
  nextDue: string;
  active: string;
  pending: string;
  paid: string;
  completed: string;
  complete: string;
  groupName: string;
  contributionAmount: string;
  contributionFrequency: string;
  startDate: string;
  payoutMethod: string;
  inviteMembers: string;
  createGroup: string;
  weekly: string;
  biweekly: string;
  monthly: string;
  rotation: string;
  randomSelection: string;
  biddingSystem: string;
  dashboard: string;
  myGroups: string;
  profile: string;
  currency: string;
  language: string;
  settings: string;
  payments: string;
  darkMode: string;
  lightMode: string;
  pageNotFound: string;
  returnToDashboard: string;
  
  // Adding missing keys for the Groups page
  manageGroups: string;
  searchGroups: string;
  filterByStatus: string;
  all: string; 
  noGroupsFound: string;
  noMatchingGroups: string;
  createFirstGroup: string;
  groupSummary: string;
  totalGroups: string;
  totalMembers: string;
  avgContribution: string;
  
  // Adding deposit/withdraw key
  depositWithdraw: string;
  
  // Adding missing keys from error messages
  error: string;
  success: string;
  mustBeLoggedIn: string;
  groupCreated: string;
  errorCreatingGroup: string;
  creating: string;
  progress: string;
  payoutStatus: string;
  upcoming: string;
  ready: string;
  errorFetchingGroups: string;
  groupsInfoText: string;
  sortBy: string;
  name: string;
  date: string;
  amount: string;
};

type TranslationsType = {
  [key in Language]: TranslationKeys;
};

export const translations: TranslationsType = {
  en: {
    welcome: 'Welcome Back!',
    trackContributions: 'Track your tontine contributions and manage your savings groups',
    createNewGroup: 'Create New Group',
    totalContributions: 'Total Contributions',
    availableBalance: 'Available Balance',
    activeGroups: 'Active Groups',
    nextPayout: 'Next Payout',
    yourGroups: 'Your Tontine Groups',
    viewAll: 'View All',
    paymentCalendar: 'Payment Calendar',
    recentMembers: 'Recent Members',
    recentActivity: 'Recent Activity',
    receivedPayout: 'You received a payout of',
    joinedGroup: 'joined',
    madeContribution: 'You made a contribution of',
    hoursAgo: 'hours ago',
    yesterday: 'Yesterday',
    daysAgo: 'days ago',
    members: 'members',
    contribution: 'Contribution',
    nextDue: 'Next Due',
    active: 'Active',
    pending: 'Pending',
    paid: 'Paid',
    completed: 'Completed',
    complete: 'Complete',
    groupName: 'Group Name',
    contributionAmount: 'Contribution Amount',
    contributionFrequency: 'Contribution Frequency',
    startDate: 'Start Date',
    payoutMethod: 'Payout Method',
    inviteMembers: 'Invite Members (email addresses, comma separated)',
    createGroup: 'Create Tontine Group',
    weekly: 'Weekly',
    biweekly: 'Bi-weekly',
    monthly: 'Monthly',
    rotation: 'Rotation',
    randomSelection: 'Random Selection',
    biddingSystem: 'Bidding System',
    dashboard: 'Dashboard',
    myGroups: 'My Groups',
    profile: 'Profile',
    currency: 'Currency',
    language: 'Language',
    settings: 'Settings',
    payments: 'Payments',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    pageNotFound: 'Oops! Page not found',
    returnToDashboard: 'Return to Dashboard',
    
    // Adding missing translations
    error: 'Error',
    success: 'Success',
    mustBeLoggedIn: 'You must be logged in to create a group',
    groupCreated: 'Group created successfully',
    errorCreatingGroup: 'An error occurred while creating the group',
    creating: 'Creating',
    progress: 'Progress',
    payoutStatus: 'Payout Status',
    upcoming: 'Upcoming',
    ready: 'Ready',
    errorFetchingGroups: 'An error occurred while fetching groups',
    groupsInfoText: 'Create and manage your tontine groups. Track contributions and payouts for each group.',
    sortBy: 'Sort by',
    name: 'Name',
    date: 'Date',
    amount: 'Amount',
    
    // Existing keys
    manageGroups: 'Manage and track your tontine groups',
    searchGroups: 'Search groups...',
    filterByStatus: 'Filter by status',
    all: 'All',
    noGroupsFound: 'No groups found',
    noMatchingGroups: 'No groups match your search criteria',
    createFirstGroup: 'Create your first group to get started',
    groupSummary: 'Group Summary',
    totalGroups: 'Total Groups',
    totalMembers: 'Total Members',
    avgContribution: 'Avg. Contribution',
    depositWithdraw: 'Deposit/Withdraw'
  },
  fr: {
    welcome: 'Bienvenue !',
    trackContributions: 'Suivez vos contributions à la tontine et gérez vos groupes d\'épargne',
    createNewGroup: 'Créer un Nouveau Groupe',
    totalContributions: 'Contributions Totales',
    availableBalance: 'Solde Disponible',
    activeGroups: 'Groupes Actifs',
    nextPayout: 'Prochain Versement',
    yourGroups: 'Vos Groupes de Tontine',
    viewAll: 'Voir Tout',
    paymentCalendar: 'Calendrier de Paiement',
    recentMembers: 'Membres Récents',
    recentActivity: 'Activité Récente',
    receivedPayout: 'Vous avez reçu un versement de',
    joinedGroup: 'a rejoint',
    madeContribution: 'Vous avez fait une contribution de',
    hoursAgo: 'heures',
    yesterday: 'Hier',
    daysAgo: 'jours',
    members: 'membres',
    contribution: 'Contribution',
    nextDue: 'Prochaine Échéance',
    active: 'Actif',
    pending: 'En attente',
    paid: 'Payé',
    completed: 'Terminé',
    complete: 'Terminé',
    groupName: 'Nom du Groupe',
    contributionAmount: 'Montant de la Contribution',
    contributionFrequency: 'Fréquence de Contribution',
    startDate: 'Date de Début',
    payoutMethod: 'Méthode de Versement',
    inviteMembers: 'Inviter des Membres (adresses e-mail, séparées par des virgules)',
    createGroup: 'Créer un Groupe de Tontine',
    weekly: 'Hebdomadaire',
    biweekly: 'Bimensuel',
    monthly: 'Mensuel',
    rotation: 'Rotation',
    randomSelection: 'Sélection Aléatoire',
    biddingSystem: 'Système d\'Enchères',
    dashboard: 'Tableau de Bord',
    myGroups: 'Mes Groupes',
    profile: 'Profil',
    currency: 'Devise',
    language: 'Langue',
    settings: 'Paramètres',
    payments: 'Paiements',
    darkMode: 'Mode Sombre',
    lightMode: 'Mode Clair',
    pageNotFound: 'Oups ! Page non trouvée',
    returnToDashboard: 'Retourner au Tableau de Bord',
    
    // Adding missing translations
    error: 'Erreur',
    success: 'Succès',
    mustBeLoggedIn: 'Vous devez être connecté pour créer un groupe',
    groupCreated: 'Groupe créé avec succès',
    errorCreatingGroup: 'Une erreur est survenue lors de la création du groupe',
    creating: 'Création',
    progress: 'Progression',
    payoutStatus: 'Statut de Paiement',
    upcoming: 'À venir',
    ready: 'Prêt',
    errorFetchingGroups: 'Une erreur est survenue lors de la récupération des groupes',
    groupsInfoText: 'Créez et gérez vos groupes de tontine. Suivez les contributions et les versements pour chaque groupe.',
    sortBy: 'Trier par',
    name: 'Nom',
    date: 'Date',
    amount: 'Montant',
    
    // Existing keys
    manageGroups: 'Gérez et suivez vos groupes de tontine',
    searchGroups: 'Rechercher des groupes...',
    filterByStatus: 'Filtrer par statut',
    all: 'Tous',
    noGroupsFound: 'Aucun groupe trouvé',
    noMatchingGroups: 'Aucun groupe ne correspond à vos critères de recherche',
    createFirstGroup: 'Créez votre premier groupe pour commencer',
    groupSummary: 'Résumé des Groupes',
    totalGroups: 'Nombre Total de Groupes',
    totalMembers: 'Nombre Total de Membres',
    avgContribution: 'Contribution Moyenne',
    depositWithdraw: 'Dépôt/Retrait'
  },
  es: {
    welcome: '¡Bienvenido de Nuevo!',
    trackContributions: 'Sigue tus contribuciones a la tontina y administra tus grupos de ahorro',
    createNewGroup: 'Crear Nuevo Grupo',
    totalContributions: 'Contribuciones Totales',
    availableBalance: 'Saldo Disponible',
    activeGroups: 'Grupos Activos',
    nextPayout: 'Próximo Pago',
    yourGroups: 'Tus Grupos de Tontina',
    viewAll: 'Ver Todo',
    paymentCalendar: 'Calendario de Pagos',
    recentMembers: 'Miembros Recientes',
    recentActivity: 'Actividad Reciente',
    receivedPayout: 'Recibiste un pago de',
    joinedGroup: 'se unió a',
    madeContribution: 'Hiciste una contribución de',
    hoursAgo: 'horas atrás',
    yesterday: 'Ayer',
    daysAgo: 'días atrás',
    members: 'miembros',
    contribution: 'Contribución',
    nextDue: 'Próximo Vencimiento',
    active: 'Activo',
    pending: 'Pendiente',
    paid: 'Pagado',
    completed: 'Completado',
    complete: 'Completo',
    groupName: 'Nombre del Grupo',
    contributionAmount: 'Monto de Contribución',
    contributionFrequency: 'Frecuencia de Contribución',
    startDate: 'Fecha de Inicio',
    payoutMethod: 'Método de Pago',
    inviteMembers: 'Invitar Miembros (direcciones de correo, separadas por comas)',
    createGroup: 'Crear Grupo de Tontina',
    weekly: 'Semanal',
    biweekly: 'Quincenal',
    monthly: 'Mensual',
    rotation: 'Rotación',
    randomSelection: 'Selección Aleatoria',
    biddingSystem: 'Sistema de Pujas',
    dashboard: 'Panel',
    myGroups: 'Mis Grupos',
    profile: 'Perfil',
    currency: 'Moneda',
    language: 'Idioma',
    settings: 'Ajustes',
    payments: 'Pagos',
    darkMode: 'Modo Oscuro',
    lightMode: 'Modo Claro',
    pageNotFound: '¡Ups! Página no encontrada',
    returnToDashboard: 'Volver al Panel',
    
    // Adding missing translations
    error: 'Error',
    success: 'Éxito',
    mustBeLoggedIn: 'Debes iniciar sesión para crear un grupo',
    groupCreated: 'Grupo creado con éxito',
    errorCreatingGroup: 'Ocurrió un error al crear el grupo',
    creating: 'Creando',
    progress: 'Progreso',
    payoutStatus: 'Estado de Pago',
    upcoming: 'Próximo',
    ready: 'Listo',
    errorFetchingGroups: 'Ocurrió un error al obtener los grupos',
    groupsInfoText: 'Crea y administra tus grupos de tontina. Sigue las contribuciones y pagos para cada grupo.',
    sortBy: 'Ordenar por',
    name: 'Nombre',
    date: 'Fecha',
    amount: 'Monto',
    
    // Existing keys
    manageGroups: 'Administra y sigue tus grupos de tontina',
    searchGroups: 'Buscar grupos...',
    filterByStatus: 'Filtrar por estado',
    all: 'Todos',
    noGroupsFound: 'No se encontraron grupos',
    noMatchingGroups: 'Ningún grupo coincide con tus criterios de búsqueda',
    createFirstGroup: 'Crea tu primer grupo para comenzar',
    groupSummary: 'Resumen de Grupos',
    totalGroups: 'Total de Grupos',
    totalMembers: 'Total de Miembros',
    avgContribution: 'Contribución Media',
    depositWithdraw: 'Depósito/Retiro'
  },
  ar: {
    welcome: 'مرحبًا بعودتك!',
    trackContributions: 'تتبع مساهماتك في التونتين وإدارة مجموعات التوفير الخاصة بك',
    createNewGroup: 'إنشاء مجموعة جديدة',
    totalContributions: 'إجمالي المساهمات',
    availableBalance: 'الرصيد المتاح',
    activeGroups: 'المجموعات النشطة',
    nextPayout: 'الدفعة التالية',
    yourGroups: 'مجموعات التونتين الخاصة بك',
    viewAll: 'عرض الكل',
    paymentCalendar: 'تقويم الدفع',
    recentMembers: 'الأعضاء الأخيرون',
    recentActivity: 'النشاط الأخير',
    receivedPayout: 'لقد تلقيت دفعة بقيمة',
    joinedGroup: 'انضم إلى',
    madeContribution: 'قمت بمساهمة بقيمة',
    hoursAgo: 'ساعات مضت',
    yesterday: 'الأمس',
    daysAgo: 'أيام مضت',
    members: 'الأعضاء',
    contribution: 'المساهمة',
    nextDue: 'الاستحقاق التالي',
    active: 'نشط',
    pending: 'قيد الانتظار',
    paid: 'مدفوع',
    completed: 'مكتمل',
    complete: 'كامل',
    groupName: 'اسم المجموعة',
    contributionAmount: 'مبلغ المساهمة',
    contributionFrequency: 'تكرار المساهمة',
    startDate: 'تاريخ البدء',
    payoutMethod: 'طريقة الدفع',
    inviteMembers: 'دعوة أعضاء (عناوين البريد الإلكتروني، مفصولة بفواصل)',
    createGroup: 'إنشاء مجموعة تونتين',
    weekly: 'أسبوعي',
    biweekly: 'نصف شهري',
    monthly: 'شهري',
    rotation: 'تناوب',
    randomSelection: 'اختيار عشوائي',
    biddingSystem: 'نظام المزايدة',
    dashboard: 'لوحة التحكم',
    myGroups: 'مجموعاتي',
    profile: 'الملف الشخصي',
    currency: 'العملة',
    language: 'اللغة',
    settings: 'الإعدادات',
    payments: 'المدفوعات',
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع الفاتح',
    pageNotFound: 'عذراً! الصفحة غير موجودة',
    returnToDashboard: 'العودة إلى لوحة التحكم',
    
    // Adding missing translations
    error: 'خطأ',
    success: 'نجاح',
    mustBeLoggedIn: 'يجب تسجيل الدخول لإنشاء مجموعة',
    groupCreated: 'تم إنشاء المجموعة بنجاح',
    errorCreatingGroup: 'حدث خطأ أثناء إنشاء المجموعة',
    creating: 'جاري الإنشاء',
    progress: 'التقدم',
    payoutStatus: 'حالة الدفع',
    upcoming: 'قادم',
    ready: 'جاهز',
    errorFetchingGroups: 'حدث خطأ أثناء جلب المجموعات',
    groupsInfoText: 'إنشاء وإدارة مجموعات التونتين الخاصة بك. تتبع المساهمات والمدفوعات لكل مجموعة.',
    sortBy: 'ترتيب حسب',
    name: 'الاسم',
    date: 'التاريخ',
    amount: 'المبلغ',
    
    // Existing keys
    manageGroups: 'إدارة ومتابعة مجموعات التونتين الخاصة بك',
    searchGroups: 'البحث عن المجموعات...',
    filterByStatus: 'تصفية حسب الحالة',
    all: 'الكل',
    noGroupsFound: 'لم يتم العثور على مجموعات',
    noMatchingGroups: 'لا توجد مجموعات تطابق معايير البحث الخاصة بك',
    createFirstGroup: 'أنشئ مجموعتك الأولى للبدء',
    groupSummary: 'ملخص المجموعة',
    totalGroups: 'إجمالي المجموعات',
    totalMembers: 'إجمالي الأعضاء',
    avgContribution: 'متوسط المساهمة',
    depositWithdraw: 'إيداع/سحب'
  },
  sw: {
    welcome: 'Karibu Tena!',
    trackContributions: 'Fuatilia michango yako ya tontine na usimamie vikundi vyako vya akiba',
    createNewGroup: 'Unda Kikundi Kipya',
    totalContributions: 'Michango Yote',
    availableBalance: 'Salio Linalotumika',
    activeGroups: 'Vikundi Vinavyofanya Kazi',
    nextPayout: 'Malipo Yajayo',
    yourGroups: 'Vikundi Vyako vya Tontine',
    viewAll: 'Tazama Vyote',
    paymentCalendar: 'Kalenda ya Malipo',
    recentMembers: 'Wanachama wa Hivi Karibuni',
    recentActivity: 'Shughuli za Hivi Karibuni',
    receivedPayout: 'Umepokea malipo ya',
    joinedGroup: 'alijiunga na',
    madeContribution: 'Umetoa mchango wa',
    hoursAgo: 'saa zilizopita',
    yesterday: 'Jana',
    daysAgo: 'siku zilizopita',
    members: 'wanachama',
    contribution: 'Mchango',
    nextDue: 'Inayofuata',
    active: 'Inayofanya Kazi',
    pending: 'Inasubiri',
    paid: 'Imelipwa',
    completed: 'Imekamilika',
    complete: 'Kamili',
    groupName: 'Jina la Kikundi',
    contributionAmount: 'Kiasi cha Mchango',
    contributionFrequency: 'Mara ya Mchango',
    startDate: 'Tarehe ya Kuanza',
    payoutMethod: 'Njia ya Malipo',
    inviteMembers: 'Alika Wanachama (barua pepe, zitenganishwe kwa koma)',
    createGroup: 'Unda Kikundi cha Tontine',
    weekly: 'Kila Wiki',
    biweekly: 'Kila Wiki Mbili',
    monthly: 'Kila Mwezi',
    rotation: 'Mzunguko',
    randomSelection: 'Uchaguzi wa Kinasibu',
    biddingSystem: 'Mfumo wa Zabuni',
    dashboard: 'Dashibodi',
    myGroups: 'Vikundi Vyangu',
    profile: 'Wasifu',
    currency: 'Sarafu',
    language: 'Lugha',
    settings: 'Mipangilio',
    payments: 'Malipo',
    darkMode: 'Hali ya Giza',
    lightMode: 'Hali ya Mwanga',
    pageNotFound: 'Samahani! Ukurasa haukupatikana',
    returnToDashboard: 'Rudi kwenye Dashibodi',
    
    // Adding missing translations
    error: 'Hitilafu',
    success: 'Mafanikio',
    mustBeLoggedIn: 'Lazima uwe umejiandikisha ili kuunda kikundi',
    groupCreated: 'Kikundi kimeundwa kwa mafanikio',
    errorCreatingGroup: 'Hitilafu imetokea wakati wa kuunda kikundi',
    creating: 'Inaunda',
    progress: 'Maendeleo',
    payoutStatus: 'Hali ya Malipo',
    upcoming: 'Inayokuja',
    ready: 'Tayari',
    errorFetchingGroups: 'Hitilafu imetokea wakati wa kuleta vikundi',
    groupsInfoText: 'Unda na usimamie vikundi vyako vya tontine. Fuatilia michango na malipo kwa kila kikundi.',
    sortBy: 'Panga kwa',
    name: 'Jina',
    date: 'Tarehe',
    amount: 'Kiasi',
    
    // Existing keys
    manageGroups: 'Simamia na fuatilia vikundi vyako vya tontine',
    searchGroups: 'Tafuta vikundi...',
    filterByStatus: 'Chuja kwa hali',
    all: 'Vyote',
    noGroupsFound: 'Hakuna vikundi vilivyopatikana',
    noMatchingGroups: 'Hakuna vikundi vinavyolingana na vigezo vyako vya utafutaji',
    createFirstGroup: 'Unda kikundi chako cha kwanza kuanza',
    groupSummary: 'Muhtasari wa Kikundi',
    totalGroups: 'Jumla ya Vikundi',
    totalMembers: 'Jumla ya Wanachama',
    avgContribution: 'Wastani wa Mchango',
    depositWithdraw: 'Amana/Kutoa'
  }
};

// Define available currencies
export const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'XOF', symbol: 'CFA', name: 'West African CFA Franc' },
  { code: 'XAF', symbol: 'FCFA', name: 'Central African CFA Franc' },
  { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'KES', symbol: 'Ksh', name: 'Kenyan Shilling' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'MAD', symbol: 'DH', name: 'Moroccan Dirham' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' }
];
