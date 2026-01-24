// Company-specific interview questions database
export interface CompanyQuestion {
  question: string;
  type: 'technical' | 'hr' | 'system-design' | 'behavioral';
  difficulty: 'easy' | 'medium' | 'hard';
  year?: number;
  topics?: string[];
}

export interface CompanyData {
  name: string;
  code: string;
  questions: CompanyQuestion[];
  focus: string[];
}

export const COMPANY_INTERVIEW_DATA: CompanyData[] = [
  {
    name: 'Google',
    code: 'google',
    focus: ['Algorithms', 'System Design', 'Problem Solving', 'Innovation'],
    questions: [
      {
        question: 'Design a distributed web crawler that can crawl billions of web pages.',
        type: 'system-design',
        difficulty: 'hard',
        year: 2024,
        topics: ['Distributed Systems', 'Web Scraping', 'Scalability']
      },
      {
        question: 'Implement LRU Cache with O(1) time complexity for get and put operations.',
        type: 'technical',
        difficulty: 'medium',
        year: 2024,
        topics: ['Data Structures', 'Hash Map', 'Doubly Linked List']
      },
      {
        question: 'Given a binary tree, find the maximum path sum. The path may start and end at any node.',
        type: 'technical',
        difficulty: 'hard',
        year: 2023,
        topics: ['Trees', 'Recursion', 'DFS']
      },
      {
        question: 'Tell me about a time when you had to deal with ambiguity in a project.',
        type: 'behavioral',
        difficulty: 'medium',
        year: 2024,
        topics: ['Leadership', 'Problem Solving']
      },
      {
        question: 'Design YouTube - how would you handle video streaming, storage, and recommendations?',
        type: 'system-design',
        difficulty: 'hard',
        year: 2023,
        topics: ['Video Streaming', 'CDN', 'Recommendation System']
      }
    ]
  },
  {
    name: 'Amazon',
    code: 'amazon',
    focus: ['Leadership Principles', 'Customer Obsession', 'Scalability', 'Ownership'],
    questions: [
      {
        question: 'Design Amazon Prime Video streaming service. Consider global scale and low latency.',
        type: 'system-design',
        difficulty: 'hard',
        year: 2024,
        topics: ['Video Streaming', 'CDN', 'Global Distribution']
      },
      {
        question: 'Find the number of islands in a 2D grid where 1 represents land and 0 represents water.',
        type: 'technical',
        difficulty: 'medium',
        year: 2024,
        topics: ['Graph', 'DFS', 'BFS']
      },
      {
        question: 'Implement a method to find the kth largest element in an array.',
        type: 'technical',
        difficulty: 'medium',
        year: 2023,
        topics: ['Arrays', 'Quick Select', 'Heap']
      },
      {
        question: 'Tell me about a time when you had to make a decision with incomplete information. (Bias for Action)',
        type: 'behavioral',
        difficulty: 'medium',
        year: 2024,
        topics: ['Leadership Principles', 'Decision Making']
      },
      {
        question: 'Design a package tracking system that can handle millions of packages daily.',
        type: 'system-design',
        difficulty: 'hard',
        year: 2023,
        topics: ['Real-time Tracking', 'Database Design', 'Scalability']
      }
    ]
  },
  {
    name: 'Microsoft',
    code: 'microsoft',
    focus: ['Innovation', 'Collaboration', 'Cloud Services', 'Problem Solving'],
    questions: [
      {
        question: 'Design a collaborative document editing system like Microsoft Word Online.',
        type: 'system-design',
        difficulty: 'hard',
        year: 2024,
        topics: ['Collaborative Editing', 'CRDT', 'WebSockets']
      },
      {
        question: 'Reverse a linked list. Can you do it both iteratively and recursively?',
        type: 'technical',
        difficulty: 'easy',
        year: 2024,
        topics: ['Linked List', 'Recursion', 'Iteration']
      },
      {
        question: 'Given an array of meeting time intervals, determine if a person could attend all meetings.',
        type: 'technical',
        difficulty: 'easy',
        year: 2023,
        topics: ['Arrays', 'Sorting', 'Intervals']
      },
      {
        question: 'Describe a situation where you had to work with a difficult team member.',
        type: 'behavioral',
        difficulty: 'medium',
        year: 2024,
        topics: ['Teamwork', 'Conflict Resolution']
      },
      {
        question: 'Design Azure Blob Storage - focus on redundancy, availability, and cost optimization.',
        type: 'system-design',
        difficulty: 'hard',
        year: 2023,
        topics: ['Cloud Storage', 'Distributed Systems', 'Replication']
      }
    ]
  },
  {
    name: 'Meta (Facebook)',
    code: 'meta',
    focus: ['Move Fast', 'Be Bold', 'Build Social Value', 'Focus on Impact'],
    questions: [
      {
        question: 'Design Facebook News Feed - how would you rank and display posts?',
        type: 'system-design',
        difficulty: 'hard',
        year: 2024,
        topics: ['Ranking Algorithm', 'ML', 'Scalability']
      },
      {
        question: 'Implement a function to validate if a binary tree is a valid binary search tree.',
        type: 'technical',
        difficulty: 'medium',
        year: 2024,
        topics: ['Trees', 'BST', 'Recursion']
      },
      {
        question: 'Clone a graph. Each node contains a value and a list of neighbors.',
        type: 'technical',
        difficulty: 'medium',
        year: 2023,
        topics: ['Graph', 'DFS', 'Hash Map']
      },
      {
        question: 'Tell me about a time when you failed and what you learned from it.',
        type: 'behavioral',
        difficulty: 'medium',
        year: 2024,
        topics: ['Growth Mindset', 'Learning']
      },
      {
        question: 'Design Instagram - focus on image storage, feed generation, and notifications.',
        type: 'system-design',
        difficulty: 'hard',
        year: 2023,
        topics: ['Social Media', 'CDN', 'Push Notifications']
      }
    ]
  },
  {
    name: 'Apple',
    code: 'apple',
    focus: ['Innovation', 'Excellence', 'User Experience', 'Privacy'],
    questions: [
      {
        question: 'Design iCloud - focus on cross-device sync, security, and privacy.',
        type: 'system-design',
        difficulty: 'hard',
        year: 2024,
        topics: ['Cloud Sync', 'Encryption', 'Conflict Resolution']
      },
      {
        question: 'Find the longest substring without repeating characters.',
        type: 'technical',
        difficulty: 'medium',
        year: 2024,
        topics: ['String', 'Sliding Window', 'Hash Set']
      },
      {
        question: 'Implement a stack that supports push, pop, top, and retrieving the minimum element in constant time.',
        type: 'technical',
        difficulty: 'medium',
        year: 2023,
        topics: ['Stack', 'Data Structures']
      },
      {
        question: 'Describe a project where you prioritized user experience over technical complexity.',
        type: 'behavioral',
        difficulty: 'medium',
        year: 2024,
        topics: ['User Focus', 'Design Thinking']
      },
      {
        question: 'Design a music streaming service with offline support and personalized recommendations.',
        type: 'system-design',
        difficulty: 'hard',
        year: 2023,
        topics: ['Streaming', 'Offline Sync', 'ML Recommendations']
      }
    ]
  },
  {
    name: 'Netflix',
    code: 'netflix',
    focus: ['Freedom & Responsibility', 'Context not Control', 'Innovation', 'Impact'],
    questions: [
      {
        question: 'Design Netflix recommendation system - how to personalize content for millions of users?',
        type: 'system-design',
        difficulty: 'hard',
        year: 2024,
        topics: ['ML', 'Recommendation Engine', 'Big Data']
      },
      {
        question: 'Implement a rate limiter that allows a certain number of requests per time window.',
        type: 'technical',
        difficulty: 'medium',
        year: 2024,
        topics: ['System Design', 'Sliding Window', 'Hash Map']
      },
      {
        question: 'Design a video encoding pipeline that can handle thousands of videos per hour.',
        type: 'system-design',
        difficulty: 'hard',
        year: 2023,
        topics: ['Video Processing', 'Queue', 'Distributed Computing']
      },
      {
        question: 'Tell me about a time when you had to make a tough decision without manager approval.',
        type: 'behavioral',
        difficulty: 'medium',
        year: 2024,
        topics: ['Ownership', 'Decision Making']
      },
      {
        question: 'Given a list of video viewing times, detect if users are binge-watching.',
        type: 'technical',
        difficulty: 'medium',
        year: 2023,
        topics: ['Arrays', 'Time Series', 'Pattern Detection']
      }
    ]
  },
  {
    name: 'Adobe',
    code: 'adobe',
    focus: ['Creativity', 'Innovation', 'Customer Focus', 'Excellence'],
    questions: [
      {
        question: 'Design Photoshop Cloud - how to sync large files and enable collaborative editing?',
        type: 'system-design',
        difficulty: 'hard',
        year: 2024,
        topics: ['File Sync', 'Large Files', 'Collaboration']
      },
      {
        question: 'Implement an image filter that applies Gaussian blur to an image matrix.',
        type: 'technical',
        difficulty: 'medium',
        year: 2024,
        topics: ['Image Processing', 'Matrices', 'Algorithms']
      },
      {
        question: 'Design a color palette generator that suggests complementary colors.',
        type: 'technical',
        difficulty: 'medium',
        year: 2023,
        topics: ['Color Theory', 'Algorithms']
      },
      {
        question: 'Describe a creative solution you developed to solve a technical problem.',
        type: 'behavioral',
        difficulty: 'medium',
        year: 2024,
        topics: ['Innovation', 'Problem Solving']
      },
      {
        question: 'Design a real-time collaborative whiteboard application.',
        type: 'system-design',
        difficulty: 'hard',
        year: 2023,
        topics: ['Real-time', 'WebSockets', 'Canvas']
      }
    ]
  },
  {
    name: 'Uber',
    code: 'uber',
    focus: ['Customer Obsession', 'Innovation', 'Scale', 'Hustle'],
    questions: [
      {
        question: 'Design Uber ride matching system - how to match riders with nearby drivers efficiently?',
        type: 'system-design',
        difficulty: 'hard',
        year: 2024,
        topics: ['Geospatial', 'Real-time Matching', 'Scalability']
      },
      {
        question: 'Implement a geohashing system to find nearby locations.',
        type: 'technical',
        difficulty: 'hard',
        year: 2024,
        topics: ['Geospatial', 'Hash', 'Algorithms']
      },
      {
        question: 'Design dynamic pricing (surge pricing) algorithm.',
        type: 'system-design',
        difficulty: 'hard',
        year: 2023,
        topics: ['Real-time Pricing', 'Supply-Demand', 'ML']
      },
      {
        question: 'Tell me about a time when you had to scale a system 10x.',
        type: 'behavioral',
        difficulty: 'medium',
        year: 2024,
        topics: ['Scalability', 'System Design']
      },
      {
        question: 'Find the shortest path between two locations on a map.',
        type: 'technical',
        difficulty: 'medium',
        year: 2023,
        topics: ['Graph', 'Dijkstra', 'A* Algorithm']
      }
    ]
  },
  {
    name: 'Salesforce',
    code: 'salesforce',
    focus: ['Customer Success', 'Innovation', 'Equality', 'Trust'],
    questions: [
      {
        question: 'Design a CRM system that can handle millions of customer records and complex queries.',
        type: 'system-design',
        difficulty: 'hard',
        year: 2024,
        topics: ['Database', 'Scalability', 'Query Optimization']
      },
      {
        question: 'Implement a multi-tenant database architecture with data isolation.',
        type: 'technical',
        difficulty: 'hard',
        year: 2024,
        topics: ['Database Design', 'Multi-tenancy', 'Security']
      },
      {
        question: 'Design a workflow automation engine that can handle complex business rules.',
        type: 'system-design',
        difficulty: 'hard',
        year: 2023,
        topics: ['Rule Engine', 'Workflow', 'State Machine']
      },
      {
        question: 'Describe how you ensured customer success in a challenging project.',
        type: 'behavioral',
        difficulty: 'medium',
        year: 2024,
        topics: ['Customer Focus', 'Problem Solving']
      },
      {
        question: 'Implement a permission system with role-based access control (RBAC).',
        type: 'technical',
        difficulty: 'medium',
        year: 2023,
        topics: ['Security', 'RBAC', 'Graph']
      }
    ]
  },
  {
    name: 'Tesla',
    code: 'tesla',
    focus: ['Innovation', 'Speed', 'Impact', 'Sustainability'],
    questions: [
      {
        question: 'Design a real-time vehicle telemetry system for autonomous cars.',
        type: 'system-design',
        difficulty: 'hard',
        year: 2024,
        topics: ['IoT', 'Real-time', 'Time Series']
      },
      {
        question: 'Implement an algorithm to detect obstacles using sensor data.',
        type: 'technical',
        difficulty: 'hard',
        year: 2024,
        topics: ['Computer Vision', 'Sensor Fusion', 'ML']
      },
      {
        question: 'Design a battery management system that optimizes charging and longevity.',
        type: 'system-design',
        difficulty: 'hard',
        year: 2023,
        topics: ['Embedded Systems', 'Optimization', 'Real-time']
      },
      {
        question: 'Tell me about a time when you had to move extremely fast on a critical project.',
        type: 'behavioral',
        difficulty: 'medium',
        year: 2024,
        topics: ['Speed', 'Execution']
      },
      {
        question: 'Implement a path planning algorithm for autonomous navigation.',
        type: 'technical',
        difficulty: 'hard',
        year: 2023,
        topics: ['Graph', 'A*', 'Dynamic Programming']
      }
    ]
  }
];

export const getCompanyByCode = (code: string): CompanyData | undefined => {
  return COMPANY_INTERVIEW_DATA.find(company => company.code === code);
};

export const getAllCompanies = () => {
  return COMPANY_INTERVIEW_DATA.map(company => ({
    code: company.code,
    name: company.name,
    focus: company.focus
  }));
};
