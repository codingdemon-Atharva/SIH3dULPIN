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
  },
  HI: {
    internalPortal: "आंतरिक पोर्टल",
    notificationsTitle: "सरकारी सूचनाएं",
    notificationsDesc: "आधिकारिक अलर्ट, सत्यापन कतार सूचनाएं और जमा अपडेट।",
    downloadsTitle: "सरकारी निर्यात और डाउनलोड",
    downloadsDesc: "स्थानिक GeoJSON, LandXML, CityGML और सारणीबद्ध भू-अभिलेख डेटासेट डाउनलोड करें।",
    settingsTitle: "सरकारी प्रणाली सेटिंग्स",
    settingsDesc: "उपयोगकर्ता प्रोफ़ाइल, भाषा प्राथमिकताएं, अधिसूचना सेटिंग्स और पोर्टल सुरक्षा।",
    helpSupportTitle: "सहायता और सहायता",
    helpSupportDesc: "तकनीकी दस्तावेज, परिचालन FAQ और मंच सहायता दिशा-निर्देश।",

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
  },
};
