export type Language = "EN" | "HI";

export interface Translations {
  // Navigation & Shared Header
  internalPortal: string;
  notificationsTitle: string;
  notificationsDesc: string;
  downloadsTitle: string;
  downloadsDesc: string;
  settingsTitle: string;
  settingsDesc: string;
  helpSupportTitle: string;
  helpSupportDesc: string;

  // Header & User Role
  bhuVistaPublicViewer: string;
  publicNotifications: string;
  publicViewer: string;
  surveyor: string;
  signInSwitchRole: string;
  openInternalPortal: string;
  bhuVistaSession: string;
  noUnreadPublicNotifications: string;
  viewAllNotifications: string;

  // Sidebar
  navHomeGroup: string;
  navLandGroup: string;
  navToolsGroup: string;
  navOtherGroup: string;
  navHome: string;
  navPropertySearch: string;
  navCadastralMap: string;
  nav3dPropertyMap: string;
  navUlpinRegistry: string;
  navLandRecords: string;
  navDownloads: string;
  navNotifications: string;
  navHelpSupport: string;
  taglineTitle: string;
  taglineSub: string;

  // Main Map & Public Viewer Controls
  mapSearchPlaceholder: string;
  matchingPublicRecords: string;
  noMatchingRecords: string;
  propertyDetails: string;
  registryZone: string;
  activeParcels: string;
  gisSystem: string;
  viewFullDetails: string;
  nationalCadastralZone: string;
  stateLandRegistry: string;
  backToNationalMap: string;
  verifiedCadastralRecord: string;
  threeDVolumetricModel: string;
  verticalCadastralGraph: string;
  realWorldGisMap: string;
  clearSelection: string;
  noPublicParcelsNotice: string;
  loadingRegistry: string;

  // ULPIN Registry & Land Records
  ulpinRegistryTitle: string;
  ulpinRegistryDesc: string;
  nationalCadastralDatabase: string;
  publicRegistry: string;
  backToCadastralMap: string;
  allLandUseTypes: string;
  sortByUlpin: string;
  sortBySurveyNum: string;
  sortByArea: string;
  sortByLandUse: string;
  sortByStructure: string;
  noPublicRecordsInDb: string;
  noPublicRecordsDesc: string;
  viewOnMap: string;
  viewDetails: string;
  approvedCadastre: string;
  pendingAssignment: string;

  landRecordsTitle: string;
  landRecordsDesc: string;
  allModels: string;
  threeDModelAvailable: string;
  twoDMapOnly: string;
  viewIn3d: string;

  // Common Actions & States
  refresh: string;
  loading: string;
  error: string;
  searchPlaceholder: string;
  all: string;
  markAsRead: string;
  markAllAsRead: string;
  unreadOnly: string;
  noNotifications: string;
  noNotificationsDesc: string;
  openRecord: string;

  // Notification Categories & Statuses
  categoryAll: string;
  categoryVerification: string;
  categorySubmission: string;
  categoryValidation: string;
  categoryUlpin: string;
  categorySystem: string;

  // Downloads Workspace
  downloadsWorkspaceTitle: string;
  downloadsWorkspaceDesc: string;
  exportFormatGeoJson: string;
  exportFormatLandXml: string;
  exportFormatCityGml: string;
  exportFormatCsv: string;
  downloadSelected: string;
  downloadAll: string;
  filterByParcel: string;
  filterByUlpin: string;
  filterByLocation: string;
  filterByStatus: string;
  noDownloadData: string;
  noDownloadDataDesc: string;
  filename: string;

  // Settings Workspace
  profileSectionTitle: string;
  profileSectionDesc: string;
  fullName: string;
  emailAddress: string;
  userRole: string;
  userId: string;
  languagePreferencesTitle: string;
  languagePreferencesDesc: string;
  selectLanguage: string;
  english: string;
  hindi: string;
  notificationPreferencesTitle: string;
  notificationPreferencesDesc: string;
  optVerificationQueueAlerts: string;
  optSubmissionStatusAlerts: string;
  optQualityValidationAlerts: string;
  accountSecurityTitle: string;
  accountSecurityDesc: string;
  sessionStatus: string;
  sessionActive: string;
  authBoundary: string;
  saveSettings: string;
  savingSettings: string;
  settingsSavedSuccess: string;
  settingsSaveError: string;
  signOut: string;

  // Help & Support Workspace
  helpDocumentationTitle: string;
  helpDocumentationDesc: string;
  faqTitle: string;
  faqDesc: string;
  technicalSupportTitle: string;
  technicalSupportDesc: string;
  mordGuidelinesNotice: string;
  searchHelpPlaceholder: string;
  modulesTitle: string;
  readMore: string;

  // Property Details Page
  propertyDetailsTitle: string;
  unitNumberLabel: string;
  floorLevelLabel: string;
  landUseLabel: string;
  areaLabel: string;
  parentStructureLabel: string;
  verificationLabel: string;
}

export const translations: Record<Language, Translations> = {
  EN: {
    internalPortal: "Internal Portal",
    notificationsTitle: "Government Notifications",
    notificationsDesc: "Official alerts, verification queue notifications, and submission updates.",
    downloadsTitle: "Government Exports & Downloads",
    downloadsDesc: "Download spatial GeoJSON, LandXML, CityGML, and tabular cadastral datasets.",
    settingsTitle: "Government System Settings",
    settingsDesc: "User profile, language preferences, notification settings, and portal security.",
    helpSupportTitle: "Help & Support",
    helpSupportDesc: "Technical documentation, operational FAQs, and platform support guidelines.",

    bhuVistaPublicViewer: "BhuVista Public Viewer",
    publicNotifications: "Public Notifications",
    publicViewer: "Public Viewer",
    surveyor: "Surveyor",
    signInSwitchRole: "Sign In / Switch Role",
    openInternalPortal: "Open Internal Portal →",
    bhuVistaSession: "BhuVista Session",
    noUnreadPublicNotifications: "No unread public notifications.",
    viewAllNotifications: "View All Notifications →",

    navHomeGroup: "HOME",
    navLandGroup: "LAND",
    navToolsGroup: "TOOLS",
    navOtherGroup: "OTHER",
    navHome: "Home",
    navPropertySearch: "Property Search",
    navCadastralMap: "Cadastral Map",
    nav3dPropertyMap: "3D Property Map",
    navUlpinRegistry: "ULPIN Registry",
    navLandRecords: "Land Records",
    navDownloads: "Downloads",
    navNotifications: "Notifications",
    navHelpSupport: "Help & Support",
    taglineTitle: "Transparent Land Records",
    taglineSub: "Stronger Rural India",

    mapSearchPlaceholder: "Search by ULPIN, Owner Name, Survey Number...",
    matchingPublicRecords: "Matching Public Records",
    noMatchingRecords: "No matching public records found.",
    propertyDetails: "Property Details",
    registryZone: "Registry Zone",
    activeParcels: "Active Parcels",
    gisSystem: "GIS System",
    viewFullDetails: "View Full Details",
    nationalCadastralZone: "National Cadastral Zone",
    stateLandRegistry: "State Land Registry • Verified GIS",
    backToNationalMap: "← Back to National Map",
    verifiedCadastralRecord: "✓ VERIFIED CADASTRAL RECORD",
    threeDVolumetricModel: "3D Volumetric Property Model",
    verticalCadastralGraph: "Vertical Cadastral Graph",
    realWorldGisMap: "Real-World GIS Map",
    clearSelection: "✕ Clear Selection",
    noPublicParcelsNotice: "No public cadastral parcels are available for this area.",
    loadingRegistry: "Loading BhuVista cadastral registry...",

    ulpinRegistryTitle: "ULPIN Registry",
    ulpinRegistryDesc: "Search and explore publicly verified ULPIN-linked land records.",
    nationalCadastralDatabase: "NATIONAL CADASTRAL DATABASE",
    publicRegistry: "PUBLIC REGISTRY",
    backToCadastralMap: "← Back to Cadastral Map",
    allLandUseTypes: "All Land Use Types",
    sortByUlpin: "Sort by ULPIN",
    sortBySurveyNum: "Sort by Survey Number",
    sortByArea: "Sort by Area",
    sortByLandUse: "Sort by Land Use",
    sortByStructure: "Sort by Structure Name",
    noPublicRecordsInDb: "No Public ULPIN Records Available",
    noPublicRecordsDesc: "No publicly verified ULPIN records are currently available in the national cadastre database.",
    viewOnMap: "View on Map",
    viewDetails: "View Details",
    approvedCadastre: "✓ APPROVED CADASTRE",
    pendingAssignment: "Pending Assignment",

    landRecordsTitle: "Land Records",
    landRecordsDesc: "Browse publicly available land and property records linked with BhuVista.",
    allModels: "All Models",
    threeDModelAvailable: "3D Model Available",
    twoDMapOnly: "2D Map Only",
    viewIn3d: "View in 3D",

    refresh: "Refresh",
    loading: "Loading data...",
    error: "An error occurred while loading information.",
    searchPlaceholder: "Search records by ID, keywords, or status...",
    all: "All",
    markAsRead: "Mark as read",
    markAllAsRead: "Mark all as read",
    unreadOnly: "Unread Only",
    noNotifications: "No new notifications",
    noNotificationsDesc: "There are currently no new notifications or system alerts for your account.",
    openRecord: "Open Related Record →",

    categoryAll: "All Notifications",
    categoryVerification: "Verification",
    categorySubmission: "Submissions",
    categoryValidation: "Validation",
    categoryUlpin: "ULPIN Registry",
    categorySystem: "System",

    downloadsWorkspaceTitle: "3D Cadastral Download Workspace",
    downloadsWorkspaceDesc: "Export verified 3D spatial boundaries, LandXML survey plans, CityGML models, and ULPIN tabular registers.",
    exportFormatGeoJson: "3D GeoJSON (Spatial)",
    exportFormatLandXml: "LandXML 1.2 (Survey)",
    exportFormatCityGml: "CityGML 3.0 (BIM/3D)",
    exportFormatCsv: "Tabular CSV (Register)",
    downloadSelected: "Download Selected Dataset",
    downloadAll: "Export Full Register",
    filterByParcel: "Filter by Parcel / Building",
    filterByUlpin: "Filter by 3D ULPIN",
    filterByLocation: "Filter by Location Zone",
    filterByStatus: "Filter by Approval Status",
    noDownloadData: "No Downloadable Data Available",
    noDownloadDataDesc: "No records match your search query or selected filter criteria.",
    filename: "Filename",

    profileSectionTitle: "Authenticated User Profile",
    profileSectionDesc: "View official departmental identity details and server-authorized session role.",
    fullName: "Full Name",
    emailAddress: "Email Address",
    userRole: "Portal Authorization Role",
    userId: "Account Identifier",
    languagePreferencesTitle: "Language & Localization Preferences",
    languagePreferencesDesc: "Select your preferred operating language for the BhuVista Internal Portal.",
    selectLanguage: "Interface Language",
    english: "English (English)",
    hindi: "हिंदी (Hindi)",
    notificationPreferencesTitle: "Notification & Alert Preferences",
    notificationPreferencesDesc: "Configure automated notification channels and system warning thresholds.",
    optVerificationQueueAlerts: "Verification Queue Pending Alerts",
    optSubmissionStatusAlerts: "Surveyor Submission Approval & Rejection Updates",
    optQualityValidationAlerts: "GIS Topology & Quality Control Validation Warnings",
    accountSecurityTitle: "Account & Portal Security",
    accountSecurityDesc: "Server-side JWT session active with government boundary security checks.",
    sessionStatus: "Session Security Status",
    sessionActive: "Active (Server Protected)",
    authBoundary: "Government Authorization Boundary Active",
    saveSettings: "Save Settings",
    savingSettings: "Saving Preferences...",
    settingsSavedSuccess: "Settings saved and persisted successfully.",
    settingsSaveError: "Failed to persist settings. Please try again.",
    signOut: "Sign Out",

    helpDocumentationTitle: "BhuVista Module Documentation",
    helpDocumentationDesc: "Comprehensive operational documentation for every feature in the BhuVista platform.",
    faqTitle: "Frequently Asked Questions",
    faqDesc: "Find quick answers to common operational questions regarding land parcel management, 3D visualization, and verification.",
    technicalSupportTitle: "Technical Support Guidance",
    technicalSupportDesc: "Official technical guidelines from the Ministry of Rural Development, Government of India.",
    mordGuidelinesNotice: "For assistance with 3D ULPIN registration, cadastral survey review, or government authorization boundaries, refer to national MoRD guidelines and standard operational protocols.",
    searchHelpPlaceholder: "Search help articles, feature guides, or FAQs...",
    modulesTitle: "Platform Feature Modules",
    readMore: "View Guide →",

    propertyDetailsTitle: "3D Property Details",
    unitNumberLabel: "Survey / Unit #",
    floorLevelLabel: "Floor Level",
    landUseLabel: "Land Use",
    areaLabel: "Area",
    parentStructureLabel: "Parent Structure",
    verificationLabel: "Verification",
  },
  HI: {
    internalPortal: "आंतरिक पोर्टल",
    notificationsTitle: "सरकारी सूचनाएं",
    notificationsDesc: "आधिकारिक अलर्ट, सत्यापन कतार सूचनाएं और जमा अपडेट।",
    downloadsTitle: "सरकारी निर्यात और डाउनलोड",
    downloadsDesc: "स्थानिक GeoJSON, LandXML, CityGML और सारणीबद्ध भू-अभिलेख डेटासेट डाउनलोड करें।",
    settingsTitle: "सरकारी प्रणाली सेटिंग्स",
    settingsDesc: "उपयोगकर्ता प्रोफ़ाइल, भाषा प्राथमिकताएं, अधिसूचना सेटिंग्स और पोर्टल सुरक्षा।",
    helpSupportTitle: "सहायता और समर्थन",
    helpSupportDesc: "तकनीकी दस्तावेज, परिचालन FAQ और मंच सहायता दिशा-निर्देश।",

    bhuVistaPublicViewer: "भू-विस्टा सार्वजनिक दर्शक",
    publicNotifications: "सार्वजनिक सूचनाएं",
    publicViewer: "सार्वजनिक दर्शक",
    surveyor: "सर्वेक्षक",
    signInSwitchRole: "साइन इन / भूमिका बदलें",
    openInternalPortal: "आंतरिक पोर्टल खोलें →",
    bhuVistaSession: "भू-विस्टा सत्र",
    noUnreadPublicNotifications: "कोई अपठित सार्वजनिक सूचना नहीं है।",
    viewAllNotifications: "सभी सूचनाएं देखें →",

    navHomeGroup: "मुख्य पृष्ठ",
    navLandGroup: "भूमि भू-अभिलेख",
    navToolsGroup: "उपकरण",
    navOtherGroup: "अन्य",
    navHome: "गृह",
    navPropertySearch: "संपत्ति खोज",
    navCadastralMap: "कैडस्ट्रल नक्शा",
    nav3dPropertyMap: "3D संपत्ति नक्शा",
    navUlpinRegistry: "ULPIN रजिस्ट्री",
    navLandRecords: "भू-अभिलेख",
    navDownloads: "डाउनलोड",
    navNotifications: "सूचनाएं",
    navHelpSupport: "सहायता और समर्थन",
    taglineTitle: "पारदर्शी भू-अभिलेख",
    taglineSub: "सशक्त ग्रामीण भारत",

    mapSearchPlaceholder: "ULPIN, मालिक का नाम, सर्वेक्षण संख्या द्वारा खोजें...",
    matchingPublicRecords: "मिलान वाले सार्वजनिक रिकॉर्ड",
    noMatchingRecords: "कोई मेल खाने वाला सार्वजनिक रिकॉर्ड नहीं मिला।",
    propertyDetails: "संपत्ति विवरण",
    registryZone: "रजिस्ट्री क्षेत्र",
    activeParcels: "सक्रिय भू-खंड (पार्सल)",
    gisSystem: "जीआईएस प्रणाली",
    viewFullDetails: "पूरा विवरण देखें",
    nationalCadastralZone: "राष्ट्रीय कैडस्ट्रल क्षेत्र",
    stateLandRegistry: "राज्य भू-रजिस्ट्री • सत्यापित जीआईएस",
    backToNationalMap: "← राष्ट्रीय मानचित्र पर वापस जाएं",
    verifiedCadastralRecord: "✓ सत्यापित कैडस्ट्रल रिकॉर्ड",
    threeDVolumetricModel: "3D वॉल्यूमेट्रिक संपत्ति मॉडल",
    verticalCadastralGraph: "ऊर्ध्वाधर कैडस्ट्रल ग्राफ",
    realWorldGisMap: "वास्तविक जीआईएस मानचित्र",
    clearSelection: "✕ चयन रद्द करें",
    noPublicParcelsNotice: "इस क्षेत्र के लिए कोई सार्वजनिक कैडस्ट्रल पार्सल उपलब्ध नहीं है।",
    loadingRegistry: "भू-विस्टा कैडस्ट्रल रजिस्ट्री लोड हो रही है...",

    ulpinRegistryTitle: "ULPIN रजिस्ट्री",
    ulpinRegistryDesc: "सार्वजनिक रूप से सत्यापित ULPIN-लिंक किए गए भू-अभिलेख खोजें और देखें।",
    nationalCadastralDatabase: "राष्ट्रीय कैडस्ट्रल डेटाबेस",
    publicRegistry: "सार्वजनिक रजिस्ट्री",
    backToCadastralMap: "← कैडस्ट्रल मानचित्र पर वापस जाएं",
    allLandUseTypes: "सभी भूमि उपयोग प्रकार",
    sortByUlpin: "ULPIN के अनुसार क्रमबद्ध करें",
    sortBySurveyNum: "सर्वेक्षण संख्या के अनुसार क्रमबद्ध करें",
    sortByArea: "क्षेत्रफल के अनुसार क्रमबद्ध करें",
    sortByLandUse: "भूमि उपयोग के अनुसार क्रमबद्ध करें",
    sortByStructure: "संरचना के नाम के अनुसार क्रमबद्ध करें",
    noPublicRecordsInDb: "कोई सार्वजनिक ULPIN रिकॉर्ड उपलब्ध नहीं है",
    noPublicRecordsDesc: "राष्ट्रीय कैडस्ट्रल डेटाबेस में वर्तमान में कोई सार्वजनिक रूप से सत्यापित ULPIN रिकॉर्ड उपलब्ध नहीं है।",
    viewOnMap: "मानचित्र पर देखें",
    viewDetails: "विवरण देखें",
    approvedCadastre: "✓ स्वीकृत कैडस्ट्रल",
    pendingAssignment: "आवंटन लंबित",

    landRecordsTitle: "भू-अभिलेख",
    landRecordsDesc: "भू-विस्टा के साथ जुड़े सार्वजनिक रूप से उपलब्ध भूमि और संपत्ति के रिकॉर्ड देखें।",
    allModels: "सभी मॉडल",
    threeDModelAvailable: "3D मॉडल उपलब्ध",
    twoDMapOnly: "केवल 2D मानचित्र",
    viewIn3d: "3D में देखें",

    refresh: "पुनश्चर्या (रीफ्रेश)",
    loading: "डेटा लोड हो रहा है...",
    error: "जानकारी लोड करते समय एक त्रुटि हुई।",
    searchPlaceholder: "आईडी, कीवर्ड या स्थिति के आधार पर खोजें...",
    all: "सभी",
    markAsRead: "पढ़ा हुआ चिह्नित करें",
    markAllAsRead: "सभी को पढ़ा हुआ चिह्नित करें",
    unreadOnly: "केवल अपठित",
    noNotifications: "कोई नई सूचनाएं नहीं",
    noNotificationsDesc: "वर्तमान में आपके खाते के लिए कोई नई सूचनाएं या सिस्टम अलर्ट नहीं हैं।",
    openRecord: "संबंधित रिकॉर्ड खोलें →",

    categoryAll: "सभी सूचनाएं",
    categoryVerification: "सत्यापन",
    categorySubmission: "प्रविष्टियां (सबमिशन)",
    categoryValidation: "मान्यकरण (वैलिडेशन)",
    categoryUlpin: "ULPIN रजिस्ट्री",
    categorySystem: "सिस्टम",

    downloadsWorkspaceTitle: "3D कैडस्ट्रल डाउनलोड कार्यक्षेत्र",
    downloadsWorkspaceDesc: "सत्यापित 3D स्थानिक सीमाओं, LandXML सर्वेक्षण योजनाओं, CityGML मॉडल और ULPIN रजिस्टरों का निर्यात करें।",
    exportFormatGeoJson: "3D GeoJSON (स्थानिक)",
    exportFormatLandXml: "LandXML 1.2 (सर्वेक्षण)",
    exportFormatCityGml: "CityGML 3.0 (BIM/3D)",
    exportFormatCsv: "सारणीबद्ध CSV (रजिस्टर)",
    downloadSelected: "चयनित डेटासेट डाउनलोड करें",
    downloadAll: "पूरा रजिस्टर निर्यात करें",
    filterByParcel: "पार्सल / भवन द्वारा फ़िल्टर करें",
    filterByUlpin: "3D ULPIN द्वारा फ़िल्टर करें",
    filterByLocation: "स्थान क्षेत्र द्वारा फ़िल्टर करें",
    filterByStatus: "स्वीकृति स्थिति द्वारा फ़िल्टर करें",
    noDownloadData: "कोई डाउनलोड योग्य डेटा उपलब्ध नहीं है",
    noDownloadDataDesc: "कोई भी रिकॉर्ड आपके खोज प्रश्न या चयनित फ़िल्टर मापदंडों से मेल नहीं खाता है।",
    filename: "फ़ाइल का नाम",

    profileSectionTitle: "प्रमाणीकृत उपयोगकर्ता प्रोफ़ाइल",
    profileSectionDesc: "आधिकारिक विभागीय पहचान विवरण और सर्वर-अधिकृत सत्र भूमिका देखें।",
    fullName: "पूरा नाम",
    emailAddress: "ईमेल पता",
    userRole: "पोर्टल प्राधिकरण भूमिका",
    userId: "खाता पहचानकर्ता",
    languagePreferencesTitle: "भाषा और स्थानीयकरण प्राथमिकताएं",
    languagePreferencesDesc: "भू-विस्टा आंतरिक पोर्टल के लिए अपनी पसंदीदा ऑपरेटिंग भाषा चुनें।",
    selectLanguage: "इंटरफ़ेस भाषा",
    english: "English (अंग्रेज़ी)",
    hindi: "हिंदी (Hindi)",
    notificationPreferencesTitle: "अधिसूचना और अलर्ट प्राथमिकताएं",
    notificationPreferencesDesc: "स्वचालित अधिसूचना चैनल और सिस्टम चेतावनी सीमाएं कॉन्फ़िगर करें।",
    optVerificationQueueAlerts: "सत्यापन कतार लंबित अलर्ट",
    optSubmissionStatusAlerts: "सर्वेक्षक प्रविष्टि स्वीकृति और अस्वीकृति अपडेट",
    optQualityValidationAlerts: "GIS टोपोलॉजी और गुणवत्ता नियंत्रण चेतावनी",
    accountSecurityTitle: "खाता और पोर्टल सुरक्षा",
    accountSecurityDesc: "सरकारी सीमा सुरक्षा जांच के साथ सर्वर-साइड JWT सत्र सक्रिय है।",
    sessionStatus: "सत्र सुरक्षा स्थिति",
    sessionActive: "सक्रिय (सर्वर संरक्षित)",
    authBoundary: "सरकारी प्राधिकरण सीमा सक्रिय",
    saveSettings: "सेटिंग्स सहेजें",
    savingSettings: "प्राथमिकताएं सहेजी जा रही हैं...",
    settingsSavedSuccess: "सेटिंग्स सफलतापूर्वक सहेजी गईं और सुरक्षित की गईं।",
    settingsSaveError: "सेटिंग्स सहेजने में विफल। कृपया पुन: प्रयास करें।",
    signOut: "साइन आउट",

    helpDocumentationTitle: "भू-विस्टा मॉड्यूल दस्तावेज़ीकरण",
    helpDocumentationDesc: "भू-विस्टा प्लेटफॉर्म की हर विशेषता के लिए व्यापक परिचालन दस्तावेज़।",
    faqTitle: "अक्सर पूछे जाने वाले प्रश्न (FAQ)",
    faqDesc: "भूमि पार्सल प्रबंधन, 3D विज़ुअलाइज़ेशन और सत्यापन से संबंधित सामान्य प्रश्नों के त्वरित उत्तर पाएं।",
    technicalSupportTitle: "तकनीकी सहायता मार्गदर्शन",
    technicalSupportDesc: "ग्रामीण विकास मंत्रालय, भारत सरकार के आधिकारिक तकनीकी दिशानिर्देश।",
    mordGuidelinesNotice: "3D ULPIN पंजीकरण, कैडस्ट्रल सर्वेक्षण समीक्षा, या सरकारी प्राधिकरण सीमाओं के लिए राष्ट्रीय MoRD दिशानिर्देशों का संदर्भ लें।",
    searchHelpPlaceholder: "सहायता लेख, फ़ीचर गाइड या FAQ खोजें...",
    modulesTitle: "प्लेटफ़ॉर्म फ़ीचर मॉड्यूल",
    readMore: "गाइड देखें →",

    propertyDetailsTitle: "3D संपत्ति विवरण",
    unitNumberLabel: "सर्वेक्षण / इकाई संख्या",
    floorLevelLabel: "मंजिल का स्तर",
    landUseLabel: "भूमि उपयोग",
    areaLabel: "क्षेत्रफल",
    parentStructureLabel: "मूल संरचना",
    verificationLabel: "सत्यापन",
  },
};
