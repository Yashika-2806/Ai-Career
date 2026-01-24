import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import Roadmap from '../models/Roadmap.js';
import AIService from '../ai/ai.service.js';
import { ROADMAP_PROMPTS } from '../ai/prompts.js';

const aiService = new AIService(process.env.GEMINI_API_KEY || '');

export const roadmapController = {
  /**
   * Generate roadmap for role
   */
  generateRoadmap: async (req: AuthRequest, res: Response) => {
    try {
      const { 
        role, 
        duration, 
        currentLevel, 
        goals,
        topicKnowledge,
        availableHoursPerDay,
        preferredLearningStyle,
        hasDeadline,
        deadlineDate
      } = req.body;

      // Prepare additional info for AI
      const additionalInfo = {
        topicKnowledge,
        availableHoursPerDay,
        preferredLearningStyle,
        hasDeadline,
        deadlineDate
      };

      // Generate roadmap using AI with detailed information
      const prompt = ROADMAP_PROMPTS.generateRoadmap(role, duration, currentLevel, goals, additionalInfo);
      console.log('Generating roadmap with enhanced prompt...');
      const response = await aiService.sendMessage(prompt);

      if (!response.success) {
        return res.status(500).json({ error: response.error });
      }

      // Parse AI response (expecting JSON)
      let milestones = [];
      let roadmap; // Declare roadmap variable here
      
      try {
        // WHY: AI often wraps JSON in markdown code blocks
        // Remove markdown code fences if present
        let cleanedResponse = response.response || '';
        cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        
        // Try to find JSON array in the response - be more flexible
        const jsonMatch = cleanedResponse.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          
          // Validate and clean milestones
          milestones = parsed.map((m: any, index: number) => ({
            week: m.week || index + 1,
            title: m.title || `Week ${index + 1}`,
            description: m.description || 'Focus on learning and practice',
            resources: Array.isArray(m.resources) ? m.resources.filter((r: string) => r && r.startsWith('http')) : [],
            completed: false
          }));
          
          console.log(`✅ Generated ${milestones.length} detailed milestones from AI`);
        } else {
          console.warn('⚠️ No JSON array found in AI response');
          console.log('Response preview:', response.response?.substring(0, 500));
          throw new Error('No valid JSON in response');
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        console.log('Generating detailed fallback milestones...');
        
        // Create comprehensive role-specific fallback milestones
        milestones = generateFallbackMilestones(role, duration, currentLevel, goals);
      }

      // Ensure we have milestones
      if (!milestones || milestones.length === 0) {
        console.error('❌ No milestones generated!');
        milestones = generateFallbackMilestones(role, duration, currentLevel, goals);
      }

      // Create roadmap - use original role value for database (lowercase)
      roadmap = new Roadmap({
        userId: req.userId,
        role: role, // Keep original lowercase value for DB
        duration,
        milestones,
        endDate: new Date(Date.now() + duration * 30 * 24 * 60 * 60 * 1000),
      });
      
      console.log(`💾 Saving roadmap for role: ${role} with ${milestones.length} milestones`);

      await roadmap.save();
      console.log(`✅ Roadmap saved with ${milestones.length} milestones`);

      res.status(201).json(roadmap);
    } catch (error: any) {
      console.error('Roadmap generation error:', error);
      res.status(500).json({ error: 'Roadmap generation failed', details: error.message });
    }
  },

  /**
   * Get roadmap
   */
  getRoadmap: async (req: AuthRequest, res: Response) => {
    try {
      const { role } = req.query;

      const query = { userId: req.userId };
      if (role) {
        (query as any).role = role as string;
      }

      const roadmaps = await Roadmap.find(query);

      res.json(roadmaps);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch roadmap' });
    }
  },

  /**
   * Update milestone progress
   */
  updateMilestone: async (req: AuthRequest, res: Response) => {
    try {
      const { roadmapId, weekNumber, completed } = req.body;

      const roadmap = await Roadmap.findById(roadmapId);

      if (!roadmap || roadmap.userId.toString() !== req.userId) {
        return res.status(404).json({ error: 'Roadmap not found' });
      }

      const milestone = roadmap.milestones.find(m => m.week === weekNumber);
      if (milestone) {
        milestone.completed = completed;
      }

      // Update overall progress
      const completedCount = roadmap.milestones.filter(m => m.completed).length;
      roadmap.progress = (completedCount / roadmap.milestones.length) * 100;

      await roadmap.save();

      res.json(roadmap);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update milestone' });
    }
  },

  /**
   * Adapt roadmap based on progress
   * WHY: Creates NEW roadmap instead of mutating existing one
   * This prevents React duplicate key warnings and state inconsistencies
   */
  adaptRoadmap: async (req: AuthRequest, res: Response) => {
    try {
      const { roadmapId } = req.params;

      // Validate roadmapId format
      if (!roadmapId || roadmapId === 'undefined') {
        return res.status(400).json({ error: 'Invalid roadmap ID' });
      }

      const oldRoadmap = await Roadmap.findById(roadmapId);

      if (!oldRoadmap || oldRoadmap.userId.toString() !== req.userId) {
        return res.status(404).json({ error: 'Roadmap not found' });
      }

      // Check if roadmap has milestones
      // WHY: Return structured error for better frontend handling
      if (!oldRoadmap.milestones?.length) {
        return res.status(400).json({
          code: 'EMPTY_ROADMAP',
          message: 'Roadmap has no milestones',
          action: 'GENERATE_NEW_ROADMAP'
        });
      }

      // Generate adaptation using AI (without conversation history to avoid errors)
      const currentRoadmapStr = JSON.stringify(oldRoadmap.milestones);
      const completedCount = oldRoadmap.milestones.filter(m => m.completed).length;
      const progressStr = `Progress: ${oldRoadmap.progress}%, Completed: ${completedCount}/${oldRoadmap.milestones.length} milestones`;

      const prompt = ROADMAP_PROMPTS.adaptRoadmap(currentRoadmapStr, progressStr);
      const aiResponse = await aiService.sendMessage(prompt);

      if (!aiResponse.success) {
        return res.status(500).json({ error: aiResponse.error || 'AI adaptation failed' });
      }

      // Parse adapted milestones
      let adaptedMilestones = oldRoadmap.milestones;
      try {
        // WHY: AI often wraps JSON in markdown code blocks
        // Remove markdown code fences if present
        let cleanedResponse = aiResponse.response || '';
        cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        
        const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          adaptedMilestones = JSON.parse(jsonMatch[0]);
          console.log(`✅ Parsed ${adaptedMilestones.length} adapted milestones`);
        } else {
          console.warn('⚠️ No JSON array found in AI response, keeping original milestones');
        }
      } catch (parseError) {
        console.error('Failed to parse adapted milestones:', parseError);
        // Keep original milestones if parsing fails
      }

      // WHY: Create NEW roadmap document instead of updating existing one
      // This gives it a NEW _id, preventing React duplicate key issues
      const newRoadmap = new Roadmap({
        userId: oldRoadmap.userId,
        role: oldRoadmap.role,
        duration: oldRoadmap.duration,
        milestones: adaptedMilestones,
        progress: oldRoadmap.progress, // Recalculate will happen on save
        startDate: oldRoadmap.startDate,
        endDate: oldRoadmap.endDate,
      });

      // Recalculate progress for new roadmap
      const newCompletedCount = newRoadmap.milestones.filter(m => m.completed).length;
      newRoadmap.progress = (newCompletedCount / newRoadmap.milestones.length) * 100;

      await newRoadmap.save();
      console.log(`✅ Created new adapted roadmap: ${newRoadmap._id}`);

      // WHY: Delete old roadmap to maintain single source of truth
      await Roadmap.findByIdAndDelete(roadmapId);
      console.log(`✅ Deleted old roadmap: ${roadmapId}`);

      // WHY: Return ONLY the new roadmap, not wrapped in adaptation object
      // Frontend expects roadmap directly
      res.json(newRoadmap);
    } catch (error: any) {
      console.error('❌ Adaptation error:', error);
      res.status(500).json({ error: 'Adaptation failed: ' + error.message });
    }
  },

  /**
   * Delete roadmap
   */
  deleteRoadmap: async (req: AuthRequest, res: Response) => {
    try {
      const { roadmapId } = req.params;

      if (!roadmapId || roadmapId === 'undefined') {
        return res.status(400).json({ error: 'Invalid roadmap ID' });
      }

      const roadmap = await Roadmap.findById(roadmapId);

      if (!roadmap || roadmap.userId.toString() !== req.userId) {
        return res.status(404).json({ error: 'Roadmap not found' });
      }

      await Roadmap.findByIdAndDelete(roadmapId);
      console.log(`✅ Deleted roadmap: ${roadmapId}`);

      res.json({ message: 'Roadmap deleted successfully' });
    } catch (error: any) {
      console.error('❌ Delete error:', error);
      res.status(500).json({ error: 'Failed to delete roadmap: ' + error.message });
    }
  },
};

/**
 * Map role codes to full role names for template matching
 */
function getRoleDisplayName(role: string): string {
  const roleMap: Record<string, string> = {
    'sde': 'Software Engineer (SDE)',
    'software-engineer': 'Software Engineer (SDE)',
    'aiml-engineer': 'AI/ML Engineer',
    'ai-ml-engineer': 'AI/ML Engineer',
    'researcher': 'Researcher',
    'research-scientist': 'Researcher',
    'data-scientist': 'Data Scientist',
    'data-science': 'Data Scientist',
  };
  
  // Return mapped name or original if already in full format
  return roleMap[role.toLowerCase()] || role;
}

/**
 * Generate detailed fallback milestones based on role
 */
function generateFallbackMilestones(role: string, duration: number, currentLevel: string, goals: string) {
  const weekCount = Math.ceil(duration * 4);
  const milestones = [];

  // Role-specific roadmap templates
  const roleTemplates: Record<string, any> = {
    'Software Engineer (SDE)': [
      { title: 'Arrays & Strings Fundamentals', desc: 'Master array manipulation, two-pointer technique, sliding window. Solve 15 LeetCode easy problems. Build a string processing CLI tool.', resources: ['https://leetcode.com/tag/array/', 'https://neetcode.io/roadmap', 'https://takeuforward.org/arrays/'] },
      { title: 'Linked Lists & Recursion', desc: 'Understand linked list operations, reverse, detect cycles. Master recursion patterns. Solve 12 problems. Implement custom LinkedList class.', resources: ['https://leetcode.com/tag/linked-list/', 'https://www.geeksforgeeks.org/data-structures/linked-list/', 'https://visualgo.net/en/list'] },
      { title: 'Stacks, Queues & Hashing', desc: 'Implement stack/queue from scratch. Learn hash table collision handling. Solve 15 problems including monotonic stack. Build a task scheduler.', resources: ['https://leetcode.com/tag/stack/', 'https://www.youtube.com/watch?v=wjI1WNcIntg', 'https://cp-algorithms.com/data_structures/stack_queue_modification.html'] },
      { title: 'Trees & Binary Search Trees', desc: 'Master tree traversals (in/pre/post-order). Learn BST operations. Solve 18 problems. Build a file system visualizer using trees.', resources: ['https://leetcode.com/tag/tree/', 'https://visualgo.net/en/bst', 'https://www.youtube.com/watch?v=fAAZixBzIAI'] },
      { title: 'Heaps & Priority Queues', desc: 'Understand heap operations, heapify. Solve top K problems, merge K sorted. 12 problems. Implement custom priority queue.', resources: ['https://leetcode.com/tag/heap-priority-queue/', 'https://www.programiz.com/dsa/heap-data-structure', 'https://cp-algorithms.com/data_structures/segment_tree.html'] },
      { title: 'Binary Search Mastery', desc: 'Master binary search on answers, rotated arrays. 15 problems from easy to hard. Build a search engine prototype with binary search.', resources: ['https://leetcode.com/tag/binary-search/', 'https://www.topcoder.com/thrive/articles/Binary%20Search', 'https://www.youtube.com/watch?v=j5uXyPJ0Pew'] },
      { title: 'Dynamic Programming - 1D', desc: 'Understand memoization vs tabulation. Master Fibonacci, climbing stairs, house robber patterns. 10 1D DP problems.', resources: ['https://leetcode.com/tag/dynamic-programming/', 'https://www.youtube.com/watch?v=oBt53YbR9Kk', 'https://www.geeksforgeeks.org/dynamic-programming/'] },
      { title: 'Dynamic Programming - 2D', desc: 'Master grid DP, longest common subsequence, edit distance. 12 problems. Build a text diff tool using DP.', resources: ['https://leetcode.com/problems/edit-distance/', 'https://www.youtube.com/watch?v=YBSt1jYwVfU', 'https://cses.fi/problemset/'] },
      { title: 'Graphs - DFS & BFS', desc: 'Implement graph representations. Master DFS/BFS traversals. Solve cycle detection, connected components. 15 problems.', resources: ['https://leetcode.com/tag/graph/', 'https://visualgo.net/en/dfsbfs', 'https://www.youtube.com/watch?v=tWVWeAqZ0WU'] },
      { title: 'Advanced Graph Algorithms', desc: 'Learn Dijkstra, Bellman-Ford, Floyd-Warshall. Solve shortest path problems. 10 problems. Build a route planner.', resources: ['https://leetcode.com/tag/shortest-path/', 'https://www.youtube.com/watch?v=pVfj6mxhdMw', 'https://cp-algorithms.com/graph/dijkstra.html'] },
      { title: 'Tries & Advanced Strings', desc: 'Implement trie data structure. Master KMP, Rabin-Karp algorithms. 10 problems. Build autocomplete system.', resources: ['https://leetcode.com/tag/trie/', 'https://www.youtube.com/watch?v=AXjmTQ8LEoI', 'https://cp-algorithms.com/string/string-hashing.html'] },
      { title: 'Backtracking & Combinations', desc: 'Master backtracking template. Solve permutations, combinations, N-Queens. 12 problems. Build a Sudoku solver.', resources: ['https://leetcode.com/tag/backtracking/', 'https://www.youtube.com/watch?v=A80YzvNwqXA', 'https://www.geeksforgeeks.org/backtracking-algorithms/'] },
      { title: 'System Design Basics', desc: 'Learn CAP theorem, load balancing, caching strategies. Design URL shortener, parking lot. Read 3 design blogs.', resources: ['https://github.com/donnemartin/system-design-primer', 'https://www.youtube.com/c/TechDummiesNarendraL', 'https://newsletter.pragmaticengineer.com/'] },
      { title: 'API Design & Databases', desc: 'Design RESTful APIs. Learn SQL vs NoSQL. Implement CRUD operations. Build a blog backend with PostgreSQL.', resources: ['https://restfulapi.net/', 'https://www.postgresql.org/docs/current/tutorial.html', 'https://www.youtube.com/watch?v=HXV3zeQKqGY'] },
      { title: 'Advanced System Design', desc: 'Design Instagram, Twitter feed. Learn rate limiting, CDN, microservices. Mock interviews with peers.', resources: ['https://www.youtube.com/c/SystemDesignInterview', 'https://github.com/checkcheckzz/system-design-interview', 'https://systemdesignprimer.com/'] },
      { title: 'Project Showcase Development', desc: 'Build full-stack project: real-time chat app, e-commerce, or dashboard. Deploy to AWS/Vercel. Write comprehensive README.', resources: ['https://github.com/topics/portfolio-project', 'https://docs.aws.amazon.com/getting-started/', 'https://vercel.com/docs'] },
      { title: 'Behavioral Interview Prep', desc: 'Prepare STAR format answers. Practice 20 common behavioral questions. Record yourself. Get feedback from mentors.', resources: ['https://www.indeed.com/career-advice/interviewing/star-interview-method', 'https://leetcode.com/discuss/interview-question/437082/Amazon-Behavioral-questions-or-Leadership-Principles-or-LP', 'https://www.youtube.com/watch?v=PJKYqLP6MRE'] },
      { title: 'Company-Specific Prep', desc: 'Research target companies. Solve 20 problems from company tags. Read Glassdoor reviews. Connect with employees on LinkedIn.', resources: ['https://leetcode.com/company/', 'https://www.teamblind.com/', 'https://www.glassdoor.com/'] },
      { title: 'Mock Interviews - Round 1', desc: 'Take 5 mock coding interviews on Pramp/interviewing.io. Focus on communication and problem-solving approach. Record sessions.', resources: ['https://www.pramp.com/', 'https://interviewing.io/', 'https://www.youtube.com/c/CsDojoYT'] },
      { title: 'Mock Interviews - Round 2', desc: 'Take 3 system design mocks. Practice whiteboard coding. Get feedback on explanation style. Review recorded sessions.', resources: ['https://www.tryexponent.com/', 'https://www.interviewquery.com/', 'https://igotanoffer.com/'] },
      { title: 'Resume & LinkedIn Optimization', desc: 'Optimize resume with ATS keywords. Get 3 reviews. Update LinkedIn with projects. Write technical blog posts.', resources: ['https://www.resume.io/resume-examples/software-engineer', 'https://www.linkedin.com/pulse/', 'https://dev.to/'] },
      { title: 'Final Contest & Applications', desc: 'Participate in 2 coding contests. Apply to 20+ companies. Follow up on applications. Stay consistent with daily practice.', resources: ['https://codeforces.com/', 'https://www.codechef.com/', 'https://leetcode.com/contest/'] },
      { title: 'Interview Season Preparation', desc: 'Revise all patterns. Solve 5 problems daily. Stay healthy. Track applications. Prepare questions for interviewers.', resources: ['https://www.teamblind.com/post/New-Year-Gift---Curated-List-of-Top-75-LeetCode-Questions-to-Save-Your-Time', 'https://neetcode.io/practice', 'https://github.com/jwasham/coding-interview-university'] },
      { title: 'Offer Negotiation & Onboarding', desc: 'Learn salary negotiation tactics. Compare offers. Plan relocation if needed. Prepare for onboarding. Keep learning!', resources: ['https://www.kalzumeus.com/2012/01/23/salary-negotiation/', 'https://www.levels.fyi/', 'https://www.youtube.com/watch?v=u9BoG1n1948'] },
    ],
    'Data Scientist': [
      { title: 'Python & Math Foundations', desc: 'Master NumPy, Pandas basics. Revise linear algebra, calculus, probability. Solve 10 Python coding problems. Set up Jupyter environment.', resources: ['https://numpy.org/doc/', 'https://pandas.pydata.org/docs/', 'https://www.khanacademy.org/math/linear-algebra'] },
      { title: 'Data Wrangling & EDA', desc: 'Learn data cleaning, handling missing values. Master pandas operations. Complete 3 Kaggle EDA notebooks. Visualize with matplotlib/seaborn.', resources: ['https://www.kaggle.com/learn/pandas', 'https://seaborn.pydata.org/tutorial.html', 'https://mode.com/python-tutorial/'] },
      { title: 'Statistics & Hypothesis Testing', desc: 'Learn descriptive/inferential statistics. Master t-tests, chi-square, ANOVA. Solve 10 statistics problems. Analyze real datasets.', resources: ['https://www.khanacademy.org/math/statistics-probability', 'https://www.coursera.org/learn/statistical-inference', 'https://www.statology.org/'] },
      { title: 'Machine Learning Fundamentals', desc: 'Understand supervised vs unsupervised learning. Learn train-test split, cross-validation. Implement linear/logistic regression from scratch.', resources: ['https://scikit-learn.org/stable/tutorial/', 'https://www.coursera.org/learn/machine-learning', 'https://www.youtube.com/watch?v=ukzFI9rgwfU'] },
      { title: 'Classification Algorithms', desc: 'Master Decision Trees, Random Forest, SVM, KNN. Learn model evaluation metrics. Complete 2 classification projects on Kaggle.', resources: ['https://scikit-learn.org/stable/supervised_learning.html', 'https://www.kaggle.com/competitions', 'https://machinelearningmastery.com/'] },
      { title: 'Regression & Regularization', desc: 'Learn Ridge, Lasso, ElasticNet. Master feature engineering. Build house price prediction model. Deploy with Flask API.', resources: ['https://scikit-learn.org/stable/modules/linear_model.html', 'https://www.kaggle.com/c/house-prices-advanced-regression-techniques', 'https://flask.palletsprojects.com/'] },
    ],
    'AI/ML Engineer': [
      { title: 'Python & Deep Learning Setup', desc: 'Master Python for ML. Set up TensorFlow/PyTorch environment. Learn NumPy, Pandas basics. Complete 10 Python coding exercises.', resources: ['https://pytorch.org/tutorials/', 'https://www.tensorflow.org/tutorials', 'https://numpy.org/doc/'] },
      { title: 'Neural Networks Fundamentals', desc: 'Understand perceptrons, activation functions, backpropagation. Implement neural network from scratch. Train on MNIST dataset.', resources: ['https://www.coursera.org/learn/neural-networks-deep-learning', 'https://www.3blue1brown.com/topics/neural-networks', 'https://www.youtube.com/watch?v=aircAruvnKk'] },
      { title: 'CNNs & Computer Vision', desc: 'Master convolutional layers, pooling, architectures (ResNet, VGG). Build image classifier. Complete 2 Kaggle vision competitions.', resources: ['https://cs231n.stanford.edu/', 'https://www.kaggle.com/competitions', 'https://pytorch.org/vision/stable/index.html'] },
      { title: 'RNNs & NLP Basics', desc: 'Learn LSTMs, GRUs, sequence modeling. Build sentiment analyzer. Understand word embeddings (Word2Vec, GloVe).', resources: ['https://www.coursera.org/learn/nlp-sequence-models', 'https://huggingface.co/course/chapter1', 'https://nlp.stanford.edu/'] },
      { title: 'Transformers & LLMs', desc: 'Master attention mechanism, BERT, GPT architectures. Fine-tune pre-trained models. Build text generation application.', resources: ['https://huggingface.co/transformers/', 'https://jalammar.github.io/illustrated-transformer/', 'https://www.youtube.com/watch?v=kCc8FmEb1nY'] },
      { title: 'MLOps & Deployment', desc: 'Learn Docker, model versioning, CI/CD for ML. Deploy models with FastAPI. Monitor model performance in production.', resources: ['https://madewithml.com/', 'https://www.docker.com/get-started', 'https://fastapi.tiangolo.com/'] },
      { title: 'Reinforcement Learning', desc: 'Understand Q-learning, policy gradients, actor-critic. Implement RL agent for game. Read key RL papers.', resources: ['https://spinningup.openai.com/', 'https://www.deepmind.com/learning-resources', 'https://gymnasium.farama.org/'] },
      { title: 'Advanced ML Topics', desc: 'Learn GANs, VAEs, transfer learning. Experiment with diffusion models. Build creative AI application.', resources: ['https://www.coursera.org/specializations/generative-adversarial-networks-gans', 'https://arxiv.org/', 'https://paperswithcode.com/'] },
    ],
    'Researcher': [
      { title: 'Research Methodology Foundations', desc: 'Learn literature review techniques, paper reading strategies. Read 5 seminal papers in your field. Set up reference management (Zotero/Mendeley).', resources: ['https://www.scribbr.com/category/research-process/', 'https://academia.stackexchange.com/', 'https://www.zotero.org/'] },
      { title: 'Problem Identification & Formulation', desc: 'Identify research gaps in current literature. Define research questions and hypotheses. Write problem statement draft. Discuss with mentors.', resources: ['https://www.nature.com/articles/d41586-019-02918-5', 'https://arxiv.org/', 'https://scholar.google.com/'] },
      { title: 'Mathematical Foundations', desc: 'Master linear algebra, probability theory, optimization. Complete 20 math problems. Understand proofs and derivations relevant to your field.', resources: ['https://www.khanacademy.org/math', 'https://ocw.mit.edu/courses/mathematics/', 'https://brilliant.org/'] },
      { title: 'Programming for Research', desc: 'Master Python/MATLAB for research. Learn version control (Git). Set up research environment. Implement 3 classic algorithms from papers.', resources: ['https://realpython.com/', 'https://git-scm.com/book/en/v2', 'https://github.com/academic/awesome-research'] },
      { title: 'Related Work Analysis', desc: 'Conduct comprehensive literature survey. Read 15 recent papers. Create taxonomy of existing approaches. Identify unique contributions you can make.', resources: ['https://arxiv.org/', 'https://scholar.google.com/', 'https://www.connectedpapers.com/'] },
      { title: 'Experimental Design', desc: 'Design experiments to test hypotheses. Learn statistical significance testing. Plan data collection methodology. Create experimental protocol.', resources: ['https://www.coursera.org/learn/designexperiments', 'https://www.jove.com/', 'https://osf.io/'] },
    ],
  };

  // Get role template or default
  const displayRole = getRoleDisplayName(role);
  const templates = roleTemplates[displayRole] || roleTemplates['Software Engineer (SDE)'];
  
  console.log(`📋 Generating fallback for role: ${role} -> ${displayRole}`);
  console.log(`📊 Creating ${weekCount} weeks from ${templates.length} templates`);
  
  // Use each template only once, cycling through if we need more weeks
  for (let i = 0; i < weekCount; i++) {
    const templateIndex = i % templates.length; // Cycle through templates
    const template = templates[templateIndex];
    const weekNum = i + 1;
    
    milestones.push({
      week: weekNum,
      title: template.title,
      description: template.desc,
      resources: template.resources || [],
      completed: false,
    });
  }

  return milestones;
}
