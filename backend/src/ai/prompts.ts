// DSA AI prompt templates
export const DSA_PROMPTS = {
  analyzeApproach: (question: string, userApproach: string, constraints: string) => `
You are an expert competitive programmer and DSA mentor.

Question: ${question}
Constraints: ${constraints}
User's Approach: ${userApproach}

Provide structured feedback:
1. **Approach Validity**: Is the approach correct?
2. **Time Complexity**: Analyze the time complexity
3. **Space Complexity**: Analyze the space complexity
4. **Alternative Approaches**: Suggest 2-3 alternative approaches with their complexities
5. **Edge Cases**: List potential edge cases and how to handle them
6. **If constraints halved**: How would you optimize?
7. **If constraints doubled**: How would you still solve it efficiently?

Format your response in markdown with clear sections.
  `,

  suggestOptimizations: (question: string, currentComplexity: string) => `
You are a DSA optimization expert.

Question: ${question}
Current Solution Complexity: ${currentComplexity}

Suggest 3 optimization strategies with:
- Exact time/space complexity improvements
- Code examples (pseudocode is fine)
- When to use each approach

Explain trade-offs between memory and speed.
  `,

  generateRelatedProblems: (topic: string, difficulty: string) => `
You are a DSA curriculum designer.

Topic: ${topic}
Current Difficulty: ${difficulty}

Generate 5 related problems that progressively increase in difficulty:
1. Problem statement (1-2 lines)
2. Key insight needed
3. Estimated difficulty

This helps build intuition for the concept.
  `
};

export const RESUME_PROMPTS = {
  generateFromProfiles: (profiles: Record<string, any>) => `
You are a professional resume writer with startup hiring experience.

Generate a detailed, ATS-optimized resume from these profiles:
${JSON.stringify(profiles, null, 2)}

IMPORTANT: Generate a COMPLETE, DETAILED resume with ALL sections filled out.

Structure (in plain text format, NO markdown):

[NAME] - Use from personal.name or generate professional name
[EMAIL] | [PHONE] | [GITHUB PROFILE URL] | [LINKEDIN URL]

===== PROFESSIONAL SUMMARY =====
[Write 3-4 compelling sentences about expertise, skills, and career goals based on profile data]

===== TECHNICAL SKILLS =====
Programming Languages: [List from GitHub repos and coding profiles]
Frameworks & Tools: [Infer from GitHub repos]
Databases: [Common ones]
Other: [Cloud, DevOps, etc.]

===== EDUCATION =====
[College Name] - [Branch]
[Graduation Year]
Relevant Coursework: [Related to branch]

===== COMPETITIVE PROGRAMMING =====
[If LeetCode data exists]: LeetCode: [X problems solved], Rating: [Y]
[If CodeForces data exists]: CodeForces: [Rank], Rating: [X], Contests: [Y]
[If GitHub data exists]: GitHub: [X public repos], [Y followers]

===== PROJECTS =====
[List 3-5 projects inferred from GitHub repos with descriptions]
Project 1: [Name] - [Tech Stack]
- [Achievement/Feature 1]
- [Achievement/Feature 2]
- GitHub: [URL if available]

===== EXPERIENCE =====
[If no experience data, create 1-2 relevant internship/project experiences based on skills]
Position | Company | Duration
- [Achievement 1 with metrics]
- [Achievement 2 with impact]

===== ACHIEVEMENTS =====
- [List coding achievements, contest ranks, certifications]
- [GitHub stars, popular repos]
- [Any other notable achievements]

Generate a COMPLETE resume. DO NOT leave sections empty. Use the profile data to create a professional, detailed resume.
  `,

  calculateATSScore: (resume: string) => `
You are an ATS (Applicant Tracking System) expert evaluator.

Resume:
${resume}

Evaluate this resume comprehensively on:

1. KEYWORD OPTIMIZATION (30 points)
   - Relevant tech keywords (programming languages, frameworks, tools)
   - Industry buzzwords (SDE, AIML, Data Science, ML, Cloud)
   - Action verbs (developed, implemented, optimized, led)

2. FORMATTING & STRUCTURE (25 points)
   - Clear section headers
   - Consistent formatting
   - No special characters that ATS can't parse
   - Proper spacing and organization

3. CONTENT QUALITY (25 points)
   - Quantified achievements (numbers, percentages, metrics)
   - Strong action verbs
   - Relevant experience and projects
   - Skills match job requirements

4. COMPLETENESS (20 points)
   - All key sections present (Summary, Skills, Experience, Education, Projects)
   - Contact information complete
   - No empty sections
   - Appropriate length (1-2 pages)

Provide ONLY:
Score: [X]/100

Format your response EXACTLY as: "Score: XX/100" where XX is a number between 0-100.
  `,

  optimizeForRole: (resume: string, targetRole: string) => `
You are a career strategist for tech professionals.

Current Resume:
${resume}

Target Role: ${targetRole}

Provide:
1. Resume sections to reorder
2. Keywords to add (use 'bold' for emphasis)
3. Achievements to reframe
4. Missing experience to highlight
5. Certification/skill recommendations

Make it SPECIFIC for this role.
  `
};

export const RESEARCH_PROMPTS = {
  summarizePaper: (title: string, abstract: string, content: string) => `
You are a research paper analyst and summarizer.

Paper Title: ${title}
Abstract: ${abstract}

Full Content:
${content}

Provide:
1. **One-line summary**: What is the core contribution?
2. **Problem Solved**: What gap does it address?
3. **Key Methodology**: How do they solve it?
4. **Results**: What are the main findings?
5. **Limitations**: What are the constraints?
6. **Future Work**: What remains unexplored?

Keep each section concise but informative.
  `,

  findRelatedWorks: (title: string, problemStatement: string) => `
You are a research literature expert with extensive knowledge of academic papers across multiple domains.

Research Paper: ${title}
Problem Statement: ${problemStatement}

Suggest 10 highly relevant related papers/works that:
1. Directly address similar problems or research questions
2. Use comparable methodologies or approaches
3. Build upon related foundational work
4. Are from top-tier venues (IEEE, ACM, Springer, NeurIPS, ICML, etc.)
5. Represent both foundational and recent work (mix of classic and recent papers)

For each paper, provide:
- **Paper Title**: Full title of the paper
- **Authors**: Key authors (first 2-3)
- **Year & Venue**: Publication year and conference/journal
- **Relevance**: 1-2 sentences explaining why it's relevant
- **Key Contribution**: What makes this paper significant

Format as a numbered list with clear sections. Be specific and academically accurate.
  `,

  generateCitations: (paperTitle: string, authors: string[], year: number) => `
You are an academic citation formatter.

Generate citations for a paper:
- Title: ${paperTitle}
- Authors: ${authors.join(', ')}
- Year: ${year}

Provide in formats:
1. **IEEE**: [1] ...
2. **Springer**: Author. et al., "..." Journal, Year.
3. **BibTeX**: @article{key, ...}
4. **APA**: Author, A., et al. (Year). ...

Make citations academically correct and complete.
  `,

  generateMethodology: (problemStatement: string, constraints: string) => `
You are a research methodology designer with expertise in experimental design and scientific research methods.

Problem Statement: ${problemStatement}
Constraints: ${constraints || 'None specified'}

Design a comprehensive research methodology with:

1. **Research Objectives**: 
   - Primary objective
   - 2-3 secondary objectives
   
2. **Hypothesis**: 
   - Null hypothesis (H0)
   - Alternative hypothesis (H1)
   
3. **Methodology Framework**:
   - Research approach (experimental, survey-based, simulation, etc.)
   - Step-by-step experimental design
   - Control variables and dependent variables
   
4. **Data Collection**:
   - Type of data needed
   - Sample size estimation
   - Data sources
   - Collection methods
   
5. **Analysis Plan**:
   - Statistical methods or analytical techniques
   - Evaluation metrics
   - Success criteria
   
6. **Timeline**: 
   - Phase 1: Literature review (2 weeks)
   - Phase 2: Data collection (4 weeks)
   - Phase 3: Analysis (3 weeks)
   - Phase 4: Writing & revision (3 weeks)
   
7. **Resources Required**:
   - Software tools
   - Datasets (if applicable)
   - Hardware requirements
   - Estimated budget

8. **Validation Strategy**:
   - How to validate results
   - Comparison baselines
   - Reproducibility measures

Be specific, realistic for college-level research, and academically rigorous.
  `,

  generateLiteratureReview: (title: string, problemStatement: string, relatedWorks: string[]) => `
You are an expert academic writer specializing in literature reviews.

Research Title: ${title}
Problem Statement: ${problemStatement}
Related Works Found: ${relatedWorks.length > 0 ? relatedWorks.join(', ') : 'None yet'}

Generate a comprehensive literature review section (800-1200 words) that:

1. **Introduction to the Domain**:
   - Provide context for the research area
   - Explain why this area is important
   
2. **Historical Development**:
   - Trace the evolution of research in this area
   - Mention foundational work
   
3. **Current State of Research**:
   - Summarize major approaches and findings
   - Identify key research groups or papers
   
4. **Research Gaps**:
   - Clearly identify what's missing in current research
   - Explain why your problem statement addresses an important gap
   
5. **Methodological Approaches**:
   - Compare different approaches used by researchers
   - Discuss pros and cons of each
   
6. **Critical Analysis**:
   - What are the limitations of existing work?
   - What controversies or debates exist?
   
7. **Position of Current Work**:
   - How does your research fit into the broader landscape?
   - What unique contribution will it make?

Write in formal academic style with proper transitions between sections. Use phrases like "Recent studies have shown...", "Building upon the work of...", "In contrast to previous approaches...".
  `,

  generateAbstract: (title: string, problemStatement: string, methodology: string) => `
You are an expert at writing compelling research paper abstracts.

Title: ${title}
Problem Statement: ${problemStatement}
Methodology: ${methodology}

Generate a structured abstract (200-250 words) following this format:

1. **Background** (2-3 sentences): Set the context and importance
2. **Problem** (1-2 sentences): State the specific problem addressed
3. **Proposed Approach** (2-3 sentences): Describe your methodology
4. **Key Results** (1-2 sentences): Expected or achieved outcomes
5. **Significance** (1 sentence): Impact and contributions

Write in past tense for completed work, future tense for proposed work. Use clear, concise academic language. Avoid citations in the abstract.
  `,

  generateIntroduction: (title: string, problemStatement: string, abstract: string) => `
You are an academic writing expert specializing in research paper introductions.

Title: ${title}
Problem Statement: ${problemStatement}
Abstract: ${abstract}

Generate a comprehensive Introduction section (500-700 words) that follows this structure:

1. **Opening Hook**: Start with a compelling statement about the broader problem domain

2. **Context Setting** (2-3 paragraphs):
   - Why is this area important?
   - What is the current state of the field?
   - What motivates this specific research?

3. **Problem Statement** (1 paragraph):
   - Clearly articulate the specific problem
   - Why is it challenging?
   - Why hasn't it been solved yet?

4. **Research Questions** (bullet points):
   - List 3-4 specific research questions this work addresses

5. **Proposed Approach** (1 paragraph):
   - Brief overview of your methodology
   - What makes your approach novel or different?

6. **Contributions** (bullet points):
   - List 3-5 key contributions of this work
   - Be specific about what's new

7. **Paper Organization** (1 paragraph):
   - "The rest of this paper is organized as follows..."
   - Briefly describe each section

Use formal academic writing with smooth transitions. Start broad and narrow down to your specific contribution (funnel approach).
  `
};

export const INTERVIEW_PROMPTS = {
  generateTechnicalQuestion: (backgroundContext: string, topicFocus: string, company?: string, companyName?: string) => `
You are a tech interview conductor for ${companyName || 'top tech companies'}.

${company && companyName ? `IMPORTANT: Generate a question that was actually asked in ${companyName} interviews in recent years (2022-2024). 
The question should reflect ${companyName}'s interview style and focus areas.` : ''}

Candidate Background:
${backgroundContext}

Interview Focus: ${topicFocus}

${company === 'google' ? `Google focuses on: Algorithms, System Design, Problem Solving, Scalability, and Innovation.
Common question types: Graph algorithms, Tree traversal, Dynamic Programming, System Design at scale.` : ''}

${company === 'amazon' ? `Amazon emphasizes: Leadership Principles, Customer Obsession, Scalability, and Ownership.
Common question types: Graph problems (islands, connected components), Tree problems, String manipulation, System Design.` : ''}

${company === 'microsoft' ? `Microsoft focuses on: Innovation, Collaboration, Cloud Services, and Problem Solving.
Common question types: Linked Lists, Arrays, String manipulation, Collaborative systems design.` : ''}

${company === 'meta' ? `Meta (Facebook) emphasizes: Move Fast, Be Bold, Build Social Value, Focus on Impact.
Common question types: Graph algorithms, Tree problems, Social network design, Ranking algorithms.` : ''}

${company === 'apple' ? `Apple focuses on: Innovation, Excellence, User Experience, and Privacy.
Common question types: String problems, Stack/Queue, System design with focus on UX and security.` : ''}

${company === 'netflix' ? `Netflix emphasizes: Freedom & Responsibility, Context not Control, Innovation.
Common question types: Rate limiting, Video streaming, Recommendation systems, High availability design.` : ''}

Generate ONE challenging but fair technical question that reflects ${companyName || 'top company'} interview standards:
1. Problem statement (clear and concise)
2. Constraints
3. Example input/output
4. Difficulty level
5. Key concepts tested

${company && companyName ? `Mention that this type of question has been asked in ${companyName} interviews.` : ''}

Follow-up questions should naturally build from the initial problem.
  `,

  evaluateAnswer: (question: string, candidateAnswer: string, optimalApproach: string, suspiciousActivities?: number, tabSwitches?: number) => `
You are a senior engineer conducting interviews.

Question: ${question}
Candidate's Answer: ${candidateAnswer}
Optimal Approach: ${optimalApproach}

${suspiciousActivities && suspiciousActivities > 0 ? `
⚠️ PROCTORING ALERT: ${suspiciousActivities} suspicious activities detected during this answer.
${tabSwitches && tabSwitches > 0 ? `- ${tabSwitches} tab switches detected (possible external research/cheating)` : ''}
- This should be factored into the evaluation.
` : ''}

Provide feedback on:
1. **Correctness**: Is the solution correct?
2. **Communication**: Did they explain clearly?
3. **Complexity Analysis**: Did they discuss O(n) complexity?
4. **Edge Cases**: Did they consider edge cases?
5. **Coding Quality**: Is code clean and readable?
6. **Confidence**: Were they confident?
7. **Problem-solving Approach**: Was there a systematic approach?
${suspiciousActivities && suspiciousActivities > 0 ? `8. **Integrity Concerns**: Suspicious activity detected - evaluate authenticity of the answer.` : ''}

Rate on scale 1-5 (5 = excellent, 1 = needs improvement).
${suspiciousActivities && suspiciousActivities > 0 ? `Reduce score by 1-2 points if suspicious activities suggest potential cheating.` : ''}
Provide actionable feedback for improvement.
  `,

  generateHRQuestion: (jobRole: string, userBackground: string, company?: string, companyName?: string) => `
You are an HR interview specialist ${companyName ? `for ${companyName}` : ''}.

${company && companyName ? `IMPORTANT: Generate a behavioral question that reflects ${companyName}'s culture and values.` : ''}

Job Role: ${jobRole}
Candidate Background:
${userBackground}

${company === 'google' ? `Google values: Innovation, User Focus, Googleyness, Cognitive Ability.
Ask about: Dealing with ambiguity, innovation, collaboration, learning from failure.` : ''}

${company === 'amazon' ? `Amazon Leadership Principles: Customer Obsession, Ownership, Invent and Simplify, Bias for Action, Learn and Be Curious.
Ask STAR questions about: Customer focus, ownership, quick decision-making, innovation.` : ''}

${company === 'microsoft' ? `Microsoft values: Respect, Integrity, Accountability, Innovation, Collaboration.
Ask about: Teamwork, handling difficult situations, innovation, growth mindset.` : ''}

${company === 'meta' ? `Meta values: Move Fast, Be Bold, Build Social Value, Focus on Impact, Be Open.
Ask about: Taking risks, impact, learning from failure, collaboration.` : ''}

${company === 'apple' ? `Apple values: Innovation, Excellence, User Experience, Privacy, Collaboration.
Ask about: User-centric thinking, attention to detail, innovation, collaboration.` : ''}

${company === 'netflix' ? `Netflix Culture: Freedom & Responsibility, Context not Control, Highly Aligned Loosely Coupled.
Ask about: Independent decision-making, ownership, candor, judgment.` : ''}

Generate an HR question that:
1. Is role-relevant
2. Probes soft skills
3. Assesses cultural fit ${companyName ? `with ${companyName}` : ''}
4. Is open-ended

Provide:
- Question ${company && companyName ? `(mention this reflects ${companyName}'s interview style)` : ''}
- What you're evaluating
- Good vs poor answer examples
- Follow-up questions
  `
};

export const ROADMAP_PROMPTS = {
  generateRoadmap: (role: string, duration: number, currentLevel: string, goals: string, additionalInfo?: any) => `
You are an expert career development strategist and technical mentor for ${role} professionals.

📋 USER PROFILE:
- Target Role: ${role}
- Duration: ${duration} months (${Math.ceil(duration * 4)} weeks total)
- Current Level: ${currentLevel}
- Career Goals: ${goals}

${additionalInfo ? `
📊 DETAILED ASSESSMENT:
- DSA Knowledge: ${additionalInfo.topicKnowledge?.dsa || 'Beginner'}
- System Design: ${additionalInfo.topicKnowledge?.systemDesign || 'Beginner'}
- Project Experience: ${additionalInfo.topicKnowledge?.projects || 'Limited'}
- Interview Prep: ${additionalInfo.topicKnowledge?.interviews || 'Not started'}
- Available Time: ${additionalInfo.availableHoursPerDay || 2} hours/day
- Learning Style: ${additionalInfo.preferredLearningStyle || 'balanced'}
${additionalInfo.hasDeadline ? `- Target Deadline: ${additionalInfo.deadlineDate}` : ''}
` : ''}

🎯 TASK: Create a comprehensive, week-by-week roadmap with ${Math.ceil(duration * 4)} detailed milestones.

CRITICAL REQUIREMENTS FOR EACH WEEK:
1. **Specific Learning Topics**: Name exact concepts, technologies, or skills
2. **Actionable Tasks**: List 3-5 concrete activities (e.g., "Complete 10 array problems on LeetCode", "Build a REST API with Node.js")
3. **Time Breakdown**: How to spend ${additionalInfo?.availableHoursPerDay || 2} hours/day
4. **Resources**: Include 2-4 high-quality learning resources (courses, docs, tutorials, YouTube channels)
5. **Milestone Goals**: What should be achieved by end of week
6. **Difficulty Progression**: Start easier, gradually increase complexity

📚 CONTENT STRUCTURE BY PHASE:
Weeks 1-${Math.ceil(duration * 4 * 0.25)}: Foundation Building
- Core concepts and fundamentals
- Basic problem-solving skills
- Essential tools and setup

Weeks ${Math.ceil(duration * 4 * 0.25) + 1}-${Math.ceil(duration * 4 * 0.5)}: Intermediate Development
- Advanced topics and patterns
- Building small projects
- Competitive programming practice

Weeks ${Math.ceil(duration * 4 * 0.5) + 1}-${Math.ceil(duration * 4 * 0.75)}: Advanced & Specialization
- System design (if applicable)
- Large projects
- Domain-specific skills for ${role}

Weeks ${Math.ceil(duration * 4 * 0.75) + 1}-${Math.ceil(duration * 4)}: Interview Prep & Polish
- Mock interviews
- Resume building
- Portfolio optimization
- Company-specific preparation

🔥 LEARNING APPROACH: ${additionalInfo?.preferredLearningStyle === 'project' ? 'PROJECT-BASED: Focus on building real projects each week' : additionalInfo?.preferredLearningStyle === 'theory' ? 'THEORY-FIRST: Deep understanding of concepts before practice' : 'BALANCED: Mix of theory (40%), practice (40%), and projects (20%)'}

⚠️ OUTPUT FORMAT: Return ONLY a valid JSON array with NO markdown, NO code blocks, NO extra text.

EXACT JSON STRUCTURE (copy this format):
[
  {
    "week": 1,
    "title": "Foundation: Arrays & Strings Mastery",
    "description": "Master array and string manipulation. Complete 15 easy problems on LeetCode. Learn two-pointer technique and sliding window. Build a string processing CLI tool. Focus: Time complexity analysis and pattern recognition. Daily: 30min theory + 1hr coding practice + 30min project work.",
    "resources": [
      "https://leetcode.com/tag/array/",
      "https://www.youtube.com/watch?v=example-arrays",
      "https://takeuforward.org/strivers-a2z-dsa-course/",
      "https://neetcode.io/roadmap"
    ]
  }
]

⚡ EXAMPLE QUALITY STANDARDS:
- ✅ "Master binary search on 1D arrays. Solve 12 problems: 8 easy, 4 medium. Implement custom binary search template. Build a search visualizer app."
- ❌ "Learn data structures" (too vague)
- ✅ "Design and implement a URL shortener with Redis caching. Handle 1000 req/sec. Deploy on AWS."
- ❌ "Build a project" (too generic)

Generate ${Math.ceil(duration * 4)} weeks of detailed, actionable content NOW. Make it achievable with ${additionalInfo?.availableHoursPerDay || 2}hrs/day.
  `,

  adaptRoadmap: (currentRoadmap: string, progressData: string) => `
You are an adaptive learning coach.

Current Roadmap:
${currentRoadmap}

Progress So Far:
${progressData}

Adapt the roadmap by:
1. Identifying areas of strength to accelerate
2. Identifying gaps to address
3. Adjusting remaining milestones accordingly
4. Adding focused practice zones
5. Updating resource recommendations

Provide updated weekly plan with justifications for changes.
  `
};

export const GLOBAL_MENTOR_PROMPTS = {
  contextAwareResponse: (userContext: string, currentPage: string, userHistory: string, userQuestion: string) => `
You are a global AI mentor for college students pursuing careers in tech/research.

User Context:
${userContext}

Current Page: ${currentPage}
User's Learning History:
${userHistory}

User Question: ${userQuestion}

Provide a response that:
1. Is specific to their current activity
2. References their past learning/achievements
3. Connects to their career goals
4. Offers actionable next steps
5. Adapts language based on their level

Be encouraging, specific, and concise (under 150 words for initial response).
  `,

  generateInsights: (userData: string, progressMetrics: string) => `
You are a career analytics AI.

User Profile:
${userData}

Progress Metrics:
${progressMetrics}

Generate personalized insights:
1. **Strengths**: What are they excelling at?
2. **Growth Areas**: Where should they focus next?
3. **Career Readiness**: How close to placement-ready?
4. **Recommended Focus**: Top 3 things to work on this week
5. **Motivational Note**: One sentence of encouragement

Keep insights actionable and specific.
  `
};
