import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, Linkedin, Github, Code2, Trophy, 
  Sparkles, RefreshCw, Plus, X, Edit2, Save, Brain, Home as HomeIcon, LogOut, Upload, Image as ImageIcon, Palette
} from 'lucide-react';
import { resumeService } from '../services/api';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/auth.store';

interface ResumeSection {
  id: string;
  title: string;
  items: ResumeSectionItem[];
  editable: boolean;
}

interface ResumeSectionItem {
  id: string;
  content: string;
  source: 'fetched' | 'manual';
  deletable: boolean;
}

interface ProfileInputs {
  githubUrl: string;
  leetcodeUrl: string;
  codeforcesUrl: string;
  hackerrankUrl: string;
  geeksforgeeksUrl: string;
  codechefUrl: string;
  linkedinUrl: string;
}

type ResumeTemplate = 'modern' | 'classic' | 'minimal' | 'creative' | 'professional';

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  address: string;
}

export const Resume: React.FC = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [loading, setLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddDataModal, setShowAddDataModal] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showPersonalInfoModal, setShowPersonalInfoModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [newItemContent, setNewItemContent] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate>('modern');
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    address: ''
  });
  
  const [inputs, setInputs] = useState<ProfileInputs>({
    githubUrl: '',
    leetcodeUrl: '',
    codeforcesUrl: '',
    hackerrankUrl: '',
    geeksforgeeksUrl: '',
    codechefUrl: '',
    linkedinUrl: ''
  });
  
  const [sections, setSections] = useState<ResumeSection[]>([]);
  const [resumeGenerated, setResumeGenerated] = useState(false);

  useEffect(() => {
    loadExistingResume();
  }, []);

  const loadExistingResume = async () => {
    try {
      const data = await resumeService.getVersions() as { versions?: any[] };
      if (data.versions && data.versions.length > 0) {
        // Load existing sections from backend if available
        setResumeGenerated(true);
      }
    } catch (error) {
      console.error('Failed to load resume:', error);
    }
  };

  const extractUsernameFromUrl = (url: string, platform: string): string => {
    if (!url) return '';
    try {
      // GitHub: https://github.com/username
      if (platform === 'github') {
        const match = url.match(/github\.com\/([^\/\?]+)/);
        return match ? match[1] : '';
      }
      // LeetCode: https://leetcode.com/username or https://leetcode.com/u/username
      if (platform === 'leetcode') {
        const match = url.match(/leetcode\.com\/u?\/([^\/\?]+)/);
        return match ? match[1] : '';
      }
      // CodeForces: https://codeforces.com/profile/handle
      if (platform === 'codeforces') {
        const match = url.match(/codeforces\.com\/profile\/([^\/\?]+)/);
        return match ? match[1] : '';
      }
      // HackerRank: https://www.hackerrank.com/username
      if (platform === 'hackerrank') {
        const match = url.match(/hackerrank\.com\/([^\/\?]+)/);
        return match ? match[1] : '';
      }
      // GeeksforGeeks: https://auth.geeksforgeeks.org/user/username
      if (platform === 'gfg') {
        const match = url.match(/geeksforgeeks\.org\/user\/([^\/\?]+)/);
        return match ? match[1] : '';
      }
      // CodeChef: https://www.codechef.com/users/username
      if (platform === 'codechef') {
        const match = url.match(/codechef\.com\/users\/([^\/\?]+)/);
        return match ? match[1] : '';
      }
      return '';
    } catch {
      return '';
    }
  };

  const handleSyncAndGenerate = async () => {
    const hasAnyUrl = Object.values(inputs).some(val => val.trim() !== '');
    if (!hasAnyUrl) {
      alert('Please enter at least one profile URL');
      return;
    }

    setLoading(true);
    try {
      // Extract usernames from URLs
      const profiles = {
        github: extractUsernameFromUrl(inputs.githubUrl, 'github'),
        leetcode: extractUsernameFromUrl(inputs.leetcodeUrl, 'leetcode'),
        codeforces: extractUsernameFromUrl(inputs.codeforcesUrl, 'codeforces'),
        hackerrank: extractUsernameFromUrl(inputs.hackerrankUrl, 'hackerrank'),
        geeksforgeeks: extractUsernameFromUrl(inputs.geeksforgeeksUrl, 'gfg'),
        codechef: extractUsernameFromUrl(inputs.codechefUrl, 'codechef'),
        linkedin: inputs.linkedinUrl // Keep full URL for LinkedIn
      };

      // Sync profiles
      const syncResponse: any = await resumeService.syncProfiles(profiles);
      console.log('✅ Sync response:', syncResponse);

      // Generate resume and parse into sections
      console.log('🔄 Generating resume...');
      const resumeResult: any = await resumeService.generate();
      console.log('✅ Resume generated:', resumeResult);
      parseResumeIntoSections(resumeResult.content, syncResponse.data);
      
      setResumeGenerated(true);
      setShowProfileModal(false);
      alert('✅ Resume generated successfully!');
    } catch (error: any) {
      console.error('❌ Error syncing/generating:', error);
      console.error('❌ Error response:', error?.response);
      console.error('❌ Error data:', error?.response?.data);
      console.error('❌ Error details:', error?.response?.data?.details);
      const errorDetails = error?.response?.data?.details ? '\nDetails: ' + error.response.data.details : '';
      alert('Failed: ' + (error?.response?.data?.error || error?.message || 'Unknown error') + errorDetails);
    } finally {
      setLoading(false);
    }
  };

  const parseResumeIntoSections = (content: string, profileData: any) => {
    const lines = content.split('\n');
    const parsedSections: ResumeSection[] = [];
    let currentSection: ResumeSection | null = null;

    for (const line of lines) {
      if (line.startsWith('=====')) {
        // New section header
        if (currentSection) {
          parsedSections.push(currentSection);
        }
        const title = line.replace(/=/g, '').trim();
        currentSection = {
          id: `section-${Date.now()}-${Math.random()}`,
          title,
          items: [],
          editable: true
        };
      } else if (currentSection && line.trim()) {
        // Add item to current section
        currentSection.items.push({
          id: `item-${Date.now()}-${Math.random()}`,
          content: line,
          source: 'fetched',
          deletable: true
        });
      }
    }

    if (currentSection) {
      parsedSections.push(currentSection);
    }

    // Add special sections from profile data
    if (profileData) {
      // Certificates from LinkedIn
      if (profileData.linkedin?.certificates) {
        const certSection: ResumeSection = {
          id: `section-certificates`,
          title: 'CERTIFICATIONS',
          items: profileData.linkedin.certificates.map((cert: any) => ({
            id: `cert-${Date.now()}-${Math.random()}`,
            content: `${cert.name} - ${cert.issuer}`,
            source: 'fetched' as const,
            deletable: true
          })),
          editable: true
        };
        parsedSections.push(certSection);
      }
    }

    setSections(parsedSections);
  };

  const handleAddItem = () => {
    if (!selectedSection || !newItemContent.trim()) return;

    setSections(sections.map(section => {
      if (section.id === selectedSection) {
        return {
          ...section,
          items: [
            ...section.items,
            {
              id: `item-${Date.now()}-${Math.random()}`,
              content: newItemContent,
              source: 'manual',
              deletable: true
            }
          ]
        };
      }
      return section;
    }));

    setNewItemContent('');
    setShowAddDataModal(false);
    setSelectedSection(null);
  };

  const handleDeleteItem = (sectionId: string, itemId: string) => {
    if (!confirm('Remove this item?')) return;

    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.filter(item => item.id !== itemId)
        };
      }
      return section;
    }));
  };

  const handleEditItem = (itemId: string, content: string) => {
    setEditingItemId(itemId);
    setEditContent(content);
  };

  const handleSaveEdit = (sectionId: string, itemId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.map(item => 
            item.id === itemId ? { ...item, content: editContent } : item
          )
        };
      }
      return section;
    }));
    setEditingItemId(null);
    setEditContent('');
  };

  // Profile picture upload handler
  const handleProfilePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert('File size must be less than 2MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      setProfilePictureFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePicture = () => {
    setProfilePicture('');
    setProfilePictureFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Template configurations
  const templates = {
    modern: {
      name: 'Modern',
      primaryColor: '#00d4ff',
      secondaryColor: '#0ea5e9',
      accentColor: '#1a1f3a',
      font: 'sans-serif',
      layout: 'single-column',
      icon: '🎨',
      headerBg: '#00d4ff',
      headerText: '#000000'
    },
    classic: {
      name: 'Classic',
      primaryColor: '#1e40af',
      secondaryColor: '#3b82f6',
      accentColor: '#eff6ff',
      font: 'serif',
      layout: 'two-column',
      icon: '📋',
      headerBg: '#1e40af',
      headerText: '#ffffff'
    },
    minimal: {
      name: 'Minimal',
      primaryColor: '#000000',
      secondaryColor: '#6b7280',
      accentColor: '#f9fafb',
      font: 'sans-serif',
      layout: 'single-column',
      icon: '✨',
      headerBg: '#000000',
      headerText: '#ffffff'
    },
    creative: {
      name: 'Creative',
      primaryColor: '#7c3aed',
      secondaryColor: '#a78bfa',
      accentColor: '#faf5ff',
      font: 'sans-serif',
      layout: 'two-column',
      icon: '🎭',
      headerBg: '#7c3aed',
      headerText: '#ffffff'
    },
    professional: {
      name: 'Professional',
      primaryColor: '#047857',
      secondaryColor: '#10b981',
      accentColor: '#ecfdf5',
      font: 'sans-serif',
      layout: 'single-column',
      icon: '💼',
      headerBg: '#047857',
      headerText: '#ffffff'
    },
    sunset: {
      name: 'Sunset',
      primaryColor: '#dc2626',
      secondaryColor: '#f97316',
      accentColor: '#fff7ed',
      font: 'sans-serif',
      layout: 'single-column',
      icon: '🌅',
      headerBg: '#dc2626',
      headerText: '#ffffff'
    },
    ocean: {
      name: 'Ocean',
      primaryColor: '#0891b2',
      secondaryColor: '#06b6d4',
      accentColor: '#ecfeff',
      font: 'sans-serif',
      layout: 'single-column',
      icon: '🌊',
      headerBg: '#0891b2',
      headerText: '#ffffff'
    },
    forest: {
      name: 'Forest',
      primaryColor: '#15803d',
      secondaryColor: '#22c55e',
      accentColor: '#f0fdf4',
      font: 'sans-serif',
      layout: 'single-column',
      icon: '🌲',
      headerBg: '#15803d',
      headerText: '#ffffff'
    }
  };

  const handleDownloadPDF = () => {
    if (!resumeGenerated) return;

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const maxWidth = pageWidth - 2 * margin;

      const template = templates[selectedTemplate];
      
      // Convert hex to RGB for jsPDF
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
      };

      // Add colored header background
      const headerHeight = 50;
      const headerBg = hexToRgb(template.headerBg);
      doc.setFillColor(headerBg.r, headerBg.g, headerBg.b);
      doc.rect(0, 0, pageWidth, headerHeight, 'F');
      
      // Add profile picture if available - positioned in top right of header
      if (profilePicture) {
        try {
          const imgWidth = 40;
          const imgHeight = 40;
          const imgX = pageWidth - margin - imgWidth;
          const imgY = 5;
          
          // Add white circular background for photo
          doc.setFillColor(255, 255, 255);
          doc.circle(imgX + imgWidth/2, imgY + imgHeight/2, imgWidth/2 + 1, 'F');
          
          // Add image
          doc.addImage(profilePicture, 'JPEG', imgX, imgY, imgWidth, imgHeight, undefined, 'FAST');
        } catch (error) {
          console.error('Failed to add profile picture:', error);
        }
      }

      // Add name in header (left side)
      let yPosition = 18;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      const headerText = hexToRgb(template.headerText);
      doc.setTextColor(headerText.r, headerText.g, headerText.b);
      
      // Use personal info if provided
      const displayName = personalInfo.fullName || 'Your Name';
      doc.text(displayName, margin, yPosition);
      
      // Contact details below name (left side, won't overlap with photo on right)
      yPosition += 8;
      doc.setFontSize(9);
      const maxContactWidth = pageWidth - 80; // Leave space for photo on right
      
      if (personalInfo.email) {
        doc.text('Email: ' + personalInfo.email, margin, yPosition);
        yPosition += 6;
      }
      if (personalInfo.phone) {
        doc.text('Phone: ' + personalInfo.phone, margin, yPosition);
        yPosition += 6;
      }
      if (personalInfo.location) {
        doc.text('Location: ' + personalInfo.location, margin, yPosition);
        yPosition += 6;
      }
      if (personalInfo.address) {
        const addressLines = doc.splitTextToSize(personalInfo.address, maxContactWidth);
        doc.text(addressLines, margin, yPosition);
      }
      
      // Reset to black text for content
      yPosition = headerHeight + 15;
      doc.setTextColor(0, 0, 0);

      sections.forEach(section => {
        // Section header with primary color
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }

        const primaryColor = hexToRgb(template.primaryColor);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
        doc.text(section.title, margin, yPosition);
        
        // Add colored underline
        doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
        doc.setLineWidth(0.5);
        doc.line(margin, yPosition + 2, margin + 60, yPosition + 2);
        
        yPosition += 10;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // Section items
        section.items.forEach(item => {
          if (yPosition > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }

          const lines = doc.splitTextToSize(item.content, maxWidth);
          lines.forEach((line: string) => {
            if (yPosition > pageHeight - margin) {
              doc.addPage();
              yPosition = margin;
            }
            doc.text(line, margin, yPosition);
            yPosition += 7;
          });
        });

        yPosition += 8; // Space between sections
      });

      const filename = `Resume_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      alert('✅ Resume downloaded as PDF!');
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0f1629] p-6 relative">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0e27]/95 backdrop-blur-md border-b border-[#00d4ff]/30 shadow-[0_0_20px_rgba(0,212,255,0.1)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9] rounded-lg flex items-center justify-center glow-cyan">
              <Brain className="w-6 h-6 text-[#0a0e27]" />
            </div>
            <span className="font-bold text-white text-2xl">Career AI</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-[#1a1f3a] hover:bg-[#1a1f3a]/80 border border-[#00d4ff]/30 rounded-lg text-white transition hover-glow-cyan"
            >
              <HomeIcon className="w-5 h-5" />
              <span className="font-medium">Home</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 pt-20">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-5xl font-bold text-white mb-2">Smart Resume Builder</h1>
            <p className="text-[#00d4ff] text-xl">AI-powered with multi-platform sync & custom editing</p>
          </div>
          {resumeGenerated && (
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setShowTemplateSelector(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#1a1f3a] hover:bg-[#1a1f3a]/80 border border-[#00d4ff]/30 rounded-lg text-white transition hover-glow-cyan"
              >
                <Palette className="w-5 h-5" />
                Template: {templates[selectedTemplate].name}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-[#1a1f3a] hover:bg-[#1a1f3a]/80 border border-[#00d4ff]/30 rounded-lg text-white transition hover-glow-cyan"
              >
                <ImageIcon className="w-5 h-5" />
                {profilePicture ? 'Change Photo' : 'Add Photo'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                className="hidden"
              />
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] hover:shadow-[0_0_30px_rgba(0,212,255,0.6)] text-[#0a0e27] font-bold rounded-lg transition btn-primary-glow text-base"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </button>
            </div>
          )}
        </div>

        {!resumeGenerated ? (
          /* Welcome Screen */
          <div className="max-w-3xl mx-auto text-center py-20">
            <div className="bg-[#1a1f3a]/90 backdrop-blur-md border border-[#00d4ff]/30 rounded-2xl p-12 card-glow">
              <Sparkles className="w-20 h-20 text-[#00d4ff] mx-auto mb-6 glow-cyan" />
              <h2 className="text-5xl font-bold text-white mb-4">Welcome!</h2>
              <p className="text-2xl text-gray-300 mb-8">
                Link your coding profiles to generate an AI-powered, editable resume
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: Github, label: 'GitHub' },
                  { icon: Code2, label: 'LeetCode' },
                  { icon: Trophy, label: 'CodeForces' },
                  { icon: Linkedin, label: 'LinkedIn' },
                  { icon: Code2, label: 'HackerRank' },
                  { icon: Code2, label: 'GeeksforGeeks' },
                  { icon: Code2, label: 'CodeChef' }
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="bg-white/5 rounded-lg p-4">
                    <Icon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-300">{label}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowProfileModal(true)}
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] hover:shadow-[0_0_30px_rgba(0,212,255,0.6)] text-[#0a0e27] text-lg font-bold rounded-xl transition shadow-lg disabled:opacity-50 btn-primary-glow"
              >
                {loading ? 'Generating...' : 'Get Started'}
              </button>
            </div>
          </div>
        ) : (
          /* Resume Editor */
          <div className="space-y-6">
            {/* Control Bar */}
            <div className="bg-[#1a1f3a]/90 backdrop-blur-md border border-[#00d4ff]/30 rounded-lg p-4 flex items-center justify-between card-glow">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] hover:shadow-[0_0_20px_rgba(0,212,255,0.5)] text-[#0a0e27] rounded-lg transition font-semibold btn-primary-glow"
                >
                  <RefreshCw className="w-4 h-4" />
                  Update Profiles
                </button>
                
                <button
                  onClick={() => setShowPersonalInfoModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-semibold"
                >
                  <Edit2 className="w-4 h-4" />
                  Personal Info
                </button>
              </div>
            </div>

            {/* Sections */}
            {sections.map(section => (
              <div key={section.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white">{section.title}</h3>
                  {section.editable && (
                    <button
                      onClick={() => { setSelectedSection(section.id); setShowAddDataModal(true); }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition"
                    >
                      <Plus className="w-4 h-4" />
                      Add Item
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {section.items.map(item => (
                    <div key={item.id} className="bg-white/5 rounded-lg p-4 flex items-start gap-3">
                      {editingItemId === item.id ? (
                        <>
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white resize-none"
                            rows={3}
                            placeholder="Edit content..."
                            aria-label="Edit item content"
                          />
                          <button
                            onClick={() => handleSaveEdit(section.id, item.id)}
                            className="p-2 bg-green-600 hover:bg-green-700 text-white rounded transition"
                            aria-label="Save changes"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingItemId(null)}
                            className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition"
                            aria-label="Cancel editing"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="flex-1 text-gray-300 whitespace-pre-wrap">{item.content}</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditItem(item.id, item.content)}
                              className="p-2 bg-blue-600/50 hover:bg-blue-600 text-white rounded transition"
                              aria-label="Edit item"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {item.deletable && (
                              <button
                                onClick={() => handleDeleteItem(section.id, item.id)}
                                className="p-2 bg-red-600/50 hover:bg-red-600 text-white rounded transition"
                                aria-label="Delete item"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-white/20 rounded-xl p-8 max-w-3xl w-full my-8">
            <h2 className="text-2xl font-bold text-white mb-6">Link Your Profile URLs</h2>
            <p className="text-gray-400 mb-6 text-sm">Enter the full URL of your profiles (e.g., https://github.com/yourusername)</p>

            <div className="space-y-4 mb-6 max-h-[60vh] overflow-y-auto pr-2">
              {[
                { key: 'githubUrl' as keyof ProfileInputs, icon: Github, label: 'GitHub URL', placeholder: 'https://github.com/yourusername' },
                { key: 'linkedinUrl' as keyof ProfileInputs, icon: Linkedin, label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/yourprofile' },
                { key: 'leetcodeUrl' as keyof ProfileInputs, icon: Code2, label: 'LeetCode URL', placeholder: 'https://leetcode.com/yourusername' },
                { key: 'codeforcesUrl' as keyof ProfileInputs, icon: Trophy, label: 'CodeForces URL', placeholder: 'https://codeforces.com/profile/yourhandle' },
                { key: 'hackerrankUrl' as keyof ProfileInputs, icon: Code2, label: 'HackerRank URL', placeholder: 'https://www.hackerrank.com/yourusername' },
                { key: 'geeksforgeeksUrl' as keyof ProfileInputs, icon: Code2, label: 'GeeksforGeeks URL', placeholder: 'https://auth.geeksforgeeks.org/user/yourusername' },
                { key: 'codechefUrl' as keyof ProfileInputs, icon: Code2, label: 'CodeChef URL', placeholder: 'https://www.codechef.com/users/yourusername' }
              ].map(({ key, icon: Icon, label, placeholder }) => (
                <div key={key}>
                  <label className="text-sm text-gray-300 mb-2 block flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {label}
                  </label>
                  <input
                    type="url"
                    value={inputs[key]}
                    onChange={(e) => setInputs({...inputs, [key]: e.target.value})}
                    placeholder={placeholder}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowProfileModal(false)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/15 text-gray-300 rounded-lg transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSyncAndGenerate}
                disabled={loading}
                className="flex-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Sync & Generate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Data Modal */}
      {showAddDataModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/20 rounded-xl p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-white mb-6">Add Custom Data</h2>
            
            <div className="mb-6">
              <label className="text-sm text-gray-300 mb-2 block">Content</label>
              <textarea
                value={newItemContent}
                onChange={(e) => setNewItemContent(e.target.value)}
                placeholder="Enter the content to add to this section..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 resize-none"
                rows={5}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowAddDataModal(false); setNewItemContent(''); setSelectedSection(null); }}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/15 text-gray-300 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                disabled={!newItemContent.trim()}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1f3a] border-2 border-[#00d4ff] rounded-xl p-8 max-w-4xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">Choose Resume Template</h2>
              <button
                onClick={() => setShowTemplateSelector(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {(Object.keys(templates) as ResumeTemplate[]).map((templateKey) => {
                const template = templates[templateKey];
                return (
                  <button
                    key={templateKey}
                    onClick={() => {
                      setSelectedTemplate(templateKey);
                      setShowTemplateSelector(false);
                    }}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      selectedTemplate === templateKey
                        ? 'border-[#00d4ff] bg-[#00d4ff]/10 shadow-[0_0_20px_rgba(0,212,255,0.3)]'
                        : 'border-white/20 bg-white/5 hover:border-[#00d4ff]/50 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-4xl mb-3">{template.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
                    <div className="flex gap-2 justify-center">
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-white/20"
                        style={{ backgroundColor: template.primaryColor }}
                      />
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-white/20"
                        style={{ backgroundColor: template.secondaryColor }}
                      />
                    </div>
                    <p className="text-sm text-gray-400 mt-2">{template.layout}</p>
                  </button>
                );
              })}
            </div>

            <p className="text-center text-gray-400 text-sm">
              Selected: <span className="text-[#00d4ff] font-semibold">{templates[selectedTemplate].name}</span>
            </p>
          </div>
        </div>
      )}

      {/* Profile Picture Preview */}
      {profilePicture && resumeGenerated && (
        <div className="fixed bottom-6 right-6 z-40">
          <div className="bg-[#1a1f3a] border-2 border-[#00d4ff] rounded-lg p-4 shadow-[0_0_30px_rgba(0,212,255,0.3)]">
            <div className="flex items-center gap-3">
              <img 
                src={profilePicture} 
                alt="Profile" 
                className="w-20 h-20 rounded-full object-cover border-2 border-[#00d4ff]"
              />
              <div>
                <p className="text-white font-semibold mb-2">Profile Photo</p>
                <button
                  onClick={handleRemoveProfilePicture}
                  className="flex items-center gap-1 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500 rounded text-red-400 text-sm transition"
                >
                  <X className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Personal Info Modal */}
      {showPersonalInfoModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1f3a] border-2 border-[#00d4ff] rounded-xl p-8 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">Personal Information</h2>
              <button
                onClick={() => setShowPersonalInfoModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Full Name *</label>
                <input
                  type="text"
                  value={personalInfo.fullName}
                  onChange={(e) => setPersonalInfo({...personalInfo, fullName: e.target.value})}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div>
                <label className="text-sm text-gray-300 mb-2 block">Email *</label>
                <input
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div>
                <label className="text-sm text-gray-300 mb-2 block">Phone Number</label>
                <input
                  type="tel"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                  placeholder="+1 234 567 8900"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div>
                <label className="text-sm text-gray-300 mb-2 block">City / Location</label>
                <input
                  type="text"
                  value={personalInfo.location}
                  onChange={(e) => setPersonalInfo({...personalInfo, location: e.target.value})}
                  placeholder="New York, USA"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div>
                <label className="text-sm text-gray-300 mb-2 block">Full Address</label>
                <textarea
                  value={personalInfo.address}
                  onChange={(e) => setPersonalInfo({...personalInfo, address: e.target.value})}
                  placeholder="123 Main Street, Apartment 4B, New York, NY 10001"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff] resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPersonalInfoModal(false)}
                className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/15 text-gray-300 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowPersonalInfoModal(false);
                  alert('✅ Personal information saved!');
                }}
                disabled={!personalInfo.fullName || !personalInfo.email}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] hover:shadow-[0_0_20px_rgba(0,212,255,0.5)] text-[#0a0e27] font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Information
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
