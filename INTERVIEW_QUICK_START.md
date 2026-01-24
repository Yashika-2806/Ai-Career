# Quick Start Guide - Enhanced Interview Feature

## 🎯 What's New?

Your interview feature now has:
1. **Company-specific questions** from Google, Amazon, Microsoft, Meta, Apple, Netflix, Adobe, Uber, Salesforce, Tesla
2. **Fullscreen mode** during interview
3. **Camera monitoring** with live feed
4. **AI/Cheating detection** (tab switches, copy-paste, AI patterns)
5. **Real-time alerts** for suspicious activities

## 🚀 How to Use

### Starting an Interview

1. Navigate to the Interview page
2. **Select Target Company** - Choose from 10 top companies
3. Select Interview Type (Technical/HR/System Design)
4. Select Target Role
5. Click "Start Interview"

### During the Interview

1. **Camera Permission Popup** appears
   - Click "Allow Camera" to continue
   - Camera is required for proctoring

2. **Answering Questions**
   - Click in the answer box
   - **Fullscreen activates automatically**
   - Camera feed appears in bottom-right
   - Type your answer

3. **What's Being Monitored**
   - Tab switches (switching to Google/ChatGPT)
   - Copy-paste events (copying answers)
   - AI-generated text patterns
   - Fullscreen exits

4. **Submit Your Answer**
   - AI evaluates with proctoring data
   - Score adjusted if suspicious activity detected
   - Feedback provided

### Ending the Interview

- Click "End Interview"
- Camera stops automatically
- Fullscreen exits
- Results saved to history

## ⚠️ Important Notes

### Camera Access
- **Required** for all interviews
- Used only for proctoring
- Not recorded or stored
- Live feed only during answering

### Fullscreen Mode
- **Automatic** when you start typing
- Exiting fullscreen = suspicious activity
- Press ESC to exit (logged as suspicious)

### Suspicious Activities
- Yellow alert box appears when detected
- Shows count and description
- Affects your final score
- All activities timestamped

### What Gets Flagged
❌ Switching tabs/windows
❌ Large copy-paste operations (>50 chars)
❌ AI-generated text patterns
❌ Exiting fullscreen during interview

## 🏢 Company-Specific Questions

### Google
- Focus: Algorithms, System Design, Innovation
- Questions: Graph problems, Scalability, LRU Cache

### Amazon
- Focus: Leadership Principles, Customer Obsession
- Questions: Islands, Tree problems, STAR behavioral

### Microsoft
- Focus: Collaboration, Cloud Services
- Questions: Linked Lists, Collaborative systems

### Meta (Facebook)
- Focus: Social Value, Move Fast
- Questions: Graph algorithms, News Feed design

### Apple
- Focus: User Experience, Privacy
- Questions: String problems, UX-focused design

### Netflix
- Focus: Freedom & Responsibility
- Questions: Rate limiting, Streaming systems

### Adobe
- Focus: Creativity, Innovation
- Questions: Image processing, Collaborative tools

### Uber
- Focus: Geospatial, Real-time
- Questions: Location matching, Dynamic pricing

### Salesforce
- Focus: Customer Success, Multi-tenancy
- Questions: CRM design, RBAC systems

### Tesla
- Focus: Innovation, Speed
- Questions: Autonomous systems, Battery optimization

## 🔍 Detection System

### Tab Switch Detection
```
User switches to another tab → Logged
Opens Google → Detected and counted
Switches back → Logged
```

### Copy-Paste Detection
```
User copies large text → Flagged
Pastes answer → Logged with character count
Pattern analyzed → Scored accordingly
```

### AI Pattern Detection
```
Answer contains "As an AI" → Flagged
Contains "Language model" → Flagged
Multiple patterns → High suspicion score
```

## 📊 How Scoring Works

Base score (1-5) adjusted by:
- **Perfect integrity**: No adjustment
- **Minor issues** (1-2 flags): -0.5 points
- **Moderate issues** (3-5 flags): -1 point
- **Serious issues** (6+ flags): -2 points

Factors considered:
- Correctness of answer
- Communication clarity
- Complexity analysis
- Edge case handling
- Code quality
- Confidence
- **Integrity concerns**

## 🎓 Tips for Success

### Do's ✅
- Think and answer yourself
- Use fullscreen mode properly
- Allow camera access
- Type your own answers
- Take your time
- Ask clarifying questions

### Don'ts ❌
- Don't switch tabs
- Don't use ChatGPT/AI tools
- Don't copy-paste answers
- Don't exit fullscreen
- Don't use external resources
- Don't try to cheat the system

## 🔧 Troubleshooting

### Camera Not Working?
1. Check browser permissions
2. Allow camera access in system settings
3. Close other apps using camera
4. Try different browser
5. Reload the page

### Fullscreen Not Activating?
1. Click in answer box
2. Grant fullscreen permission
3. Browser blocks? Check settings
4. Try F11 key

### False Positives?
- Legitimate tab switches still count
- Be careful with multi-monitor setups
- Explain in your answer if needed
- Minimize non-interview activities

## 📱 Browser Compatibility

### ✅ Fully Supported
- Chrome 90+
- Edge 90+
- Firefox 88+
- Safari 15+

### ⚠️ Limited Support
- Older browsers may not support fullscreen
- Camera API varies by browser
- Some detection may not work

## 🎯 Best Practices

1. **Environment Setup**
   - Quiet, distraction-free space
   - Good lighting for camera
   - Stable internet connection
   - Close unnecessary tabs

2. **During Interview**
   - Focus on the question
   - Think before typing
   - Explain your reasoning
   - Don't rush

3. **After Interview**
   - Review feedback carefully
   - Note improvement areas
   - Practice flagged concepts
   - Try different companies

## 📞 Need Help?

If you encounter issues:
1. Check this guide first
2. Review error messages
3. Try refreshing the page
4. Clear browser cache
5. Contact support

## 🎉 Success Stories

The enhanced interview feature helps you:
- Practice with **real** company questions
- Experience **authentic** interview pressure
- Get **honest** feedback on your skills
- Improve **integrity** and discipline
- Build **confidence** for actual interviews

## 🚀 Ready to Start?

1. Go to Interview page
2. Select your target company
3. Allow camera access
4. Answer honestly
5. Learn and improve!

Remember: The goal is to prepare you for real interviews, not to catch you cheating. Use the proctoring as motivation to practice honestly and build genuine skills! 💪

---

**Good luck with your interview preparation!** 🌟
