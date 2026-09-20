"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { PageShell } from "@/src/components/PageShell";

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export default function HelpSupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqId, setOpenFaqId] = useState<string | null>("faq-ulpin");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  const helpSections = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: "🌐",
      description:
        "Learn the basics of navigating BhuVista, exploring 2D/3D land parcels, and accessing verified public registry data.",
      link: "/",
      linkText: "Go to Main Map →",
    },
    {
      id: "property-search",
      title: "Property Search",
      icon: "🔍",
      description:
        "Locate specific land parcels or buildings using ULPIN, survey numbers, unit IDs, structure names, or land use categories.",
      link: "/?search=true",
      linkText: "Search Properties →",
    },
    {
      id: "ulpin",
      title: "ULPIN (Unique Land Parcel Identification Number)",
      icon: "🏷️",
      description:
        "Understand how the 14-digit geo-tagged ULPIN acts as the single source of truth for Indian land parcels.",
      link: "/ulpin-registry",
      linkText: "Open ULPIN Registry →",
    },
    {
      id: "cadastral-map",
      title: "Cadastral Map",
      icon: "🗺️",
      description:
        "Visualize georeferenced cadastral boundaries, land parcels, and building footprints on high-resolution basemaps.",
      link: "/",
      linkText: "View Cadastral Map →",
    },
    {
      id: "3d-property-map",
      title: "3D Property Map",
      icon: "🧊",
      description:
        "Explore 3D volumetric building extrusions, floor elevations, and spatial unit geometries across multi-story structures.",
      link: "/",
      linkText: "Explore 3D Viewer →",
    },
    {
      id: "land-records",
      title: "Land Records",
      icon: "📋",
      description:
        "Access publicly approved land records, verification status, surface areas, floor numbers, and space classifications.",
      link: "/land-records",
      linkText: "View Land Records →",
    },
    {
      id: "downloads",
      title: "Downloads",
      icon: "📥",
      description:
        "Export public land datasets and parcel geometries in standard formats including CSV, GeoJSON, CityGML 3.0, and LandXML.",
      link: "/downloads",
      linkText: "Go to Downloads →",
    },
  ];

  const faqs: FAQItem[] = [
    {
      id: "faq-ulpin",
      category: "ULPIN",
      question: "What is ULPIN?",
      answer:
        "ULPIN (Unique Land Parcel Identification Number) is a 14-digit alphanumeric code assigned to land parcels based on their precise geographical coordinates. In BhuVista, ULPIN uniquely identifies properties and connects cadastral survey data, floor units, and public land records.",
    },
    {
      id: "faq-search",
      category: "Search",
      question: "How do I search for a property?",
      answer:
        "You can search for a property on the main map viewer, ULPIN Registry, or Land Records page. Use the search bar to enter a 14-digit ULPIN, survey or unit number (e.g. A-101), building name, or land use type (e.g. RESIDENTIAL, COMMERCIAL).",
    },
    {
      id: "faq-map",
      category: "Map Viewer",
      question: "How do I view a property on the map?",
      answer:
        "When browsing the ULPIN Registry or Land Records, click the 'View on Map' action button on any property record. BhuVista will automatically center the map camera and highlight the corresponding parcel polygon.",
    },
    {
      id: "faq-3d",
      category: "3D Viewer",
      question: "How do I view a property in 3D?",
      answer:
        "Properties with volumetric building models display a '3D Geometry Available' indicator. Click '3D View' or open the Property Details page to view multi-story floor plans, floor elevations, and extruded 3D structural models.",
    },
    {
      id: "faq-records",
      category: "Land Records",
      question: "Where can I find land records?",
      answer:
        "Navigate to the 'Land Records' section from the sidebar menu. Here you can browse verified public land records, filter by land use or 3D status, sort by area or date, and view property details.",
    },
    {
      id: "faq-downloads",
      category: "Downloads",
      question: "How can I download public land information?",
      answer:
        "Visit the 'Downloads' section from the sidebar. You can export bulk public datasets or individual property records in CSV spreadsheets, GIS GeoJSON vectors, CityGML 3.0 volumetric models, or LandXML survey formats.",
    },
    {
      id: "faq-missing",
      category: "Access & Visibility",
      question: "Why can't I see a particular property?",
      answer:
        "BhuVista's public viewer displays only approved public land records. Properties that are pending official surveyor review or undergoing cadastral verification are restricted to authorized government surveyors and administrators.",
    },
  ];

  const categories = ["ALL", "ULPIN", "Search", "Map Viewer", "3D Viewer", "Land Records", "Downloads", "Access & Visibility"];

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory =
        activeCategory === "ALL" || faq.category === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q) ||
        faq.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, activeCategory]);

  // Filtered Help Sections
  const filteredSections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return helpSections;
    return helpSections.filter(
      (sec) =>
        sec.title.toLowerCase().includes(q) ||
        sec.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <PageShell
      roleMode="PUBLIC_VIEWER"
      userRole={null}
      onRoleModeChange={() => {}}
      activeSection="help-support"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 font-sans text-[#162a21]">
        {/* PAGE HEADER */}
        <div className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded bg-[#2d6a4f]/10 px-2.5 py-0.5 text-[10px] font-extrabold text-[#2d6a4f] uppercase tracking-wider">
                CITIZEN KNOWLEDGE BASE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#162a21] tracking-tight">
              Help & Support
            </h1>
            <p className="text-xs font-medium text-[#6b887a] mt-1">
              Find answers about using BhuVista, searching land records, viewing properties and exploring 3D land information.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-[#2d6a4f] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#1b4332] transition shadow-xs"
            >
              Explore Map Portal →
            </Link>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-6 shadow-sm space-y-3">
          <label htmlFor="help-search-input" className="block text-xs font-extrabold text-[#162a21]">
            Search BhuVista Help Topics & FAQs
          </label>
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6b887a]"
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
              id="help-search-input"
              type="text"
              placeholder="Type keywords like 'ULPIN', '3D View', 'Downloads', 'Search'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[#e2dad0] bg-white pl-11 pr-4 py-3 text-xs text-[#162a21] placeholder-[#6b887a] outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20 shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#6b887a] hover:text-[#162a21]"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* HELP SECTIONS GRID */}
        <div className="space-y-4">
          <div className="border-b border-[#e2dad0] pb-2">
            <h2 className="text-lg font-extrabold text-[#162a21]">
              Platform Features & Guides
            </h2>
            <p className="text-xs text-[#6b887a]">
              Overview of tools available to citizens on the BhuVista portal.
            </p>
          </div>

          {filteredSections.length === 0 ? (
            <div className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-8 text-center text-xs text-[#6b887a]">
              No feature guides match your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSections.map((sec) => (
                <div
                  key={sec.id}
                  className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-5 shadow-sm hover:border-[#2d6a4f]/60 hover:bg-white transition flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{sec.icon}</span>
                      <h3 className="text-sm font-bold text-[#162a21]">
                        {sec.title}
                      </h3>
                    </div>
                    <p className="text-xs text-[#6b887a] leading-relaxed">
                      {sec.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#e2dad0]/60">
                    <Link
                      href={sec.link}
                      className="text-xs font-extrabold text-[#2d6a4f] hover:underline inline-flex items-center gap-1"
                    >
                      {sec.linkText}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FAQ ACCORDION SECTION */}
        <div className="space-y-4 pt-4 border-t border-[#e2dad0]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e2dad0] pb-2">
            <div>
              <h2 className="text-lg font-extrabold text-[#162a21]">
                Frequently Asked Questions
              </h2>
              <p className="text-xs text-[#6b887a]">
                Quick answers to common questions about land records, ULPIN, and 3D maps.
              </p>
            </div>

            {/* CATEGORY TABS FOR FAQ */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
                    activeCategory === cat
                      ? "bg-[#2d6a4f] text-white"
                      : "bg-[#fdfbf7] border border-[#e2dad0] text-[#3d5a4c] hover:bg-[#f3efe6]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-8 text-center text-xs text-[#6b887a]">
              No FAQs match your search query.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] overflow-hidden shadow-xs transition"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-[#f3efe6] transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="rounded-md bg-[#2d6a4f]/10 px-2 py-0.5 text-[10px] font-extrabold text-[#2d6a4f] uppercase shrink-0">
                          {faq.category}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-[#162a21]">
                          {faq.question}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#2d6a4f] shrink-0">
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="p-4 pt-2 border-t border-[#e2dad0]/60 bg-white text-xs text-[#3d5a4c] leading-relaxed">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CONTACT / SUPPORT INFORMATIONAL SECTION */}
        <div className="rounded-2xl border border-[#e2dad0] bg-[#fdfbf7] p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#2d6a4f]/10 px-2.5 py-0.5 text-[10px] font-extrabold text-[#2d6a4f] uppercase tracking-wider">
              SUPPORT & CONTACT
            </span>
          </div>
          <h3 className="text-base font-extrabold text-[#162a21]">
            Need Further Assistance?
          </h3>
          <p className="text-xs text-[#6b887a] leading-relaxed">
            Support contact information will be provided here.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
