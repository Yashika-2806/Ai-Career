import React, { useState } from 'react';
import { 
  FileText, Download, Zap, 
  Plus, Sparkles, RefreshCw, Eye, Settings,
  Briefcase, FolderGit2, GraduationCap, Award, Trophy
} from 'lucide-react';
import { resumeService } from '../services/api';
import { ProfilePictureUpload } from '../components/ProfilePictureUpload';
import { TemplateSelector } from '../components/TemplateSelector';
import { ExperienceForm, ProjectForm, EducationForm, CertificationForm, AchievementForm, SkillsEditor } from '../components/ResumeInputForms';
import { ModernTemplate, ClassicTemplate, MinimalTemplate, CreativeTemplate, ResumeData } from '../components/ResumeTemplates';
import { generatePDF } from '../utils/pdfGenerator';

export const EnhancedResume: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData>({
    profilePicture: '',
    fullName: '',
    email: '',
    phone: '',
    location: '',
    portfolio: '',
    linkedinUrl: '',
    githubUsername: '',
    leetcodeUsername: '',
    codeforcesUsername: '',
    summary: '',
    skills: {
      languages: [],
      frameworks: [],
      tools: [],
      databases: []
    },
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    achievements: []
  });

  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [generating, setGenerating] = useState(false);
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [showCertificationForm, setShowCertificationForm] = useState(false);
  const [showAchievementForm, setShowAchievementForm] = useState(false);
  const [showSkillsEditor, setShowSkillsEditor] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [syncing, setSyncing] = useState(false);

  const [profileInputs, setProfileInputs] = useState({
    githubUsername: '',
    leetcodeUsername: '',
    codeforcesHandle: '',
    linkedinUrl: ''
  });

  const [profilesLinked, setProfilesLinked] = useState({
    github: false,
    leetcode: false,
    codeforces: false,
    linkedin: false
  });
  const [fetchedData, setFetchedData] = useState<any>(null);


  // Add handlers for forms
  const addExperience = (exp: any) => {
    setResumeData({ ...resumeData, experience: [...resumeData.experience, exp] });
  };

  const addProject = (project: any) => {
    setResumeData({ ...resumeData, projects: [...resumeData.projects, project] });
  };

  const addEducation = (edu: any) => {
    setResumeData({ ...resumeData, education: [...resumeData.education, edu] });
  };

  const addCertification = (cert: any) => {
    setResumeData({ ...resumeData, certifications: [...resumeData.certifications, cert] });
  };

  const addAchievement = (achievement: any) => {
    setResumeData({ ...resumeData, achievements: [...resumeData.achievements, achievement] });
  };

  const updateSkills = (skills: string[]) => {
    // Convert flat array to categorized skills
    setResumeData({ 
      ...resumeData, 
      skills: {
        languages: skills.filter(s => !s.includes('React') && !s.includes('Express')),
        frameworks: skills.filter(s => s.includes('React') || s.includes('Express')),
        tools: [],
        databases: []
      }
    });
  };

  const handleSyncProfiles = async () => {
    setSyncing(true);
    try {
      const response = await resumeService.syncProfiles({
        github: profileInputs.githubUsername,
        leetcode: profileInputs.leetcodeUsername,
        codeforces: profileInputs.codeforcesHandle,
        linkedin: profileInputs.linkedinUrl
      });
      
      setProfilesLinked({
        github: !!profileInputs.githubUsername,
        leetcode: !!profileInputs.leetcodeUsername,
        codeforces: !!profileInputs.codeforcesHandle,
        linkedin: !!profileInputs.linkedinUrl
      });

      // Store fetched data
      setFetchedData(response.data || {});
      
      setShowProfileModal(false);
      
      // Show detailed success message with fetched data
      let successMsg = 'Profiles synced successfully!\n\n';
      if (response.data?.github && !response.data.github.error) {
        successMsg += `✓ GitHub: ${response.data.github.name || response.data.github.username} (${response.data.github.publicRepos} repos, ${response.data.github.followers} followers)\n`;
      }
      if (response.data?.leetcode && !response.data.leetcode.error) {
        successMsg += `✓ LeetCode: ${response.data.leetcode.solvedProblems} problems solved\n`;
      }
      if (response.data?.codeforces && !response.data.codeforces.error) {
        successMsg += `✓ Codeforces: ${response.data.codeforces.rank} (${response.data.codeforces.rating} rating)\n`;
      }
      if (response.data?.linkedin && !response.data.linkedin.error) {
        successMsg += `✓ LinkedIn: Profile linked\n`;
      }
      successMsg += '\nYou can now generate your resume!';
      
      alert(successMsg);
    } catch (error) {
      console.error('Profile sync failed:', error);
      alert('Failed to sync profiles. Please check your usernames and try again.');
    } finally {
      setSyncing(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const fileName = `${resumeData.fullName || 'resume'}_${selectedTemplate}.pdf`;
      await generatePDF('resume-preview', fileName);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const renderTemplate = () => {
    const templateProps = {
      data: resumeData,
      profileImage: resumeData.profilePicture || ''
    };

    switch (selectedTemplate) {
      case 'modern':
        return <ModernTemplate {...templateProps} />;
      case 'classic':
        return <ClassicTemplate {...templateProps} />;
      case 'minimal':
        return <MinimalTemplate {...templateProps} />;
      case 'creative':
        return <CreativeTemplate {...templateProps} />;
      default:
        return <ModernTemplate {...templateProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <FileText className="w-10 h-10" />
            Professional Resume Builder
          </h1>
          <p className="text-purple-200">Create stunning resumes with AI assistance and multiple templates</p>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'edit'
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/15'
            }`}
          >
            <Settings className="w-5 h-5 inline mr-2" />
            Edit Resume
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'preview'
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/15'
            }`}
          >
            <Eye className="w-5 h-5 inline mr-2" />
            Preview & Download
          </button>
        </div>

        {/* Edit Tab */}
        {activeTab === 'edit' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile & Basic Info */}
            <div className="space-y-6">
              {/* Profile Picture */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                <ProfilePictureUpload
                  currentImage={resumeData.profilePicture}
                  onImageChange={(img) => setResumeData({ ...resumeData, profilePicture: img })}
                />
              </div>

              {/* Personal Info */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={resumeData.fullName}
                    onChange={(e) => setResumeData({ ...resumeData, fullName: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={resumeData.email}
                    onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={resumeData.phone}
                    onChange={(e) => setResumeData({ ...resumeData, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={resumeData.location}
                    onChange={(e) => setResumeData({ ...resumeData, location: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                  />
                  <input
                    type="url"
                    placeholder="LinkedIn URL"
                    value={resumeData.linkedinUrl || ''}
                    onChange={(e) => setResumeData({ ...resumeData, linkedinUrl: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                  />
                  <input
                    type="url"
                    placeholder="GitHub Username"
                    value={resumeData.githubUsername || ''}
                    onChange={(e) => setResumeData({ ...resumeData, githubUsername: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                  />
                  <input
                    type="url"
                    placeholder="Portfolio Website (Optional)"
                    value={resumeData.portfolio || ''}
                    onChange={(e) => setResumeData({ ...resumeData, portfolio: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              {/* Professional Summary */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Professional Summary</h3>
                <textarea
                  placeholder="Write a brief professional summary..."
                  value={resumeData.summary}
                  onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 min-h-[120px]"
                />
              </div>
            </div>

            {/* Middle Column - Experience, Projects, Education */}
            <div className="space-y-6">
              {/* Experience Section */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Experience ({resumeData.experience.length})
                  </h3>
                  <button
                    onClick={() => setShowExperienceForm(true)}
                    className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm flex items-center gap-1 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {resumeData.experience.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">No experience added yet</p>
                  ) : (
                    resumeData.experience.map((exp, idx) => (
                      <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-lg">
                        <p className="text-white font-medium">{exp.title}</p>
                        <p className="text-gray-400 text-sm">{exp.company}</p>
                        <p className="text-gray-500 text-xs">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Projects Section */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <FolderGit2 className="w-5 h-5" />
                    Projects ({resumeData.projects.length})
                  </h3>
                  <button
                    onClick={() => setShowProjectForm(true)}
                    className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm flex items-center gap-1 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {resumeData.projects.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">No projects added yet</p>
                  ) : (
                    resumeData.projects.map((proj, idx) => (
                      <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-lg">
                        <p className="text-white font-medium">{proj.name}</p>
                        <p className="text-gray-400 text-sm line-clamp-2">{proj.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Education Section */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Education ({resumeData.education.length})
                  </h3>
                  <button
                    onClick={() => setShowEducationForm(true)}
                    className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm flex items-center gap-1 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {resumeData.education.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">No education added yet</p>
                  ) : (
                    resumeData.education.map((edu, idx) => (
                      <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-lg">
                        <p className="text-white font-medium">{edu.degree}</p>
                        <p className="text-gray-400 text-sm">{edu.institution}</p>
                        <p className="text-gray-500 text-xs">CGPA: {edu.cgpa}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Skills, Certifications, Achievements */}
            <div className="space-y-6">
              {/* Skills Section */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Skills ({[...resumeData.skills.languages, ...resumeData.skills.frameworks, ...resumeData.skills.tools, ...resumeData.skills.databases].length})
                  </h3>
                  <button
                    onClick={() => setShowSkillsEditor(true)}
                    className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm flex items-center gap-1 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Edit
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[...resumeData.skills.languages, ...resumeData.skills.frameworks, ...resumeData.skills.tools, ...resumeData.skills.databases].length === 0 ? (
                    <p className="text-gray-400 text-sm text-center w-full py-4">No skills added yet</p>
                  ) : (
                    [...resumeData.skills.languages, ...resumeData.skills.frameworks, ...resumeData.skills.tools, ...resumeData.skills.databases].map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-purple-300 text-sm"
                      >
                        {skill}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Certifications Section */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Certifications ({resumeData.certifications.length})
                  </h3>
                  <button
                    onClick={() => setShowCertificationForm(true)}
                    className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm flex items-center gap-1 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {resumeData.certifications.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">No certifications added yet</p>
                  ) : (
                    resumeData.certifications.map((cert, idx) => (
                      <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-lg">
                        <p className="text-white font-medium text-sm">{cert.name}</p>
                        <p className="text-gray-400 text-xs">{cert.issuer}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Achievements Section */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Achievements ({resumeData.achievements.length})
                  </h3>
                  <button
                    onClick={() => setShowAchievementForm(true)}
                    className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm flex items-center gap-1 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {resumeData.achievements.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">No achievements added yet</p>
                  ) : (
                    resumeData.achievements.map((ach, idx) => (
                      <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-lg">
                        <p className="text-white font-medium text-sm">{ach.title}</p>
                        <p className="text-gray-400 text-xs line-clamp-2">{ach.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Sync Profiles */}
              <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-md border border-purple-400/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Auto-Fill from Profiles
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  Link your GitHub, LeetCode, or Codeforces to automatically import projects and achievements.
                </p>
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg transition"
                >
                  <RefreshCw className="w-4 h-4 inline mr-2" />
                  Sync Profiles
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div className="space-y-6">
            {/* Template Selector */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
              <TemplateSelector
                selectedTemplate={selectedTemplate}
                onSelect={setSelectedTemplate}
              />
            </div>

            {/* Preview and Download */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Resume Preview</h3>
                <button
                  onClick={handleDownloadPDF}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg transition flex items-center gap-2 font-medium"
                >
                  <Download className="w-5 h-5" />
                  Download PDF
                </button>
              </div>

              {/* Preview Container */}
              <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
                <div id="resume-preview" className="w-full">
                  {renderTemplate()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        {showExperienceForm && (
          <ExperienceForm
            onAdd={addExperience}
            onClose={() => setShowExperienceForm(false)}
          />
        )}

        {showProjectForm && (
          <ProjectForm
            onAdd={addProject}
            onClose={() => setShowProjectForm(false)}
          />
        )}

        {showEducationForm && (
          <EducationForm
            onAdd={addEducation}
            onClose={() => setShowEducationForm(false)}
          />
        )}

        {showCertificationForm && (
          <CertificationForm
            onAdd={addCertification}
            onClose={() => setShowCertificationForm(false)}
          />
        )}

        {showAchievementForm && (
          <AchievementForm
            onAdd={addAchievement}
            onClose={() => setShowAchievementForm(false)}
          />
        )}

        {showSkillsEditor && (
          <SkillsEditor
            skills={[...resumeData.skills.languages, ...resumeData.skills.frameworks, ...resumeData.skills.tools, ...resumeData.skills.databases]}
            onUpdate={updateSkills}
            onClose={() => setShowSkillsEditor(false)}
          />
        )}

        {/* Profile Sync Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-white/20 rounded-xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-white mb-6">Link Your Profiles</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">GitHub Username</label>
                  <input
                    type="text"
                    value={profileInputs.githubUsername}
                    onChange={(e) => setProfileInputs({ ...profileInputs, githubUsername: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                    placeholder="octocat"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">LeetCode Username</label>
                  <input
                    type="text"
                    value={profileInputs.leetcodeUsername}
                    onChange={(e) => setProfileInputs({ ...profileInputs, leetcodeUsername: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                    placeholder="username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Codeforces Handle</label>
                  <input
                    type="text"
                    value={profileInputs.codeforcesHandle}
                    onChange={(e) => setProfileInputs({ ...profileInputs, codeforcesHandle: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                    placeholder="tourist"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn URL</label>
                  <input
                    type="url"
                    value={profileInputs.linkedinUrl}
                    onChange={(e) => setProfileInputs({ ...profileInputs, linkedinUrl: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/15 text-gray-300 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSyncProfiles}
                  disabled={syncing}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg transition disabled:opacity-50"
                >
                  {syncing ? 'Syncing...' : 'Sync Profiles'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
