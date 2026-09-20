"use client";

import React, { useEffect, useState, useMemo } from "react";
import { GovernmentPageHeader } from "@/src/components/GovernmentPageHeader";
import { translations, type Language } from "@/src/lib/translations";
import Link from "next/link";

interface HelpModule {
  id: string;
  title: string;
  category: string;
  href: string;
  summary: string;
  details: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function GovernmentHelpSupportPage() {
  const [lang, setLang] = useState<Language>("EN");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<"DOCS" | "FAQ" | "SUPPORT">("DOCS");

  // Listen for language changes in localStorage
  useEffect(() => {
    const updateLang = () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("bhuvista_lang") as Language;
        if (saved === "EN" || saved === "HI") {
          setLang(saved);
        }
      }
    };
    updateLang();
    window.addEventListener("storage", updateLang);
    return () => window.removeEventListener("storage", updateLang);
  }, []);

  const t = translations[lang];

  // Actual BhuVista Module Documentation
  const modules: HelpModule[] = useMemo(() => {
    if (lang === "HI") {
      return [
        {
          id: "dashboard",
          title: "डैशबोर्ड अवलोकन (Dashboard)",
          category: "कोर प्रबंधन",
          href: "/government/dashboard",
          summary: "कैडस्ट्रल मैट्रिक्स, सत्यापन कतार गतिशीलता और स्थानिक आंकड़े।",
          details: "डैशबोर्ड राष्ट्रीय भूमि डिजिटलीकरण प्रगति का उच्च-स्तरीय अवलोकन प्रदान करता है, जिसमें अनुमोदित इमारतें, असाइन किए गए ULPIN, और हाल की गतिविधि शामिल हैं।",
        },
        {
          id: "land-parcels",
          title: "भूमि पार्सल (Land Parcels)",
          category: "भूमि प्रबंधन",
          href: "/government/land-parcels",
          summary: "रजिस्टर किए गए भू-पार्सलों और मंजिलों की सूची।",
          details: "भू-पार्सल अनुभाग में सभी पंजीकृत भवनों, उनकी मंजिलों, कुल मापे गए क्षेत्रफल और सत्यापन स्थिति का व्यापक रिकॉर्ड शामिल है।",
        },
        {
          id: "property-registry",
          title: "संपत्ति रजिस्ट्री (Property Registry)",
          category: "भूमि प्रबंधन",
          href: "/government/property-registry",
          summary: "3D संपत्ति इकाइयों का विवरण और क्षेत्रफल।",
          details: "इकाई-वार 3D संपत्तियों की सूची खोजें, जिनमें प्रत्येक इकाई का नंबर, स्थान का प्रकार (आवासीय/व्यावसायिक) और ज्यामिति शामिल है।",
        },
        {
          id: "ulpin-registry",
          title: "ULPIN रजिस्ट्री (ULPIN Registry)",
          category: "भूमि प्रबंधन",
          href: "/government/ulpin-registry",
          summary: "3D ULPIN पहचान संख्या प्रबंधन।",
          details: "14-अंकीय अद्वितीय भूमि पार्सल पहचान संख्या (ULPIN) का प्रबंधन और सत्यापन करें जो प्रत्येक 3D संपत्ति इकाई को आवंटित की गई है।",
        },
        {
          id: "cadastral-map",
          title: "कैडस्ट्रल मानचित्र (Cadastral Map)",
          category: "GIS दृश्यता",
          href: "/government/cadastral-map",
          summary: "2D/3D MapLibre भू-स्थानिक मानचित्र दर्शक।",
          details: "मानचित्र पर उच्च-सटीकता वाली कैडस्ट्रल संरचनाओं और सीमाओं को देखें, फ़िल्टर करें और उनकी जांच करें।",
        },
        {
          id: "3d-land-map",
          title: "3D भूमि मानचित्र (3D Land Map)",
          category: "GIS दृश्यता",
          href: "/government/3d-land-map",
          summary: "Three.js वॉल्यूमेट्रिक 3D कैडस्ट्रल व्यूअर।",
          details: "मंजिल स्तरों, ऊंचाई, और 3D स्थानिक मात्राओं का विश्लेषण करने के लिए इंटरेक्टिव 3D दृश्यों को एक्सप्लोर करें।",
        },
        {
          id: "surveyor-submissions",
          title: "सर्वेक्षक प्रविष्टियां (Surveyor Submissions)",
          category: "सत्यापन",
          href: "/government/surveyor-submissions",
          summary: "2D फ़ाइल अपलोड और समीक्षा कतार।",
          details: "सर्वेक्षकों द्वारा सबमिट की गई 2D फ़ाइलों (GeoJSON, DXF, SVG, JSON) की जांच करें और उनकी समीक्षा स्थिति ट्रैक करें।",
        },
        {
          id: "pending-verification",
          title: "लंबित सत्यापन (Pending Verification)",
          category: "सत्यापन",
          href: "/government/pending-verification",
          summary: "सरकारी अधिकारियों द्वारा स्वीकृति और अस्वीकृति वर्कफ़्लो।",
          details: "लंबित कैडस्ट्रल सर्वेक्षणों की समीक्षा करें, टोपोलॉजी जांचें और आधिकारिक स्वीकृति प्रदान करें या अस्वीकृत करें।",
        },
        {
          id: "validation",
          title: "गुणवत्ता मान्यकरण (Validation Engine)",
          category: "सत्यापन",
          href: "/government/validation",
          summary: "GIS टोपोलॉजी और ज्यामिति गुणवत्ता निरीक्षण।",
          details: "ज्यामिति बंद होने, लंबवत अंतर, और ULPIN विशिष्टता की स्वचालित जांच करके गुणवत्ता PASS/WARNING/FAIL स्तर निर्धारित करें।",
        },
        {
          id: "land-analytics",
          title: "भूमि विश्लेषण (Land Analytics)",
          category: "विश्लेषण",
          href: "/government/land-analytics",
          summary: "स्थानिक वितरण, उपयोग रुझान और चार्ट।",
          details: "उपयोग के प्रकार (आवासीय, व्यावसायिक), सत्यापन सफलता दर, और क्षेत्र वितरण के विस्तृत चार्ट और आंकड़े देखें।",
        },
        {
          id: "reports",
          title: "सरकारी रिपोर्ट (Reports)",
          category: "विश्लेषण",
          href: "/government/reports",
          summary: "कस्टम रिपोर्ट जेनरेशन और डेटा निर्यात।",
          details: "संपत्ति सारांश, ULPIN कवरेज और मान्यकरण रिपोर्ट तैयार करें।",
        },
        {
          id: "notifications",
          title: "सरकारी सूचनाएं (Notifications)",
          category: "सिस्टम",
          href: "/government/notifications",
          summary: "सत्यापन और सबमिशन अलर्ट।",
          details: "अपनी प्रविष्टियों, सत्यापन कतारों और गुणवत्ता चेतावनियों के लिए रीयल-टाइम अलर्ट प्राप्त करें।",
        },
        {
          id: "downloads",
          title: "डाउनलोड कार्यक्षेत्र (Downloads)",
          category: "सिस्टम",
          href: "/government/downloads",
          summary: "GeoJSON, LandXML 1.2, CityGML 3.0 और CSV निर्यात।",
          details: "3D स्थानिक डेटा, LandXML सर्वेक्षण सीमाएं, CityGML BIM मॉडल और CSV रजिस्टर डाउनलोड करें।",
        },
        {
          id: "settings",
          title: "सिस्टम सेटिंग्स (Settings)",
          category: "सिस्टम",
          href: "/government/settings",
          summary: "प्रोफ़ाइल, भाषा और सुरक्षा।",
          details: "अंग्रेज़ी और हिंदी के बीच भाषा बदलें, अधिसूचना प्राथमिकताएं सहेजें और प्रोफ़ाइल विवरण देखें।",
        },
      ];
    }

    return [
      {
        id: "dashboard",
        title: "Dashboard Overview",
        category: "Core Management",
        href: "/government/dashboard",
        summary: "High-level cadastral metrics, pending queue dynamics, and spatial distribution statistics.",
        details: "The Dashboard provides a consolidated view of national land digitization progress, including approved structures, assigned ULPIN coverage, total area, and recent verification activity.",
      },
      {
        id: "land-parcels",
        title: "Land Parcels",
        category: "Land Management",
        href: "/government/land-parcels",
        summary: "Master register of registered land parcels and building structures.",
        details: "View and filter all registered building structures, floor counts, total measured area, surveyor identifiers, and verification statuses.",
      },
      {
        id: "property-registry",
        title: "Property Registry",
        category: "Land Management",
        href: "/government/property-registry",
        summary: "3D property unit records and space type classifications.",
        details: "Search unit-level 3D property records including unit numbers, space classifications (Residential, Commercial, Utility), measured area, and associated floor elevations.",
      },
      {
        id: "ulpin-registry",
        title: "ULPIN Registry",
        category: "Land Management",
        href: "/government/ulpin-registry",
        summary: "14-digit Unique Land Parcel Identification Number (ULPIN) management.",
        details: "Manage 3D ULPIN identities generated for volumetric property units. Search by ULPIN string, check coverage percentage, and review registration timestamps.",
      },
      {
        id: "cadastral-map",
        title: "Cadastral Map",
        category: "GIS & Visualization",
        href: "/government/cadastral-map",
        summary: "Interactive 2D/3D MapLibre GIS viewer for spatial boundaries.",
        details: "Inspect cadastral building boundaries on interactive maps with satellite/vector layers, location filtering, and spatial record selection.",
      },
      {
        id: "3d-land-map",
        title: "3D Land Map",
        category: "GIS & Visualization",
        href: "/government/3d-land-map",
        summary: "Volumetric 3D spatial cadastre rendering using Three.js / React Three Fiber.",
        details: "Visualize floor levels, volumetric height extrusions, unit boundaries, and 3D spatial clearances in an interactive 3D environment.",
      },
      {
        id: "surveyor-submissions",
        title: "Surveyor Submissions",
        category: "Verification Workflow",
        href: "/government/surveyor-submissions",
        summary: "2D spatial file upload workspace and submission review queue.",
        details: "Surveyors can parse and upload 2D cadastral plans (GeoJSON, DXF, SVG, JSON). Track submission review states and queue plans for government verification.",
      },
      {
        id: "pending-verification",
        title: "Pending Verification",
        category: "Verification Workflow",
        href: "/government/pending-verification",
        summary: "Official government approval and rejection workflow.",
        details: "Government officers evaluate submitted cadastral plans, inspect topology validation checks, enter official remarks, and approve or reject submissions.",
      },
      {
        id: "validation",
        title: "Validation Engine",
        category: "Verification Workflow",
        href: "/government/validation",
        summary: "Automated GIS topology and spatial quality control inspector.",
        details: "Automated quality control evaluating polygon ring closure, floor clearance consistency, spatial boundary overlaps, and ULPIN uniqueness (PASS / WARNING / FAIL).",
      },
      {
        id: "land-analytics",
        title: "Land Analytics",
        category: "Analytics & Reports",
        href: "/government/land-analytics",
        summary: "Spatial land use distribution and verification performance analytics.",
        details: "Analytical breakdown of land use categories, verification approval ratios, ULPIN coverage metrics, and geographic cluster summaries.",
      },
      {
        id: "reports",
        title: "Government Reports",
        category: "Analytics & Reports",
        href: "/government/reports",
        summary: "Custom report generation and tabular data exports.",
        details: "Generate property summaries, ULPIN coverage registers, verification logs, and land use distribution reports with pagination and CSV export capabilities.",
      },
      {
        id: "notifications",
        title: "Government Notifications",
        category: "System",
        href: "/government/notifications",
        summary: "Real-time alerts for verification events, submission updates, and quality warnings.",
        details: "View event-driven notifications derived from database activities. Mark notifications as read and navigate directly to target record pages.",
      },
      {
        id: "downloads",
        title: "Downloads Workspace",
        category: "System",
        href: "/government/downloads",
        summary: "Multi-format spatial exports (GeoJSON, LandXML 1.2, CityGML 3.0, CSV).",
        details: "Export verified 3D spatial boundaries, LandXML survey plans, CityGML LOD2 building models, and tabular ULPIN registers with clear, meaningful filenames.",
      },
      {
        id: "settings",
        title: "System Settings",
        category: "System",
        href: "/government/settings",
        summary: "Profile information, interface language toggle, and notification preferences.",
        details: "View authenticated user session details, switch between English and Hindi, configure notification alert preferences, and manage portal security.",
      },
    ];
  }, [lang]);

  // Operational FAQs
  const faqs: FAQItem[] = useMemo(() => {
    if (lang === "HI") {
      return [
        {
          id: "faq-1",
          question: "मैं 2D कैडस्ट्रल या भूमि फ़ाइल कैसे अपलोड कर सकता हूं?",
          category: "सबमिशन वर्कफ़्लो",
          answer: "नेविगेशन मेनू से 'सर्वेक्षक प्रविष्टियां' (Surveyor Submissions) पर जाएं और 'नई फ़ाइल अपलोड करें' पर क्लिक करें। समर्थित फ़ाइल चुनें, सर्वेक्षण विवरण दर्ज करें और जमा करें।",
        },
        {
          id: "faq-2",
          question: "BhuVista द्वारा कौन से फ़ाइल फ़ॉर्मैट समर्थित हैं?",
          category: "फ़ाइल समर्थित",
          answer: "BhuVista स्वचालित रूप से GeoJSON (.geojson), CAD DXF (.dxf), Scalable Vector Graphics (.svg), और JSON (.json) फ़ॉर्मैट को प्रोसेस कर सकता है।",
        },
        {
          id: "faq-3",
          question: "सत्यापन प्रक्रिया कैसे काम करती है?",
          category: "सत्यापन",
          answer: "जब कोई सर्वेक्षक एक योजना सबमिट करता है, तो वह 'लंबित सत्यापन' कतार में दिखाई देती है। सरकारी अधिकारी टोपोलॉजी मान्यकरण की समीक्षा करते हैं और रिकॉर्ड को स्वीकृत या अस्वीकृत करते हैं।",
        },
        {
          id: "faq-4",
          question: "3D ULPIN कैसे आवंटित किया जाता है?",
          category: "ULPIN रजिस्ट्री",
          answer: "सरकारी अधिकारी द्वारा कैडस्ट्रल रिकॉर्ड स्वीकृत होने पर, BhuVista ULPIN इंजन प्रत्येक 3D संपत्ति इकाई के लिए स्वचालित रूप से एक अद्वितीय 14-अंकीय ULPIN उत्पन्न और पंजीकृत करता है।",
        },
        {
          id: "faq-5",
          question: "3D भूमि मानचित्र कैसे खोलें?",
          category: "GIS विज़ुअलाइज़ेशन",
          answer: "साइडबार मेनू से '3D भूमि मानचित्र' (3D Land Map) चुनें। आप 3D मॉडल को घुमा सकते हैं, ज़ूम कर सकते हैं और प्रत्येक मंजिल और इकाई की ऊंचाई और सीमाएं देख सकते हैं।",
        },
        {
          id: "faq-6",
          question: "डेटा डाउनलोड करने के लिए कौन से फ़ॉर्मैट उपलब्ध हैं?",
          category: "डाउनलोड",
          answer: "'डाउनलोड' पृष्ठ से आप 3D GeoJSON (स्थानिक डेटा), LandXML 1.2 (सर्वेक्षण सीमाएं), CityGML 3.0 (3D BIM मॉडल), और CSV रजिस्टर्ड डेटा डाउनलोड कर सकते हैं।",
        },
        {
          id: "faq-7",
          question: "पोर्टल की भाषा कैसे बदलें?",
          category: "सेटिंग्स",
          answer: "शीर्ष नेविगेशन बार में 'English / हिंदी' बटन पर क्लिक करें या 'सेटिंग्स' पृष्ठ पर जाकर भाषा चुनें। बदलाव तुरंत लागू हो जाते हैं।",
        },
        {
          id: "faq-8",
          question: "अधिसूचनाएं कहां देखें?",
          category: "सूचनाएं",
          answer: "शीर्ष हेडर में घंटी (Bell) आइकन पर क्लिक करके नवीनतम अलर्ट देखें, या पूरी सूची और फ़िल्टर के लिए 'सूचनाएं' (Notifications) पृष्ठ खोलें।",
        },
      ];
    }

    return [
      {
        id: "faq-1",
        question: "How do I upload a 2D land or cadastral plan file?",
        category: "Submission Workflow",
        answer: "Navigate to 'Surveyor Submissions' in the internal sidebar and click 'Upload New Cadastral File'. Select your spatial file, input required survey metadata (survey number, location, land use), and click Submit to queue it for government review.",
      },
      {
        id: "faq-2",
        question: "What file formats are supported for cadastral uploads?",
        category: "File Support",
        answer: "BhuVista natively supports GeoJSON (.geojson), CAD AutoCAD DXF (.dxf), Scalable Vector Graphics (.svg), and structured JSON (.json) cadastral plans.",
      },
      {
        id: "faq-3",
        question: "How does the verification workflow work?",
        category: "Verification",
        answer: "Once a plan is submitted by a surveyor, it enters the 'Pending Verification' queue. Authorized government officers review the 2D/3D geometry, check automated topology validation results, add remarks, and formally approve or reject the submission.",
      },
      {
        id: "faq-4",
        question: "How is a 3D ULPIN identity generated?",
        category: "ULPIN Registry",
        answer: "When a government officer approves a cadastral submission, the BhuVista 3D ULPIN registry engine automatically constructs a unique 14-character 3D ULPIN key for every property unit.",
      },
      {
        id: "faq-5",
        question: "How do I open and interact with the 3D Land Map?",
        category: "GIS Visualization",
        answer: "Click '3D Land Map' under GIS & VISUALIZATION in the sidebar. You can rotate, pan, and zoom the volumetric 3D view, select specific floor levels, and inspect 3D property volumes.",
      },
      {
        id: "faq-6",
        question: "Which formats are available for downloading records?",
        category: "Downloads",
        answer: "Authorized users can export records in 3D GeoJSON (spatial), LandXML 1.2 (survey limits), CityGML 3.0 (3D volumetric LOD2 models), and CSV (tabular registers) from the Downloads workspace.",
      },
      {
        id: "faq-7",
        question: "How do I switch the portal language between English and Hindi?",
        category: "Settings",
        answer: "Click the language toggle (🌐 English / हिंदी) in the top header bar, or select your preferred language in the Settings page. Your preference is saved and updates the entire UI immediately.",
      },
      {
        id: "faq-8",
        question: "Where can I see notifications and system alerts?",
        category: "Notifications",
        answer: "Click the bell icon in the top header to view recent notice popups, or open the 'Notifications' page from the sidebar to browse, filter, search, and mark notifications as read.",
      },
    ];
  }, [lang]);

  // Search filtering
  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return modules;
    const q = searchQuery.trim().toLowerCase();
    return modules.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.summary.toLowerCase().includes(q) ||
        m.details.toLowerCase().includes(q)
    );
  }, [modules, searchQuery]);

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const q = searchQuery.trim().toLowerCase();
    return faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
    );
  }, [faqs, searchQuery]);

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto font-sans text-[#162a21]">
      {/* PAGE HEADER */}
      <GovernmentPageHeader
        title={t.helpSupportTitle}
        description={t.helpSupportDesc}
      />

      {/* SEARCH BAR & NAVIGATION TABS */}
      <div className="rounded-2xl border border-[#e2dad0] bg-white p-5 shadow-sm space-y-4">
        <div className="relative flex-1">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b887a]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder={t.searchHelpPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[#e2dad0] bg-[#fdfbf7] pl-10 pr-4 py-2.5 text-xs text-[#162a21] placeholder-[#6b887a] outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#e2dad0]/60">
          <button
            type="button"
            onClick={() => setSelectedTab("DOCS")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              selectedTab === "DOCS"
                ? "bg-[#2d6a4f] text-white shadow-xs"
                : "bg-[#f8f5ee] text-[#3d5a4c] border border-[#e2dad0] hover:bg-[#f3efe6]"
            }`}
          >
            📖 {t.helpDocumentationTitle}
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab("FAQ")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              selectedTab === "FAQ"
                ? "bg-[#2d6a4f] text-white shadow-xs"
                : "bg-[#f8f5ee] text-[#3d5a4c] border border-[#e2dad0] hover:bg-[#f3efe6]"
            }`}
          >
            ❓ {t.faqTitle}
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab("SUPPORT")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              selectedTab === "SUPPORT"
                ? "bg-[#2d6a4f] text-white shadow-xs"
                : "bg-[#f8f5ee] text-[#3d5a4c] border border-[#e2dad0] hover:bg-[#f3efe6]"
            }`}
          >
            🛡️ {t.technicalSupportTitle}
          </button>
        </div>
      </div>

      {/* TAB 1: MODULE DOCUMENTATION */}
      {selectedTab === "DOCS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-extrabold text-[#162a21]">
              {t.modulesTitle} ({filteredModules.length})
            </h2>
          </div>

          {filteredModules.length === 0 ? (
            <div className="rounded-2xl border border-[#e2dad0] bg-white p-10 text-center shadow-sm">
              <p className="text-xs text-[#6b887a]">No documentation articles match your search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredModules.map((mod) => (
                <div
                  key={mod.id}
                  className="rounded-2xl border border-[#e2dad0] bg-white p-5 shadow-sm space-y-3 hover:border-[#2d6a4f]/50 transition flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="rounded-lg bg-[#2d6a4f]/10 px-2.5 py-0.5 text-[10px] font-extrabold text-[#2d6a4f] uppercase">
                        {mod.category}
                      </span>
                    </div>

                    <h3 className="text-sm font-extrabold text-[#162a21]">
                      {mod.title}
                    </h3>

                    <p className="text-xs text-[#3d5a4c] leading-relaxed">
                      {mod.details}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#e2dad0]/60 flex items-center justify-between">
                    <span className="text-[10px] text-[#6b887a]">{mod.summary}</span>
                    <Link
                      href={mod.href}
                      className="text-xs font-bold text-[#2d6a4f] hover:underline"
                    >
                      {t.readMore}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FREQUENTLY ASKED QUESTIONS */}
      {selectedTab === "FAQ" && (
        <div className="space-y-4">
          <div className="px-1">
            <h2 className="text-base font-extrabold text-[#162a21]">
              {t.faqTitle} ({filteredFaqs.length})
            </h2>
            <p className="text-xs text-[#6b887a] mt-0.5">{t.faqDesc}</p>
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="rounded-2xl border border-[#e2dad0] bg-white p-10 text-center shadow-sm">
              <p className="text-xs text-[#6b887a]">No FAQs match your search query.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-[#e2dad0] bg-white p-5 shadow-sm space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-bold">
                      {faq.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-[#162a21]">
                    Q: {faq.question}
                  </h3>
                  <p className="text-xs text-[#3d5a4c] leading-relaxed pl-3 border-l-2 border-[#2d6a4f]">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TECHNICAL SUPPORT GUIDANCE */}
      {selectedTab === "SUPPORT" && (
        <div className="rounded-2xl border border-[#e2dad0] bg-white p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-[#e2dad0] pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2d6a4f]/10 text-[#2d6a4f] text-xl font-bold">
              🏛️
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#162a21]">
                {t.technicalSupportTitle}
              </h2>
              <p className="text-xs text-[#6b887a]">
                Ministry of Rural Development • Government of India
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[#e2dad0] bg-[#fdfbf7] p-5 text-xs text-[#162a21] leading-relaxed space-y-3">
            <p className="font-bold text-[#2d6a4f]">
              {t.mordGuidelinesNotice}
            </p>
            <p className="text-[#3d5a4c]">
              • All 3D volumetric cadastre data submissions and verifications are governed by server-side authorization boundaries.
            </p>
            <p className="text-[#3d5a4c]">
              • Standard operating procedures for 3D ULPIN issuance comply with National Land Records Modernization Programme (NLRMP) standards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl border border-[#e2dad0] p-4 bg-white space-y-1">
              <span className="text-[10px] font-bold text-[#6b887a] uppercase">Platform Framework</span>
              <p className="font-bold text-[#162a21]">BhuVista 3D Land Intelligence Platform</p>
            </div>
            <div className="rounded-xl border border-[#e2dad0] p-4 bg-white space-y-1">
              <span className="text-[10px] font-bold text-[#6b887a] uppercase">Department Authority</span>
              <p className="font-bold text-[#162a21]">Ministry of Rural Development (MoRD)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
