import React from 'react';

export interface ResumeData {
  // Personal Info
  fullName: string;
  email: string;
  phone: string;
  location: string;
  portfolio?: string;
  profilePicture?: string;
  
  // Links
  linkedinUrl?: string;
  githubUsername?: string;
  leetcodeUsername?: string;
  codeforcesUsername?: string;
  
  // Content
  summary: string;
  
  skills: {
    languages: string[];
    frameworks: string[];
    tools: string[];
    databases: string[];
  };
  
  experience: Array<{
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string[];
  }>;
  
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
    highlights: string[];
  }>;
  
  education: Array<{
    degree: string;
    institution: string;
    location: string;
    startDate: string;
    endDate: string;
    cgpa?: string;
  }>;
  
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    url?: string;
  }>;
  
  achievements: Array<{
    title: string;
    description: string;
  }>;
}

interface TemplateProps {
  data: ResumeData;
}

// Modern Template
export const ModernTemplate: React.FC<TemplateProps> = ({ data }) => {
  return (
    <div className="resume-template bg-white text-gray-900 p-8 max-w-4xl mx-auto" style={{ minHeight: '1056px', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="border-b-4 border-blue-600 pb-6 mb-6">
        <div className="flex items-start gap-6">
          {data.profilePicture && (
            <img src={data.profilePicture} alt={data.fullName} className="w-24 h-24 rounded-full object-cover border-4 border-blue-600" />
          )}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{data.fullName}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span>📧 {data.email}</span>
              <span>📱 {data.phone}</span>
              <span>📍 {data.location}</span>
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              {data.githubUsername && <span className="text-xs bg-gray-100 px-2 py-1 rounded">GitHub: {data.githubUsername}</span>}
              {data.leetcodeUsername && <span className="text-xs bg-gray-100 px-2 py-1 rounded">LeetCode: {data.leetcodeUsername}</span>}
              {data.linkedinUrl && <span className="text-xs bg-gray-100 px-2 py-1 rounded">LinkedIn</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-blue-600 mb-3 flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-600"></div>
            PROFESSIONAL SUMMARY
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">{data.summary}</p>
        </div>
      )}

      {/* Skills */}
      {data.skills && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-blue-600 mb-3 flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-600"></div>
            TECHNICAL SKILLS
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {data.skills.languages.length > 0 && (
              <div>
                <span className="font-semibold text-gray-800">Languages: </span>
                <span className="text-gray-700">{data.skills.languages.join(', ')}</span>
              </div>
            )}
            {data.skills.frameworks.length > 0 && (
              <div>
                <span className="font-semibold text-gray-800">Frameworks: </span>
                <span className="text-gray-700">{data.skills.frameworks.join(', ')}</span>
              </div>
            )}
            {data.skills.tools.length > 0 && (
              <div>
                <span className="font-semibold text-gray-800">Tools: </span>
                <span className="text-gray-700">{data.skills.tools.join(', ')}</span>
              </div>
            )}
            {data.skills.databases.length > 0 && (
              <div>
                <span className="font-semibold text-gray-800">Databases: </span>
                <span className="text-gray-700">{data.skills.databases.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-blue-600 mb-3 flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-600"></div>
            EXPERIENCE
          </h2>
          <div className="space-y-4">
            {data.experience.map((exp, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-bold text-gray-900">{exp.title}</h3>
                    <p className="text-sm text-gray-600">{exp.company} • {exp.location}</p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2">
                  {exp.description.map((desc, i) => (
                    <li key={i}>{desc}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-blue-600 mb-3 flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-600"></div>
            PROJECTS
          </h2>
          <div className="space-y-3">
            {data.projects.map((project, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-gray-900">{project.name}</h3>
                  {project.link && <span className="text-xs text-blue-600">{project.link}</span>}
                </div>
                <p className="text-sm text-gray-600 mb-1">{project.description}</p>
                <p className="text-xs text-gray-500 mb-1">
                  <span className="font-semibold">Tech:</span> {project.technologies.join(', ')}
                </p>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-0.5 ml-2">
                  {project.highlights.map((highlight, i) => (
                    <li key={i}>{highlight}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-blue-600 mb-3 flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-600"></div>
            EDUCATION
          </h2>
          <div className="space-y-3">
            {data.education.map((edu, idx) => (
              <div key={idx} className="flex justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                  <p className="text-sm text-gray-600">{edu.institution}, {edu.location}</p>
                  {edu.cgpa && <p className="text-sm text-gray-600">CGPA: {edu.cgpa}</p>}
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">{edu.startDate} - {edu.endDate}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-blue-600 mb-3 flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-600"></div>
            CERTIFICATIONS
          </h2>
          <div className="space-y-2">
            {data.certifications.map((cert, idx) => (
              <div key={idx} className="flex justify-between">
                <div>
                  <span className="font-semibold text-gray-900">{cert.name}</span>
                  <span className="text-sm text-gray-600"> - {cert.issuer}</span>
                </div>
                <span className="text-xs text-gray-500">{cert.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {data.achievements && data.achievements.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-blue-600 mb-3 flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-600"></div>
            ACHIEVEMENTS
          </h2>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {data.achievements.map((achievement, idx) => (
              <li key={idx}>
                <span className="font-semibold">{achievement.title}:</span> {achievement.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Classic Template
export const ClassicTemplate: React.FC<TemplateProps> = ({ data }) => {
  return (
    <div className="resume-template bg-white text-gray-900 p-8 max-w-4xl mx-auto" style={{ minHeight: '1056px', fontFamily: 'Georgia, serif' }}>
      {/* Header - Centered */}
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
        {data.profilePicture && (
          <img src={data.profilePicture} alt={data.fullName} className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 border-gray-800" />
        )}
        <h1 className="text-3xl font-bold text-gray-900 mb-2 uppercase tracking-wide">{data.fullName}</h1>
        <div className="text-sm text-gray-700 space-x-3">
          <span>{data.email}</span>
          <span>•</span>
          <span>{data.phone}</span>
          <span>•</span>
          <span>{data.location}</span>
        </div>
        {(data.githubUsername || data.linkedinUrl || data.leetcodeUsername) && (
          <div className="text-xs text-gray-600 mt-2 space-x-2">
            {data.githubUsername && <span>GitHub: {data.githubUsername}</span>}
            {data.linkedinUrl && <span>• LinkedIn</span>}
            {data.leetcodeUsername && <span>• LeetCode: {data.leetcodeUsername}</span>}
          </div>
        )}
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-5">
          <h2 className="text-lg font-bold text-gray-900 mb-2 uppercase border-b border-gray-400">Professional Summary</h2>
          <p className="text-sm text-gray-700 leading-relaxed text-justify">{data.summary}</p>
        </div>
      )}

      {/* Education - Comes first in classic */}
      {data.education && data.education.length > 0 && (
        <div className="mb-5">
          <h2 className="text-lg font-bold text-gray-900 mb-2 uppercase border-b border-gray-400">Education</h2>
          {data.education.map((edu, idx) => (
            <div key={idx} className="mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                  <p className="text-sm text-gray-700">{edu.institution}, {edu.location}</p>
                  {edu.cgpa && <p className="text-sm text-gray-600 italic">CGPA: {edu.cgpa}</p>}
                </div>
                <span className="text-sm text-gray-600">{edu.startDate} - {edu.endDate}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div className="mb-5">
          <h2 className="text-lg font-bold text-gray-900 mb-2 uppercase border-b border-gray-400">Professional Experience</h2>
          {data.experience.map((exp, idx) => (
            <div key={idx} className="mb-4">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h3 className="font-bold text-gray-900">{exp.title}</h3>
                  <p className="text-sm text-gray-700 italic">{exp.company}, {exp.location}</p>
                </div>
                <span className="text-sm text-gray-600">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
              </div>
              <ul className="list-disc list-outside text-sm text-gray-700 ml-5 space-y-1">
                {exp.description.map((desc, i) => (
                  <li key={i}>{desc}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills && (
        <div className="mb-5">
          <h2 className="text-lg font-bold text-gray-900 mb-2 uppercase border-b border-gray-400">Technical Skills</h2>
          <div className="text-sm text-gray-700 space-y-1">
            {data.skills.languages.length > 0 && (
              <p><span className="font-semibold">Programming Languages:</span> {data.skills.languages.join(', ')}</p>
            )}
            {data.skills.frameworks.length > 0 && (
              <p><span className="font-semibold">Frameworks & Libraries:</span> {data.skills.frameworks.join(', ')}</p>
            )}
            {data.skills.tools.length > 0 && (
              <p><span className="font-semibold">Tools & Technologies:</span> {data.skills.tools.join(', ')}</p>
            )}
            {data.skills.databases.length > 0 && (
              <p><span className="font-semibold">Databases:</span> {data.skills.databases.join(', ')}</p>
            )}
          </div>
        </div>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <div className="mb-5">
          <h2 className="text-lg font-bold text-gray-900 mb-2 uppercase border-b border-gray-400">Projects</h2>
          {data.projects.map((project, idx) => (
            <div key={idx} className="mb-3">
              <h3 className="font-bold text-gray-900">{project.name}</h3>
              <p className="text-sm text-gray-700 mb-1">{project.description}</p>
              <p className="text-xs text-gray-600 italic mb-1">Technologies: {project.technologies.join(', ')}</p>
              <ul className="list-disc list-outside text-sm text-gray-700 ml-5">
                {project.highlights.map((highlight, i) => (
                  <li key={i}>{highlight}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Certifications & Achievements */}
      <div className="grid grid-cols-2 gap-4">
        {data.certifications && data.certifications.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2 uppercase border-b border-gray-400">Certifications</h2>
            <div className="text-sm text-gray-700 space-y-1">
              {data.certifications.map((cert, idx) => (
                <p key={idx}>• {cert.name} ({cert.issuer})</p>
              ))}
            </div>
          </div>
        )}

        {data.achievements && data.achievements.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2 uppercase border-b border-gray-400">Achievements</h2>
            <div className="text-sm text-gray-700 space-y-1">
              {data.achievements.map((achievement, idx) => (
                <p key={idx}>• {achievement.title}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Minimal Template
export const MinimalTemplate: React.FC<TemplateProps> = ({ data }) => {
  return (
    <div className="resume-template bg-white text-gray-900 p-10 max-w-4xl mx-auto" style={{ minHeight: '1056px', fontFamily: 'Helvetica, Arial, sans-serif' }}>
      {/* Header - Minimal */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          {data.profilePicture && (
            <img src={data.profilePicture} alt={data.fullName} className="w-16 h-16 rounded object-cover" />
          )}
          <h1 className="text-5xl font-light text-gray-900">{data.fullName}</h1>
        </div>
        <div className="text-xs text-gray-600 space-x-4">
          <span>{data.email}</span>
          <span>{data.phone}</span>
          <span>{data.location}</span>
          {data.githubUsername && <span>github.com/{data.githubUsername}</span>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-8">
          <p className="text-sm text-gray-700 leading-relaxed">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-bold text-gray-900 mb-4 tracking-widest">EXPERIENCE</h2>
          {data.experience.map((exp, idx) => (
            <div key={idx} className="mb-5">
              <div className="flex justify-between mb-1">
                <h3 className="font-semibold text-gray-900">{exp.title} • {exp.company}</h3>
                <span className="text-xs text-gray-500">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
              </div>
              <div className="text-xs text-gray-700 space-y-1">
                {exp.description.map((desc, i) => (
                  <p key={i}>— {desc}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-bold text-gray-900 mb-4 tracking-widest">PROJECTS</h2>
          {data.projects.map((project, idx) => (
            <div key={idx} className="mb-4">
              <h3 className="font-semibold text-gray-900">{project.name}</h3>
              <p className="text-xs text-gray-600 mb-1">{project.technologies.join(' • ')}</p>
              <div className="text-xs text-gray-700 space-y-0.5">
                {project.highlights.map((highlight, i) => (
                  <p key={i}>— {highlight}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills && (
        <div className="mb-8">
          <h2 className="text-sm font-bold text-gray-900 mb-4 tracking-widest">SKILLS</h2>
          <div className="text-xs text-gray-700 leading-relaxed">
            <p className="mb-1">{[...data.skills.languages, ...data.skills.frameworks, ...data.skills.tools, ...data.skills.databases].join(' • ')}</p>
          </div>
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-bold text-gray-900 mb-4 tracking-widest">EDUCATION</h2>
          {data.education.map((edu, idx) => (
            <div key={idx} className="mb-2">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">{edu.degree}</span>
                <span className="text-xs text-gray-500">{edu.startDate} - {edu.endDate}</span>
              </div>
              <p className="text-xs text-gray-700">{edu.institution} {edu.cgpa && `• CGPA: ${edu.cgpa}`}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Creative Template
export const CreativeTemplate: React.FC<TemplateProps> = ({ data }) => {
  return (
    <div className="resume-template bg-gradient-to-br from-gray-50 to-white text-gray-900 max-w-4xl mx-auto" style={{ minHeight: '1056px', fontFamily: 'system-ui, sans-serif' }}>
      {/* Sidebar */}
      <div className="flex">
        <div className="w-1/3 bg-gradient-to-b from-indigo-600 to-purple-600 text-white p-8">
          {data.profilePicture && (
            <img src={data.profilePicture} alt={data.fullName} className="w-32 h-32 rounded-full object-cover mx-auto mb-6 border-4 border-white shadow-lg" />
          )}
          
          <div className="mb-6">
            <h2 className="text-sm font-bold mb-3 tracking-wide">CONTACT</h2>
            <div className="space-y-2 text-xs">
              <p>📧 {data.email}</p>
              <p>📱 {data.phone}</p>
              <p>📍 {data.location}</p>
            </div>
          </div>

          {data.skills && (
            <div className="mb-6">
              <h2 className="text-sm font-bold mb-3 tracking-wide">SKILLS</h2>
              <div className="space-y-3 text-xs">
                {data.skills.languages.length > 0 && (
                  <div>
                    <p className="font-semibold mb-1">Languages</p>
                    <div className="flex flex-wrap gap-1">
                      {data.skills.languages.map((skill, i) => (
                        <span key={i} className="bg-white/20 px-2 py-0.5 rounded text-xs">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
                {data.skills.frameworks.length > 0 && (
                  <div>
                    <p className="font-semibold mb-1">Frameworks</p>
                    <div className="flex flex-wrap gap-1">
                      {data.skills.frameworks.map((skill, i) => (
                        <span key={i} className="bg-white/20 px-2 py-0.5 rounded text-xs">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
                {data.skills.tools.length > 0 && (
                  <div>
                    <p className="font-semibold mb-1">Tools</p>
                    <div className="flex flex-wrap gap-1">
                      {data.skills.tools.map((skill, i) => (
                        <span key={i} className="bg-white/20 px-2 py-0.5 rounded text-xs">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {(data.githubUsername || data.linkedinUrl || data.leetcodeUsername) && (
            <div className="mb-6">
              <h2 className="text-sm font-bold mb-3 tracking-wide">LINKS</h2>
              <div className="space-y-1 text-xs">
                {data.githubUsername && <p>🔗 GitHub/{data.githubUsername}</p>}
                {data.leetcodeUsername && <p>🔗 LeetCode/{data.leetcodeUsername}</p>}
                {data.linkedinUrl && <p>🔗 LinkedIn</p>}
              </div>
            </div>
          )}

          {data.certifications && data.certifications.length > 0 && (
            <div>
              <h2 className="text-sm font-bold mb-3 tracking-wide">CERTIFICATIONS</h2>
              <div className="space-y-2 text-xs">
                {data.certifications.map((cert, idx) => (
                  <div key={idx}>
                    <p className="font-semibold">{cert.name}</p>
                    <p className="text-white/80">{cert.issuer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="w-2/3 p-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{data.fullName}</h1>
            <div className="w-24 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 mb-4"></div>
            {data.summary && <p className="text-sm text-gray-700 leading-relaxed">{data.summary}</p>}
          </div>

          {/* Experience */}
          {data.experience && data.experience.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-indigo-600 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                EXPERIENCE
              </h2>
              {data.experience.map((exp, idx) => (
                <div key={idx} className="mb-4 pl-4 border-l-2 border-indigo-200">
                  <div className="flex justify-between mb-1">
                    <div>
                      <h3 className="font-bold text-gray-900">{exp.title}</h3>
                      <p className="text-sm text-gray-600">{exp.company}</p>
                    </div>
                    <span className="text-xs text-gray-500">{exp.startDate} - {exp.current ? 'Now' : exp.endDate}</span>
                  </div>
                  <ul className="list-disc list-inside text-xs text-gray-700 space-y-0.5">
                    {exp.description.map((desc, i) => (
                      <li key={i}>{desc}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {data.projects && data.projects.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-indigo-600 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                PROJECTS
              </h2>
              {data.projects.map((project, idx) => (
                <div key={idx} className="mb-4 pl-4 border-l-2 border-purple-200">
                  <h3 className="font-bold text-gray-900">{project.name}</h3>
                  <p className="text-xs text-gray-600 mb-1">{project.technologies.join(' | ')}</p>
                  <ul className="list-disc list-inside text-xs text-gray-700 space-y-0.5">
                    {project.highlights.map((highlight, i) => (
                      <li key={i}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-indigo-600 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                EDUCATION
              </h2>
              {data.education.map((edu, idx) => (
                <div key={idx} className="mb-3 pl-4 border-l-2 border-indigo-200">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                      <p className="text-sm text-gray-600">{edu.institution}</p>
                      {edu.cgpa && <p className="text-xs text-gray-500">CGPA: {edu.cgpa}</p>}
                    </div>
                    <span className="text-xs text-gray-500">{edu.startDate} - {edu.endDate}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Achievements */}
          {data.achievements && data.achievements.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-indigo-600 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                ACHIEVEMENTS
              </h2>
              <ul className="list-disc list-inside text-xs text-gray-700 space-y-1 pl-4">
                {data.achievements.map((achievement, idx) => (
                  <li key={idx}><span className="font-semibold">{achievement.title}:</span> {achievement.description}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const templates = {
  modern: { name: 'Modern', component: ModernTemplate, description: 'Clean and professional with accent colors' },
  classic: { name: 'Classic', component: ClassicTemplate, description: 'Traditional format perfect for corporate roles' },
  minimal: { name: 'Minimal', component: MinimalTemplate, description: 'Simple and elegant with maximum white space' },
  creative: { name: 'Creative', component: CreativeTemplate, description: 'Bold design with sidebar layout' },
};
