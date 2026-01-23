import axios from 'axios';

export interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  headline: string;
  experience: LinkedInExperience[];
  education: LinkedInEducation[];
  skills: string[];
  certifications: LinkedInCertification[];
}

export interface LinkedInExperience {
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

export interface LinkedInEducation {
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
}

export interface LinkedInCertification {
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl: string;
}

export class LinkedInService {
  private baseUrl = 'https://api.linkedin.com/v2';

  /**
   * Fetch LinkedIn profile using OAuth token
   */
  async getUserProfile(accessToken: string): Promise<LinkedInProfile> {
    try {
      const headers = { Authorization: `Bearer ${accessToken}` };

      // Get profile info
      const profileRes = await axios.get(`${this.baseUrl}/me`, { headers });
      const profile = profileRes.data;

      // Get email
      const emailRes = await axios.get(`${this.baseUrl}/emailAddress?q=members&projection=(elements*(handle~))`, { headers });
      const email = emailRes.data.elements[0]?.['handle~']?.emailAddress || '';

      // Get full profile with experience
      const fullProfileRes = await axios.get(
        `${this.baseUrl}/me?projection=(id,firstName,lastName,profilePicture(displayImage),headline,vanityName,summary,positions,educations,skills,certifications)`,
        { headers }
      );

      const fullProfile = fullProfileRes.data;

      return {
        id: profile.id,
        firstName: profile.localizedFirstName,
        lastName: profile.localizedLastName,
        headline: fullProfile.headline?.localized?.en_US || '',
        experience: fullProfile.positions?.elements?.map((exp: any) => ({
          title: exp.title?.localized?.en_US,
          company: exp.companyName?.localized?.en_US,
          startDate: exp.startDate?.year?.toString(),
          endDate: exp.endDate?.year?.toString(),
          current: exp.endDate === null,
          description: exp.description?.localized?.en_US || '',
        })) || [],
        education: fullProfile.educations?.elements?.map((edu: any) => ({
          school: edu.schoolName?.localized?.en_US,
          degree: edu.degreeName?.localized?.en_US,
          fieldOfStudy: edu.fieldOfStudy?.localized?.en_US,
          startDate: edu.startDate?.year?.toString(),
          endDate: edu.endDate?.year?.toString(),
        })) || [],
        skills: fullProfile.skills?.elements?.map((skill: any) => skill.name?.localized?.en_US) || [],
        certifications: fullProfile.certifications?.elements?.map((cert: any) => ({
          name: cert.name?.localized?.en_US,
          issuer: cert.authority?.localized?.en_US,
          issueDate: cert.issuedOn?.year?.toString(),
          credentialUrl: cert.credentialUrl,
        })) || [],
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch LinkedIn profile: ${error.message}`);
    }
  }

  /**
   * Get trending skills for a role
   */
  async getTrendingSkillsForRole(role: string): Promise<string[]> {
    // This would require LinkedIn's trending insights API which is restricted
    // Fallback to predefined skill sets
    const skillsByRole: Record<string, string[]> = {
      'sde': ['JavaScript', 'Python', 'Java', 'System Design', 'Database Design', 'API Development', 'Cloud (AWS/GCP)', 'Git'],
      'aiml': ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Data Analysis', 'SQL', 'Deep Learning', 'NLP'],
      'researcher': ['Python', 'Research Methodology', 'Data Analysis', 'Academic Writing', 'Statistical Analysis', 'Latex'],
      'data-scientist': ['Python', 'SQL', 'Data Analysis', 'Statistics', 'Machine Learning', 'Tableau', 'Power BI'],
    };

    return skillsByRole[role] || skillsByRole['sde'];
  }
}

export default LinkedInService;
