import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Linkedin, Github, Code2, Trophy, 
  Sparkles, RefreshCw, Target, CheckCircle2, Plus, X, Edit2, Save
} from 'lucide-react';
import { resumeService } from '../services/api';
import jsPDF from 'jspdf';

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
  codeche fUrl: string;
  linkedinUrl: string;
}

export const ResumeNew: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddDataModal, setShowAddDataModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [newItemContent, setNewItemContent] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
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
  const [profileData, setProfileData] = useState<any>(null);
  const [resumeGenerated, setResumeGenerated] = useState(false);

  useEffect(() => {
    loadExistingResume();
  }, []);

  const loadExistingResume = async () => {
    try {
      const data = await resumeService.getVersions();
      if (data.versions?.length > 0) {
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
      const syncResponse = await resumeService.syncProfiles(profiles);
      setProfileData(syncResponse.data || {});

      // Generate resume and parse into sections
      const resumeResult = await resumeService.generate();
      parseResumeIntoSections(resumeResult.content, syncResponse.data);
      
      setResumeGenerated(true);
      setShowProfileModal(false);
      alert('✅ Resume generated successfully!');
    } catch (error: any) {
      console.error('Error:', error);
      alert('Failed: ' + (error?.response?.data?.error || error?.message || 'Unknown error'));
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

  const handleDownloadPDF = () => {
    if (!resumeGenerated) return;

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      doc.setFontSize(10);

      sections.forEach(section => {
        // Section header
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(section.title, margin, yPosition);
        yPosition += 10;
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

        yPosition += 5; // Space between sections
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Smart Resume Builder</h1>
            <p className="text-purple-200">AI-powered with multi-platform sync & custom editing</p>
          </div>
          {resumeGenerated && (
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
          )}
        </div>

        {!resumeGenerated ? (
          /* Welcome Screen */
          <div className="max-w-3xl mx-auto text-center py-20">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-12">
              <Sparkles className="w-20 h-20 text-purple-400 mx-auto mb-6" />
              <h2 className="text-4xl font-bold text-white mb-4">Welcome!</h2>
              <p className="text-xl text-purple-200 mb-8">
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
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg font-semibold rounded-xl transition shadow-lg disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Get Started'}
              </button>
            </div>
          </div>
        ) : (
          /* Resume Editor */
          <div className="space-y-6">
            {/* Control Bar */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 flex items-center justify-between">
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                <RefreshCw className="w-4 h-4" />
                Update Profiles
              </button>
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
                          />
                          <button
                            onClick={() => handleSaveEdit(section.id, item.id)}
                            className="p-2 bg-green-600 hover:bg-green-700 text-white rounded transition"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingItemId(null)}
                            className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition"
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
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {item.deletable && (
                              <button
                                onClick={() => handleDeleteItem(section.id, item.id)}
                                className="p-2 bg-red-600/50 hover:bg-red-600 text-white rounded transition"
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
    </div>
  );
};
