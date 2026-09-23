"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Briefcase,
  GraduationCap,
  Map,
  FileText,
  CheckSquare,
  Phone,
  UserCheck,
  ShieldCheck,
  Star,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Search,
  Eye,
  EyeOff,
  Download,
  Info,
  Trash2,
  Edit,
  Plus,
  Bell,
  MessageSquare,
  LayoutDashboard,
  Image,
  BookOpen,
  ClipboardClock,
  Layers,
  Menu,
  X,
  LogOut,
  Check,
  Send,
  AlertTriangle,
  Clock,
  Upload,
  KeyRound,
} from "lucide-react";
import { api, API_BASE, getImageUrl } from "../../hooks/useApi";
import useStore from "../../store/useStore";
import { showToast, confirmDelete } from "../../utils/swal";
import Pagination from "../../components/Pagination";
import OptimizedImage from "../../components/OptimizedImage";
import JoditEditor from "../../components/JoditEditor";
import countries from "../../utils/countries";
import Link from "next/link";

export default function AdminDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    user,
    token,
    setAuth,
    logout,
    initializeAuth,
    notifications,
    unreadCount,
    setNotifications,
    addNotification,
    threads,
    activeThread,
    messages,
    setThreads,
    setActiveThread,
    setMessages,
    addMessage,
  } = useStore();

  const [activeTab, setActiveTab] = useState("overview"); // overview, passports, chat, sliders, circulars, packages, blogs, reviews, appointments, gallery
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isClearingNotifs, setIsClearingNotifs] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [isSubmittingSlider, setIsSubmittingSlider] = useState(false);
  const [isSubmittingPackage, setIsSubmittingPackage] = useState(false);
  const [isSubmittingCircular, setIsSubmittingCircular] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isSubmittingBlog, setIsSubmittingBlog] = useState(false);
  const [isSubmittingGallery, setIsSubmittingGallery] = useState(false);
  const [isSubmittingPassport, setIsSubmittingPassport] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showChatList, setShowChatList] = useState(false);

  // Change Password states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPasswordState, setShowNewPasswordState] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Search passport state
  const [passportSearch, setPassportSearch] = useState("");
  const [passportPage, setPassportPage] = useState(1);
  const passportsPerPage = 10;

  // Real-time Chat state
  const [adminReplyText, setAdminReplyText] = useState("");
  const chatEndRef = useRef(null);

  // CRUD Forms State
  const [editingId, setEditingId] = useState(null);

  // Form sliders
  const [sliderTitle, setSliderTitle] = useState("");
  const [sliderSubtitle, setSliderSubtitle] = useState("");
  const [sliderAction, setSliderAction] = useState("");
  const [sliderOrder, setSliderOrder] = useState("0");
  const [sliderImageFile, setSliderImageFile] = useState(null);

  // Form packages
  const [pkgTitle, setPkgTitle] = useState("");
  const [pkgDest, setPkgDest] = useState("");
  const [pkgDur, setPkgDur] = useState("");
  const [pkgPrice, setPkgPrice] = useState("");
  const [pkgDesc, setPkgDesc] = useState("");
  const [pkgItin, setPkgItin] = useState("");
  const [pkgImageFile, setPkgImageFile] = useState(null);

  // Form circulars
  const [circTitle, setCircTitle] = useState("");
  const [circCountry, setCircCountry] = useState("");
  const [circCat, setCircCat] = useState("");
  const [circSalary, setCircSalary] = useState("");
  const [circDescription, setCircDescription] = useState("");
  const [circReqs, setCircReqs] = useState("");
  const [circImageFile, setCircImageFile] = useState(null);

  // Form reviews
  const [revName, setRevName] = useState("");
  const [revRole, setRevRole] = useState("");
  const [revText, setRevText] = useState("");
  const [revRating, setRevRating] = useState("5");
  const [revImageFile, setRevImageFile] = useState(null);

  // Form blogs
  const [blogTitle, setBlogTitle] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogAuthor, setBlogAuthor] = useState("");
  const [blogImageFile, setBlogImageFile] = useState(null);

  // Form gallery
  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryDescription, setGalleryDescription] = useState("");
  const [galleryImageFile, setGalleryImageFile] = useState(null);

  // Form passports
  const [holderName, setHolderName] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [submissionDate, setSubmissionDate] = useState("");
  const [country, setCountry] = useState("");
  const [passportFile, setPassportFile] = useState(null);

  // Modal / status states
  const [isCrudModalOpen, setIsCrudModalOpen] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // 1. Poll for notifications & chat threads (replaces SSE for Vercel deployment)
  useEffect(() => {
    if (!user || user.role !== "admin" || !token) return;

    const poll = () => {
      api.getNotifications(token).then(setNotifications).catch(console.error);
      api.getChatThreads(token).then(setThreads).catch(console.error);
    };

    poll();
    const interval = setInterval(poll, 4000);

    return () => clearInterval(interval);
  }, [user, token, setThreads, setNotifications]);

  // 2. Fetching history when active chat thread changes
  useEffect(() => {
    if (!activeThread?.userId) return;
    api
      .getChatHistory(activeThread.userId)
      .then(setMessages)
      .catch(() => {});
  }, [activeThread]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Queries
  const { data: passports = [], refetch: refetchPassports } = useQuery({
    queryKey: ["passports", passportSearch],
    queryFn: () => api.getPassports(passportSearch, token),
    enabled: !!user && user.role === "admin",
  });

  const { data: sliders = [], refetch: refetchSliders } = useQuery({
    queryKey: ["adminSliders"],
    queryFn: api.getSliders,
    enabled: !!user && user.role === "admin",
  });

  const { data: packages = [], refetch: refetchPackages } = useQuery({
    queryKey: ["adminPackages"],
    queryFn: api.getPackages,
    enabled: !!user && user.role === "admin",
  });

  const { data: circulars = [], refetch: refetchCirculars } = useQuery({
    queryKey: ["adminCirculars"],
    queryFn: () => api.getCirculars(),
    enabled: !!user && user.role === "admin",
  });

  const { data: reviews = [], refetch: refetchReviews } = useQuery({
    queryKey: ["adminReviews"],
    queryFn: api.getReviews,
    enabled: !!user && user.role === "admin",
  });

  const { data: blogs = [], refetch: refetchBlogs } = useQuery({
    queryKey: ["adminBlogs"],
    queryFn: api.getBlogs,
    enabled: !!user && user.role === "admin",
  });

  const { data: appointments = [], refetch: refetchAppointments } = useQuery({
    queryKey: ["adminAppointments"],
    queryFn: () => api.getAppointments(token),
    enabled: !!user && user.role === "admin",
  });

  const { data: galleryItems = [], refetch: refetchGallery } = useQuery({
    queryKey: ["adminGallery"],
    queryFn: api.getGallery,
    enabled: !!user && user.role === "admin",
  });

  const passportTotalPages = Math.max(1, Math.ceil(passports.length / passportsPerPage));
  const safePassportPage = Math.min(passportPage, passportTotalPages);
  const paginatedPassports = passports.slice(
    (safePassportPage - 1) * passportsPerPage,
    safePassportPage * passportsPerPage
  );

  // Handle Admin Credentials Login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error || "ভুল ক্রেডেনশিয়াল! সঠিক ইমেইল ও পাসওয়ার্ড দিন।",
        );
      }

      if (data.user.role !== "admin") {
        throw new Error(
          "এক্সেস ডিনাইড! শুধুমাত্র অ্যাডমিন অ্যাকাউন্ট প্রবেশ করতে পারবে।",
        );
      }

      setAuth(data.user, data.token);
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Status handler for passports
  const handleUpdatePassportStatus = async (id, status) => {
    try {
      await api.updatePassportStatus(id, status, token);
      refetchPassports();
      showToast('success', "পাসপোর্ট স্ট্যাটাস আপডেট করা হয়েছে।");
    } catch (err) {
      showToast('error', "স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।");
    }
  };

  // Status handler for appointments
  const handleUpdateAppointmentStatus = async (id, status) => {
    const key = status + "_" + id;
    setProcessingId(key);
    try {
      await api.updateAppointmentStatus(id, status, token);
      refetchAppointments();
      showToast('success', "অ্যাপয়েন্টমেন্ট স্ট্যাটাস আপডেট করা হয়েছে।");
    } catch (err) {
      showToast('error', "স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDownloadPDF = (app) => {
    try {
      const { jsPDF } = require("jspdf");
      const doc = new jsPDF();
      const l = 14, r = 196, w = 182;

      try { doc.addImage("/logo.jpeg", "JPEG", l, 10, 30, 30); } catch (e) {}

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(13, 148, 136);
      doc.text("MCES", r, 22, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("International Overseas Travel Agency", r, 28, { align: "right" });
      doc.text("Email: info@mcesbd.com | Web: www.mcesbd.com", r, 33, { align: "right" });

      doc.setDrawColor(13, 148, 136);
      doc.setLineWidth(0.8);
      doc.line(l, 44, r, 44);

      let y = 58;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text("APPOINTMENT CONFIRMATION RECEIPT", l, y);

      doc.setFillColor(248, 250, 252);
      doc.rect(120, 48, 76, 24, "F");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "bold");
      doc.text("Receipt ID:", 124, 54);
      doc.text("Issued Date:", 124, 60);
      doc.text("Appr. Status:", 124, 66);
      doc.setFont("helvetica", "normal");
      doc.text(`${app._id ? app._id.substring(0, 12) : "N/A"}`, 150, 54);
      doc.text(`${new Date(app.createdAt || new Date()).toLocaleDateString("en-GB")}`, 150, 60);

      const st = app.status ? app.status.toUpperCase() : "PENDING";
      const sCol = st === "ACCEPTED" ? [22,163,74] : st === "REJECTED" ? [220,38,38] : [217,119,6];
      doc.setTextColor(sCol[0], sCol[1], sCol[2]);
      doc.setFont("helvetica", "bold");
      doc.text(st, 150, 66);

      y += 16;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(13, 148, 136);
      doc.text("APPLICANT DETAILS", l, y);
      y += 3;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(l, y, r, y);
      y += 7;

      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      const row = (label, val) => {
        doc.setFont("helvetica", "bold");
        doc.text(label, l, y);
        doc.setFont("helvetica", "normal");
        doc.text(`${val || "N/A"}`, 48, y);
        y += 7;
      };
      row("Full Name:", app.name);
      row("Phone Number:", app.phone);
      row("Email Address:", app.email);

      y += 3;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(13, 148, 136);
      doc.text("SERVICE & SCHEDULE", l, y);
      y += 3;
      doc.line(l, y, r, y);
      y += 6;

      doc.setFillColor(13, 148, 136);
      doc.rect(l, y, w, 8, "F");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "normal");
      doc.text("Selected Department / Service", l + 4, y + 5.5);
      doc.text("Booking Date", 140, y + 5.5);
      y += 20;

      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "normal");
      doc.text(`${app.serviceName || "General Consultation"}`, l + 4, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(13, 148, 136);
      doc.text(`${app.date || "Not Set"}`, 140, y);
      y += 4;
      doc.setDrawColor(203, 213, 225);
      doc.line(l, y, r, y);
      y += 6;

      if (app.message) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(13, 148, 136);
        doc.text("APPLICANT NOTE / INQUIRY", l, y);
        y += 3;
        doc.line(l, y, r, y);
        y += 6;

        const msgs = doc.splitTextToSize(app.message, w - 4);
        const bh = msgs.length * 5 + 10;
        doc.setFillColor(250, 250, 250);
        doc.setDrawColor(241, 245, 249);
        doc.rect(l, y, w, bh, "FD");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text(msgs, l + 4, y + 6);
        y += bh + 8;
      }

      const bot = Math.max(y + 24, 260);
      doc.setDrawColor(203, 213, 225);
      doc.line(150, bot, r, bot);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("Authorized Signature", 173, bot + 5, { align: "center" });

      doc.setDrawColor(226, 232, 240);
      doc.line(l, bot + 20, r, bot + 20);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("This is a system generated document, no physical seal required.", l, bot + 27);
      doc.text("(c) 2026 MCES Ltd. All Rights Reserved.", r, bot + 27, { align: "right" });

      doc.save(`MCES_Appointment_${app.name || "Customer"}.pdf`);
    } catch (error) {
      console.error("PDF generation error:", error);
      showToast('error', "পিডিএফ জেনারেট করতে সমস্যা হয়েছে।");
    }
  };

  // Delete handler with strict confirmation requirement
  const handleDeleteItem = async (type, id) => {
    const confirmed = await confirmDelete();
    if (!confirmed) return;

    const key = "delete_" + type + "_" + id;
    setProcessingId(key);
    try {
      if (type === "passport") {
        await api.deletePassport(id, token);
        refetchPassports();
      } else if (type === "slider") {
        await api.deleteSlider(id, token);
        refetchSliders();
      } else if (type === "package") {
        await api.deletePackage(id, token);
        refetchPackages();
      } else if (type === "circular") {
        await api.deleteCircular(id, token);
        refetchCirculars();
      } else if (type === "review") {
        await api.deleteReview(id, token);
        refetchReviews();
      } else if (type === "blog") {
        await api.deleteBlog(id, token);
        refetchBlogs();
      } else if (type === "gallery") {
        await api.deleteGallery(id, token);
        refetchGallery();
      }
      showToast('success', "রেকর্ডটি মুছে ফেলা হয়েছে।");
    } catch (err) {
      showToast('error', "মুছে ফেলা ব্যর্থ হয়েছে।");
    } finally {
      setProcessingId(null);
    }
  };

  // Submit chat reply
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!adminReplyText.trim() || !activeThread) return;

    const text = adminReplyText;
    setAdminReplyText("");
    setIsSendingReply(true);

    try {
      const savedReply = await api.sendAdminReply(
        {
          userId: activeThread.userId,
          message: text,
        },
        token,
      );
      setMessages((prev) => [...prev, savedReply]);
    } catch (err) {
      showToast('error', "বার্তা পাঠানো যায়নি।");
    } finally {
      setIsSendingReply(false);
    }
  };

  // CRUD Actions submissions
  const handleSliderSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingSlider(true);
    const formData = new FormData();
    formData.append("title", sliderTitle);
    formData.append("subtitle", sliderSubtitle);
    formData.append("actionUrl", sliderAction);
    formData.append("order", sliderOrder);
    if (sliderImageFile) {
      formData.append("file", sliderImageFile);
    }

    try {
      if (editingId) {
        await api.updateSlider(editingId, formData, token);
        showToast('success', "স্লাইডার আপডেট করা হয়েছে।");
      } else {
        if (!sliderImageFile)
          return showToast('warning', "স্লাইডারের জন্য একটি ছবি আপলোড করা আবশ্যক।");
        await api.addSlider(formData, token);
        showToast('success', "স্লাইডার যুক্ত করা হয়েছে।");
      }
      refetchSliders();
      closeModal();
    } catch (err) {
      showToast('error', "স্লাইডার সেভ করা যায়নি।");
    } finally {
      setIsSubmittingSlider(false);
    }
  };

  const handlePackageSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingPackage(true);
    const formData = new FormData();
    formData.append("title", pkgTitle);
    formData.append("destination", pkgDest);
    formData.append("duration", pkgDur);
    formData.append("price", pkgPrice);
    formData.append("description", pkgDesc);

    const itinArray = pkgItin.split("\n").filter(Boolean);
    formData.append("itinerary", JSON.stringify(itinArray));

    if (pkgImageFile) {
      formData.append("file", pkgImageFile);
    }

    try {
      if (editingId) {
        await api.updatePackage(editingId, formData, token);
        showToast('success', "প্যাকেজ আপডেট করা হয়েছে।");
      } else {
        if (!pkgImageFile) return showToast('warning', "প্যাকেজের ছবি আপলোড করা আবশ্যক।");
        await api.addPackage(formData, token);
        showToast('success', "প্যাকেজ যুক্ত করা হয়েছে।");
      }
      refetchPackages();
      closeModal();
    } catch (err) {
      showToast('error', "প্যাকেজ সেভ করা যায়নি।");
    } finally {
      setIsSubmittingPackage(false);
    }
  };

  const handleCircularSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingCircular(true);
    const formData = new FormData();
    formData.append("title", circTitle);
    formData.append("country", circCountry);
    formData.append("jobCategory", circCat);
    formData.append("description", circDescription);
    formData.append("salaryRange", circSalary);

    const reqsArray = circReqs.split("\n").filter(Boolean);
    formData.append("requirements", JSON.stringify(reqsArray));

    if (circImageFile) {
      formData.append("file", circImageFile);
    }

    try {
      if (editingId) {
        await api.updateCircular(editingId, formData, token);
        showToast('success', "সার্কুলার আপডেট করা হয়েছে।");
      } else {
        if (!circImageFile) return showToast('warning', "সার্কুলারের ছবি আপলোড করা আবশ্যক।");
        await api.addCircular(formData, token);
        showToast('success', "সার্কুলার যুক্ত করা হয়েছে।");
      }
      refetchCirculars();
      closeModal();
    } catch (err) {
      showToast('error', "সার্কুলার সেভ করা যায়নি।");
    } finally {
      setIsSubmittingCircular(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    const formData = new FormData();
    formData.append("clientName", revName);
    formData.append("clientRole", revRole);
    formData.append("reviewText", revText);
    formData.append("rating", revRating);
    if (revImageFile) {
      formData.append("file", revImageFile);
    }

    try {
      if (!revImageFile && !editingId)
        return showToast('warning', "ক্লায়েন্টের ছবি আপলোড করা আবশ্যক।");
      await api.addReview(formData, token);
      showToast('success', "রিভিউ যুক্ত করা হয়েছে।");
      refetchReviews();
      closeModal();
    } catch (err) {
      showToast('error', "রিভিউ সেভ করা যায়নি।");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    if (!blogTitle.trim())
      return showToast('warning', "ব্লগ শিরোনাম লিখুন।");
    if (!blogContent || blogContent === "<br>" || blogContent.replace(/<[^>]*>/g, '').trim() === "")
      return showToast('warning', "ব্লগ কনটেন্ট লিখুন।");
    if (!blogImageFile && !editingId)
      return showToast('warning', "ব্লগ ফিচার্ড ছবি আপলোড করা আবশ্যক।");
    setIsSubmittingBlog(true);
    const formData = new FormData();
    formData.append("title", blogTitle);
    formData.append("content", blogContent);
    formData.append("author", blogAuthor || "Admin");
    if (blogImageFile) {
      formData.append("file", blogImageFile);
    }

    try {
      if (editingId) {
        await api.updateBlog(editingId, formData, token);
        showToast('success', "ব্লগ আপডেট করা হয়েছে।");
      } else {
        await api.addBlog(formData, token);
        showToast('success', "ব্লগ যুক্ত করা হয়েছে।");
      }
      refetchBlogs();
      closeModal();
    } catch (err) {
      showToast('error', "ব্লগ সেভ করা যায়নি।");
    } finally {
      setIsSubmittingBlog(false);
    }
  };

  const handleGallerySubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingGallery(true);
    const formData = new FormData();
    formData.append("title", galleryTitle);
    formData.append("description", galleryDescription);
    if (galleryImageFile) {
      formData.append("file", galleryImageFile);
    }

    try {
      if (editingId) {
        await api.updateGallery(editingId, formData, token);
        showToast('success', "গ্যালারি আপডেট করা হয়েছে।");
      } else {
        if (!galleryImageFile)
          return showToast('warning', "গ্যালারির জন্য একটি ছবি আপলোড করা আবশ্যক।");
        await api.addGallery(formData, token);
        showToast('success', "গ্যালারি যুক্ত করা হয়েছে।");
      }
      refetchGallery();
      closeModal();
    } catch (err) {
      showToast('error', "গ্যালারি সেভ করা যায়নি।");
    } finally {
      setIsSubmittingGallery(false);
    }
  };

  const handlePassportSubmit = async (e) => {
    e.preventDefault();
    if (!passportFile && !editingId) {
      showToast('warning', "পাসপোর্ট এর পিডিএফ ফাইল আপলোড করা আবশ্যক।");
      return;
    }

    setIsSubmittingPassport(true);
    const formData = new FormData();
    formData.append("holderName", holderName);
    formData.append("passportNumber", passportNumber.trim());
    formData.append("submissionDate", submissionDate);
    formData.append("country", country);
    if (passportFile) {
      formData.append("file", passportFile);
    }

    try {
      await api.submitPassport(formData, token);
      showToast('success', "পাসপোর্ট যুক্ত করা হয়েছে।");
      refetchPassports();
      closeModal();
    } catch (err) {
      showToast('error', err.message || "পাসপোর্ট সেভ করা যায়নি।");
    } finally {
      setIsSubmittingPassport(false);
    }
  };

  const handleClearNotifications = async () => {
    setIsClearingNotifs(true);
    try {
      await api.clearNotifications(token);
      setNotifications([]);
      showToast('success', "নোটিফিকেশন ক্লিয়ার করা হয়েছে।");
    } catch (e) {
      showToast('error', "নোটিফিকেশন ক্লিয়ার করা যায়নি।");
    } finally {
      setIsClearingNotifs(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id, token);
      // Update local read state
      const updated = notifications.map((n) =>
        n._id === id || n.id === id ? { ...n, isRead: true } : n,
      );
      setNotifications(updated);
    } catch (e) {}
  };

  // Handle Change Password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmNewPassword) {
      showToast('error', 'নতুন পাসওয়ার্ড মিলছে না!');
      return;
    }

    if (newPassword.length < 4) {
      showToast('error', 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষর হতে হবে!');
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'পাসওয়ার্ড পরিবর্তন করা যায়নি।');
      }

      showToast('success', 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      showToast('error', err.message || 'পাসওয়ার্ড পরিবর্তন করা যায়নি।');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const closeModal = () => {
    setIsCrudModalOpen(false);
    setEditingId(null);

    // Clean form states
    setSliderTitle("");
    setSliderSubtitle("");
    setSliderAction("");
    setSliderOrder("0");
    setSliderImageFile(null);
    setPkgTitle("");
    setPkgDest("");
    setPkgDur("");
    setPkgPrice("");
    setPkgDesc("");
    setPkgItin("");
    setPkgImageFile(null);
    setCircTitle("");
    setCircCountry("");
    setCircCat("");
    setCircSalary("");
    setCircDescription("");
    setCircReqs("");
    setCircImageFile(null);
    setRevName("");
    setRevRole("");
    setRevText("");
    setRevRating("5");
    setRevImageFile(null);
    setBlogTitle("");
    setBlogContent("");
    setBlogAuthor("");
    setBlogImageFile(null);
    setGalleryTitle("");
    setGalleryDescription("");
    setGalleryImageFile(null);
    setHolderName("");
    setPassportNumber("");
    setSubmissionDate("");
    setCountry("");
    setPassportFile(null);
  };

  const openEditModal = (type, item) => {
    setEditingId(item._id || item.id);
    setIsCrudModalOpen(true);

    if (type === "slider") {
      setSliderTitle(item.title);
      setSliderSubtitle(item.subtitle);
      setSliderAction(item.actionUrl);
      setSliderOrder(item.order.toString());
    } else if (type === "package") {
      setPkgTitle(item.title);
      setPkgDest(item.destination);
      setPkgDur(item.duration);
      setPkgPrice(item.price.toString());
      setPkgDesc(item.description);
      setPkgItin(item.itinerary?.join("\n") || "");
    } else if (type === "circular") {
      setCircTitle(item.title);
      setCircCountry(item.country);
      setCircCat(item.jobCategory);
      setCircSalary(item.salaryRange);
      setCircDescription(item.description || "");
      setCircReqs(item.requirements?.join("\n") || "");
    } else if (type === "gallery") {
      setGalleryTitle(item.title);
      setGalleryDescription(item.description || "");
    } else if (type === "blog") {
      setBlogTitle(item.title || "");
      setBlogContent(item.content || "");
      setBlogAuthor(item.author || "Admin");
    }
  };

  // UN-AUTHENTICATED ADMIN PANEL - SHOW LOGIN
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-16 text-slate-100">
        <div className="bg-slate-800 p-8 md:p-10 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-teal-900/50 text-teal-400 rounded-tr-2xl rounded-bl-2xl shadow-sm mb-4 border border-teal-500/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              অ্যাডমিন ড্যাশবোর্ড লগইন
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              প্রশাসনিক কাজে প্রবেশ করতে প্রফেশনাল ক্রেডেনশিয়াল দিন।
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-rose-950 border border-rose-800 text-rose-300 text-xs rounded-xl font-medium flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                অ্যাডমিন ইমেইল *
              </label>
              <input
                type="email"
                required
                placeholder="example@domain.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                পাসওয়ার্ড *
              </label>
              <div className="relative">
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  required
                  placeholder="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-750 text-white text-xs font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center space-x-1"
            >
              <span>
                {isLoggingIn ? "ভেরিফাই হচ্ছে..." : "ড্যাশবোর্ড প্রবেশ করুন"}
              </span>
              {!isLoggingIn && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Generate Stats Data for charts
  const totalPassports = passports.length;
  const approvedPassports = passports.filter(
    (p) => p.status === "Approved",
  ).length;
  const processPassports = passports.filter(
    (p) => p.status === "In Process",
  ).length;
  const submittedPassports = passports.filter(
    (p) => p.status === "Submitted",
  ).length;
  const rejectedPassports = passports.filter(
    (p) => p.status === "Rejected",
  ).length;

  const passportStatusData = [
    { name: "Approved", value: approvedPassports, color: "#10b981" },
    { name: "In Process", value: processPassports, color: "#f59e0b" },
    { name: "Submitted", value: submittedPassports, color: "#6366f1" },
    { name: "Rejected", value: rejectedPassports, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  const analyticsBarData = [
    { name: "ট্যুর প্যাকেজ", সংখ্যা: packages.length },
    { name: "সার্কুলার", সংখ্যা: circulars.length },
    { name: "ব্লগ", সংখ্যা: blogs.length },
    { name: "পাসপোর্ট", সংখ্যা: totalPassports },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed md:sticky top-0 left-0 z-50 h-screen w-72 md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col justify-between border-r border-slate-800 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-teal-600 text-white rounded-tr-lg rounded-bl-lg">
                <ShieldCheck className="w-5 h-5 animate-pulse" />
              </div>
              <Link href={"/"}><span className="text-lg font-bold text-white">MCES Admin</span></Link>
            </div>
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              title="লগআউট"
              className="p-1.5 hover:bg-slate-800 rounded-md text-red-400 hover:text-red-650"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1">
            {[
              {
                id: "overview",
                name: "ওভারভিউ এনালিটিক্স",
                icon: LayoutDashboard,
              },
              {
                id: "passports",
                name: "পাসপোর্ট ম্যানেজমেন্ট",
                icon: CheckSquare,
              },
              {
                id: "chat",
                name: "লাইভ চ্যাট কনসোল",
                icon: MessageSquare,
                badge: threads.length,
              },
              { id: "sliders", name: "স্লাইডার ব্যানার", icon: Image },
              { id: "circulars", name: "কাজের সার্কুলার", icon: BookOpen },
              { id: "packages", name: "ট্যুর প্যাকেজ", icon: Map },
              { id: "blogs", name: "ব্লগ পোস্ট", icon: FileText },
              { id: "reviews", name: "গ্রাহক রিভিউ", icon: Star },
              { id: "appointment", name: "অ্যাপয়েন্টমেন্ট", icon: ClipboardClock },
              { id: "gallery", name: "ফটো গ্যালারি", icon: Image },
              { id: "change-password", name: "পাসওয়ার্ড পরিবর্তন", icon: KeyRound },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === item.id
                      ? "bg-teal-700 text-white shadow-sm"
                      : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4.5 h-4.5" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-bold rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Info footer */}
        <div className="p-4 border-t border-slate-800 text-[10px] text-slate-500 space-y-1">
          <p>লগইন ইউজার: {user.name}</p>
          <p>পাওয়ারড বাই: MCES INTERNATIONAL</p>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-grow flex flex-col min-h-screen overflow-x-hidden">
        {/* Header toolbar */}
        <header className="bg-white border-b border-slate-200 h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors md:hidden focus:outline-none"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm md:text-base font-bold text-slate-800 uppercase tracking-wider truncate max-w-[180px] md:max-w-none">
              {activeTab === "overview" && "ড্যাশবোর্ড এনালিটিক্স ওভারভিউ"}
              {activeTab === "passports" && "জমাকৃত পাসপোর্ট ও ফাইল তালিকা"}
              {activeTab === "chat" && (showChatList ? "চ্যাট কনভার্সেশনস তালিকা" : "গ্রাহকদের চ্যাট ও সমাধান বোর্ড")}
              {activeTab === "sliders" && "স্লাইডার ব্যানার ম্যানেজমেন্ট"}
              {activeTab === "circulars" && "চাকরির সার্কুলার তালিকা"}
              {activeTab === "packages" && "ট্যুর প্যাকেজ তালিকা"}
              {activeTab === "blogs" && "ব্লগ ও ইনফরমেশন প্যানেল"}
              {activeTab === "reviews" && "গ্রাহক রিভিউ প্যানেল"}
              {activeTab === "appointment" && "Appointment Panel"}
              {activeTab === "gallery" && "ফটো গ্যালারি ম্যানেজমেন্ট"}
              {activeTab === "change-password" && "পাসওয়ার্ড পরিবর্তন"}
            </h2>
          </div>

          {/* Right Bell notification stream */}
          <div className="flex items-center space-x-4">
            {/* Real-time notification panel */}
            <div className="relative group">
              <button className="relative p-2 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-full transition-colors focus:outline-none">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 bg-rose-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown hover list */}
              <div className="absolute right-0 top-10 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 hidden group-hover:block z-40 max-h-[380px] overflow-y-auto">
                <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <span className="text-xs font-bold text-slate-700">
                    রিয়েল-টাইম নোটিফিকেশন
                  </span>
                  <button
                    onClick={handleClearNotifications}
                    disabled={isClearingNotifs}
                    className="text-[10px] text-red-600 hover:text-red-800 font-bold disabled:opacity-50"
                  >
                    {isClearingNotifs ? "..." : "সব মুছুন"}
                  </button>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      কোনো নোটিফিকেশন নেই।
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id || notif.id}
                        onClick={() => handleMarkRead(notif._id || notif.id)}
                        className={`p-3 cursor-pointer transition-colors flex items-start space-x-2.5 ${notif.isRead ? "bg-white" : "bg-teal-50/40 font-semibold"}`}
                      >
                        <span className="h-2 w-2 rounded-full bg-teal-600 mt-1.5 flex-shrink-0" />
                        <div className="space-y-0.5">
                          <p className="text-slate-800 text-[11px]">
                            {notif.title}
                          </p>
                          <p className="text-slate-550 text-[10px] font-normal leading-tight">
                            {notif.message}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <Link
              href="/"
              className="text-xs text-teal-700 hover:text-teal-900 font-bold flex items-center space-x-1"
            >
              <span>সাইট ভিজিট</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Main Panel Body */}
        <div className="p-6 md:p-8 flex-grow">
          {/* TAB 1: OVERVIEW ANALYTICS */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Stat grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-xs font-semibold block">
                      মোট পাসপোর্ট আবেদন
                    </span>
                    <span className="text-2xl font-bold text-slate-800 mt-1">
                      {totalPassports}
                    </span>
                  </div>
                  <div className="p-3 bg-teal-50 text-teal-700 rounded-xl">
                    <CheckSquare className="w-6 h-6" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-xs font-semibold block">
                      অনুমোদিত (Approved)
                    </span>
                    <span className="text-2xl font-bold text-emerald-600 mt-1">
                      {approvedPassports}
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                    <Check className="w-6 h-6" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-xs font-semibold block">
                      প্রক্রিয়াধীন (In Process)
                    </span>
                    <span className="text-2xl font-bold text-amber-600 mt-1">
                      {processPassports}
                    </span>
                  </div>
                  <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-xs font-semibold block">
                      নতুন চ্যাট থ্রেডস
                    </span>
                    <span className="text-2xl font-bold text-indigo-600 mt-1">
                      {threads.length}
                    </span>
                  </div>
                  <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Recharts Data Visualization charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bar chart */}
                <div className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 mb-6">
                    কন্টেন্ট ও পাসপোর্ট স্ট্যাটিস্টিক্স
                  </h3>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReBarChart data={analyticsBarData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="সংখ্যা" fill="#0f766e" barSize={40} />
                      </ReBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pie Chart */}
                <div className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 mb-6">
                    পাসপোর্ট অনুমোদন স্থিতি (Status breakdown)
                  </h3>
                  {passportStatusData.length === 0 ? (
                    <div className="h-80 flex items-center justify-center text-xs text-slate-400">
                      কোনো পাসপোর্ট রেকর্ড নেই।
                    </div>
                  ) : (
                    <div className="h-80 w-full flex flex-col justify-center">
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={passportStatusData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {passportStatusData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex justify-center space-x-4 text-xs font-semibold mt-4">
                        {passportStatusData.map((entry, i) => (
                          <div
                            key={i}
                            className="flex items-center space-x-1.5"
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span>
                              {entry.name}: {entry.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* আপনার page.js ফাইলের কন্টেন্ট এরিয়াতে এটি রিপ্লেস করুন */}
          {activeTab === "appointment" && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    সব অ্যাপয়েন্টমেন্ট তালিকা
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    রিয়েল-টাইম নোটিফিকেশন প্যানেল থেকে ফিল্টার করা গ্রাহকদের
                    তালিকা।
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-[11px] font-semibold uppercase bg-slate-50/50">
                      <th className="py-3 px-4">গ্রাহকের নাম</th>
                      <th className="py-3 px-4">যোগাযোগ ও ইমেইল</th>
                      <th className="py-3 px-4">ডিপার্টমেন্ট</th>
                      <th className="py-3 px-4">তারিখ</th>
                      <th className="py-3 px-4">স্ট্যাটাস</th>
                      <th className="py-3 px-4 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-slate-50 text-slate-600">
                    {appointments.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="py-8 text-center text-slate-400"
                        >
                          কোনো অ্যাপয়েন্টমেন্ট ডাটা পাওয়া যায়নি।
                        </td>
                      </tr>
                    ) : (
                      appointments.map((app) => (
                        <tr
                          key={app._id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="py-3 px-4 font-medium text-slate-800">
                            {app.name}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-700">
                              {app.phone}
                            </div>
                            <div className="text-[11px] text-slate-400 max-w-[200px] truncate" title={app.email}>
                              {app.email}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 bg-teal-50 text-teal-800 rounded text-[11px] font-medium">
                              {app.serviceName}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-teal-700">
                            {app.date}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                app.status === "accepted"
                                  ? "bg-green-100 text-green-700"
                                  : app.status === "rejected"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {app.status === "accepted"
                                ? "গৃহীত"
                                : app.status === "rejected"
                                  ? "প্রত্যাখ্যাত"
                                  : "পেন্ডিং"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                            {/* স্ট্যাটাস পেন্ডিং থাকলে অ্যাকশন বাটনগুলো দেখাবে */}
                             {(app.status === "pending" || !app.status) && (
                              <>
                                 <button
                                   onClick={() =>
                                     handleUpdateAppointmentStatus(app._id, "accepted")
                                   }
                                   disabled={processingId === "accepted_" + app._id}
                                   className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-[11px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                 >
                                   {processingId === "accepted_" + app._id ? "..." : "✔ অ্যাক্সেপ্ট"}
                                 </button>
                                 <button
                                   onClick={() =>
                                     handleUpdateAppointmentStatus(app._id, "rejected")
                                   }
                                   disabled={processingId === "rejected_" + app._id}
                                   className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                 >
                                   {processingId === "rejected_" + app._id ? "..." : "✖ রিজেক্ট"}
                                 </button>
                              </>
                            )}

                            <button
                              onClick={() => handleDownloadPDF(app)}
                              className="px-2 py-1 bg-slate-700 hover:bg-slate-800 text-white rounded text-[11px] font-medium transition-colors inline-flex items-center space-x-1"
                            >
                              <span>🖨 PDF ডাউনলোড</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: PASSPORT DOCUMENT LIST & SEARCH & STATUS ACTIONS */}
          {activeTab === "passports" && (
            <div className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm space-y-6">
              {/* Search Toolbar */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full max-w-sm flex">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="নাম অথবা পাসপোর্ট নাম্বার দিয়ে সার্চ করুন..."
                    value={passportSearch}
                    onChange={(e) => {
                      setPassportSearch(e.target.value);
                      setPassportPage(1);
                      setTimeout(() => refetchPassports(), 300);
                    }}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50 focus:bg-white font-medium"
                  />
                </div>
                <button
                  onClick={() => setIsCrudModalOpen(true)}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold curvy-button shadow-sm flex items-center space-x-1.5 self-end sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন পাসপোর্ট জমা করুন</span>
                </button>
              </div>

              {/* Passports Table list */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-xs md:text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 font-semibold">
                      <th className="pb-3">ধারকের নাম</th>
                      <th className="pb-3">পাসপোর্ট নাম্বার</th>
                      <th className="pb-3">দেশ (Country)</th>
                      <th className="pb-3">জমা দেওয়ার তারিখ</th>
                      <th className="pb-3">পিডিএফ ডকুমেন্ট</th>
                      <th className="pb-3">স্ট্যাটাস</th>
                      <th className="pb-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {paginatedPassports.map((pass) => (
                      <tr key={pass.id}>
                        <td className="py-3.5 font-semibold font-medium">
                          {pass.holderName}
                        </td>
                        <td className="py-3.5 font-mono">
                          {pass.passportNumber}
                        </td>
                        <td className="py-3.5">{pass.country}</td>
                        <td className="py-3.5">{pass.submissionDate}</td>
                        <td className="py-3.5">
                          <a
                            href={getImageUrl(pass.pdfUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-teal-700 hover:text-teal-900 font-bold"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF ফাইল দেখুন</span>
                          </a>
                        </td>
                        <td className="py-3.5">
                          <select
                            value={pass.status}
                            onChange={(e) =>
                              handleUpdatePassportStatus(
                                pass.id,
                                e.target.value,
                              )
                            }
                            className="px-2.5 py-1 border border-slate-200 rounded-lg text-xs font-semibold bg-white focus:outline-none focus:border-teal-700"
                          >
                            <option value="Submitted">Submitted</option>
                            <option value="In Process">In Process</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() =>
                              handleDeleteItem("passport", pass.id)
                            }
                            disabled={processingId === "delete_passport_" + pass.id}
                            className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {processingId === "delete_passport_" + pass.id ? <span className="text-[10px]">...</span> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                    ))}

                    {passports.length === 0 && (
                      <tr>
                        <td
                          colSpan="6"
                          className="text-center py-8 text-slate-400 text-xs"
                        >
                          কোনো পাসপোর্ট রেকর্ড পাওয়া যায়নি।
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {passports.length > 0 && (
                <Pagination currentPage={safePassportPage} totalPages={passportTotalPages} onPageChange={setPassportPage} />
              )}
            </div>
          )}

          {/* TAB 3: LIVE CHAT SUPPORT CONSOLE */}
          {activeTab === "chat" && (
            <div className="bg-white rounded-2xl border border-teal-50 shadow-sm overflow-hidden h-[calc(100vh-12rem)] md:h-[600px] flex relative">
              {/* Left Column: User threads list */}
              <div className={`w-full md:w-80 border-r border-slate-200 flex flex-col absolute md:relative inset-0 z-10 bg-white md:bg-transparent transition-transform duration-300 ${activeThread && !showChatList ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
                <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-700 text-xs md:text-sm flex items-center justify-between">
                  <span>চ্যাট কনভার্সেশনস তালিকা</span>
                  <span className="text-[10px] text-slate-400 font-normal">({threads.length})</span>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                  {threads.length === 0 ? (
                    <div className="text-center py-12 text-slate-450 text-xs">
                      কোনো চ্যাট রিকোয়েস্ট নেই।
                    </div>
                  ) : (
                    threads.filter(Boolean).map((thread) => {
                      const isActive = activeThread?.userId === thread?.userId;
                      return thread ? (
                        <div
                          key={thread.userId}
                          onClick={() => { setActiveThread(thread); setShowChatList(false); }}
                          className={`p-4 cursor-pointer transition-colors ${isActive ? "bg-teal-50/50 border-r-4 border-teal-700" : "hover:bg-slate-50"}`}
                        >
                          <div className="flex justify-between items-baseline mb-1">
                            <h4 className="font-bold text-slate-800 text-xs md:text-sm">
                              {thread.senderName || 'Unknown'}
                            </h4>
                            <span className="text-[9px] text-slate-400">
                              {thread.updatedAt ? new Date(thread.updatedAt).toLocaleTimeString(
                                "bn-BD",
                                { hour: "2-digit", minute: "2-digit" },
                              ) : ''}
                            </span>
                          </div>
                          <p className="text-slate-500 text-xs truncate leading-normal">
                            {thread.lastMessage || ''}
                          </p>
                        </div>
                      ) : null;
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Chat History & Reply */}
              <div className={`flex-1 flex flex-col bg-slate-50 justify-between w-full md:w-auto ${!activeThread ? 'hidden md:flex' : 'flex'}`}>
                {activeThread ? (
                  <>
                    {/* Header */}
                    <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => { setActiveThread(null); setShowChatList(true); }}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 md:hidden"
                          aria-label="Back to conversations"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                        <h4 className="font-bold text-slate-800 text-sm md:text-base">
                          {activeThread.senderName} এর সাথে চ্যাট
                        </h4>
                      </div>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-grow p-4 overflow-y-auto space-y-3">
                      {Array.isArray(messages) && messages.length > 0 ? (
                        messages.filter(Boolean).map((msg, index) => {
                          const isAdmin = msg.sender === "admin";
                          return (
                            <div
                              key={msg._id || msg.id || index}
                              className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                            >
                              <span className="text-[9px] text-slate-400 mb-0.5 px-1">
                                {isAdmin ? "অ্যাডমিন সাপোর্ট" : msg.senderName || ''}
                              </span>
                              <div
                                className={`max-w-[85%] md:max-w-[70%] px-3.5 py-2.5 text-xs rounded-2xl shadow-sm ${
                                  isAdmin
                                    ? "bg-teal-700 text-white rounded-tr-none"
                                    : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                                }`}
                              >
                                {msg.message || ''}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center text-xs text-slate-400 py-8">
                          {'কোনো মেসেজ পাওয়া যায়নি।'}
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Reply Input Form */}
                    <form
                      onSubmit={handleSendReply}
                      className="p-4 bg-white border-t border-slate-200 flex items-center space-x-2"
                    >
                      <input
                        type="text"
                        required
                        placeholder="আপনার রিপ্লাই বার্তাটি লিখুন..."
                        value={adminReplyText}
                        onChange={(e) => setAdminReplyText(e.target.value)}
                        className="flex-grow px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-teal-600"
                      />
                      <button
                        type="submit"
                        disabled={isSendingReply}
                        className="p-3 bg-teal-700 text-white rounded-xl hover:bg-teal-800 transition-colors shadow-md flex items-center justify-center focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSendingReply ? <span className="text-xs">...</span> : <Send className="w-4 h-4" />}
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="m-auto text-slate-400 text-xs md:text-sm flex flex-col items-center space-y-2 p-6 text-center">
                    <MessageSquare className="w-10 h-10 text-slate-350" />
                    <span>
                      বাম পাশের তালিকা থেকে একজন গ্রাহক নির্বাচন করুন।
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SLIDER BANNER CRUD */}
          {activeTab === "sliders" && (
            <div className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-450 font-medium">
                  হোমপেজের স্লাইডার এডিটর প্যানেল
                </span>
                <button
                  onClick={() => setIsCrudModalOpen(true)}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold curvy-button shadow-sm flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন স্লাইডার যুক্ত করুন</span>
                </button>
              </div>

              {/* Slider list */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {sliders.map((item) => (
                  <div
                    key={item._id || item.id}
                    className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
                  >
                    <div className="h-36 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={getImageUrl(item.imageUrl)}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <h4 className="font-bold text-slate-800 text-xs md:text-sm line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-slate-450 text-[10px] line-clamp-2">
                        {item.subtitle}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2">
                      <button
                        onClick={() => openEditModal("slider", item)}
                        className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-650 shadow-sm"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteItem("slider", item._id || item.id)
                        }
                        disabled={processingId === "delete_slider_" + (item._id || item.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-650 transition-colors disabled:opacity-50"
                      >
                        {processingId === "delete_slider_" + (item._id || item.id) ? <span className="text-[10px]">...</span> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: JOB CIRCULARS CRUD */}
          {activeTab === "circulars" && (
            <div className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-450 font-medium">
                  দক্ষ শ্রমিক নিয়োগ সার্কুলার এডিটর
                </span>
                <button
                  onClick={() => setIsCrudModalOpen(true)}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold curvy-button shadow-sm flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন সার্কুলার যুক্ত করুন</span>
                </button>
              </div>

              {/* Circulars list */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {circulars.map((item) => (
                  <div
                    key={item._id || item.id}
                    className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
                  >
                    <div className="h-32 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={getImageUrl(item.imageUrl)}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-md text-[8px] font-bold">
                        {item.country}
                      </span>
                      <h4 className="font-bold text-slate-800 text-xs md:text-sm line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-teal-800 font-extrabold text-[10px]">
                        বেতন: {item.salaryRange}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2">
                      <button
                        onClick={() => openEditModal("circular", item)}
                        className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-650 shadow-sm"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteItem("circular", item._id || item.id)
                        }
                        disabled={processingId === "delete_circular_" + (item._id || item.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-650 transition-colors disabled:opacity-50"
                      >
                        {processingId === "delete_circular_" + (item._id || item.id) ? <span className="text-[10px]">...</span> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: TOUR PACKAGES CRUD */}
          {activeTab === "packages" && (
            <div className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-450 font-medium">
                  ট্যুর প্যাকেজ বুকিং এডিটর
                </span>
                <button
                  onClick={() => setIsCrudModalOpen(true)}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold curvy-button shadow-sm flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন ট্যুর প্যাকেজ যুক্ত করুন</span>
                </button>
              </div>

              {/* Packages list */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {packages.map((item) => (
                  <div
                    key={item._id || item.id}
                    className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
                  >
                    <div className="h-32 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={getImageUrl(item.imageUrl)}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-800 border border-indigo-100 rounded-md text-[8px] font-bold">
                        {item.destination}
                      </span>
                      <h4 className="font-bold text-slate-800 text-xs md:text-sm line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-teal-800 font-extrabold text-[10px]">
                        মূল্য: ৳{item.price.toLocaleString("bn-BD")}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2">
                      <button
                        onClick={() => openEditModal("package", item)}
                        className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-650 shadow-sm"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteItem("package", item._id || item.id)
                        }
                        disabled={processingId === "delete_package_" + (item._id || item.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-650 transition-colors disabled:opacity-50"
                      >
                        {processingId === "delete_package_" + (item._id || item.id) ? <span className="text-[10px]">...</span> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: BLOG MANAGEMENT CRUD */}
          {activeTab === "blogs" && (
            <div className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-450 font-medium">
                  ইনফরমেশন ও এডুকেশন ব্লগ প্যানেল
                </span>
                <button
                  onClick={() => setIsCrudModalOpen(true)}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold curvy-button shadow-sm flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন ব্লগ লিখুন</span>
                </button>
              </div>

              {/* Blogs list */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {blogs.map((item) => (
                  <div
                    key={item._id || item.id}
                    className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
                  >
                    <div className="h-32 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={getImageUrl(item.imageUrl)}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 space-y-2 flex-grow">
                      <h4 className="font-bold text-slate-800 text-xs md:text-sm line-clamp-2 leading-tight">
                        {item.title}
                      </h4>
                      <p className="text-slate-450 text-[10px] line-clamp-2">
                        {item.content?.replace(/<[^>]*>/g, '')}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2">
                      <button
                        onClick={() => openEditModal("blog", item)}
                        className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-650 shadow-sm"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteItem("blog", item._id || item.id)
                        }
                        disabled={processingId === "delete_blog_" + (item._id || item.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-650 transition-colors flex items-center space-x-1 font-semibold text-[10px] disabled:opacity-50"
                      >
                        {processingId === "delete_blog_" + (item._id || item.id) ? <span className="text-[10px]">...</span> : <><Trash2 className="w-3.5 h-3.5" /><span>মুছুন</span></>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: CLIENT REVIEW MANAGEMENT CRUD */}
          {activeTab === "reviews" && (
            <div className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-450 font-medium">
                  গ্রাহক প্রতিক্রিয়া রিভিউ মডারেটর
                </span>
                <button
                  onClick={() => setIsCrudModalOpen(true)}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold curvy-button shadow-sm flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন রিভিউ যোগ করুন</span>
                </button>
              </div>

              {/* Reviews list */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {reviews.map((item) => (
                  <div
                    key={item._id || item.id}
                    className="border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-1">
                        {[...Array(item.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>
                      <p className="text-slate-600 text-xs italic line-clamp-3">
                        "{item.reviewText}"
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={getImageUrl(item.imageUrl)}
                          alt={item.clientName}
                          className="w-8 h-8 rounded-full object-cover border"
                        />
                        <div>
                          <h4 className="font-bold text-slate-800 text-[11px]">
                            {item.clientName}
                          </h4>
                          <span className="text-[9px] text-slate-400 block">
                            {item.clientRole}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleDeleteItem("review", item._id || item.id)
                        }
                        disabled={processingId === "delete_review_" + (item._id || item.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-650 transition-colors disabled:opacity-50"
                      >
                        {processingId === "delete_review_" + (item._id || item.id) ? <span className="text-[10px]">...</span> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: PHOTO GALLERY CRUD */}
          {activeTab === "gallery" && (
            <div className="bg-white p-6 rounded-2xl border border-teal-50 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-450 font-medium">
                  ফটো গ্যালারি ম্যানেজমেন্ট প্যানেল
                </span>
                <button
                  onClick={() => setIsCrudModalOpen(true)}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold curvy-button shadow-sm flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন ছবি যুক্ত করুন</span>
                </button>
              </div>

              {/* Gallery list */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {galleryItems.map((item) => (
                  <div
                    key={item._id || item.id}
                    className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
                  >
                    <div className="h-40 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={getImageUrl(item.imageUrl)}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <h4 className="font-bold text-slate-800 text-xs md:text-sm line-clamp-1">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-slate-450 text-[10px] line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2">
                      <button
                        onClick={() => openEditModal("gallery", item)}
                        className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-650 shadow-sm"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteItem("gallery", item._id || item.id)
                        }
                        disabled={processingId === "delete_gallery_" + (item._id || item.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-650 transition-colors disabled:opacity-50"
                      >
                        {processingId === "delete_gallery_" + (item._id || item.id) ? <span className="text-[10px]">...</span> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* CRUD MODAL FOR ADDING/EDITING DATA */}
      {isCrudModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 relative animate-in zoom-in-95 duration-200 text-slate-800 shadow-2xl">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-650 hover:bg-slate-50 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-800 mb-6">
              {editingId ? "রিকর্ড আপডেট এডিটর" : "নতুন রেকর্ড অ্যাড প্যানেল"}
            </h3>

            {/* Render conditional forms based on tab */}
            {activeTab === "sliders" && (
              <form onSubmit={handleSliderSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    স্লাইডার শিরোনাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={sliderTitle}
                    onChange={(e) => setSliderTitle(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    স্লাইডার বিবরণ *
                  </label>
                  <textarea
                    required
                    value={sliderSubtitle}
                    onChange={(e) => setSliderSubtitle(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                    rows="3"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      লিংক URL (অ্যাকশন)
                    </label>
                    <input
                      type="text"
                      value={sliderAction}
                      onChange={(e) => setSliderAction(e.target.value)}
                      className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      অর্ডার নম্বর (সাজানো)
                    </label>
                    <input
                      type="number"
                      value={sliderOrder}
                      onChange={(e) => setSliderOrder(e.target.value)}
                      className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    স্লাইডার ব্যানার ইমেজ *
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSliderImageFile(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                    <span className="text-xs text-slate-500 block">
                      {sliderImageFile ? sliderImageFile.name : 'ক্লিক করে ছবি আপলোড করুন'}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">JPG, PNG (সর্বোচ্চ ৫ এমবি)</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingSlider}
                  className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold curvy-button shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingSlider ? "সেভ করা হচ্ছে..." : "স্লাইডার সেভ করুন"}
                </button>
              </form>
            )}

            {activeTab === "circulars" && (
              <form onSubmit={handleCircularSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    সার্কুলার জব টাইটেল *
                  </label>
                  <input
                    type="text"
                    required
                    value={circTitle}
                    onChange={(e) => setCircTitle(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    বিবরণ
                  </label>
                  <textarea
                    value={circDescription}
                    onChange={(e) => setCircDescription(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                    rows="3"
                    placeholder="চাকরির বিস্তারিত বিবরণ লিখুন..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      দেশ *
                    </label>
                    <select
                      required
                      value={circCountry}
                      onChange={(e) => setCircCountry(e.target.value)}
                      className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50 bg-white"
                    >
                      <option value="">দেশ নির্বাচন করুন</option>
                      {countries.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      ক্যাটাগরি *
                    </label>
                    <select
                      required
                      value={circCat}
                      onChange={(e) => setCircCat(e.target.value)}
                      className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50 bg-white"
                    >
                      <option value="">ক্যাটাগরি নির্বাচন করুন</option>
                      {['Construction', "Labor Worker", "Mason", "Carpenter", "Scaffolder", ' Civil Engineer', " Piping Engineer", "Civil Supervisor", 'Caregiver', 'Driving', 'Hospitality', 'IT/Engineering', "Civil Foreman", "Piping Supervisor", ' Piping Foreman', "Pipe Fitter", "Welder", "Plumber", "Helper"].map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    বেতন পরিসীমা *
                  </label>
                  <input
                    type="text"
                    required
                    value={circSalary}
                    onChange={(e) => setCircSalary(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                    placeholder="যেমন: ৮০০ ইউরো / মাস"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    যোগ্যতার রিকোয়ারমেন্টস (লাইন ব্রেক দিয়ে লিখুন) *
                  </label>
                  <textarea
                    required
                    value={circReqs}
                    onChange={(e) => setCircReqs(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50 font-medium"
                    rows="4"
                    placeholder="১. ২ বছরের অভিজ্ঞতা&#10;২. ভাষা দক্ষতা..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    ফিচার্ড ইমেজ *
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCircImageFile(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                    <span className="text-xs text-slate-500 block">
                      {circImageFile ? circImageFile.name : 'ক্লিক করে ছবি আপলোড করুন'}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">JPG, PNG (সর্বোচ্চ ৫ এমবি)</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingCircular}
                  className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold curvy-button shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingCircular ? "সেভ করা হচ্ছে..." : "সার্কুলার সেভ করুন"}
                </button>
              </form>
            )}

            {activeTab === "passports" && (
              <form onSubmit={handlePassportSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-650 mb-1">
                    পাসপোর্ট ধারির নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={holderName}
                    onChange={(e) => setHolderName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-650 mb-1">
                    পাসপোর্ট নাম্বার *
                  </label>
                  <input
                    type="text"
                    required
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-650 mb-1">
                    দেশ (Country) *
                  </label>
                  <select
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50 bg-white"
                  >
                    <option value="">দেশ নির্বাচন করুন</option>
                    {countries.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-650 mb-1">
                    পাসপোর্ট জমা দেওয়ার তারিখ *
                  </label>
                  <input
                    type="date"
                    required
                    value={submissionDate}
                    onChange={(e) => setSubmissionDate(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-650 mb-1">
                    পাসপোর্ট এর পিডিএফ ফাইল *
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors relative">
                    <input
                      type="file"
                      required={!editingId}
                      accept=".pdf"
                      onChange={(e) => setPassportFile(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                    <span className="text-xs text-slate-500 block">
                      {passportFile ? passportFile.name : 'ক্লিক করে পিডিএফ ফাইলটি আপলোড করুন'}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">সর্বোচ্চ ১০ এমবি (PDF ফরম্যাট)</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingPassport}
                  className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold curvy-button shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingPassport ? "সেভ করা হচ্ছে..." : "পাসপোর্ট সেভ করুন"}
                </button>
              </form>
            )}

            {activeTab === "packages" && (
              <form onSubmit={handlePackageSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    প্যাকেজ টাইটেল *
                  </label>
                  <input
                    type="text"
                    required
                    value={pkgTitle}
                    onChange={(e) => setPkgTitle(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      গন্তব্য *
                    </label>
                    <input
                      type="text"
                      required
                      value={pkgDest}
                      onChange={(e) => setPkgDest(e.target.value)}
                      className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                      placeholder="যেমন: Nepal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      সময়কাল *
                    </label>
                    <input
                      type="text"
                      required
                      value={pkgDur}
                      onChange={(e) => setPkgDur(e.target.value)}
                      className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                      placeholder="যেমন: ৫ দিন ৪ রাত"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      প্যাকেজ মূল্য *
                    </label>
                    <input
                      type="number"
                      required
                      value={pkgPrice}
                      onChange={(e) => setPkgPrice(e.target.value)}
                      className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                      placeholder="৳ মূল্য"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    সংক্ষিপ্ত বর্ণনা *
                  </label>
                  <textarea
                    required
                    value={pkgDesc}
                    onChange={(e) => setPkgDesc(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    বিস্তারিত ভ্রমণ পরিকল্পনা (লাইন ব্রেক দিয়ে লিখুন)
                  </label>
                  <textarea
                    value={pkgItin}
                    onChange={(e) => setPkgItin(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50 font-medium"
                    rows="4"
                    placeholder="১ম দিন: আগমন ও হোটেলে ট্রান্সফার&#10;২য় দিন: দরবার স্কয়ার..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    প্যাকেজ ইমেজ *
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPkgImageFile(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                    <span className="text-xs text-slate-500 block">
                      {pkgImageFile ? pkgImageFile.name : 'ক্লিক করে ছবি আপলোড করুন'}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">JPG, PNG (সর্বোচ্চ ৫ এমবি)</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingPackage}
                  className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold curvy-button shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingPackage ? "সেভ করা হচ্ছে..." : "প্যাকেজ সেভ করুন"}
                </button>
              </form>
            )}

            {activeTab === "blogs" && (
              <form onSubmit={handleBlogSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    ব্লগ শিরোনাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={blogTitle}
                    onChange={(e) => setBlogTitle(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    লেখক
                  </label>
                  <input
                    type="text"
                    value={blogAuthor}
                    onChange={(e) => setBlogAuthor(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                    placeholder="অ্যাডমিন"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    ব্লগ কনটেন্ট *
                  </label>
                  <JoditEditor value={blogContent} onChange={setBlogContent} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    ব্লগ কাভার ইমেজ *
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setBlogImageFile(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                    <span className="text-xs text-slate-500 block">
                      {blogImageFile ? blogImageFile.name : 'ক্লিক করে ছবি আপলোড করুন'}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">JPG, PNG (সর্বোচ্চ ৫ এমবি)</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingBlog}
                  className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold curvy-button shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingBlog ? "সেভ করা হচ্ছে..." : "ব্লগ সেভ করুন"}
                </button>
              </form>
            )}

            {activeTab === "reviews" && (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      ক্লায়েন্টের নাম *
                    </label>
                    <input
                      type="text"
                      required
                      value={revName}
                      onChange={(e) => setRevName(e.target.value)}
                      className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      পদবী ও দেশ *
                    </label>
                    <input
                      type="text"
                      required
                      value={revRole}
                      onChange={(e) => setRevRole(e.target.value)}
                      className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                      placeholder="যেমন: কনস্ট্রাকশন ফোরম্যান (রোমানিয়া)"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    রেটিং (১-৫) *
                  </label>
                  <select
                    value={revRating}
                    onChange={(e) => setRevRating(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50 bg-white"
                  >
                    <option value="5">৫ স্টার</option>
                    <option value="4">৪ স্টার</option>
                    <option value="3">৩ স্টার</option>
                    <option value="2">২ স্টার</option>
                    <option value="1">১ স্টার</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    রিভিউ প্রতিক্রিয়া টেক্সট *
                  </label>
                  <textarea
                    required
                    value={revText}
                    onChange={(e) => setRevText(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    গ্রাহকের ছবি *
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setRevImageFile(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                    <span className="text-xs text-slate-500 block">
                      {revImageFile ? revImageFile.name : 'ক্লিক করে ছবি আপলোড করুন'}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">JPG, PNG (সর্বোচ্চ ৫ এমবি)</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold curvy-button shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingReview ? "সেভ করা হচ্ছে..." : "রিভিউ সেভ করুন"}
                </button>
              </form>
            )}

            {activeTab === "gallery" && (
              <form onSubmit={handleGallerySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    গ্যালারি টাইটেল *
                  </label>
                  <input
                    type="text"
                    required
                    value={galleryTitle}
                    onChange={(e) => setGalleryTitle(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    বিবরণ
                  </label>
                  <textarea
                    value={galleryDescription}
                    onChange={(e) => setGalleryDescription(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-teal-700 bg-slate-50"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {editingId ? "নতুন ছবি (পরিবর্তন করতে চাইলে)" : "ছবি আপলোড *"}
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors relative">
                    <input
                      type="file"
                      accept="image/*"
                      required={!editingId}
                      onChange={(e) => setGalleryImageFile(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                    <span className="text-xs text-slate-500 block">
                      {galleryImageFile ? galleryImageFile.name : 'ক্লিক করে ছবি আপলোড করুন'}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">JPG, PNG (সর্বোচ্চ ৫ এমবি)</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingGallery}
                  className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold curvy-button shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingGallery ? "সেভ করা হচ্ছে..." : editingId ? "গ্যালারি আপডেট করুন" : "গ্যালারি সেভ করুন"}
                </button>
              </form>
            )}

            {activeTab === "change-password" && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-md">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">পাসওয়ার্ড পরিবর্তন</h2>
                    <p className="text-[11px] text-slate-400">আপনার পাসওয়ার্ড আপডেট করুন।</p>
                  </div>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">বর্তমান পাসওয়ার্ড *</label>
                    <div className="relative">
                      <input
                        type={showOldPassword ? 'text' : 'password'}
                        required
                        placeholder="বর্তমান পাসওয়ার্ড দিন"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-teal-700 bg-slate-50 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">নতুন পাসওয়ার্ড *</label>
                    <div className="relative">
                      <input
                        type={showNewPasswordState ? 'text' : 'password'}
                        required
                        placeholder="নতুন পাসওয়ার্ড দিন"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-teal-700 bg-slate-50 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPasswordState(!showNewPasswordState)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showNewPasswordState ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">পাসওয়ার্ড কনফার্ম *</label>
                    <div className="relative">
                      <input
                        type={showConfirmNewPassword ? 'text' : 'password'}
                        required
                        placeholder="নতুন পাসওয়ার্ড আবার দিন"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-teal-700 bg-slate-50 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isChangingPassword ? "পরিবর্তন হচ্ছে..." : "পাসওয়ার্ড পরিবর্তন করুন"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
