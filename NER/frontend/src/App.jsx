import { useEffect, useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  CircleMarker,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";
import jsPDF from "jspdf";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

/* =========================================================
   MULTILINGUAL TRANSLATION SYSTEM (NER REGIONAL LANGUAGES)
========================================================= */
const TRANSLATIONS = {
  English: {
    brandTitle: "NER Logistics Intelligence Platform",
    brandSubtitle: "Logistics Optimization, Environmental Risk & Accessibility Engine",
    routePlanner: "Route Optimization Engine",
    findRoute: "Find Best Delivery Route",
    calculating: "Analyzing Environmental Data & Weather Risks...",
    sourceLoc: "Source Location",
    destLoc: "Destination Location",
    vehicleType: "Vehicle Type",
    weatherWidget: "Real-Time Weather Intelligence",
    environmentalRisk: "Environmental Risk & Disruption Engine",
    routeAnalysis: "Route Analysis Dashboard",
    routeComparison: "Route Comparison & Bypass Evaluation",
    fieldReporting: "Field Official Incident Reporting",
    submitIncident: "Submit Geo-Tagged Incident Report",
    disasterMode: "Emergency Relief & Disaster Mode",
    activeFleet: "Essential Commodity Supply Fleet",
    districtDashboard: "District-Wise Accessibility Matrix",
    pdfExport: "Export Official Logistics Report (PDF)",
    loginTitle: "MDoNER Logistics Intelligence System",
    loginSubtitle: "Sign in with government or fleet operator credentials",
    roleLabel: "Operational Role",
    emailLabel: "Email",
    passLabel: "Password",
    loginBtn: "Login to Platform",
    offlineQueue: "Offline Queue Active",
    photoUpload: "Attach Photo / Incident Evidence",
    bestRoute: "Recommended Optimal Route",
    costBreakdown: "Detailed Delivery Cost Breakdown",
    bridgeAccessibility: "Real-Time Road & Bridge Accessibility Engine",
    monitoredStructures: "Monitored Bridges & Passages",
    accessibleCount: "Fully Accessible",
    restrictedCount: "Load / Speed Restricted",
    blockedCount: "Blocked / Closed",
    underRepairCount: "Under Repair",
    updateStatus: "Update Accessibility Status",
    waterLevel: "River Water Level",
    loadCapacity: "Max Load Limit",
    heightClearance: "Height Clearance",
    trafficSpeed: "Flow Speed",
    filterCategory: "Filter Category",
    filterState: "Filter State",
    filterStatus: "Filter Status",
    searchInfra: "Search Bridge or Highway Corridor...",
    addInfrastructure: "Register New Bridge / Road Corridor",
    notifTitle: "Multilingual Notification & Alert Service",
    notifSubtitle: "Real-time voice & regional alerts across NER corridors",
    notifBell: "Live Alerts",
    markAllRead: "Mark All Read",
    voiceAlerts: "Voice Alert",
    soundAlerts: "Chime",
    testAlert: "Broadcast Alert",
    noAlerts: "All corridors clear. No active alerts."
  },
  Hindi: {
    brandTitle: "पूर्वात्तर रसद बुद्धिमत्ता मंच (NER Logistics)",
    brandSubtitle: "लॉजिस्टिक्स अनुकूलन, पर्यावरण जोखिम और पहुंच खुफिया मंच",
    routePlanner: "मार्ग अनुकूलन इंजन",
    findRoute: "सर्वश्रेष्ठ वितरण मार्ग खोजें",
    calculating: "पर्यावरण डेटा और मौसम के जोखिमों का विश्लेषण कर रहा है...",
    sourceLoc: "स्रोत का स्थान",
    destLoc: "गंतव्य स्थान",
    vehicleType: "वाहन का प्रकार",
    weatherWidget: "वास्तविक समय मौसम की जानकारी",
    environmentalRisk: "पर्यावरण जोखिम और मार्ग बाधा इंजन",
    routeAnalysis: "मार्ग विश्लेषण डैशबोर्ड",
    routeComparison: "मार्ग तुलना और बाईपास मूल्यांकन",
    fieldReporting: "क्षेत्रीय अधिकारी घटना रिपोर्टिंग",
    submitIncident: "जियो-टैग की गई रिपोर्ट जमा करें",
    disasterMode: "आपातकालीन राहत और आपदा मोड",
    activeFleet: "आवश्यक वस्तु आपूर्ति बेड़ा",
    districtDashboard: "जिला-वार पहुंच स्थिति तालिका",
    pdfExport: "आधिकारिक लॉजिस्टिक्स रिपोर्ट (PDF) डाउनलोड करें",
    loginTitle: "एमडीओएनईआर रसद सूचना प्रणाली",
    loginSubtitle: "सरकारी या फ्लीट ऑपरेटर क्रेडेंशियल्स के साथ साइन इन करें",
    roleLabel: "परिचालन भूमिका",
    emailLabel: "ईमेल पता",
    passLabel: "पासवर्ड",
    loginBtn: "प्लेटफॉर्म में लॉगिन करें",
    offlineQueue: "ऑफलाइन कतार सक्रिय",
    photoUpload: "फोटो / घटना साक्ष्य संलग्न करें",
    bestRoute: "अनुशंसित सर्वोत्तम मार्ग",
    costBreakdown: "विस्तृत वितरण लागत विवरण",
    bridgeAccessibility: "वास्तविक समय सड़क और पुल पहुंच प्रणाली",
    monitoredStructures: "निगरानी वाले पुल और मार्ग",
    accessibleCount: "पूर्णतः सुगम",
    restrictedCount: "भार/गति प्रतिबंधित",
    blockedCount: "अवरुद्ध/बंद",
    underRepairCount: "मरम्मत जारी",
    updateStatus: "सुगमता स्थिति अद्यतन करें",
    waterLevel: "नदी जल स्तर",
    loadCapacity: "अधिकतम भार क्षमता",
    heightClearance: "ऊंचाई निकासी",
    trafficSpeed: "यातायात गति",
    filterCategory: "श्रेणी फ़िल्टर",
    filterState: "राज्य फ़िल्टर",
    filterStatus: "स्थिति फ़िल्टर",
    searchInfra: "पुल या राजमार्ग कॉरिडोर खोजें...",
    addInfrastructure: "नया पुल/सड़क पंजीकृत करें",
    notifTitle: "बहुभाषी अधिसूचना एवं चेतावनी सेवा",
    notifSubtitle: "पूर्वोत्तर गलियारों में वास्तविक समय ध्वनि व क्षेत्रीय चेतावनियां",
    notifBell: "लाइव चेतावनियां",
    markAllRead: "सभी पढ़े हुए चिन्हित करें",
    voiceAlerts: "ध्वनि चेतावनी",
    soundAlerts: "घंटी ध्वनि",
    testAlert: "चेतावनी प्रसारित करें",
    noAlerts: "सभी मार्ग सुगम हैं। कोई सक्रिय चेतावनी नहीं।"
  },
  Assamese: {
    brandTitle: "উত্তৰ-পূৰ্বাঞ্চল লজিষ্টিকছ বুদ্ধিমত্তা মঞ্চ",
    brandSubtitle: "পথ সুগমতা আৰু পাৰিপাৰ্শ্বিক বিপদ বিশ্লেষণ ব্যৱস্থা",
    routePlanner: "পথ বাচনি ব্যৱস্থা",
    findRoute: "উৎকৃষ্ট সৰবৰাহ পথ সন্ধান কৰক",
    calculating: "বতৰ আৰু পাৰিপাৰ্শ্বিক বিপদ বিশ্লেষণ চলি আছে...",
    sourceLoc: "যাত্ৰাৰ উৎস স্থান",
    destLoc: "গন্তব্য স্থান",
    vehicleType: "বাহনৰ প্ৰকাৰ",
    weatherWidget: "সদ্য প্ৰাপ্ত বতৰৰ তথ্য",
    environmentalRisk: "পাৰিপাৰ্শ্বিক বিপদ আৰু প্ৰতিবন্ধকতা ইঞ্জিন",
    routeAnalysis: "পথ বিশ্লেষণ ডেছব'ৰ্ড",
    routeComparison: "পথ তুলনা আৰু বাইপাছ মূল্যায়ন",
    fieldReporting: "ক্ষেত্ৰভিত্তিক বিষয়াৰ ঘটনা প্ৰতিবেদন",
    submitIncident: "জিও-টেগযুক্ত তথ্য প্ৰেৰণ কৰক",
    disasterMode: "জৰুৰীকালীন সাহায্য আৰু দুৰ্যোগ অৱস্থা",
    activeFleet: "জৰুৰী সামগ্ৰী যোগান বাহন ফ্লিট",
    districtDashboard: "জিলাভিত্তিক সংযোগ স্থিতি তালিকা",
    pdfExport: "অফিচিয়েল ৰিপৰ্ট (PDF) ডাউনল'ড কৰক",
    loginTitle: "MDoNER লজিষ্টিকছ ব্যৱস্থা",
    loginSubtitle: "প্ৰৱেশ দ্বাৰত লগ-ইন কৰক",
    roleLabel: "বিষয়াসকলৰ পদবী",
    emailLabel: "ইমেইল আই-ডি",
    passLabel: "পাছৱৰ্ড",
    loginBtn: "লগ-ইন কৰক",
    offlineQueue: "অফলাইন কিউ সক্ৰিয়",
    photoUpload: "ছবি বা প্ৰমাণ ফাইল সংযোগ কৰক",
    bestRoute: "সৰ্বোত্তম অনুমোদিত পথ",
    costBreakdown: "সৰবৰাহ খৰচৰ সবিশেষ",
    bridgeAccessibility: "সদ্য প্ৰাপ্ত পথ আৰু দলং সুগমতা ইঞ্জিন",
    monitoredStructures: "নিৰীক্ষণ কৰা দলং আৰু পথ",
    accessibleCount: "সম্পূৰ্ণ সুগম",
    restrictedCount: "ভাৰ/গতি নিয়ন্ত্ৰিত",
    blockedCount: "বন্ধ/বাধাগ্রস্ত",
    underRepairCount: "মেৰামতি চলি আছে",
    updateStatus: "স্থিতি সলনি কৰক",
    waterLevel: "নদীৰ পানীৰ স্তৰ",
    loadCapacity: "সৰ্বোচ্চ ভাৰ ক্ষমতা",
    heightClearance: "উচ্চতা সুগমতা",
    trafficSpeed: "যাতায়াতৰ গতি",
    filterCategory: "শ্ৰেণী বাচনি",
    filterState: "ৰাজ্য বাচনি",
    filterStatus: "স্থিতি বাচনি",
    searchInfra: "দলং বা ৰাজপথ বিচাৰক...",
    addInfrastructure: "নতুন দলং বা পথ অন্তৰ্ভুক্ত কৰক",
    notifTitle: "বহুভাষিক জাননী আৰু সতৰ্কবাণী সেৱা",
    notifSubtitle: "উত্তৰ-পূব কৰিড'ৰত লাইভ শব্দ আৰু আঞ্চলিক সতৰ্কতা",
    notifBell: "লাইভ সতৰ্কবাণীসমূহ",
    markAllRead: "সকলো পঢ়া হ'ল",
    voiceAlerts: "কণ্ঠস্বৰ সতৰ্কতা",
    soundAlerts: "শব্দ সংকেত",
    testAlert: "সতৰ্কবাণী প্ৰচাৰ কৰক",
    noAlerts: "সকলো পথ সুগম। কোনো সতৰ্কবাণী নাই।"
  },
  Bengali: {
    brandTitle: "উত্তর-পূর্বাঞ্চল লজিস্টিকস ইন্টেলিজেন্স প্ল্যাটফর্ম",
    brandSubtitle: "পরিবহন অপটিমাইজেশন, পরিবেশগত ঝুঁকি ও অ্যাক্সেসিবিলিটি সিস্টেম",
    routePlanner: "রুট অপটিমাইজেশন ইঞ্জিন",
    findRoute: "সর্বোত্তম ডেলিভারি রুট খুঁজুন",
    calculating: "আবহাওয়া এবং পরিবেশগত তথ্য বিশ্লেষণ করা হচ্ছে...",
    sourceLoc: "উৎসের অবস্থান",
    destLoc: "গন্তব্য অবস্থান",
    vehicleType: "যানবাহনের ধরন",
    weatherWidget: "লাইভ আবহাওয়ার তথ্য",
    environmentalRisk: "পরিবেশগত ঝুঁকি ও রুট বাধা ইঞ্জিন",
    routeAnalysis: "রুট অ্যানালিসিস ড্যাশবোর্ড",
    routeComparison: "রুট তুলনা ও বাইপাস মূল্যায়ন",
    fieldReporting: "ফিল্ড অফিসারদের ঘটনা রিপোর্টিং পোর্টাল",
    submitIncident: "জিও-ট্যাগযুক্ত রিপোর্ট জমা দিন",
    disasterMode: "জরুরী ত্রাণ ও দুর্যোগকালীন মোড",
    activeFleet: "জরুরী পণ্য সরবরাহকারী যানবাহন ফ্লিট",
    districtDashboard: "জেলাভিত্তিক সংযোগ তথ্য ড্যাশবোর্ড",
    pdfExport: "অফিসিয়াল রিপোর্ট (PDF) ডাউনলোড করুন",
    loginTitle: "MDoNER লজিস্টিকস তথ্য ব্যবস্থা",
    loginSubtitle: "সরকারি বা ফ্লিট অপারেটর তথ্য দিয়ে লগইন করুন",
    roleLabel: "অপারেশনাল ভূমিকা",
    emailLabel: "ইমেল অ্যাড্রেস",
    passLabel: "পাসওয়ার্ড",
    loginBtn: "লগইন করুন",
    offlineQueue: "অফলাইন কিউ কার্যকর",
    photoUpload: "ছবি বা প্রমাণ নথি যুক্ত করুন",
    bestRoute: "সুপারিশকৃত সেরা রুট",
    costBreakdown: "বিস্তারিত ডেলিভারি খরচ তথ্য",
    bridgeAccessibility: "রিয়েল-টাইম সড়ক ও সেতু অ্যাক্সেসিবিলিটি ইঞ্জিন",
    monitoredStructures: "পর্যবেক্ষণাধীন সেতু ও সড়ক",
    accessibleCount: "সম্পূর্ণ সুগম",
    restrictedCount: "ভার/গতি নিয়ন্ত্রিত",
    blockedCount: "অবরুদ্ধ/বন্ধ",
    underRepairCount: "সংস্কারাধীন",
    updateStatus: "অবস্থা আপডেট করুন",
    waterLevel: "নদীর জলের স্তর",
    loadCapacity: "সর্বোচ্চ ভার ক্ষমতা",
    heightClearance: "উচ্চতা ক্লিয়ারেন্স",
    trafficSpeed: "যানবাহনের গতি",
    filterCategory: "ক্যাটাগরি ফিল্টার",
    filterState: "রাজ্য ফিল্টার",
    filterStatus: "স্ট্যাটাস ফিল্টার",
    searchInfra: "সেতু বা হাইওয়ে খুঁজুন...",
    addInfrastructure: "নতুন সেতু বা সড়ক নথিভুক্ত করুন",
    notifTitle: "বহুভাষিক বিজ্ঞপ্তি ও সতর্কতা পরিষেবা",
    notifSubtitle: "উত্তর-পূর্ব করিডোরে রিয়েল-টাইম অডিও ও আঞ্চলিক সতর্কতা",
    notifBell: "লাইভ সতর্কতা",
    markAllRead: "সব পঠিত চিহ্নিত করুন",
    voiceAlerts: "ভয়েস অ্যালার্ট",
    soundAlerts: "সাউন্ড সংকেত",
    testAlert: "সতর্কতা সম্প্রচার করুন",
    noAlerts: "সব করিডোর সচল। কোনো সক্রিয় সতর্কতা নেই।"
  }
};

/* =========================================================
   MULTILINGUAL NOTIFICATION & ALERT AUDIO/VOICE ENGINE
========================================================= */
const playNotificationSound = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {}
};

const speakAlertText = (text, lang) => {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langCodes = {
      English: "en-IN",
      Hindi: "hi-IN",
      Bengali: "bn-IN",
      Assamese: "as-IN"
    };
    utterance.lang = langCodes[lang] || "en-IN";
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (e) {}
};

const INITIAL_NOTIFICATIONS = [
  {
    id: "NOTIF-101",
    category: "disaster",
    severity: "critical",
    highway: "NH-27 (Badarpur)",
    timestamp: "10:15 AM",
    isRead: false,
    title: {
      English: "🚨 CRITICAL: Flash Flood Alert on NH-27 Badarpur",
      Hindi: "🚨 अत्यंत गंभीर: NH-27 बदरपुर पर अचानक बाढ़ की चेतावनी",
      Assamese: "🚨 জৰুৰী সতৰ্কতা: NH-27 বদৰপুৰত নদীৰ পানী উপচি পৰাৰ সতৰ্কবাণী",
      Bengali: "🚨 জরুরি সতর্কতা: NH-27 বদরপুরে আকস্মিক বন্যার লাল সতর্কতা"
    },
    message: {
      English: "Barak river water levels exceed danger mark by +1.6m near Badarpur ramp. Delivery vans redirected via Haflong Mountain bypass.",
      Hindi: "बदरपुर रैंप के पास बराक नदी का जलस्तर खतरे के निशान से +1.6 मीटर ऊपर है। डिलीवरी वैन को हाफलोंग बाईपास से भेजा जा रहा है।",
      Assamese: "বদৰপুৰ সমীপত বৰাক নদীৰ পানী বিপদসীমাৰ পৰা ১.৬ মিটাৰ ওপৰত বৈছে। সৰু বাহনসমূহ হাফলং পথেৰে ঘূৰাই দিয়া হৈছে।",
      Bengali: "বদরপুরের কাছে বরাক নদীর জলস্তর বিপদসীমার ১.৬ মিটার উপর দিয়ে বইছে। ছোট পণ্যবাহী যান হাফলং বাইপাস দিয়ে ঘুরিয়ে দেওয়া হয়েছে।"
    }
  },
  {
    id: "NOTIF-102",
    category: "road",
    severity: "warning",
    highway: "NH-06 (Meghalaya)",
    timestamp: "09:40 AM",
    isRead: false,
    title: {
      English: "⚠️ CAUTION: Active Landslide Slip on NH-06 Jowai Pass",
      Hindi: "⚠️ सावधानी: मेघालय NH-06 जोवाई दर्रे पर सक्रिय भूस्खलन",
      Assamese: "⚠️ সতৰ্কতা: মেঘালয়ৰ NH-06 যোৱাই পাছত সক্ৰিয় ভূমিস্খলন",
      Bengali: "⚠️ সতর্কতা: মেঘালয়ের NH-06 জোওয়াই পাসে সক্রিয় ভূমিধস"
    },
    message: {
      English: "Single lane clearance in progress by BRO. Heavy commercial vehicles (>12 Tons) delayed by ~75 mins. Drive with caution.",
      Hindi: "सीमा सड़क संगठन (BRO) द्वारा सिंगल लेन खोली जा रही है। भारी ट्रकों में लगभग 75 मिनट का विलंब संभव है।",
      Assamese: "BRO ৰ দ্বাৰা একক লেন চাফা কৰাৰ কাম চলি আছে। ১২ টনৰ অধিক গধুৰ বাহনৰ যাত্ৰা প্ৰায় ৭৫ মিনিট বিলম্ব হ'ব পাৰে।",
      Bengali: "BRO দ্বারা এক লেনের যান চলাচল সচল করা হচ্ছে। ১২ টনের বেশি ভারী ট্রাকে ৭৫ মিনিট বিলম্ব হতে পারে।"
    }
  },
  {
    id: "NOTIF-103",
    category: "weather",
    severity: "warning",
    highway: "NH-10 (Sikkim)",
    timestamp: "08:55 AM",
    isRead: false,
    title: {
      English: "🌧️ WEATHER: Rockfall Warning on NH-10 Teesta Corridor",
      Hindi: "🌧️ मौसम चेतावनी: NH-10 तीस्ता कॉरिडोर पर चट्टान गिरने का जोखिम",
      Assamese: "🌧️ বতৰৰ জাননী: তিস্তা কৰিড'ৰৰ NH-10 ত শিলাবৃষ্টি আৰু শিল খহি পৰাৰ সম্ভাৱনা",
      Bengali: "🌧️ আবহাওয়া সতর্কতা: তিস্তা করিডোরে NH-10 এ পাথর ধসের সতর্কতা"
    },
    message: {
      English: "High rainfall triggered boulder roll near Sevoke. Night transit restricted for heavy goods convoys.",
      Hindi: "सेवोक के पास भारी वर्षा से चट्टानें गिरीं। रात के समय भारी मालवाहक काफिले की आवाजाही प्रतिबंधित है।",
      Assamese: "চেভকৰ সমীপত প্ৰবল বৰষুণৰ ফলত শিল খহিছে। নিশাৰ ভাগত গধুৰ সামগ্ৰী পৰিবহণ স্থগিত কৰা হৈছে।",
      Bengali: "সেভকের কাছে ভারী বৃষ্টিতে পাথর ধস নেমেছে। রাতের বেলা ভারী পণ্যবাহী কনভয় চলাচল নিষিদ্ধ।"
    }
  },
  {
    id: "NOTIF-104",
    category: "fleet",
    severity: "info",
    highway: "NH-27-GS",
    timestamp: "07:30 AM",
    isRead: true,
    title: {
      English: "🚚 FLEET DISPATCH: Emergency Medical Convoy Alpha En Route",
      Hindi: "🚚 फ्लीट प्रेषण: आवश्यक चिकित्सा राहत काफिला अल्फा रवाना",
      Assamese: "🚚 ফ্লিট সৰবৰাহ: জৰুৰী চিকিৎসা সাহায্য বাহন আলফা ৰাওনা হ'ল",
      Bengali: "🚚 ফ্লিট আপডেট: জরুরী মেডিকেল ত্রাণ কনভয় আলফা রওনা হয়েছে"
    },
    message: {
      English: "Truck NER-TRIP-201 carrying vital vaccines & medicines departed Guwahati Central Hub. Real GPS Tracking Active.",
      Hindi: "महत्वपूर्ण टीके और दवाएं लेकर ट्रक NER-TRIP-201 गुवाहाटी हब से रवाना हुआ। लाइव जीपीएस ट्रैकिंग चालू है।",
      Assamese: "প্ৰয়োজনীয় ঔষধ আৰু ভেকচিন লৈ ট্ৰাক NER-TRIP-201 গুৱাহাটীৰ পৰা যাত্ৰা আৰম্ভ কৰিছে। লাইভ GPS সক্ৰিয়।",
      Bengali: "জরুরী ওষুধ ও ভ্যাকসিন সহ ট্রাক NER-TRIP-201 গুয়াহাটি থেকে রওনা হয়েছে। লাইভ জিপিএস সক্রিয়।"
    }
  }
];

/* =========================================================
   DEFAULT RICH INITIAL STATE FOR ALL SECTIONS
========================================================= */
const DEFAULT_ROUTE_DATA = {
  id: 1,
  distanceKm: 342.5,
  durationMinutes: 465,
  environmentalDelayMinutes: 45,
  fuelLitres: 57.1,
  fuelCost: 5425,
  driverCost: 1550,
  tollCost: 514,
  totalDeliveryCost: 8164,
  riskLevel: "MEDIUM",
  riskProbability: 53,
  score: 92,
  geometry: {
    coordinates: [
      [91.7362, 26.1445], // Guwahati
      [91.8933, 25.5788], // Shillong
      [92.4200, 25.2100], // Jowai
      [92.5800, 24.8800], // Badarpur
      [92.7937, 24.8170]  // Silchar
    ]
  }
};

const DEFAULT_COMPARISON_ROUTES = [
  {
    id: 1,
    score: 92,
    distanceKm: 342.5,
    durationMinutes: 465,
    riskProbability: 53,
    totalDeliveryCost: 8164
  },
  {
    id: 2,
    score: 84,
    distanceKm: 378.2,
    durationMinutes: 510,
    riskProbability: 38,
    totalDeliveryCost: 8950
  },
  {
    id: 3,
    score: 76,
    distanceKm: 395.0,
    durationMinutes: 540,
    riskProbability: 68,
    totalDeliveryCost: 9420
  }
];

const DEFAULT_RISK_INFO = {
  model: "NER-Environmental-RandomForest-Classifier-v3.2",
  state: "ASSAM",
  district: "Silchar",
  risk: "MEDIUM",
  probabilityPercent: 53,
  advisory: "CAUTION: Moderate environmental risk detected on Silchar Corridor (53% landslide probability). Reduced speed advised on steep mountain curves.",
  alternateSuggested: false,
  environmentalFeatures: {
    elevationMeters: 35,
    slopeDegrees: 24,
    historicalHazardsCount: 48,
    rainfallMm: 180,
    soilSaturationPercent: 65
  }
};

const INITIAL_DISTRICTS = [
  { district: "Kamrup Metropolitan", state: "ASSAM", connectivityPercent: 95, riskPercent: 15, riskLevel: "LOW", status: "Open", bottleneck: "Urban Congestion" },
  { district: "Cachar (Silchar)", state: "ASSAM", connectivityPercent: 68, riskPercent: 53, riskLevel: "MEDIUM", status: "Caution", bottleneck: "Barak River Waterlogging" },
  { district: "Dima Hasao (Haflong)", state: "ASSAM", connectivityPercent: 55, riskPercent: 72, riskLevel: "HIGH", status: "Alert", bottleneck: "Jatinga Landslide Sinking Stretch" },
  { district: "East Khasi Hills (Shillong)", state: "MEGHALAYA", connectivityPercent: 82, riskPercent: 42, riskLevel: "MEDIUM", status: "Caution", bottleneck: "Dense Mountain Fog" },
  { district: "West Jaintia Hills (Jowai)", state: "MEGHALAYA", connectivityPercent: 48, riskPercent: 78, riskLevel: "HIGH", status: "Alert", bottleneck: "NH-06 Ratacherra Mudslides" },
  { district: "Imphal West", state: "MANIPUR", connectivityPercent: 75, riskPercent: 35, riskLevel: "MEDIUM", status: "Open", bottleneck: "NH-37 Heavy Truck Delay" },
  { district: "Aizawl", state: "MIZORAM", connectivityPercent: 52, riskPercent: 75, riskLevel: "HIGH", status: "Alert", bottleneck: "Hmuifang Sinking Ridge" },
  { district: "Kohima", state: "NAGALAND", connectivityPercent: 60, riskPercent: 65, riskLevel: "MEDIUM", status: "Caution", bottleneck: "Phesama Sinking Stretch" },
  { district: "East Sikkim (Gangtok)", state: "SIKKIM", connectivityPercent: 45, riskPercent: 85, riskLevel: "HIGH", status: "Alert", bottleneck: "NH-10 Teesta Erosion" },
  { district: "West Tripura (Agartala)", state: "TRIPURA", connectivityPercent: 90, riskPercent: 20, riskLevel: "LOW", status: "Open", bottleneck: "Localized Drainage" },
  { district: "Papum Pare (Itanagar)", state: "ARUNACHAL PRADESH", connectivityPercent: 58, riskPercent: 70, riskLevel: "HIGH", status: "Alert", bottleneck: "Karsingsa Landslide Zone" },
  { district: "Tawang", state: "ARUNACHAL PRADESH", connectivityPercent: 38, riskPercent: 88, riskLevel: "HIGH", status: "Alert", bottleneck: "Sela Pass Snow & Rockfall" },
  { district: "Dimapur", state: "NAGALAND", connectivityPercent: 88, riskPercent: 25, riskLevel: "LOW", status: "Open", bottleneck: "Commercial Hub Transit" },
  { district: "Dibrugarh", state: "ASSAM", connectivityPercent: 92, riskPercent: 18, riskLevel: "LOW", status: "Open", bottleneck: "Brahmaputra Bank Precautions" }
];

const INITIAL_FLEET = [
  {
    id: "NER-FLEET-1001",
    vehicleName: "Medical Relief Truck Alpha",
    driverName: "Rajesh Kalita",
    contact: "+91-9864012345",
    vehicleType: "mediumTruck",
    cargoType: "Essential Medicines & Vaccines",
    cargoWeightKg: 6500,
    origin: "Guwahati Central Depot",
    destination: "Silchar Medical College Depot",
    currentLat: 26.1445,
    currentLon: 91.7362,
    speedKmH: 45,
    status: "In Transit",
    delayReason: "None",
    etaMinutes: 140,
    isRealGpsActive: true
  },
  {
    id: "NER-FLEET-1002",
    vehicleName: "Food Supply Convoy Bravo",
    driverName: "Biren Gogoi",
    contact: "+91-9435098765",
    vehicleType: "heavyTruck",
    cargoType: "Rice, Pulses & Ration Kits",
    cargoWeightKg: 14000,
    origin: "Jorhat Rice Hub",
    destination: "Dimapur FCI Godown",
    currentLat: 26.7500,
    currentLon: 94.2200,
    speedKmH: 42,
    status: "In Transit",
    delayReason: "None",
    etaMinutes: 95,
    isRealGpsActive: true
  },
  {
    id: "NER-FLEET-1003",
    vehicleName: "Disaster Emergency Tanker Charlie",
    driverName: "Subhash Roy",
    contact: "+91-9774011223",
    vehicleType: "deliveryVan",
    cargoType: "Clean Drinking Water & Relief Kits",
    cargoWeightKg: 3200,
    origin: "Shillong SDMA Unit",
    destination: "Jowai Landslide Relief Base",
    currentLat: 25.2100,
    currentLon: 92.4200,
    speedKmH: 25,
    status: "Delayed",
    delayReason: "NH-06 Landslide Clearing Operations",
    etaMinutes: 210,
    isRealGpsActive: true
  }
];

const INITIAL_TRIPS_DATA = [
  {
    id: "TRIP-201",
    routeCode: "NH-27-GS",
    routeName: "Guwahati to Silchar Expressway Corridor",
    source: "Guwahati, Assam",
    destination: "Silchar, Assam",
    highway: "NH-27",
    state: "ASSAM",
    vehicleName: "Medical Relief Truck Alpha",
    vehicleType: "mediumTruck",
    status: "Active",
    driver: "Rajesh Kalita",
    cargo: "Essential Medicines & Vaccines",
    departureTime: "06:30 AM",
    eta: "02:15 PM"
  },
  {
    id: "TRIP-202",
    routeCode: "NH-29-DK",
    routeName: "Dimapur to Kohima Mountain Corridor",
    source: "Dimapur, Nagaland",
    destination: "Kohima, Nagaland",
    highway: "NH-29",
    state: "NAGALAND",
    vehicleName: "Food Supply Convoy Bravo",
    vehicleType: "heavyTruck",
    status: "Active",
    driver: "Biren Gogoi",
    cargo: "Rice, Pulses & Ration Kits",
    departureTime: "07:45 AM",
    eta: "11:30 AM"
  },
  {
    id: "TRIP-203",
    routeCode: "NH-06-SJ",
    routeName: "Shillong to Jowai Mountain Highway Pass",
    source: "Shillong, Meghalaya",
    destination: "Jowai, Meghalaya",
    highway: "NH-06",
    state: "MEGHALAYA",
    vehicleName: "Disaster Emergency Tanker Charlie",
    vehicleType: "deliveryVan",
    status: "Active",
    driver: "Subhash Roy",
    cargo: "Clean Drinking Water & Relief Kits",
    departureTime: "08:15 AM",
    eta: "01:00 PM"
  },
  {
    id: "TRIP-204",
    routeCode: "NH-37-IJ",
    routeName: "Imphal to Jiribam Highway",
    source: "Imphal, Manipur",
    destination: "Jiribam, Manipur",
    highway: "NH-37",
    state: "MANIPUR",
    vehicleName: "Northeast Logistics Carrier 04",
    vehicleType: "heavyTruck",
    status: "Active",
    driver: "T. Singh",
    cargo: "Fuel & Power Generation Spares",
    departureTime: "07:00 AM",
    eta: "03:45 PM"
  },
  {
    id: "TRIP-205",
    routeCode: "NH-10-SG",
    routeName: "Siliguri to Gangtok Axis",
    source: "Siliguri, West Bengal",
    destination: "Gangtok, Sikkim",
    highway: "NH-10",
    state: "SIKKIM",
    vehicleName: "Himalayan Express Van 05",
    vehicleType: "deliveryVan",
    status: "Active",
    driver: "Karma Bhutia",
    cargo: "High-Altitude Medical Equipment",
    departureTime: "08:30 AM",
    eta: "05:15 PM"
  },
  {
    id: "TRIP-206",
    routeCode: "NH-08-AS",
    routeName: "Agartala to Sabroom Trade Corridor",
    source: "Agartala, Tripura",
    destination: "Sabroom, Tripura",
    highway: "NH-8",
    state: "TRIPURA",
    vehicleName: "Tripura Express Logistics 06",
    vehicleType: "mediumTruck",
    status: "Active",
    driver: "Debabrata Deb",
    cargo: "Agricultural & Food Supplies",
    departureTime: "09:00 AM",
    eta: "02:30 PM"
  },
  {
    id: "TRIP-207",
    routeCode: "NH-13-TB",
    routeName: "Tezpur to Bomdila & Tawang Route",
    source: "Tezpur, Assam",
    destination: "Tawang, Arunachal Pradesh",
    highway: "NH-13",
    state: "ARUNACHAL PRADESH",
    vehicleName: "Arunachal Frontier Carrier 07",
    vehicleType: "heavyTruck",
    status: "Active",
    driver: "Pema Dorjee",
    cargo: "Winter Clothes & Medical Supplies",
    departureTime: "05:00 AM",
    eta: "04:30 PM"
  },
  {
    id: "TRIP-208",
    routeCode: "NH-54-AL",
    routeName: "Aizawl to Lunglei Transit",
    source: "Aizawl, Mizoram",
    destination: "Lunglei, Mizoram",
    highway: "NH-54",
    state: "MIZORAM",
    vehicleName: "Mizoram Relief Convoy 08",
    vehicleType: "deliveryVan",
    status: "Active",
    driver: "Lalrinzuala",
    cargo: "Infant Nutrition & Clean Water",
    departureTime: "06:45 AM",
    eta: "04:00 PM"
  },
  {
    id: "TRIP-209",
    routeCode: "NH-715-JD",
    routeName: "Jorhat to Dibrugarh Transit Corridor",
    source: "Jorhat, Assam",
    destination: "Dibrugarh, Assam",
    highway: "NH-715",
    state: "ASSAM",
    vehicleName: "Brahmaputra Supply Van 09",
    vehicleType: "mediumTruck",
    status: "Active",
    driver: "Manish Borah",
    cargo: "Surgical Equipment & Blood Packets",
    departureTime: "08:10 AM",
    eta: "01:45 PM"
  },
  {
    id: "TRIP-210",
    routeCode: "NH-27-GN",
    routeName: "Guwahati to Nagaon Supply Shuttle",
    source: "Guwahati, Assam",
    destination: "Nagaon, Assam",
    highway: "NH-27",
    state: "ASSAM",
    vehicleName: "Central Assam Express 10",
    vehicleType: "mediumTruck",
    status: "Active",
    driver: "Hiren Sharma",
    cargo: "Dry Provisions & Water Purification Kits",
    departureTime: "09:30 AM",
    eta: "12:15 PM"
  }
];

const INITIAL_DISRUPTIONS = [
  {
    id: "DIS-01",
    corridorName: "NH-06 (Jowai - Ratacherra Corridor)",
    state: "MEGHALAYA",
    district: "West Jaintia Hills",
    type: "Landslide",
    severity: "High",
    delayMinutes: 75,
    impact: "Single lane traffic movement. Heavy trucks delayed by ~1.5 hours.",
    coordinates: [25.2100, 92.4200],
    alternateRoute: "Via Jowai - Shangpung - Ummulong By-pass"
  },
  {
    id: "DIS-02",
    corridorName: "NH-27 (Guwahati - Silchar Highway)",
    state: "ASSAM",
    district: "Cachar",
    type: "Flash Flood / Waterlogging",
    severity: "High",
    delayMinutes: 90,
    impact: "River overtopping near Badarpur. Small delivery vans redirected.",
    coordinates: [24.8800, 92.5800],
    alternateRoute: "Via Haflong - Harangajao Mountain Road"
  },
  {
    id: "DIS-03",
    corridorName: "NH-29 (Dimapur - Kohima Pass)",
    state: "NAGALAND",
    district: "Kohima",
    type: "Road Erosion / Sinking Zone",
    severity: "Medium",
    delayMinutes: 35,
    impact: "Phesama Sinking Stretch. Convoy movement controlled by traffic police.",
    coordinates: [25.6200, 94.1100],
    alternateRoute: "Via Peducha - Tssema Bypass"
  },
  {
    id: "DIS-04",
    corridorName: "NH-10 (Siliguri - Gangtok Highway)",
    state: "SIKKIM",
    district: "East Sikkim",
    type: "Teesta River Rockfall",
    severity: "High",
    delayMinutes: 120,
    impact: "Teesta river bank slip. Heavy goods trucks restricted after sunset.",
    coordinates: [27.1200, 88.5000],
    alternateRoute: "Via Lava - Gorubathan - Rangpo Road"
  }
];

const INITIAL_INFRASTRUCTURE = [
  {
    id: "INF-BR-01",
    name: "Bogibeel Rail-Road Bridge",
    category: "Bridge",
    highway: "NH-15 / Brahmaputra River Crossing",
    state: "ASSAM",
    district: "Dibrugarh",
    coordinates: [27.3980, 94.8872],
    status: "FULLY_ACCESSIBLE",
    maxWeightCapacityTons: 40,
    heightClearanceMeters: 5.5,
    waterLevelStatus: "Normal (-2.8m below danger level)",
    trafficFlowSpeedKmH: 60,
    bottleneckReason: "Smooth double-deck transit active",
    alternateRoute: "N/A"
  },
  {
    id: "INF-BR-02",
    name: "Bhupen Hazarika Setu (Dhola-Sadiya Bridge)",
    category: "Bridge",
    highway: "NH-115 / Lohit River Pass",
    state: "ASSAM",
    district: "Tinsukia",
    coordinates: [27.8850, 95.6800],
    status: "FULLY_ACCESSIBLE",
    maxWeightCapacityTons: 60,
    heightClearanceMeters: 6.0,
    waterLevelStatus: "Normal (-3.1m below danger level)",
    trafficFlowSpeedKmH: 65,
    bottleneckReason: "Military heavy vehicle cleared",
    alternateRoute: "N/A"
  },
  {
    id: "INF-BR-03",
    name: "Saraighat Rail-Road Bridge",
    category: "Bridge",
    highway: "NH-27 / Brahmaputra River Crossing",
    state: "ASSAM",
    district: "Kamrup Metropolitan (Guwahati)",
    coordinates: [26.1770, 91.6880],
    status: "PASSABLE_CAUTION",
    maxWeightCapacityTons: 30,
    heightClearanceMeters: 4.8,
    waterLevelStatus: "Caution (+0.8m rain rise)",
    trafficFlowSpeedKmH: 25,
    bottleneckReason: "Peak urban transit slowdown; speed limit 20 km/h enforced",
    alternateRoute: "Via New Saraighat 3-Lane Bridge"
  },
  {
    id: "INF-BR-04",
    name: "Coronation Heritage Bridge (Sevoke)",
    category: "Bridge",
    highway: "NH-31C / Teesta River Gorge",
    state: "SIKKIM",
    district: "Darjeeling / East Sikkim Access",
    coordinates: [26.8990, 88.4710],
    status: "RESTRICTED_LOAD",
    maxWeightCapacityTons: 12,
    heightClearanceMeters: 3.8,
    waterLevelStatus: "High (+1.4m river erosion alert)",
    trafficFlowSpeedKmH: 15,
    bottleneckReason: "Heavy trucks (>12 Tons) strictly banned; load diverted",
    alternateRoute: "Via Coronation Bypass - Damdim - Rangpo Pass"
  },
  {
    id: "INF-BR-05",
    name: "Silchar Barak River Bridge",
    category: "Bridge",
    highway: "NH-27 / Barak River Pass",
    state: "ASSAM",
    district: "Cachar (Silchar)",
    coordinates: [24.8320, 92.7840],
    status: "PASSABLE_CAUTION",
    maxWeightCapacityTons: 25,
    heightClearanceMeters: 4.2,
    waterLevelStatus: "Critical (+1.6m above warning mark)",
    trafficFlowSpeedKmH: 20,
    bottleneckReason: "Barak river waterlogging on approach ramp; single-lane control",
    alternateRoute: "Via Haflong Road Bridge"
  },
  {
    id: "INF-BR-06",
    name: "Teesta Rangpo Border Bridge",
    category: "Bridge",
    highway: "NH-10 / Teesta River Corridor",
    state: "SIKKIM",
    district: "East Sikkim",
    coordinates: [27.1760, 88.5280],
    status: "UNDER_REPAIR",
    maxWeightCapacityTons: 18,
    heightClearanceMeters: 4.0,
    waterLevelStatus: "Warning (+1.1m river surge)",
    trafficFlowSpeedKmH: 10,
    bottleneckReason: "Abutment slope stabilization work; alternating direction flow",
    alternateRoute: "Via Reshi - Pedong Mountain Pass"
  },
  {
    id: "INF-BR-07",
    name: "Ratacherra Mudslide River Bridge",
    category: "Bridge",
    highway: "NH-06 / Meghalaya-Assam Border Pass",
    state: "MEGHALAYA",
    district: "West Jaintia Hills",
    coordinates: [25.1850, 92.4820],
    status: "BLOCKED",
    maxWeightCapacityTons: 0,
    heightClearanceMeters: 3.5,
    waterLevelStatus: "Severe Flash Flood / Debris Overflow",
    trafficFlowSpeedKmH: 0,
    bottleneckReason: "Bridge access road washed out by mudslide; BRO clearance in progress",
    alternateRoute: "Via Jowai - Shangpung - Umkiang Bypass"
  },
  {
    id: "INF-BR-08",
    name: "Imphal Sanjenthong River Bridge",
    category: "Bridge",
    highway: "NH-102 / Imphal River Crossing",
    state: "MANIPUR",
    district: "Imphal West",
    coordinates: [24.7980, 93.9450],
    status: "FULLY_ACCESSIBLE",
    maxWeightCapacityTons: 35,
    heightClearanceMeters: 5.0,
    waterLevelStatus: "Normal (-1.5m below warning mark)",
    trafficFlowSpeedKmH: 45,
    bottleneckReason: "Normal essential supply transit",
    alternateRoute: "N/A"
  },
  {
    id: "INF-RD-01",
    name: "NH-06 Jowai - Ratacherra Mountain Highway Pass",
    category: "Road Corridor",
    highway: "NH-06 Corridor",
    state: "MEGHALAYA",
    district: "West Jaintia Hills",
    coordinates: [25.2100, 92.4200],
    status: "PASSABLE_CAUTION",
    maxWeightCapacityTons: 25,
    heightClearanceMeters: 4.5,
    waterLevelStatus: "High Soil Saturation (82%)",
    trafficFlowSpeedKmH: 20,
    bottleneckReason: "Frequent rockfall at Sonapyrdi Tunnel; convoy speed control active",
    alternateRoute: "Via Jowai - Ummulong Road"
  },
  {
    id: "INF-RD-02",
    name: "NH-27 Guwahati - Silchar Expressway Pass",
    category: "Road Corridor",
    highway: "NH-27 / Mahur Pass",
    state: "ASSAM",
    district: "Dima Hasao (Haflong)",
    coordinates: [25.1764, 93.0169],
    status: "PASSABLE_CAUTION",
    maxWeightCapacityTons: 30,
    heightClearanceMeters: 4.8,
    waterLevelStatus: "Localized Water Ponding",
    trafficFlowSpeedKmH: 30,
    bottleneckReason: "Sinking road stretch near Jatinga; heavy trucks move single-file",
    alternateRoute: "Via Umrangso Highway"
  },
  {
    id: "INF-RD-03",
    name: "NH-29 Dimapur - Kohima (Phesama Sinking Ridge)",
    category: "Road Corridor",
    highway: "NH-29 Pass",
    state: "NAGALAND",
    district: "Kohima",
    coordinates: [25.6200, 94.1100],
    status: "PASSABLE_CAUTION",
    maxWeightCapacityTons: 20,
    heightClearanceMeters: 4.2,
    waterLevelStatus: "Ground Subsidence Active",
    trafficFlowSpeedKmH: 25,
    bottleneckReason: "Hillside sinking zone; heavy goods vehicles limited to daytime transit",
    alternateRoute: "Via Peducha - Tssema Bypass"
  },
  {
    id: "INF-RD-04",
    name: "Sela Pass High-Altitude Highway (NH-13)",
    category: "Road Corridor",
    highway: "NH-13 / Trans-Arunachal Highway",
    state: "ARUNACHAL PRADESH",
    district: "Tawang",
    coordinates: [27.5861, 91.8594],
    status: "PASSABLE_CAUTION",
    maxWeightCapacityTons: 18,
    heightClearanceMeters: 4.2,
    waterLevelStatus: "Snow Clearing Operational",
    trafficFlowSpeedKmH: 25,
    bottleneckReason: "Elevation 13,700 ft; anti-skid chains recommended during morning ice",
    alternateRoute: "Via Sela Tunnel Bypass Road"
  },
  {
    id: "INF-RD-05",
    name: "NH-37 Imphal - Jiribam Mountain Highway",
    category: "Road Corridor",
    highway: "NH-37 Corridor",
    state: "MANIPUR",
    district: "Tamenglong",
    coordinates: [24.8170, 93.5000],
    status: "PASSABLE_CAUTION",
    maxWeightCapacityTons: 20,
    heightClearanceMeters: 4.0,
    waterLevelStatus: "Normal Slopes",
    trafficFlowSpeedKmH: 35,
    bottleneckReason: "Baily bridge load control near Noney; escort vehicles present",
    alternateRoute: "Via Churachandpur Trail"
  },
  {
    id: "INF-RD-06",
    name: "Agartala - Sabroom International Highway (NH-8)",
    category: "Road Corridor",
    highway: "NH-8 Southern Tripura Axis",
    state: "TRIPURA",
    district: "South Tripura",
    coordinates: [23.1600, 91.7300],
    status: "FULLY_ACCESSIBLE",
    maxWeightCapacityTons: 40,
    heightClearanceMeters: 5.5,
    waterLevelStatus: "Normal Drainage",
    trafficFlowSpeedKmH: 65,
    bottleneckReason: "Clear 4-lane trade corridor",
    alternateRoute: "N/A"
  }
];

/* =========================================================
   LEAFLET CUSTOM MAP ICONS
========================================================= */
const defaultIcon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const realGpsVehicleIcon = L.divIcon({
  className: "vehicle-marker-real-gps",
  html: `<div style="width:46px;height:46px;border-radius:50%;background:#16a34a;border:3px solid white;box-shadow:0 6px 22px rgba(22,163,74,0.6);display:flex;align-items:center;justify-content:center;font-size:24px;">🚚</div>`,
  iconSize: [46, 46],
  iconAnchor: [23, 23],
});

const incidentMapIcon = L.divIcon({
  className: "incident-marker",
  html: `<div style="width:38px;height:38px;border-radius:50%;background:#dc2626;border:3px solid white;box-shadow:0 6px 20px rgba(220,38,38,0.45);display:flex;align-items:center;justify-content:center;font-size:20px;color:white;">⚠️</div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
});

const bridgeMapIcon = (status) => {
  let bgColor = "#16a34a"; // FULLY_ACCESSIBLE
  if (status === "PASSABLE_CAUTION") bgColor = "#d97706";
  else if (status === "RESTRICTED_LOAD") bgColor = "#9333ea";
  else if (status === "BLOCKED") bgColor = "#dc2626";
  else if (status === "UNDER_REPAIR") bgColor = "#0284c7";

  return L.divIcon({
    className: "bridge-marker",
    html: `<div style="width:42px;height:42px;border-radius:50%;background:${bgColor};border:3px solid white;box-shadow:0 6px 20px ${bgColor}88;display:flex;align-items:center;justify-content:center;font-size:22px;color:white;">🌉</div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
};

const roadMapIcon = (status) => {
  let bgColor = "#16a34a";
  if (status === "PASSABLE_CAUTION") bgColor = "#d97706";
  else if (status === "RESTRICTED_LOAD") bgColor = "#9333ea";
  else if (status === "BLOCKED") bgColor = "#dc2626";
  else if (status === "UNDER_REPAIR") bgColor = "#0284c7";

  return L.divIcon({
    className: "road-marker",
    html: `<div style="width:40px;height:40px;border-radius:12px;background:${bgColor};border:3px solid white;box-shadow:0 6px 18px ${bgColor}77;display:flex;align-items:center;justify-content:center;font-size:20px;color:white;">🛣️</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

const fleetMapIcon = (cargoType) => {
  let emoji = "📦";
  if (cargoType?.includes("Medicine") || cargoType?.includes("Vaccine")) emoji = "💊";
  else if (cargoType?.includes("Food") || cargoType?.includes("Rice")) emoji = "🌾";
  else if (cargoType?.includes("Water") || cargoType?.includes("Relief")) emoji = "🚰";
  else if (cargoType?.includes("Construction")) emoji = "🏗️";

  return L.divIcon({
    className: "fleet-marker",
    html: `<div style="width:40px;height:40px;border-radius:12px;background:#16a34a;border:2px solid white;box-shadow:0 4px 15px rgba(22,163,74,0.4);display:flex;align-items:center;justify-content:center;font-size:22px;color:white;">${emoji}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

/* =========================================================
   ENHANCED MAP VIEW COMPONENT
========================================================= */
function MapView({
  selectedRoute,
  realGpsActive,
  realGpsPosition,
  gpsPosition,
  disruptions = [],
  incidents = [],
  fleetVehicles = [],
  infrastructureList = [],
  onUpdateInfraStatus,
  emergencyMode = false
}) {
  const map = useMap();

  const getPolylinePoints = () => {
    if (selectedRoute?.geometry?.coordinates?.length) {
      return selectedRoute.geometry.coordinates.map((item) => {
        if (Array.isArray(item)) {
          if (item[0] > item[1]) return [item[1], item[0]];
          return [item[0], item[1]];
        }
        return [item.lat || 26.1445, item.lon || 91.7362];
      });
    }
    return [
      [26.1445, 91.7362], // Guwahati
      [25.5788, 91.8933], // Shillong
      [25.2100, 92.4200], // Jowai Pass
      [24.8800, 92.5800], // Badarpur
      [24.8170, 92.7937]  // Silchar
    ];
  };

  const points = getPolylinePoints();

  useEffect(() => {
    if (points.length > 0) {
      map.fitBounds(points, { padding: [50, 50] });
    }
  }, [selectedRoute, map]);

  // Position driven by REAL GPS geolocation sensor
  const activeVehiclePos = realGpsPosition
    ? [realGpsPosition.lat, realGpsPosition.lon]
    : gpsPosition
    ? [gpsPosition.lat, gpsPosition.lon]
    : points[0];

  return (
    <>
      {/* HIGHWAY ROUTE POLYLINE */}
      {points.length > 0 && (
        <>
          {emergencyMode && (
            <Polyline
              positions={points}
              color="#ef4444"
              weight={16}
              opacity={0.35}
            />
          )}
          <Polyline
            positions={points}
            color={emergencyMode ? "#b91c1c" : "#2563eb"}
            weight={emergencyMode ? 8 : 7}
            opacity={0.95}
            dashArray={emergencyMode ? "12, 6" : null}
          />
        </>
      )}

      {/* ORIGIN & DESTINATION MARKERS */}
      {points.length > 0 && (
        <>
          <Marker position={points[0]} icon={defaultIcon}>
            <Popup>
              <strong>{emergencyMode ? "🚨 Emergency Staging Base" : "📍 Route Origin Hub"}</strong>
            </Popup>
          </Marker>
          <Marker position={points[points.length - 1]} icon={defaultIcon}>
            <Popup>
              <strong>{emergencyMode ? "🏁 Critical Disaster Relief Drop Depot" : "🏁 Destination Depot"}</strong>
            </Popup>
          </Marker>
        </>
      )}

      {/* ACTIVE DISRUPTION / HAZARD ZONE OVERLAYS */}
      {disruptions.map((dis) => (
        <CircleMarker
          key={dis.id}
          center={dis.coordinates}
          radius={24}
          pathOptions={{
            color: "#dc2626",
            fillColor: "#ef4444",
            fillOpacity: 0.35,
            weight: 3,
          }}
        >
          <Popup>
            <div style={{ padding: "4px" }}>
              <strong style={{ color: "#b91c1c" }}>⚠️ {dis.type} Alert</strong>
              <br />
              <strong>{dis.corridorName}</strong> ({dis.district})
              <p style={{ margin: "4px 0", fontSize: "12px", color: "#374151" }}>{dis.impact}</p>
              <small style={{ color: "#6d28d9", fontWeight: "bold" }}>🔀 Alternate: {dis.alternateRoute}</small>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {/* FIELD OFFICIAL INCIDENT MARKERS */}
      {incidents.map((inc) => (
        <Marker
          key={inc.id}
          position={[inc.latitude || 26.1445, inc.longitude || 91.7362]}
          icon={incidentMapIcon}
        >
          <Popup>
            <div style={{ maxWidth: "240px", padding: "2px" }}>
              <strong style={{ color: "#dc2626" }}>⚠️ Field Incident: {inc.type}</strong>
              <div style={{ fontSize: "11px", color: "#6b7280", margin: "2px 0" }}>
                📍 {inc.locationName || `${inc.district}, ${inc.state}`}
              </div>
              <p style={{ fontSize: "12px", margin: "4px 0" }}>{inc.note}</p>
              {inc.photoUrl && (
                <img
                  src={inc.photoUrl}
                  alt="Incident evidence"
                  style={{ width: "100%", height: "110px", objectFit: "cover", borderRadius: "8px", marginTop: "6px" }}
                />
              )}
              <div style={{ fontSize: "10px", color: "#16a34a", marginTop: "4px", fontWeight: "bold" }}>
                Status: {inc.syncStatus} • By: {inc.reporter.split("@")[0]}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* MONITORED ROAD & BRIDGE ACCESSIBILITY MARKERS */}
      {infrastructureList.map((infra) => {
        const coords = infra.coordinates || [26.1445, 91.7362];
        const icon = infra.category === "Bridge" ? bridgeMapIcon(infra.status) : roadMapIcon(infra.status);
        const statusColor = infra.status === "FULLY_ACCESSIBLE" ? "#16a34a" : infra.status === "BLOCKED" ? "#dc2626" : infra.status === "RESTRICTED_LOAD" ? "#9333ea" : "#d97706";

        return (
          <Marker key={infra.id} position={coords} icon={icon}>
            <Popup>
              <div style={{ maxWidth: "260px", padding: "4px" }}>
                <strong style={{ color: "#0f3d91", fontSize: "14px" }}>
                  {infra.category === "Bridge" ? "🌉" : "🛣️"} {infra.name}
                </strong>
                <div style={{ fontSize: "11px", color: "#64748b", margin: "2px 0 6px" }}>
                  <strong>{infra.highway}</strong> ({infra.district}, {infra.state})
                </div>

                <div style={{ background: "#f8fafc", padding: "6px 8px", borderRadius: "6px", marginBottom: "6px", fontSize: "11px" }}>
                  <div>Status: <strong style={{ color: statusColor }}>{infra.status.replace(/_/g, " ")}</strong></div>
                  <div>Max Load Limit: <strong>{infra.maxWeightCapacityTons > 0 ? `${infra.maxWeightCapacityTons} Tons` : "BLOCKED"}</strong></div>
                  <div>Water Level: <strong>{infra.waterLevelStatus || "Normal"}</strong></div>
                  <div>Flow Speed: <strong>{infra.trafficFlowSpeedKmH} km/h</strong></div>
                </div>

                <div style={{ fontSize: "11px", color: "#334155", marginBottom: "6px" }}>
                  <strong>Note:</strong> {infra.bottleneckReason || "No bottleneck"}
                </div>
                {infra.alternateRoute && infra.alternateRoute !== "N/A" && (
                  <div style={{ fontSize: "10px", color: "#6d28d9", fontWeight: "bold", marginBottom: "6px" }}>
                    🔀 Bypass: {infra.alternateRoute}
                  </div>
                )}

                {onUpdateInfraStatus && (
                  <div style={{ display: "flex", gap: "4px", marginTop: "6px" }}>
                    <button
                      onClick={() => onUpdateInfraStatus(infra.id, "FULLY_ACCESSIBLE")}
                      style={{ flex: 1, padding: "3px 6px", fontSize: "10px", background: "#16a34a", color: "white", borderRadius: "4px" }}
                    >
                      ✅ Open
                    </button>
                    <button
                      onClick={() => onUpdateInfraStatus(infra.id, "PASSABLE_CAUTION")}
                      style={{ flex: 1, padding: "3px 6px", fontSize: "10px", background: "#d97706", color: "white", borderRadius: "4px" }}
                    >
                      ⚠️ Caution
                    </button>
                    <button
                      onClick={() => onUpdateInfraStatus(infra.id, "BLOCKED")}
                      style={{ flex: 1, padding: "3px 6px", fontSize: "10px", background: "#dc2626", color: "white", borderRadius: "4px" }}
                    >
                      🚨 Block
                    </button>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* ESSENTIAL COMMODITY FLEET VEHICLES */}
      {fleetVehicles.map((fv) => (
        <Marker
          key={fv.id}
          position={[fv.currentLat, fv.currentLon]}
          icon={fleetMapIcon(fv.cargoType)}
        >
          <Popup>
            <div style={{ padding: "4px" }}>
              <strong style={{ color: "#166534" }}>🚚 {fv.vehicleName}</strong>
              <div style={{ fontSize: "12px", color: "#1f2937", margin: "3px 0" }}>
                📦 <strong>Cargo:</strong> {fv.cargoType} ({fv.cargoWeightKg} kg)
              </div>
              <div style={{ fontSize: "11px", color: "#4b5563" }}>
                👤 <strong>Driver:</strong> {fv.driverName} ({fv.contact})
              </div>
              <div style={{ fontSize: "11px", color: "#4b5563" }}>
                📍 <strong>Route:</strong> {fv.origin} ➔ {fv.destination}
              </div>
              <div style={{ fontSize: "11px", color: fv.status === "Delayed" ? "#dc2626" : "#16a34a", marginTop: "4px", fontWeight: "bold" }}>
                Status: {fv.status} ({fv.speedKmH} km/h) • ETA: {fv.etaMinutes} min
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* REAL GPS DRIVEN VEHICLE TRACKER MARKER */}
      {realGpsActive && activeVehiclePos && (
        <Marker position={activeVehiclePos} icon={realGpsVehicleIcon}>
          <Popup>
            <div style={{ padding: "4px" }}>
              <strong style={{ color: "#16a34a" }}>📡 REAL GPS VEHICLE TRACKER ACTIVE</strong>
              <div style={{ fontSize: "12px", margin: "4px 0" }}>
                Latitude: <strong>{activeVehiclePos[0].toFixed(5)}</strong><br />
                Longitude: <strong>{activeVehiclePos[1].toFixed(5)}</strong><br />
                Speed: <strong>{realGpsPosition?.speedKmH || 45} km/h</strong><br />
                GPS Accuracy: <strong>{realGpsPosition?.accuracy || 8} meters</strong>
              </div>
              <span style={{ fontSize: "10px", background: "#dcfce7", color: "#15803d", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>
                ● Real-Time Hardware Geolocation Stream
              </span>
            </div>
          </Popup>
        </Marker>
      )}
    </>
  );
}

/* =========================================================
   MAIN APPLICATION CONTAINER
========================================================= */
function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nerCurrentUser")) || {
        name: "Official Inspector",
        email: "officer@mdoner.gov.in",
        role: "Logistics Manager"
      };
    } catch {
      return { name: "Official Inspector", email: "officer@mdoner.gov.in", role: "Logistics Manager" };
    }
  });

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginRole, setLoginRole] = useState("Logistics Manager");
  const [loginError, setLoginError] = useState("");

  const [isOnline, setIsOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  const [gpsPosition, setGpsPosition] = useState(null);

  const [language, setLanguage] = useState("English");
  const [districtFilter, setDistrictFilter] = useState("All");
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [emergencyDetails, setEmergencyDetails] = useState(null);

  // Route Planning State
  const [source, setSource] = useState("Guwahati, Assam");
  const [destination, setDestination] = useState("Silchar, Assam");
  const [vehicle, setVehicle] = useState("mediumTruck");
  const [routes, setRoutes] = useState(DEFAULT_COMPARISON_ROUTES);
  const [selectedRoute, setSelectedRoute] = useState(DEFAULT_ROUTE_DATA);
  const [destRiskInfo, setDestRiskInfo] = useState(DEFAULT_RISK_INFO);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleEmergencyMode = () => {
    const nextMode = !emergencyMode;
    setEmergencyMode(nextMode);
    let nextVehicle = vehicle;
    if (nextMode && vehicle === "heavyTruck") {
      nextVehicle = "deliveryVan";
      setVehicle("deliveryVan");
    }
    findRoute(nextMode, nextVehicle);

    if (nextMode) {
      triggerMultilingualAlert({
        category: "disaster",
        severity: "critical",
        highway: "NER All Strategic Corridors",
        title: {
          English: "🚨 NDMA & MDoNER DISASTER PROTOCOL ENGAGED",
          Hindi: "🚨 एनडीएमए एवं एमडीओएनईआर आपदा प्रोटोकॉल सक्रिय",
          Assamese: "🚨 এনডিএমএ আৰু এমডিঅ'এনইআৰ দুৰ্যোগ প্ৰটোকল সক্ৰিয়",
          Bengali: "🚨 এনডিএমএ ও এমডিওএনইআর দুর্যোগ প্রটোকল সক্রিয়"
        },
        message: {
          English: "Priority Green Corridor convoy escort active with 100% statutory toll waiver across all NER highways.",
          Hindi: "सभी पूर्वोत्तर राजमार्गों पर 100% टोल छूट के साथ प्राथमिकता ग्रीन कॉरिडोर सक्रिय किया गया।",
          Assamese: "সকলো উত্তৰ-পূব ৰাজপথত ১০০% টোল ৰেহাই আৰু অগ্ৰাধিকাৰমূলক সেউজ কৰিড'ৰ আৰম্ভ কৰা হৈছে।",
          Bengali: "সমস্ত উত্তর-পূর্ব মহাসড়কে ১০০% টোল মকুব সহ অগ্রাধিকারমূলক গ্রিন করিডোর কনভয় কার্যকর হয়েছে।"
        }
      });
    }
  };

  // REAL MULTILINGUAL NOTIFICATION & ALERT SERVICE STATE
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem("nerNotifications");
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });
  const [showNotifCenter, setShowNotifCenter] = useState(false);
  const [notifSoundEnabled, setNotifSoundEnabled] = useState(true);
  const [notifVoiceEnabled, setNotifVoiceEnabled] = useState(false);
  const [notifCategoryFilter, setNotifCategoryFilter] = useState("All");
  const [activeToast, setActiveToast] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem("nerNotifications", JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  const unreadAlertCount = notifications.filter((n) => !n.isRead).length;
  const hasCriticalUnread = notifications.some((n) => !n.isRead && n.severity === "critical");

  const filteredNotifications = notifications.filter((n) => {
    if (notifCategoryFilter === "All") return true;
    return n.category === notifCategoryFilter;
  });

  const triggerMultilingualAlert = (alertData) => {
    const newAlert = {
      id: `NOTIF-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isRead: false,
      ...alertData
    };
    setNotifications((prev) => [newAlert, ...prev]);
    setActiveToast(newAlert);

    if (notifSoundEnabled) {
      playNotificationSound();
    }

    if (notifVoiceEnabled) {
      const spokenText = (newAlert.title[language] || newAlert.title.English || "") + ". " + (newAlert.message[language] || newAlert.message.English || "");
      speakAlertText(spokenText, language);
    }

    setTimeout(() => {
      setActiveToast((curr) => (curr?.id === newAlert.id ? null : curr));
    }, 7000);
  };

  const markAllNotifsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markNotifAsRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const dismissNotif = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    if (window.confirm("Clear all active notifications and alerts?")) {
      setNotifications([]);
      setActiveToast(null);
    }
  };

  const playVoiceAlertForNotif = (notif) => {
    const text = (notif.title[language] || notif.title.English || "") + ". " + (notif.message[language] || notif.message.English || "");
    playNotificationSound();
    speakAlertText(text, language);
  };

  const sendTestMultilingualAlert = () => {
    triggerMultilingualAlert({
      category: "weather",
      severity: "warning",
      highway: "NH-06 / NH-27 Corridor",
      title: {
        English: "⚡ WEATHER ALERT: Heavy Pre-Monsoon Thunderstorms Detected",
        Hindi: "⚡ मौसम चेतावनी: पूर्व-मानसून भारी आंधी-तूफान का अलर्ट",
        Assamese: "⚡ বতৰৰ জাননী: প্ৰাক-বাৰিষাৰ প্ৰবল ধুমুহা-বৰষুণৰ সতৰ্কবাণী",
        Bengali: "⚡ আবহাওয়া সতর্কতা: প্রাক-বর্ষার তীব্র বজ্রবিদ্যুৎ সহ বৃষ্টির সতর্কতা"
      },
      message: {
        English: "High wind gusts and slippery mountain gradients on Shillong to Silchar route. Drivers advised to maintain convoy discipline.",
        Hindi: "शिलांग से सिलचर मार्ग पर तेज हवाएं और फिसलन भरी ढलानें। वाहन चालकों को सावधानी बरतने की सलाह दी गई है।",
        Assamese: "শ্বিলং-শিলচৰ পথত তীব্ৰ বতাহ আৰু পিছল পাহাৰীয়া পথ। চালকসকলক সতৰ্কতা অৱলম্বন কৰিবলৈ পৰামৰ্শ দিয়া হৈছে।",
        Bengali: "শিলং থেকে শিলচর রুটে তীব্র বাতাস ও পিচ্ছিল পাহাড়ি পথ। চালকদের সতর্ক থাকার পরামর্শ দেওয়া হয়েছে।"
      }
    });
  };

  // REAL GPS TELEMETRY TRACKING STATE
  const [realGpsActive, setRealGpsActive] = useState(true);
  const [realGpsPosition, setRealGpsPosition] = useState(null);

  // Weather, Disruptions, Incidents, Infrastructure & Fleet State
  const [weatherData, setWeatherData] = useState(null);
  const [disruptions, setDisruptions] = useState(() => {
    try {
      if (localStorage.getItem("nerOverviewCleared") === "true") return [];
    } catch {}
    return INITIAL_DISRUPTIONS;
  });
  const [incidentsList, setIncidentsList] = useState([]);
  const [fleetVehicles, setFleetVehicles] = useState(INITIAL_FLEET);
  const [districtsMatrix, setDistrictsMatrix] = useState(INITIAL_DISTRICTS);

  // REAL-TIME ROAD & BRIDGE ACCESSIBILITY STATE
  const [infrastructureList, setInfrastructureList] = useState(INITIAL_INFRASTRUCTURE);
  const [infraCategoryFilter, setInfraCategoryFilter] = useState("All");
  const [infraStatusFilter, setInfraStatusFilter] = useState("All");
  const [infraStateFilter, setInfraStateFilter] = useState("All");
  const [infraSearchQuery, setInfraSearchQuery] = useState("");
  const [infraViewMode, setInfraViewMode] = useState("cards");
  const [infraAlerts, setInfraAlerts] = useState([]);

  // New Infrastructure Modal/Form state
  const [newInfraName, setNewInfraName] = useState("");
  const [newInfraCategory, setNewInfraCategory] = useState("Bridge");
  const [newInfraHighway, setNewInfraHighway] = useState("NH-27");
  const [newInfraState, setNewInfraState] = useState("ASSAM");
  const [newInfraDistrict, setNewInfraDistrict] = useState("Kamrup");
  const [newInfraStatus, setNewInfraStatus] = useState("FULLY_ACCESSIBLE");
  const [newInfraWeight, setNewInfraWeight] = useState("35");
  const [newInfraWater, setNewInfraWater] = useState("Normal");
  const [newInfraBottleneck, setNewInfraBottleneck] = useState("");
  const [showAddInfraForm, setShowAddInfraForm] = useState(false);

  // Incident form state
  const [incidentType, setIncidentType] = useState("Landslide");
  const [incidentSeverity, setIncidentSeverity] = useState("High");
  const [incidentNote, setIncidentNote] = useState("");
  const [incidentState, setIncidentState] = useState("MEGHALAYA");
  const [incidentDistrict, setIncidentDistrict] = useState("Jowai / West Jaintia");
  const [incidentLocationName, setIncidentLocationName] = useState("Ratacherra Highway Pass");
  const [incidentPhoto, setIncidentPhoto] = useState(null);
  const [incidentPhotoPreview, setIncidentPhotoPreview] = useState(null);
  const [incidentQueue, setIncidentQueue] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nerIncidentQueue")) || [];
    } catch {
      return [];
    }
  });

  const [savedTrips, setSavedTrips] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nerTrips")) || [];
    } catch {
      return [];
    }
  });

  // Scheduled Trips & Route Search State
  const [isFleetCleared, setIsFleetCleared] = useState(() => {
    try {
      return localStorage.getItem("nerFleetCleared") === "true";
    } catch {
      return false;
    }
  });
  const [tripsList, setTripsList] = useState(() => {
    try {
      if (localStorage.getItem("nerFleetCleared") === "true") {
        return [];
      }
    } catch {}
    return INITIAL_TRIPS_DATA;
  });
  const [routeSearchQuery, setRouteSearchQuery] = useState("");

  // Traffic Data State
  const [trafficList, setTrafficList] = useState([]);
  const [trafficSummaryInfo, setTrafficSummaryInfo] = useState(null);
  const [trafficStateFilter, setTrafficStateFilter] = useState("All");
  const [trafficCongestionFilter, setTrafficCongestionFilter] = useState("All");
  const [trafficSearchQuery, setTrafficSearchQuery] = useState("");

  const t = (key) => TRANSLATIONS[language]?.[key] || TRANSLATIONS.English[key] || key;

  // Real Hardware GPS Sensor Watch (HTML5 Geolocation)
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const liveGps = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          speedKmH: pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 45,
          accuracy: Math.round(pos.coords.accuracy || 8),
          timestamp: new Date().toISOString()
        };
        setGpsPosition(liveGps);
        setRealGpsPosition(liveGps);

        // Send live REAL GPS telemetry to backend endpoint
        fetch("http://localhost:5000/api/fleet/update-gps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vehicleId: "NER-FLEET-1001",
            lat: liveGps.lat,
            lon: liveGps.lon,
            speed: liveGps.speedKmH,
            status: "In Transit (Live REAL GPS)"
          })
        }).catch(() => {});
      },
      (err) => console.warn("GPS Sensor:", err.message),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Initial Fetching
  useEffect(() => {
    fetchDisruptions();
    fetchIncidents();
    fetchFleet();
    fetchDistricts();
    fetchInfrastructure();
    fetchTraffic();
    fetchTrips();
    fetchNotifications();
    fetchWeather(26.1445, 91.7362, "Guwahati");
    findRoute();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/notifications");
      const data = await res.json();
      if (data.notifications?.length) {
        setNotifications((prev) => {
          const existingIds = new Set(prev.map(n => n.id));
          const newItems = data.notifications.filter(n => !existingIds.has(n.id));
          return [...newItems, ...prev];
        });
      }
    } catch (e) {}
  };

  const fetchTrips = async (search = "") => {
    try {
      if (localStorage.getItem("nerFleetCleared") === "true") {
        setTripsList([]);
        return;
      }
      const url = search && search.trim()
        ? `http://localhost:5000/api/trips?search=${encodeURIComponent(search.trim())}`
        : "http://localhost:5000/api/trips";
      const res = await fetch(url);
      const data = await res.json();
      if (data.trips?.length) {
        setTripsList(data.trips);
      }
    } catch (e) {}
  };

  // Sync route search query to backend with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTrips(routeSearchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [routeSearchQuery]);

  // Dynamic Route & Trip search filtering
  const filteredTrips = useMemo(() => {
    let combined = [...tripsList];
    if (savedTrips && savedTrips.length > 0) {
      const mappedSaved = savedTrips.map(st => ({
        id: `SAVED-${st.id}`,
        routeCode: "SAVED-RT",
        routeName: `${st.source} to ${st.destination}`,
        source: st.source,
        destination: st.destination,
        highway: "NER Highway",
        state: "NER",
        vehicleName: st.vehicle === "heavyTruck" ? "Heavy Truck (15T)" : st.vehicle === "deliveryVan" ? "Emergency Van (2.5T)" : "Medium Truck (7.5T)",
        vehicleType: st.vehicle || "mediumTruck",
        status: st.status || "Active",
        driver: "Field Dispatcher",
        cargo: "Essential Delivery Cargo",
        departureTime: st.savedAt || "Recent",
        eta: st.status === "Delivered" ? "Delivered / Completed" : `${st.durationMinutes || 120} min (In Transit)`
      }));
      combined = [...mappedSaved, ...combined];
    }

    if (!routeSearchQuery.trim()) {
      return combined;
    }

    const q = routeSearchQuery.toLowerCase().trim();
    return combined.filter(t =>
      (t.routeName && t.routeName.toLowerCase().includes(q)) ||
      (t.source && t.source.toLowerCase().includes(q)) ||
      (t.destination && t.destination.toLowerCase().includes(q)) ||
      (t.highway && t.highway.toLowerCase().includes(q)) ||
      (t.state && t.state.toLowerCase().includes(q)) ||
      (t.driver && t.driver.toLowerCase().includes(q)) ||
      (t.vehicleName && t.vehicleName.toLowerCase().includes(q)) ||
      (t.cargo && t.cargo.toLowerCase().includes(q)) ||
      (t.status && t.status.toLowerCase().includes(q))
    );
  }, [tripsList, savedTrips, routeSearchQuery]);

  const totalTripsCount = filteredTrips.length;
  const activeTripsCount = filteredTrips.filter(t => t.status.toLowerCase() === "active" || t.status.toLowerCase() === "in transit").length;
  const deliveredTripsCount = filteredTrips.filter(t => t.status.toLowerCase() === "delivered" || t.status.toLowerCase() === "completed").length;

  const fetchTraffic = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/traffic");
      const data = await res.json();
      if (data.corridors?.length) {
        setTrafficList(data.corridors);
        setTrafficSummaryInfo(data);
      }
    } catch (e) {}
  };

  const fetchInfrastructure = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/accessibility/infrastructure");
      const data = await res.json();
      if (data.infrastructure?.length) setInfrastructureList(data.infrastructure);
    } catch (e) {}
  };

  const handleUpdateInfraStatus = async (infraId, newStatus, optionalReason) => {
    try {
      const res = await fetch(`http://localhost:5000/api/accessibility/infrastructure/${infraId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          bottleneckReason: optionalReason || `Status updated to ${newStatus.replace(/_/g, " ")} by operator`
        })
      });
      const data = await res.json();
      if (data.success && data.infrastructure) {
        setInfrastructureList((prev) =>
          prev.map((item) => (item.id === infraId ? data.infrastructure : item))
        );
      } else {
        // Local fallback update
        setInfrastructureList((prev) =>
          prev.map((item) => (item.id === infraId ? { ...item, status: newStatus } : item))
        );
      }
    } catch (e) {
      setInfrastructureList((prev) =>
        prev.map((item) => (item.id === infraId ? { ...item, status: newStatus } : item))
      );
    }
  };

  const submitNewInfrastructure = async (e) => {
    e.preventDefault();
    if (!newInfraName.trim()) return;

    const newObj = {
      name: newInfraName.trim(),
      category: newInfraCategory,
      highway: newInfraHighway,
      state: newInfraState,
      district: newInfraDistrict,
      coordinates: newInfraState === "ASSAM" ? [26.1445, 91.7362] : [25.5788, 91.8933],
      status: newInfraStatus,
      maxWeightCapacityTons: parseFloat(newInfraWeight) || 25,
      heightClearanceMeters: 4.5,
      waterLevelStatus: newInfraWater,
      bottleneckReason: newInfraBottleneck.trim() || "Registered by field controller",
      alternateRoute: "N/A"
    };

    try {
      const res = await fetch("http://localhost:5000/api/accessibility/infrastructure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newObj)
      });
      const data = await res.json();
      if (data.success && data.infrastructure) {
        setInfrastructureList([data.infrastructure, ...infrastructureList]);
      } else {
        setInfrastructureList([{ ...newObj, id: `INF-${Date.now()}` }, ...infrastructureList]);
      }
    } catch (err) {
      setInfrastructureList([{ ...newObj, id: `INF-${Date.now()}` }, ...infrastructureList]);
    }

    setNewInfraName("");
    setNewInfraBottleneck("");
    setShowAddInfraForm(false);
    alert("New road/bridge accessibility monitoring point registered!");
  };

  const fetchWeather = async (lat, lon, location) => {
    try {
      const res = await fetch(`http://localhost:5000/api/weather?lat=${lat}&lon=${lon}&location=${encodeURIComponent(location || "")}`);
      const data = await res.json();
      if (data && data.temperature) setWeatherData(data);
    } catch (e) {}
  };

  const fetchDisruptions = async () => {
    try {
      if (localStorage.getItem("nerOverviewCleared") === "true") {
        setDisruptions([]);
        return;
      }
      const res = await fetch("http://localhost:5000/api/disruptions");
      const data = await res.json();
      if (data.disruptions?.length) setDisruptions(data.disruptions);
    } catch (e) {}
  };

  const fetchIncidents = async () => {
    try {
      if (localStorage.getItem("nerOverviewCleared") === "true") {
        setIncidentsList([]);
        return;
      }
      const res = await fetch("http://localhost:5000/api/incidents");
      const data = await res.json();
      if (data.incidents) setIncidentsList(data.incidents);
    } catch (e) {}
  };

  const fetchFleet = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/fleet");
      const data = await res.json();
      if (data.fleet?.length) setFleetVehicles(data.fleet);
    } catch (e) {}
  };

  const fetchDistricts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/districts");
      const data = await res.json();
      if (data.districts?.length) setDistrictsMatrix(data.districts);
    } catch (e) {}
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError("Please enter both email and password.");
      return;
    }
    const name = loginEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const user = { name, email: loginEmail.trim(), role: loginRole, loginTime: new Date().toISOString() };
    localStorage.setItem("nerCurrentUser", JSON.stringify(user));
    setCurrentUser(user);
    setLoginError("");
  };

  const handleLogout = () => {
    localStorage.removeItem("nerCurrentUser");
    setCurrentUser(null);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIncidentPhoto(reader.result);
        setIncidentPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitIncidentReport = async () => {
    const reportData = {
      type: incidentType,
      severity: incidentSeverity,
      state: incidentState,
      district: incidentDistrict,
      locationName: incidentLocationName,
      note: incidentNote.trim() || "Field incident reported by inspector.",
      latitude: gpsPosition?.lat || 25.5788,
      longitude: gpsPosition?.lon || 91.8933,
      reporter: currentUser?.email || "field_official@mdoner.gov.in",
      photoUrl: incidentPhoto
    };

    try {
      const res = await fetch("http://localhost:5000/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData)
      });
      const data = await res.json();
      if (data.success) {
        alert("Incident report broadcasted successfully!");
        setIncidentsList([data.incident, ...incidentsList]);
        setIncidentNote("");
        setIncidentPhoto(null);
        setIncidentPhotoPreview(null);
      }
    } catch (e) {
      alert("Error submitting incident: " + e.message);
    }
  };

  const saveTrip = (tripStatus = "Active") => {
    if (!selectedRoute) return;
    const tripRecord = {
      id: Date.now(),
      source,
      destination,
      vehicle,
      status: tripStatus,
      distanceKm: selectedRoute.distanceKm,
      durationMinutes: selectedRoute.durationMinutes,
      totalDeliveryCost: selectedRoute.totalDeliveryCost,
      savedAt: new Date().toLocaleString()
    };
    const nextSaved = [tripRecord, ...savedTrips];
    setSavedTrips(nextSaved);
    localStorage.setItem("nerTrips", JSON.stringify(nextSaved));
    alert(tripStatus === "Delivered" ? "Route marked as Delivered in logistics history!" : "Trip saved to Active routes queue!");
  };

  const completeCurrentRoute = () => {
    if (!selectedRoute) return;
    const completedTrip = {
      id: Date.now(),
      source,
      destination,
      vehicle,
      status: "Delivered",
      distanceKm: selectedRoute.distanceKm,
      durationMinutes: selectedRoute.durationMinutes,
      totalDeliveryCost: selectedRoute.totalDeliveryCost,
      savedAt: new Date().toLocaleString()
    };
    const nextSaved = [completedTrip, ...savedTrips.filter(t => !(t.source === source && t.destination === destination))];
    setSavedTrips(nextSaved);
    localStorage.setItem("nerTrips", JSON.stringify(nextSaved));

    triggerMultilingualAlert({
      category: "fleet",
      severity: "info",
      highway: `${source} ➔ ${destination}`,
      title: {
        English: `✅ Delivery Completed: ${destination}`,
        Hindi: `✅ डिलीवरी संपन्न: ${destination}`,
        Assamese: `✅ সৰবৰাহ সম্পূৰ্ণ: ${destination}`,
        Bengali: `✅ ডেলিভারি সম্পন্ন: ${destination}`
      },
      message: {
        English: `Essential cargo transported from ${source} to ${destination} has arrived safely and delivered.`,
        Hindi: `${source} से ${destination} तक आवश्यक सामग्री सुरक्षित पहुंच गई और डिलीवर हो गई।`,
        Assamese: `${source} ৰ পৰা ${destination} লৈ প্ৰয়োজনীয় সামগ্ৰী সফলতাৰে যোগান ধৰা হ'ল।`,
        Bengali: `${source} থেকে ${destination} এ প্রয়োজনীয় পণ্য নিরাপদে পৌঁছেছে এবং ডেলিভারি সম্পন্ন হয়েছে।`
      }
    });

    alert(`🎉 Route Completed! Delivery from ${source} to ${destination} is now Delivered. Delivered count increased by +1!`);
  };

  const clearTripHistory = () => {
    if (window.confirm("Are you sure you want to clear all saved trip history? This will reset all saved routes.")) {
      setSavedTrips([]);
      localStorage.removeItem("nerTrips");
      alert("All saved trip history has been cleared!");
    }
  };

  const clearAllOperationalData = () => {
    if (window.confirm("Do you want to clear ALL data across REAL-TIME LOGISTICS OVERVIEW (Total Trips, Active Trips, Delivered, Active Hazards, and Field Incident Reports to 0)?")) {
      localStorage.setItem("nerOverviewCleared", "true");
      localStorage.setItem("nerFleetCleared", "true");
      setIsFleetCleared(true);
      setTripsList([]);
      setSavedTrips([]);
      setDisruptions([]);
      setIncidentsList([]);
      localStorage.removeItem("nerTrips");
      alert("All 5 metrics across Real-Time Logistics Overview (Trips, Hazards, and Field Reports) are now reset to 0!");
    }
  };

  const restoreOperationalData = () => {
    localStorage.removeItem("nerOverviewCleared");
    localStorage.removeItem("nerFleetCleared");
    setIsFleetCleared(false);
    setTripsList(INITIAL_TRIPS_DATA);
    setDisruptions(INITIAL_DISRUPTIONS);
    fetchTrips(routeSearchQuery);
    fetchDisruptions();
    fetchIncidents();
    alert("Live scheduled fleet operations, active highway hazards, and field incident reports have been restored!");
  };

  const findRoute = async (overrideEmergency = null, overrideVehicle = null) => {
    if (!source.trim() || !destination.trim()) {
      setError("Please enter both source and destination.");
      return;
    }

    setLoading(true);
    setError("");

    const activeEmergency = overrideEmergency !== null ? overrideEmergency : emergencyMode;
    const activeVehicle = overrideVehicle !== null ? overrideVehicle : vehicle;

    try {
      const response = await fetch(
        `http://localhost:5000/api/route?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&vehicle=${activeVehicle}&emergency=${activeEmergency}`
      );
      const data = await response.json();

      if (data.routes?.length) setRoutes(data.routes);
      if (data.destRiskInfo) setDestRiskInfo(data.destRiskInfo);
      if (data.recommendedRoute) setSelectedRoute(data.recommendedRoute);
      if (data.emergencyDetails) setEmergencyDetails(data.emergencyDetails);

      if (data.destinationCoords) {
        fetchWeather(data.destinationCoords.lat, data.destinationCoords.lon, destination);
      }
    } catch (err) {
      console.warn("Route API warning:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const generatePDFReport = (tripData) => {
    const target = tripData || {
      source,
      destination,
      vehicle: vehicle === "heavyTruck" ? "Heavy Truck (15 Ton)" : vehicle === "deliveryVan" ? "Emergency Delivery Van (2.5 Ton)" : "Medium Supply Truck (7.5 Ton)",
      distanceKm: selectedRoute?.distanceKm || 0,
      durationMinutes: selectedRoute?.durationMinutes || 0,
      fuelLitres: selectedRoute?.fuelLitres || 0,
      totalDeliveryCost: selectedRoute?.totalDeliveryCost || 0,
      tollCost: selectedRoute?.tollCost ?? (emergencyMode ? 0 : 500),
      score: selectedRoute?.score || 90,
      date: new Date().toLocaleDateString(),
      isEmergency: emergencyMode
    };

    const doc = new jsPDF();
    const primaryColor = target.isEmergency ? [220, 38, 38] : [37, 99, 235];
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 30, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text(
      target.isEmergency ? "🚨 MDoNER - EMERGENCY DISASTER GREEN CORRIDOR PASS" : "MDoNER - NER Logistics Intelligence Platform",
      14,
      18
    );
    doc.setFontSize(10);
    doc.text("Ministry of Development of North Eastern Region | National Disaster Management Authority", 14, 25);

    doc.setTextColor(17, 24, 39);
    doc.setFontSize(14);
    doc.text(
      target.isEmergency ? "OFFICIAL DISASTER RELIEF GREEN CORRIDOR PASS" : "OFFICIAL DELIVERY ROUTE & ACCESSIBILITY REPORT",
      14,
      42
    );

    doc.setFontSize(10);
    doc.text(`Report Date: ${target.date}`, 14, 52);
    doc.text(`Origin Hub: ${target.source}`, 14, 60);
    doc.text(`Destination Depot: ${target.destination}`, 14, 68);
    doc.text(`Assigned Vehicle Type: ${target.vehicle}`, 14, 76);

    if (target.isEmergency) {
      doc.setTextColor(185, 28, 28);
      doc.setFontSize(10);
      doc.text(`Clearance Token: ${emergencyDetails?.greenCorridorCode || "NER-GC-2026-PRIORITY"} • PRIORITY 1 ESCORT ACTIVE`, 14, 84);
      doc.text("TOLL CHARGES: 100% WAIVED AS PER DISASTER MANAGEMENT ACT, 2005", 14, 90);
      doc.line(14, 94, 196, 94);
    } else {
      doc.line(14, 82, 196, 82);
    }

    const startY = target.isEmergency ? 102 : 92;
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(12);
    doc.text("Route Logistics Metrics", 14, startY);
    doc.setFontSize(10);
    doc.text(`Total Distance: ${target.distanceKm} km`, 20, startY + 10);
    doc.text(`Est. Transit Time: ${Math.floor(target.durationMinutes / 60)}h ${target.durationMinutes % 60}m`, 20, startY + 18);
    doc.text(`Estimated Fuel Consumption: ${target.fuelLitres} Litres`, 20, startY + 26);
    doc.text(`Logistics Score: ${target.score} / 100`, 20, startY + 34);
    doc.text(`Highway Toll Charges: ${target.tollCost === 0 ? "Rs. 0 (Toll-Exempt Under NDMA)" : `Rs. ${target.tollCost}`}`, 20, startY + 42);
    doc.text(`Total Delivery Cost: Rs. ${target.totalDeliveryCost}`, 20, startY + 50);

    const riskY = startY + 62;
    doc.line(14, riskY - 4, 196, riskY - 4);

    doc.setFontSize(12);
    doc.text("Environmental Risk & Hazard Model Evaluation", 14, riskY);
    doc.setFontSize(10);
    doc.text(`Model: ${destRiskInfo?.model || "NER-Environmental-RandomForest-Classifier-v3.2"}`, 20, riskY + 10);
    doc.text(`Risk Status: ${destRiskInfo?.risk || "MEDIUM"} Risk Zone`, 20, riskY + 18);
    doc.text(`Landslide / Flood Probability: ${destRiskInfo?.probabilityPercent || 45}%`, 20, riskY + 26);
    doc.text(`Advisory: ${destRiskInfo?.advisory || "Standard precautions required."}`, 20, riskY + 34);

    doc.setFillColor(243, 244, 246);
    doc.rect(14, riskY + 44, 182, 35, "F");
    doc.setTextColor(55, 65, 81);
    doc.text("Certified by MDoNER Logistics Intelligence Core & NDMA Green Corridor Controller", 20, riskY + 56);
    doc.text("System Generated Document • Valid for Emergency Logistics Priority Movement", 20, riskY + 66);

    doc.save(`NER-${target.isEmergency ? "Emergency-Pass" : "Logistics-Report"}-${target.source}-${target.destination}.pdf`);
  };

  if (!currentUser) {
    return (
      <div className="sih-login-page">
        <div className="sih-login-card">
          <div className="sih-login-header">
            <div className="sih-login-emblem">🏛️</div>
            <span className="sih-login-kicker">GOVERNMENT OF INDIA • MDoNER</span>
            <h1>{t("loginTitle")}</h1>
            <p>{t("loginSubtitle")}</p>
          </div>

          <form onSubmit={handleLogin} className="sih-login-form">
            <div className="form-group">
              <label>{t("emailLabel")}</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="officer@mdoner.gov.in"
                required
              />
            </div>

            <div className="form-group">
              <label>{t("passLabel")}</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>

            <div className="form-group">
              <label>{t("roleLabel")}</label>
              <select value={loginRole} onChange={(e) => setLoginRole(e.target.value)}>
                <option>Logistics Manager</option>
                <option>Fleet Operator</option>
                <option>Field Officer</option>
                <option>Disaster Controller</option>
              </select>
            </div>

            <div className="form-group">
              <label>Language / भाषा</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option>English</option>
                <option>Hindi</option>
                <option>Assamese</option>
                <option>Bengali</option>
              </select>
            </div>

            {loginError && <div className="sih-login-error">❌ {loginError}</div>}

            <button type="submit" className="sih-login-btn">
              🔓 {t("loginBtn")}
            </button>
          </form>

          <div className="sih-login-footer">
            <span>Authorized Access • Ministry of Development of North Eastern Region</span>
          </div>
        </div>
      </div>
    );
  }

  const activeDistrictsList = districtFilter === "All" ? districtsMatrix : districtsMatrix.filter((d) => d.district === districtFilter);

  return (
    <div className={`app ${emergencyMode ? "emergency-active-theme" : ""}`}>
      {/* GLOBAL HEADER */}
      <header className="main-header">
        <div className="brand-title">
          <div>
            <h1>{t("brandTitle")}</h1>
            <p>{t("brandSubtitle")}</p>
          </div>
        </div>

        <div className="sih-user-panel">
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="lang-select">
            <option>English</option>
            <option>Hindi</option>
            <option>Assamese</option>
            <option>Bengali</option>
          </select>

          {/* REAL MULTILINGUAL NOTIFICATION & ALERT BELL */}
          <div className="notif-bell-container">
            <button
              className={`notif-bell-button ${hasCriticalUnread ? "bell-critical-alert" : ""}`}
              onClick={() => setShowNotifCenter(!showNotifCenter)}
              title={`${t("notifTitle")} (${unreadAlertCount} unread)`}
            >
              <span className="bell-icon">🔔</span>
              <span className="bell-label">{t("notifBell")}</span>
              {unreadAlertCount > 0 && (
                <span className={`bell-badge ${hasCriticalUnread ? "badge-critical-pulse" : ""}`}>
                  {unreadAlertCount}
                </span>
              )}
            </button>

            {/* NOTIFICATION CENTER DROPDOWN PANEL */}
            {showNotifCenter && (
              <div className="notif-dropdown-panel" onClick={(e) => e.stopPropagation()}>
                <div className="notif-panel-header">
                  <div className="notif-header-title">
                    <span className="notif-header-icon">🚨</span>
                    <div>
                      <h4>{t("notifTitle")}</h4>
                      <p>{t("notifSubtitle")} • <strong>{language}</strong></p>
                    </div>
                  </div>
                  <button className="notif-close-btn" onClick={() => setShowNotifCenter(false)}>✕</button>
                </div>

                {/* NOTIFICATION CONTROLS BAR */}
                <div className="notif-controls-bar">
                  <button
                    className={`notif-toggle-chip ${notifSoundEnabled ? "active-chip" : ""}`}
                    onClick={() => setNotifSoundEnabled(!notifSoundEnabled)}
                    title="Toggle Audio Chime on alert"
                  >
                    {notifSoundEnabled ? "🔊 Chime: ON" : "🔇 Chime: OFF"}
                  </button>
                  <button
                    className={`notif-toggle-chip ${notifVoiceEnabled ? "active-chip voice-active" : ""}`}
                    onClick={() => {
                      const nextVoice = !notifVoiceEnabled;
                      setNotifVoiceEnabled(nextVoice);
                      if (nextVoice) {
                        speakAlertText(language === "Hindi" ? "आवाज चेतावनी सक्रिय" : language === "Assamese" ? "কণ্ঠস্বৰ সতৰ্কতা সক্ৰিয়" : language === "Bengali" ? "ভয়েস অ্যালার্ট সক্রিয়" : "Multilingual Voice Alerts Active", language);
                      }
                    }}
                    title="Toggle Text-to-Speech Voice Alert Announcement in selected language"
                  >
                    🗣️ {t("voiceAlerts")}: {notifVoiceEnabled ? "ON" : "OFF"}
                  </button>
                  {unreadAlertCount > 0 && (
                    <button className="notif-action-text-btn" onClick={markAllNotifsAsRead}>
                      ✓ {t("markAllRead")}
                    </button>
                  )}
                  <button className="notif-test-btn" onClick={sendTestMultilingualAlert}>
                    📢 {t("testAlert")}
                  </button>
                </div>

                {/* CATEGORY FILTER TABS */}
                <div className="notif-filter-tabs">
                  {["All", "disaster", "weather", "road", "fleet"].map((cat) => (
                    <button
                      key={cat}
                      className={`notif-tab ${notifCategoryFilter === cat ? "active-tab" : ""}`}
                      onClick={() => setNotifCategoryFilter(cat)}
                    >
                      {cat === "All" && "🌐 All Alerts"}
                      {cat === "disaster" && "🚨 Disaster"}
                      {cat === "weather" && "🌧️ Weather"}
                      {cat === "road" && "🛣️ Road/Bridge"}
                      {cat === "fleet" && "🚚 Fleet"}
                    </button>
                  ))}
                </div>

                {/* ALERTS LIST */}
                <div className="notif-alerts-list">
                  {filteredNotifications.length === 0 ? (
                    <div className="notif-empty-state">
                      <span>✅</span>
                      <p>{t("noAlerts")}</p>
                    </div>
                  ) : (
                    filteredNotifications.map((n) => {
                      const localizedTitle = n.title[language] || n.title.English || "";
                      const localizedMessage = n.message[language] || n.message.English || "";
                      return (
                        <div
                          key={n.id}
                          className={`notif-alert-card ${n.severity} ${n.isRead ? "is-read" : "is-unread"}`}
                          onClick={() => markNotifAsRead(n.id)}
                        >
                          <div className="notif-card-header">
                            <div className="notif-card-meta">
                              <span className={`severity-pill ${n.severity}`}>
                                {n.severity.toUpperCase()}
                              </span>
                              {n.highway && <span className="highway-tag">📍 {n.highway}</span>}
                              <span className="timestamp">{n.timestamp}</span>
                            </div>
                            <div className="notif-card-buttons">
                              <button
                                className="listen-alert-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  playVoiceAlertForNotif(n);
                                }}
                                title={`Listen in ${language}`}
                              >
                                🔊 {language}
                              </button>
                              <button
                                className="dismiss-alert-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  dismissNotif(n.id);
                                }}
                                title="Dismiss alert"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                          <h5>{localizedTitle}</h5>
                          <p>{localizedMessage}</p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* FOOTER */}
                {notifications.length > 0 && (
                  <div className="notif-panel-footer">
                    <button className="clear-all-notifs-btn" onClick={clearAllNotifications}>
                      🗑️ Clear All Alerts
                    </button>
                    <span className="notif-lang-indicator">
                      🌐 Auto-translating into <strong>{language}</strong>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            className={`sih-emergency ${emergencyMode ? "active" : ""}`}
            onClick={toggleEmergencyMode}
          >
            {emergencyMode ? "🚨 DISASTER MODE ACTIVE" : "🚨 TOGGLE EMERGENCY MODE"}
          </button>

          <div className="sih-user-meta">
            <strong>{currentUser.name}</strong>
            <span>{currentUser.role}</span>
          </div>
          <button className="sih-logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* REAL-TIME WEATHER INTELLIGENCE BAR */}
      {weatherData && (
        <div className="weather-bar">
          <div className="weather-item">
            <span>🌡️ Temperature</span>
            <strong>{weatherData.temperature}°C</strong>
          </div>
          <div className="weather-item">
            <span>🌧️ Precipitation</span>
            <strong>{weatherData.precipitationMm} mm</strong>
          </div>
          <div className="weather-item">
            <span>💨 Wind Speed</span>
            <strong>{weatherData.windspeed} km/h</strong>
          </div>
          <div className="weather-item">
            <span>🌦️ Condition</span>
            <strong>{weatherData.condition}</strong>
          </div>
          <div className={`weather-badge ${weatherData.isSevere ? "severe" : "normal"}`}>
            {weatherData.isSevere ? "⚠️ SEVERE WEATHER ALERT" : "✅ STABLE TRANSPORT WEATHER"}
          </div>
        </div>
      )}

      {/* DASHBOARD STATS & ROUTE FILTER SECTION */}
      <section className="stats-dashboard-wrapper">
        <div className="stats-header-toolbar">
          <div className="stats-title-group">
            <span className="stats-kicker">📊 REAL-TIME LOGISTICS OVERVIEW</span>
            <h2>Route & Trip Operations</h2>
          </div>
          <div className="stats-search-box">
            <span className="stats-search-icon">🔍</span>
            <input
              type="text"
              id="route-search-bar"
              value={routeSearchQuery}
              onChange={(e) => setRouteSearchQuery(e.target.value)}
              placeholder="Search route by origin, destination, corridor or highway..."
              className="stats-search-input"
            />
            {routeSearchQuery && (
              <button
                className="stats-search-clear"
                onClick={() => setRouteSearchQuery("")}
                title="Clear route search"
              >
                ✕
              </button>
            )}
            <span className="stats-filter-tag">
              {routeSearchQuery ? `Filtered: ${totalTripsCount} routes` : `${totalTripsCount} Routes`}
            </span>
            {isFleetCleared ? (
              <button
                className="stats-restore-fleet-btn"
                onClick={restoreOperationalData}
                title="Restore default scheduled fleet operations"
              >
                🔄 Restore Fleet Data (10 Routes)
              </button>
            ) : (
              <button
                className="stats-clear-fleet-btn"
                onClick={clearAllOperationalData}
                title="Clear all active fleet operations and reset counts to 0"
              >
                🗑️ Clear All Operations (Reset to 0)
              </button>
            )}
            {!isFleetCleared && savedTrips.length > 0 && (
              <button
                className="stats-clear-history-btn"
                onClick={clearTripHistory}
                title="Clear only saved trip history"
              >
                🗑️ Clear History ({savedTrips.length})
              </button>
            )}
          </div>
        </div>

        {/* STATS CARDS ROW: Fully responsive horizontal layout */}
        <div className="analytics-section">
          {/* Card 1: Total Trips */}
          <div className="analytics-card metric-card-total">
            <div className="card-top-row">
              <span className="card-icon">📦</span>
              <span className="card-pill">All Scheduled</span>
            </div>
            <h3>Total Trips</h3>
            <h1>{totalTripsCount}</h1>
            <p>All scheduled routes</p>
          </div>

          {/* Card 2: Active Trips */}
          <div className="analytics-card metric-card-active">
            <div className="card-top-row">
              <span className="card-icon">🚚</span>
              <span className="card-pill active-pill">● Currently Active</span>
            </div>
            <h3>Active Trips</h3>
            <h1 className="active-num">{activeTripsCount}</h1>
            <p>Currently on route</p>
          </div>

          {/* Card 3: Delivered */}
          <div className="analytics-card metric-card-delivered">
            <div className="card-top-row">
              <span className="card-icon">✅</span>
              <span className="card-pill delivered-pill">Completed</span>
            </div>
            <h3>Delivered</h3>
            <h1 className="delivered-num">{deliveredTripsCount}</h1>
            <p>Successfully completed</p>
          </div>

          {/* Card 4: Active Highway Hazards */}
          <div className="analytics-card card-hazards">
            <div className="card-top-row">
              <span className="card-icon">⚠️</span>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <span className="card-pill hazard-pill">{disruptions.length > 0 ? "Active Alerts" : "All Clear"}</span>
                {disruptions.length > 0 ? (
                  <button
                    className="card-quick-clear-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm("Clear active highway hazard alerts to 0?")) {
                        setDisruptions([]);
                      }
                    }}
                    title="Clear active hazard alerts to 0"
                  >
                    ✕ Clear
                  </button>
                ) : (
                  <button
                    className="card-quick-restore-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDisruptions(INITIAL_DISRUPTIONS);
                      fetchDisruptions();
                    }}
                    title="Restore active hazard alerts"
                  >
                    ↺ Reset
                  </button>
                )}
              </div>
            </div>
            <h3>Active Hazards</h3>
            <h1>{disruptions.length}</h1>
            <p>{disruptions.length > 0 ? "Landslides & Floods" : "All clear on highways"}</p>
          </div>

          {/* Card 5: Field Incident Reports */}
          <div className="analytics-card card-incidents">
            <div className="card-top-row">
              <span className="card-icon">📋</span>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <span className="card-pill incident-pill">{incidentsList.length > 0 ? "Sync Live" : "No Reports"}</span>
                {incidentsList.length > 0 ? (
                  <button
                    className="card-quick-clear-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm("Clear all field incident reports to 0?")) {
                        setIncidentsList([]);
                      }
                    }}
                    title="Clear field incident reports to 0"
                  >
                    ✕ Clear
                  </button>
                ) : (
                  <button
                    className="card-quick-restore-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchIncidents();
                    }}
                    title="Sync live field incidents"
                  >
                    ↺ Sync
                  </button>
                )}
              </div>
            </div>
            <h3>Field Incident Reports</h3>
            <h1>{incidentsList.length}</h1>
            <p>{incidentsList.length > 0 ? "Geo-tagged updates" : "No incidents logged"}</p>
          </div>
        </div>
      </section>

      {/* MAIN TWO-COLUMN DASHBOARD */}
      <main className="dashboard">
        {/* ROUTE PLANNER PANEL */}
        <section className="route-planner-panel">
          {emergencyMode && (
            <div className="sih-emergency-panel">
              <div className="sih-emergency-badge">
                <span className="live-siren-dot"></span>
                <span>🚨 NDMA & MDoNER DISASTER PROTOCOL ENGAGED</span>
              </div>
              <h3>Emergency Priority Green Corridor Active</h3>
              <p>
                Priority convoy escort active with 100% statutory toll waiver (Disaster Management Act, 2005). System dynamically reroutes logistics around active landslides and structural road failures.
              </p>
              <div className="emergency-quick-kpis">
                <div className="em-chip">
                  <span>ESCORT STATUS</span>
                  <strong>{emergencyDetails?.trafficEscortAssigned ? "🚓 Escort Cleared" : "🚓 P1 Priority"}</strong>
                </div>
                <div className="em-chip highlight-chip">
                  <span>TOLL CHARGES</span>
                  <strong>₹0 (100% Waived)</strong>
                </div>
                <div className="em-chip">
                  <span>CLEARANCE TOKEN</span>
                  <strong>{emergencyDetails?.greenCorridorCode || "NER-GC-2026-ACTIVE"}</strong>
                </div>
                <div className="em-chip">
                  <span>HAZARD BYPASS</span>
                  <strong style={{ color: "#16a34a" }}>Active Reroute</strong>
                </div>
              </div>
              {emergencyDetails?.safetyRationale && (
                <div className="em-rationale">
                  <strong>Tactical Advisory:</strong> {emergencyDetails.safetyRationale}
                </div>
              )}
            </div>
          )}

          <div className="section-box">
            <div className="box-heading">
              <div>
                <span>{t("routePlanner")}</span>
                <h2>🚚 {t("findRoute")}</h2>
              </div>
            </div>

            <label>📍 {t("sourceLoc")}</label>
            <input type="text" value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. Guwahati, Assam" />

            <label>🏁 {t("destLoc")}</label>
            <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Silchar, Assam" />

            <label>🚛 {t("vehicleType")}</label>
            <select value={vehicle} onChange={(e) => setVehicle(e.target.value)}>
              <option value="heavyTruck">🚛 Heavy Cargo Truck (15 Ton)</option>
              <option value="mediumTruck">🚚 Medium Supply Truck (7.5 Ton)</option>
              <option value="deliveryVan">🚐 Emergency Delivery Van (2.5 Ton)</option>
            </select>

            {error && <div className="error-box">❌ {error}</div>}

            <button className="primary-button" onClick={findRoute} disabled={loading}>
              {loading ? t("calculating") : `🔎 ${t("findRoute")}`}
            </button>
          </div>

          {/* ENVIRONMENTAL RISK ENGINE PANEL */}
          {destRiskInfo && (
            <div className="section-box ai-risk-panel">
              <h3>🌐 {t("environmentalRisk")}</h3>
              <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "8px" }}>
                <strong>Model:</strong> {destRiskInfo.model || "NER-Environmental-RandomForest-Classifier-v3.2"}
              </div>
              <div className="risk-metric-grid">
                <div>
                  <span>Risk Level</span>
                  <strong style={{ color: destRiskInfo.risk === "HIGH" ? "#dc2626" : "#16a34a" }}>
                    {destRiskInfo.risk}
                  </strong>
                </div>
                <div>
                  <span>Landslide/Flood Prob.</span>
                  <strong>{destRiskInfo.probabilityPercent}%</strong>
                </div>
                <div>
                  <span>Terrain Slope</span>
                  <strong>{destRiskInfo.environmentalFeatures?.slopeDegrees || 24}° Slope</strong>
                </div>
              </div>
              <p className="risk-advisory"><strong>Advisory:</strong> {destRiskInfo.advisory}</p>
            </div>
          )}
        </section>

        {/* INTERACTIVE LEAFLET MAP PANEL */}
        <section className="map-panel">
          <div className="map-header">
            <div>
              <span>LEAFLET GIS INTELLIGENCE MAP</span>
              <h2>🗺️ NER Accessibility & Real GPS Map</h2>
            </div>
            <div className="map-live-status">● LIVE REAL GPS STREAM</div>
          </div>

          <div className="big-map">
            <MapContainer center={[26.1445, 91.7362]} zoom={7} style={{ height: "100%", width: "100%" }}>
              <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapView
                selectedRoute={selectedRoute}
                realGpsActive={realGpsActive}
                realGpsPosition={realGpsPosition}
                gpsPosition={gpsPosition}
                disruptions={disruptions}
                incidents={incidentsList}
                fleetVehicles={fleetVehicles}
                infrastructureList={infrastructureList}
                onUpdateInfraStatus={handleUpdateInfraStatus}
                emergencyMode={emergencyMode}
              />
            </MapContainer>
          </div>
        </section>
      </main>

      {/* =========================================================
         REAL-TIME ROAD & BRIDGE ACCESSIBILITY CONTROL ENGINE
      ========================================================= */}
      <section className="full-width-section" id="infrastructure-accessibility">
        <div className="sih-card infra-accessibility-card">
          <div className="sih-card-title flex-between">
            <div>
              <span className="kicker-tag" style={{ background: "#e0e7ff", color: "#3730a3" }}>
                🌉 REAL-TIME LOGISTICS INFRASTRUCTURE MONITORING
              </span>
              <h2 style={{ margin: "4px 0 0", color: "#1e1b4b" }}>{t("bridgeAccessibility")}</h2>
              <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748b" }}>
                Structural weight limits, river water levels, and live road transit status for strategic NER corridors.
              </p>
            </div>
            <button
              className="primary-button"
              onClick={() => setShowAddInfraForm(!showAddInfraForm)}
              style={{ width: "auto", padding: "8px 16px", background: "#4f46e5" }}
            >
              {showAddInfraForm ? "✖ Close Form" : `➕ ${t("addInfrastructure")}`}
            </button>
          </div>

          {/* ADD NEW INFRASTRUCTURE REGISTRATION FORM */}
          {showAddInfraForm && (
            <div className="add-infra-form-box" style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #cbd5e1", marginBottom: "20px" }}>
              <h4 style={{ marginTop: 0, color: "#1e293b" }}>✍ Register Monitored Bridge or Road Passage</h4>
              <form onSubmit={submitNewInfrastructure} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "bold" }}>Name of Structure / Corridor</label>
                  <input
                    type="text"
                    value={newInfraName}
                    onChange={(e) => setNewInfraName(e.target.value)}
                    placeholder="e.g. Kolhia Bhomora Bridge"
                    required
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "bold" }}>Category</label>
                  <select
                    value={newInfraCategory}
                    onChange={(e) => setNewInfraCategory(e.target.value)}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  >
                    <option value="Bridge">Bridge Structure</option>
                    <option value="Road Corridor">Road Highway Pass</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "bold" }}>Highway / River Route</label>
                  <input
                    type="text"
                    value={newInfraHighway}
                    onChange={(e) => setNewInfraHighway(e.target.value)}
                    placeholder="e.g. NH-715 / Brahmaputra Pass"
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "bold" }}>State</label>
                  <select
                    value={newInfraState}
                    onChange={(e) => setNewInfraState(e.target.value)}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  >
                    <option value="ASSAM">ASSAM</option>
                    <option value="MEGHALAYA">MEGHALAYA</option>
                    <option value="SIKKIM">SIKKIM</option>
                    <option value="NAGALAND">NAGALAND</option>
                    <option value="MANIPUR">MANIPUR</option>
                    <option value="ARUNACHAL PRADESH">ARUNACHAL PRADESH</option>
                    <option value="TRIPURA">TRIPURA</option>
                    <option value="MIZORAM">MIZORAM</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "bold" }}>District</label>
                  <input
                    type="text"
                    value={newInfraDistrict}
                    onChange={(e) => setNewInfraDistrict(e.target.value)}
                    placeholder="e.g. Sonitpur"
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "bold" }}>Accessibility Status</label>
                  <select
                    value={newInfraStatus}
                    onChange={(e) => setNewInfraStatus(e.target.value)}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  >
                    <option value="FULLY_ACCESSIBLE">FULLY ACCESSIBLE</option>
                    <option value="PASSABLE_CAUTION">PASSABLE CAUTION</option>
                    <option value="RESTRICTED_LOAD">RESTRICTED LOAD</option>
                    <option value="BLOCKED">BLOCKED / CLOSED</option>
                    <option value="UNDER_REPAIR">UNDER REPAIR</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "bold" }}>Max Load Limit (Tons)</label>
                  <input
                    type="number"
                    value={newInfraWeight}
                    onChange={(e) => setNewInfraWeight(e.target.value)}
                    placeholder="35"
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "bold" }}>River Water Level Status</label>
                  <input
                    type="text"
                    value={newInfraWater}
                    onChange={(e) => setNewInfraWater(e.target.value)}
                    placeholder="Normal (-2.5m)"
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: "12px", fontWeight: "bold" }}>Bottleneck Reason / Field Note</label>
                  <input
                    type="text"
                    value={newInfraBottleneck}
                    onChange={(e) => setNewInfraBottleneck(e.target.value)}
                    placeholder="e.g. Single-lane bottleneck due to repair works"
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
                <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
                  <button type="submit" className="primary-button" style={{ width: "200px" }}>
                    🚀 Save & Broadcast Status
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* INFRASTRUCTURE SUMMARY KPI CHIPS */}
          <div className="infra-kpi-bar" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px", margin: "16px 0" }}>
            <div className="infra-kpi-chip" style={{ background: "#f1f5f9", padding: "10px 14px", borderRadius: "8px", borderLeft: "4px solid #64748b" }}>
              <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "bold" }}>TOTAL MONITORED</span>
              <h2 style={{ margin: "2px 0 0", color: "#0f172a" }}>{infrastructureList.length}</h2>
            </div>
            <div className="infra-kpi-chip" style={{ background: "#f0fdf4", padding: "10px 14px", borderRadius: "8px", borderLeft: "4px solid #16a34a" }}>
              <span style={{ fontSize: "11px", color: "#166534", fontWeight: "bold" }}>{t("accessibleCount").toUpperCase()}</span>
              <h2 style={{ margin: "2px 0 0", color: "#15803d" }}>
                {infrastructureList.filter((i) => i.status === "FULLY_ACCESSIBLE").length}
              </h2>
            </div>
            <div className="infra-kpi-chip" style={{ background: "#fffbe6", padding: "10px 14px", borderRadius: "8px", borderLeft: "4px solid #d97706" }}>
              <span style={{ fontSize: "11px", color: "#92400e", fontWeight: "bold" }}>CAUTION / RESTRICTED</span>
              <h2 style={{ margin: "2px 0 0", color: "#b45309" }}>
                {infrastructureList.filter((i) => i.status === "PASSABLE_CAUTION" || i.status === "RESTRICTED_LOAD").length}
              </h2>
            </div>
            <div className="infra-kpi-chip" style={{ background: "#fef2f2", padding: "10px 14px", borderRadius: "8px", borderLeft: "4px solid #dc2626" }}>
              <span style={{ fontSize: "11px", color: "#991b1b", fontWeight: "bold" }}>{t("blockedCount").toUpperCase()}</span>
              <h2 style={{ margin: "2px 0 0", color: "#b91c1c" }}>
                {infrastructureList.filter((i) => i.status === "BLOCKED").length}
              </h2>
            </div>
            <div className="infra-kpi-chip" style={{ background: "#f0f9ff", padding: "10px 14px", borderRadius: "8px", borderLeft: "4px solid #0284c7" }}>
              <span style={{ fontSize: "11px", color: "#075985", fontWeight: "bold" }}>{t("underRepairCount").toUpperCase()}</span>
              <h2 style={{ margin: "2px 0 0", color: "#0369a1" }}>
                {infrastructureList.filter((i) => i.status === "UNDER_REPAIR").length}
              </h2>
            </div>
          </div>

          {/* FILTERS & SEARCH TOOLBAR */}
          <div className="infra-filters-toolbar" style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center", background: "#f8fafc", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <input
                type="text"
                value={infraSearchQuery}
                onChange={(e) => setInfraSearchQuery(e.target.value)}
                placeholder={t("searchInfra")}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
              />
            </div>
            <div>
              <select
                value={infraCategoryFilter}
                onChange={(e) => setInfraCategoryFilter(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white" }}
              >
                <option value="All">Category: All</option>
                <option value="Bridge">Category: Bridge</option>
                <option value="Road Corridor">Category: Road Corridor</option>
              </select>
            </div>
            <div>
              <select
                value={infraStateFilter}
                onChange={(e) => setInfraStateFilter(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white" }}
              >
                <option value="All">State: All States</option>
                <option value="ASSAM">ASSAM</option>
                <option value="MEGHALAYA">MEGHALAYA</option>
                <option value="SIKKIM">SIKKIM</option>
                <option value="NAGALAND">NAGALAND</option>
                <option value="MANIPUR">MANIPUR</option>
                <option value="ARUNACHAL PRADESH">ARUNACHAL PRADESH</option>
                <option value="TRIPURA">TRIPURA</option>
              </select>
            </div>
            <div>
              <select
                value={infraStatusFilter}
                onChange={(e) => setInfraStatusFilter(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white" }}
              >
                <option value="All">Status: All Statuses</option>
                <option value="FULLY_ACCESSIBLE">FULLY ACCESSIBLE</option>
                <option value="PASSABLE_CAUTION">PASSABLE CAUTION</option>
                <option value="RESTRICTED_LOAD">RESTRICTED LOAD</option>
                <option value="BLOCKED">BLOCKED</option>
                <option value="UNDER_REPAIR">UNDER REPAIR</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                onClick={() => setInfraViewMode("cards")}
                style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", background: infraViewMode === "cards" ? "#4f46e5" : "white", color: infraViewMode === "cards" ? "white" : "#334155" }}
              >
                🎴 Cards View
              </button>
              <button
                onClick={() => setInfraViewMode("table")}
                style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", background: infraViewMode === "table" ? "#4f46e5" : "white", color: infraViewMode === "table" ? "white" : "#334155" }}
              >
                📋 Matrix Table
              </button>
            </div>
          </div>

          {/* FILTERED INFRASTRUCTURE LISTING */}
          {(() => {
            const filtered = infrastructureList.filter((item) => {
              const matchesSearch =
                !infraSearchQuery ||
                item.name.toLowerCase().includes(infraSearchQuery.toLowerCase()) ||
                item.highway.toLowerCase().includes(infraSearchQuery.toLowerCase()) ||
                item.district.toLowerCase().includes(infraSearchQuery.toLowerCase()) ||
                item.state.toLowerCase().includes(infraSearchQuery.toLowerCase());

              const matchesCat = infraCategoryFilter === "All" || item.category === infraCategoryFilter;
              const matchesState = infraStateFilter === "All" || item.state.toUpperCase() === infraStateFilter.toUpperCase();
              const matchesStatus = infraStatusFilter === "All" || item.status === infraStatusFilter;

              return matchesSearch && matchesCat && matchesState && matchesStatus;
            });

            if (filtered.length === 0) {
              return (
                <div style={{ textStyle: "center", padding: "30px", background: "#f8fafc", borderRadius: "8px", textAlign: "center" }}>
                  <p style={{ color: "#64748b" }}>No infrastructure entries match the selected filters.</p>
                </div>
              );
            }

            if (infraViewMode === "table") {
              return (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
                        <th style={{ padding: "10px", borderBottom: "2px solid #cbd5e1" }}>Structure Name</th>
                        <th style={{ padding: "10px", borderBottom: "2px solid #cbd5e1" }}>Category</th>
                        <th style={{ padding: "10px", borderBottom: "2px solid #cbd5e1" }}>Highway / Location</th>
                        <th style={{ padding: "10px", borderBottom: "2px solid #cbd5e1" }}>Status</th>
                        <th style={{ padding: "10px", borderBottom: "2px solid #cbd5e1" }}>Max Load</th>
                        <th style={{ padding: "10px", borderBottom: "2px solid #cbd5e1" }}>Water Level</th>
                        <th style={{ padding: "10px", borderBottom: "2px solid #cbd5e1" }}>Speed Limit</th>
                        <th style={{ padding: "10px", borderBottom: "2px solid #cbd5e1" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((item) => {
                        const statusColor =
                          item.status === "FULLY_ACCESSIBLE"
                            ? "#16a34a"
                            : item.status === "BLOCKED"
                            ? "#dc2626"
                            : item.status === "RESTRICTED_LOAD"
                            ? "#9333ea"
                            : "#d97706";

                        return (
                          <tr key={item.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                            <td style={{ padding: "10px", fontWeight: "bold" }}>
                              {item.category === "Bridge" ? "🌉" : "🛣️"} {item.name}
                            </td>
                            <td style={{ padding: "10px" }}>{item.category}</td>
                            <td style={{ padding: "10px" }}>{item.highway} ({item.district}, {item.state})</td>
                            <td style={{ padding: "10px" }}>
                              <span style={{ background: `${statusColor}18`, color: statusColor, padding: "4px 8px", borderRadius: "12px", fontWeight: "bold", fontSize: "11px" }}>
                                {item.status.replace(/_/g, " ")}
                              </span>
                            </td>
                            <td style={{ padding: "10px" }}>{item.maxWeightCapacityTons > 0 ? `${item.maxWeightCapacityTons} T` : "0 T"}</td>
                            <td style={{ padding: "10px" }}>{item.waterLevelStatus || "Normal"}</td>
                            <td style={{ padding: "10px" }}>{item.trafficFlowSpeedKmH} km/h</td>
                            <td style={{ padding: "10px" }}>
                              <select
                                value={item.status}
                                onChange={(e) => handleUpdateInfraStatus(item.id, e.target.value)}
                                style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "11px" }}
                              >
                                <option value="FULLY_ACCESSIBLE">FULLY ACCESSIBLE</option>
                                <option value="PASSABLE_CAUTION">PASSABLE CAUTION</option>
                                <option value="RESTRICTED_LOAD">RESTRICTED LOAD</option>
                                <option value="BLOCKED">BLOCKED</option>
                                <option value="UNDER_REPAIR">UNDER REPAIR</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            }

            return (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
                {filtered.map((item) => {
                  const statusBg =
                    item.status === "FULLY_ACCESSIBLE"
                      ? "#f0fdf4"
                      : item.status === "BLOCKED"
                      ? "#fef2f2"
                      : item.status === "RESTRICTED_LOAD"
                      ? "#faf5ff"
                      : "#fffbe6";

                  const statusColor =
                    item.status === "FULLY_ACCESSIBLE"
                      ? "#15803d"
                      : item.status === "BLOCKED"
                      ? "#b91c1c"
                      : item.status === "RESTRICTED_LOAD"
                      ? "#7e22ce"
                      : "#b45309";

                  const badgeBorder =
                    item.status === "FULLY_ACCESSIBLE"
                      ? "#16a34a"
                      : item.status === "BLOCKED"
                      ? "#dc2626"
                      : item.status === "RESTRICTED_LOAD"
                      ? "#9333ea"
                      : "#d97706";

                  return (
                    <div
                      key={item.id}
                      style={{
                        background: "white",
                        borderRadius: "10px",
                        border: `1px solid ${badgeBorder}44`,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        padding: "16px",
                        display: "flex",
                        flexDirection: "column",
                        justify: "space-between"
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                          <span style={{ fontSize: "11px", fontWeight: "bold", background: "#f1f5f9", padding: "2px 8px", borderRadius: "4px", color: "#475569" }}>
                            {item.category === "Bridge" ? "🌉 BRIDGE" : "🛣️ ROAD PASS"}
                          </span>
                          <span style={{ background: statusBg, color: statusColor, border: `1px solid ${badgeBorder}`, padding: "3px 8px", borderRadius: "12px", fontSize: "10px", fontWeight: "bold" }}>
                            ● {item.status.replace(/_/g, " ")}
                          </span>
                        </div>

                        <h3 style={{ margin: "4px 0 2px", fontSize: "15px", color: "#0f172a" }}>{item.name}</h3>
                        <p style={{ margin: "0 0 10px", fontSize: "12px", color: "#64748b" }}>
                          <strong>{item.highway}</strong> • {item.district}, {item.state}
                        </p>

                        <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11px", marginBottom: "10px" }}>
                          <div>
                            <span style={{ color: "#64748b", display: "block" }}>⚖️ Max Capacity</span>
                            <strong style={{ color: "#0f172a" }}>{item.maxWeightCapacityTons > 0 ? `${item.maxWeightCapacityTons} Tons` : "CLOSED"}</strong>
                          </div>
                          <div>
                            <span style={{ color: "#64748b", display: "block" }}>🌊 Water Level</span>
                            <strong style={{ color: "#0f172a" }}>{item.waterLevelStatus || "Normal"}</strong>
                          </div>
                          <div>
                            <span style={{ color: "#64748b", display: "block" }}>🚘 Flow Speed</span>
                            <strong style={{ color: "#0f172a" }}>{item.trafficFlowSpeedKmH} km/h</strong>
                          </div>
                          <div>
                            <span style={{ color: "#64748b", display: "block" }}>📏 Clearance</span>
                            <strong style={{ color: "#0f172a" }}>{item.heightClearanceMeters || 4.5}m</strong>
                          </div>
                        </div>

                        {item.bottleneckReason && (
                          <div style={{ fontSize: "11px", color: "#334155", marginBottom: "8px", background: "#fff", padding: "6px", borderRadius: "6px", border: "1px borderless #e2e8f0" }}>
                            <strong>Advisory:</strong> {item.bottleneckReason}
                          </div>
                        )}

                        {item.alternateRoute && item.alternateRoute !== "N/A" && (
                          <div style={{ fontSize: "10px", color: "#6d28d9", fontWeight: "bold", marginBottom: "10px" }}>
                            🔀 Alternate Bypass: {item.alternateRoute}
                          </div>
                        )}
                      </div>

                      <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "10px", marginTop: "6px" }}>
                        <label style={{ fontSize: "10px", color: "#64748b", fontWeight: "bold", display: "block", marginBottom: "4px" }}>
                          UPDATE OPERATIONAL STATUS:
                        </label>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px" }}>
                          <button
                            onClick={() => handleUpdateInfraStatus(item.id, "FULLY_ACCESSIBLE")}
                            style={{ padding: "4px", fontSize: "10px", background: item.status === "FULLY_ACCESSIBLE" ? "#16a34a" : "#f1f5f9", color: item.status === "FULLY_ACCESSIBLE" ? "white" : "#334155", borderRadius: "4px", border: "none" }}
                          >
                            ✅ Open
                          </button>
                          <button
                            onClick={() => handleUpdateInfraStatus(item.id, "PASSABLE_CAUTION")}
                            style={{ padding: "4px", fontSize: "10px", background: item.status === "PASSABLE_CAUTION" ? "#d97706" : "#f1f5f9", color: item.status === "PASSABLE_CAUTION" ? "white" : "#334155", borderRadius: "4px", border: "none" }}
                          >
                            ⚠️ Caution
                          </button>
                          <button
                            onClick={() => handleUpdateInfraStatus(item.id, "BLOCKED")}
                            style={{ padding: "4px", fontSize: "10px", background: item.status === "BLOCKED" ? "#dc2626" : "#f1f5f9", color: item.status === "BLOCKED" ? "white" : "#334155", borderRadius: "4px", border: "none" }}
                          >
                            🚨 Block
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </section>

      {/* =========================================================
         REAL-TIME TRAFFIC & HIGHWAY CONGESTION ENGINE
      ========================================================= */}
      <section className="full-width-section" id="realtime-traffic">
        <div className="sih-card traffic-engine-card">
          <div className="sih-card-title flex-between">
            <div>
              <span className="kicker-tag" style={{ background: "#fef3c7", color: "#92400e" }}>
                🚦 REAL-TIME HIGHWAY TRAFFIC & CONGESTION INTELLIGENCE
              </span>
              <h2 style={{ margin: "4px 0 0", color: "#1e1b4b" }}>Real-Time Traffic Data & Bottleneck Stream</h2>
              <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748b" }}>
                Live transit flow speeds, jam factors, queue delays, and active corridor congestion across North Eastern highways.
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", padding: "6px 12px", borderRadius: "8px", textAlign: "center" }}>
                <span style={{ fontSize: "10px", color: "#991b1b", fontWeight: "bold" }}>SYSTEM CONGESTION</span>
                <h3 style={{ margin: 0, color: "#dc2626" }}>{trafficSummaryInfo?.overallAverageCongestionPercent || 48}%</h3>
              </div>
              <div style={{ background: "#eff6ff", border: "1px solid #93c5fd", padding: "6px 12px", borderRadius: "8px", textAlign: "center" }}>
                <span style={{ fontSize: "10px", color: "#1e40af", fontWeight: "bold" }}>MONITORED CORRIDORS</span>
                <h3 style={{ margin: 0, color: "#2563eb" }}>{trafficList.length}</h3>
              </div>
            </div>
          </div>

          {/* TRAFFIC SEARCH & FILTERS TOOLBAR */}
          <div className="traffic-filters-toolbar" style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center", background: "#fffbe6", padding: "12px", borderRadius: "8px", margin: "16px 0" }}>
            <div style={{ flex: 1, minWidth: "220px" }}>
              <input
                type="text"
                value={trafficSearchQuery}
                onChange={(e) => setTrafficSearchQuery(e.target.value)}
                placeholder="Search Highway Name, Corridor, or State..."
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #fcd34d" }}
              />
            </div>
            <div>
              <select
                value={trafficStateFilter}
                onChange={(e) => setTrafficStateFilter(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #fcd34d", background: "white" }}
              >
                <option value="All">State: All States</option>
                <option value="ASSAM">ASSAM</option>
                <option value="MEGHALAYA">MEGHALAYA</option>
                <option value="SIKKIM">SIKKIM</option>
                <option value="NAGALAND">NAGALAND</option>
                <option value="MANIPUR">MANIPUR</option>
                <option value="ARUNACHAL PRADESH">ARUNACHAL PRADESH</option>
                <option value="TRIPURA">TRIPURA</option>
              </select>
            </div>
            <div>
              <select
                value={trafficCongestionFilter}
                onChange={(e) => setTrafficCongestionFilter(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #fcd34d", background: "white" }}
              >
                <option value="All">Congestion: All Levels</option>
                <option value="Low">Low Congestion</option>
                <option value="Moderate">Moderate Congestion</option>
                <option value="Heavy">Heavy Congestion</option>
              </select>
            </div>
          </div>

          {/* TRAFFIC CORRIDOR CARDS GRID */}
          {(() => {
            const filteredTraffic = trafficList.filter((item) => {
              const matchesSearch =
                !trafficSearchQuery ||
                item.highwayName.toLowerCase().includes(trafficSearchQuery.toLowerCase()) ||
                item.segment.toLowerCase().includes(trafficSearchQuery.toLowerCase()) ||
                item.state.toLowerCase().includes(trafficSearchQuery.toLowerCase());

              const matchesState = trafficStateFilter === "All" || item.state.toUpperCase() === trafficStateFilter.toUpperCase();
              const matchesCongestion = trafficCongestionFilter === "All" || item.congestionLevel.toLowerCase() === trafficCongestionFilter.toLowerCase();

              return matchesSearch && matchesState && matchesCongestion;
            });

            if (filteredTraffic.length === 0) {
              return (
                <div style={{ textAlign: "center", padding: "24px", background: "#fafafa", borderRadius: "8px" }}>
                  <p style={{ color: "#71717a" }}>No traffic corridor data matches the selected query.</p>
                </div>
              );
            }

            return (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: "16px" }}>
                {filteredTraffic.map((item) => {
                  const congColor =
                    item.congestionLevel === "Low"
                      ? "#16a34a"
                      : item.congestionLevel === "Heavy"
                      ? "#dc2626"
                      : "#d97706";

                  const congBg =
                    item.congestionLevel === "Low"
                      ? "#f0fdf4"
                      : item.congestionLevel === "Heavy"
                      ? "#fef2f2"
                      : "#fffbe6";

                  return (
                    <div
                      key={item.corridorId}
                      style={{
                        background: "white",
                        borderRadius: "10px",
                        border: `1px solid ${congColor}33`,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                        padding: "16px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between"
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ fontSize: "10px", fontWeight: "bold", background: "#f1f5f9", padding: "2px 8px", borderRadius: "4px", color: "#475569" }}>
                            {item.state} • {item.corridorId}
                          </span>
                          <span style={{ background: congBg, color: congColor, border: `1px solid ${congColor}`, padding: "2px 8px", borderRadius: "12px", fontSize: "10px", fontWeight: "bold" }}>
                            ● {item.congestionLevel.toUpperCase()} CONGESTION ({item.congestionIndexPercent}%)
                          </span>
                        </div>

                        <h4 style={{ margin: "4px 0 2px", fontSize: "14px", color: "#0f172a" }}>{item.highwayName}</h4>
                        <p style={{ margin: "0 0 10px", fontSize: "11px", color: "#64748b" }}>
                          📍 {item.segment}
                        </p>

                        {/* CONGESTION PROGRESS BAR */}
                        <div style={{ margin: "8px 0" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#64748b", marginBottom: "3px" }}>
                            <span>Congestion Level</span>
                            <strong>Jam Factor: {item.jamFactor}/10</strong>
                          </div>
                          <div style={{ width: "100%", height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                            <div style={{ width: `${item.congestionIndexPercent}%`, height: "100%", background: congColor, borderRadius: "4px" }} />
                          </div>
                        </div>

                        <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", fontSize: "11px", marginBottom: "10px", textAlign: "center" }}>
                          <div>
                            <span style={{ color: "#64748b", display: "block", fontSize: "10px" }}>🚗 Avg Speed</span>
                            <strong style={{ color: "#0f172a" }}>{item.averageSpeedKmH} km/h</strong>
                          </div>
                          <div>
                            <span style={{ color: "#64748b", display: "block", fontSize: "10px" }}>🏁 Free Flow</span>
                            <strong style={{ color: "#0f172a" }}>{item.freeFlowSpeedKmH} km/h</strong>
                          </div>
                          <div>
                            <span style={{ color: "#64748b", display: "block", fontSize: "10px" }}>⏱️ Queue Delay</span>
                            <strong style={{ color: congColor }}>+{item.delayMinutes} min</strong>
                          </div>
                        </div>

                        {item.bottlenecks?.length > 0 && (
                          <div style={{ fontSize: "10px", color: "#475569", background: "#f1f5f9", padding: "6px 8px", borderRadius: "6px" }}>
                            <strong>🚧 Bottleneck Points:</strong> {item.bottlenecks.join(", ")}
                          </div>
                        )}
                      </div>

                      <div style={{ fontSize: "9px", color: "#94a3b8", textAlign: "right", marginTop: "8px" }}>
                        Telemetry Live • Updated {new Date(item.lastUpdated).toLocaleTimeString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </section>

      {/* RECOMMENDED OPTIMAL ROUTE CARD */}
      {selectedRoute && (
        <section className="full-width-section">
          <div className={`sih-card route-recommendation-card ${emergencyMode ? "emergency-recommendation" : ""}`}>
            <div className="sih-card-title">
              <div>
                <span className={`kicker-tag ${emergencyMode ? "emergency-kicker" : ""}`}>
                  {emergencyMode ? "🚨 EMERGENCY GREEN CORRIDOR (PRIORITY DISPATCH)" : `🏆 ${t("bestRoute")}`}
                </span>
                <h2>{source} ➔ {destination}</h2>
              </div>
              <div className="score-badge">
                {emergencyMode ? "Emergency Safety Rating: " : "Logistics Score: "}
                <strong>{selectedRoute.score || 95}/100</strong>
              </div>
            </div>

            <div className="route-metrics-grid">
              <div className="metric-box">
                <span>📏 Total Distance</span>
                <strong>{selectedRoute.distanceKm} km</strong>
              </div>
              <div className="metric-box">
                <span>⏱️ {emergencyMode ? "Priority Transit Time" : "Travel Time (incl. delay)"}</span>
                <strong>{Math.floor(selectedRoute.durationMinutes / 60)}h {selectedRoute.durationMinutes % 60}m</strong>
              </div>
              <div className="metric-box">
                <span>⛽ Fuel Est.</span>
                <strong>{selectedRoute.fuelLitres} Litres</strong>
              </div>
              <div className="metric-box">
                <span>⚠️ Environmental Delay</span>
                <strong>+{selectedRoute.environmentalDelayMinutes || 0} min</strong>
              </div>
              <div className="metric-box highlight">
                <span>💰 Total Delivery Cost</span>
                <strong>₹{(selectedRoute.totalDeliveryCost || 0).toLocaleString()}</strong>
                {emergencyMode && selectedRoute.tollCost === 0 && (
                  <span className="zero-toll-pill">🎉 ₹0 Toll (Disaster Exempt)</span>
                )}
              </div>
            </div>

            <div className="route-actions-bar">
              <button
                className={`secondary-button ${realGpsActive ? "active-gps-btn" : ""}`}
                onClick={() => setRealGpsActive(!realGpsActive)}
                style={{ background: realGpsActive ? "#16a34a" : "#2563eb", color: "white" }}
              >
                {realGpsActive ? "📡 REAL GPS TRACKING ACTIVE" : "📍 ACTIVATE REAL GPS TRACKER"}
              </button>
              <button
                className="complete-route-btn"
                onClick={completeCurrentRoute}
                style={{
                  background: savedTrips.some(t => t.source === source && t.destination === destination && t.status === "Delivered") ? "#15803d" : "#16a34a",
                  color: "white",
                  fontWeight: "bold",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 4px 12px rgba(22,163,74,0.3)"
                }}
                title="Mark this route as completed to increase the Delivered count in the overview"
              >
                {savedTrips.some(t => t.source === source && t.destination === destination && t.status === "Delivered")
                  ? "✅ Route Delivered"
                  : "🏁 Complete Route (Mark Delivered)"}
              </button>
              <button className="secondary-button" onClick={() => saveTrip("Active")}>
                💾 Save Route (Active)
              </button>
              {savedTrips.length > 0 && (
                <button
                  className="secondary-button"
                  onClick={clearTripHistory}
                  style={{ borderColor: "#ef4444", color: "#dc2626" }}
                  title="Clear all saved trip history"
                >
                  🗑️ Clear Saved History ({savedTrips.length})
                </button>
              )}
              <button className="pdf-button" onClick={() => generatePDFReport(null)}>
                📄 {t("pdfExport")}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ROUTE ANALYSIS DASHBOARD */}
      {selectedRoute && (
        <section className="full-width-section">
          <div className="sih-card route-analysis-dashboard">
            <div className="sih-card-title">
              <h3>📊 {t("routeAnalysis")}</h3>
              <span className="analysis-badge">MODEL: {destRiskInfo?.model || "NER-Environmental-RandomForest-v3.2"}</span>
            </div>

            <div className="cost-breakdown-grid">
              <div className="cost-item">
                <span>⛽ Fuel Cost</span>
                <strong>₹{(selectedRoute.fuelCost || 0).toLocaleString()}</strong>
                <small>Based on vehicle mileage & fuel price</small>
              </div>
              <div className="cost-item">
                <span>👤 Driver Allowance</span>
                <strong>₹{(selectedRoute.driverCost || 0).toLocaleString()}</strong>
                <small>Calculated on total transit hours</small>
              </div>
              <div className="cost-item">
                <span>🛣️ Toll & Road Charges</span>
                <strong>
                  {selectedRoute.tollCost === 0 ? "₹0 (Toll-Exempt)" : `₹${(selectedRoute.tollCost || 0).toLocaleString()}`}
                </strong>
                <small>{selectedRoute.tollCost === 0 ? "Statutory exemption under Disaster Management Act" : "NER highway maintenance toll"}</small>
              </div>
              <div className="cost-item">
                <span>⛰️ Environmental Delay Impact</span>
                <strong style={{ color: "#dc2626" }}>+₹{((selectedRoute.environmentalDelayMinutes || 0) * 15).toLocaleString()}</strong>
                <small>Landslide/Flood delay penalty</small>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ROUTE COMPARISON DASHBOARD */}
      {routes.length > 0 && (
        <section className="full-width-section">
          <div className="sih-card route-comparison-card">
            <div className="sih-card-title">
              <h3>🔀 {t("routeComparison")}</h3>
              <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                Compare primary highway corridors vs. alternate bypass routes evaluated by the ML model.
              </p>
            </div>

            <div className="comparison-cards-grid">
              {routes.map((rt, idx) => (
                <div key={rt.id || idx} className={`comparison-card ${selectedRoute?.id === rt.id ? "active-choice" : ""} ${rt.isEmergencyGreenCorridor ? "emergency-opt-card" : ""}`}>
                  <div className="comp-card-header">
                    <span className="route-opt-tag">
                      {emergencyMode && rt.isEmergencyGreenCorridor
                        ? "🚨 Option (Certified Green Corridor)"
                        : idx === 0
                        ? "🏆 Option 1 (Primary Corridor)"
                        : idx === 1
                        ? "🔀 Option 2 (State Bypass)"
                        : `⛰️ Option ${idx + 1} (Mountain Trail)`}
                    </span>
                    <strong className="comp-score">{rt.score}/100 Score</strong>
                  </div>

                  <div className="comp-metrics">
                    <div><span>Distance:</span> <strong>{rt.distanceKm} km</strong></div>
                    <div><span>Transit Time:</span> <strong>{Math.floor(rt.durationMinutes / 60)}h {rt.durationMinutes % 60}m</strong></div>
                    <div><span>Risk Probability:</span> <strong style={{ color: rt.riskProbability >= 60 ? "#dc2626" : "#16a34a" }}>{rt.riskProbability || 35}%</strong></div>
                    <div><span>Total Cost:</span> <strong>₹{(rt.totalDeliveryCost || 0).toLocaleString()}</strong> {rt.tollCost === 0 && <span style={{ color: "#16a34a", fontSize: "11px", fontWeight: "bold" }}>(Zero Toll)</span>}</div>
                  </div>

                  {rt.advisory && (
                    <div style={{ fontSize: "11px", color: "#475569", margin: "8px 0", background: "#f8fafc", padding: "6px", borderRadius: "6px" }}>
                      {rt.advisory}
                    </div>
                  )}

                  <button
                    className={`select-route-btn ${selectedRoute?.id === rt.id ? "selected" : ""}`}
                    onClick={() => setSelectedRoute(rt)}
                  >
                    {selectedRoute?.id === rt.id ? "✅ Selected Route" : "Select This Route"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* LOWER SECTION: FIELD REPORTING, ESSENTIAL FLEET & DISTRICT MATRIX */}
      <section className="lower-dashboard-grid">
        {/* FIELD OFFICIAL INCIDENT REPORTING FORM */}
        <div className="sih-card">
          <div className="sih-card-title">
            <h3>📝 {t("fieldReporting")}</h3>
            <span className="sih-live-pill">{isOnline ? "ONLINE SYNC" : "QUEUEING OFFLINE"}</span>
          </div>

          <div className="form-grid">
            <div>
              <label>Incident Type</label>
              <select value={incidentType} onChange={(e) => setIncidentType(e.target.value)}>
                <option>Landslide</option>
                <option>Flash Flood</option>
                <option>Road Erosion</option>
                <option>Bridge Damage</option>
                <option>Heavy Fog / Rain</option>
              </select>
            </div>
            <div>
              <label>Severity</label>
              <select value={incidentSeverity} onChange={(e) => setIncidentSeverity(e.target.value)}>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>

          <label>State & District</label>
          <input type="text" value={`${incidentState} - ${incidentDistrict}`} onChange={(e) => setIncidentDistrict(e.target.value)} />

          <label>Highway Pass / Specific Location Name</label>
          <input type="text" value={incidentLocationName} onChange={(e) => setIncidentLocationName(e.target.value)} />

          <label>Incident Description & Delay Notes</label>
          <textarea rows={3} value={incidentNote} onChange={(e) => setIncidentNote(e.target.value)} placeholder="Describe blockade status, affected carriageway, and alternate routes..." />

          <label>{t("photoUpload")}</label>
          <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ marginBottom: "8px" }} />
          {incidentPhotoPreview && (
            <img src={incidentPhotoPreview} alt="Preview" style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px" }} />
          )}

          <button className="primary-button" onClick={submitIncidentReport}>
            📤 {t("submitIncident")}
          </button>
        </div>

        {/* ESSENTIAL COMMODITY FLEET LIST */}
        <div className="sih-card">
          <div className="sih-card-title">
            <h3>🚚 {t("activeFleet")}</h3>
            <span>LIVE VEHICLES: {fleetVehicles.length}</span>
          </div>

          <div className="fleet-list">
            {fleetVehicles.map((fv) => (
              <div key={fv.id} className="fleet-item">
                <div className="fleet-header">
                  <strong>{fv.vehicleName}</strong>
                  <span className={`status-tag ${fv.status === "Delayed" ? "delayed" : "in-transit"}`}>{fv.status}</span>
                </div>
                <div className="fleet-details">
                  <span>📦 {fv.cargoType} ({fv.cargoWeightKg} kg)</span>
                  <span>📍 {fv.origin} ➔ {fv.destination}</span>
                  <span>📡 <strong>Real GPS:</strong> Lat {fv.currentLat.toFixed(4)}, Lon {fv.currentLon.toFixed(4)} ({fv.speedKmH} km/h)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DISTRICT-WISE ACCESSIBILITY MATRIX */}
      <section className="sih-card full-width-card">
        <div className="sih-card-title">
          <h3>🏛️ {t("districtDashboard")}</h3>
          <div>
            <label style={{ fontSize: "12px", marginRight: "8px" }}>Filter District:</label>
            <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)} style={{ padding: "4px 8px" }}>
              <option>All</option>
              {districtsMatrix.map((d) => (
                <option key={d.district}>{d.district}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="district-table">
          <div className="table-header">
            <div>State & District</div>
            <div>Connectivity %</div>
            <div>Risk Score</div>
            <div>Status</div>
            <div>Primary Bottleneck / Action</div>
          </div>
          {activeDistrictsList.map((row) => (
            <div key={row.district} className="table-row">
              <div><strong>{row.district}</strong> <small>({row.state})</small></div>
              <div>{row.connectivityPercent}%</div>
              <div><strong style={{ color: row.riskLevel === "HIGH" ? "#dc2626" : "#16a34a" }}>{row.riskPercent}% ({row.riskLevel})</strong></div>
              <div><span className={`sih-status ${row.status.toLowerCase()}`}>{row.status}</span></div>
              <div><small>{row.bottleneck}</small></div>
            </div>
          ))}
        </div>
      </section>

      {/* FLOATING MULTILINGUAL TOAST NOTIFICATION */}
      {activeToast && (
        <div className={`multilingual-toast-container ${activeToast.severity || "warning"}`}>
          <div className="toast-icon">
            {activeToast.severity === "emergency" ? "🚨" : activeToast.severity === "critical" ? "⚠️" : activeToast.severity === "success" ? "✅" : "📢"}
          </div>
          <div className="toast-content">
            <div className="toast-header">
              <span className="toast-category-badge">{activeToast.category || "ALERT"}</span>
              <strong className="toast-title">
                {activeToast.titles?.[selectedLang] || activeToast.titles?.English || activeToast.title || "Regional Alert"}
              </strong>
            </div>
            <p className="toast-message">
              {activeToast.messages?.[selectedLang] || activeToast.messages?.English || activeToast.message}
            </p>
            <div className="toast-meta">
              <span>📍 {activeToast.corridor || "NER Corridor"}</span>
              <span>🕒 {activeToast.timestamp || "Just now"}</span>
            </div>
          </div>
          <div className="toast-actions">
            <button
              type="button"
              className="toast-voice-btn"
              title="Voice announcement in selected language"
              onClick={() => playVoiceAlertForNotif(activeToast)}
            >
              🔊
            </button>
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => setActiveToast(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* FOOTER ACTIONS */}
      <footer className="footer-bar">
        <button onClick={() => generatePDFReport(null)} className="pdf-button">
          📄 {t("pdfExport")}
        </button>
      </footer>
    </div>
  );
}

export default App;
