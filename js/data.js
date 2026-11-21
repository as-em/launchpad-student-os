const STAGES = ['Wishlist', 'Applied', 'Interview', 'Offer'];
const SKILL_OPTIONS = ['C++', 'Python', 'DSA / CP', 'React', 'Node.js', 'SQL', 'Machine Learning'];

const defaults = {
  tab: 'command',
  filter: 'all',
  opps: [
    { id: 1, org: 'Therap (BD) Ltd.', title: 'Software Engineer Intern', type: 'Internship', status: 'Interview', deadline: 'Dec 5' },
    { id: 2, org: 'CSE Programming Club', title: 'Contest Trainer', type: 'Club Role', status: 'Offer', deadline: 'Nov 28' },
    { id: 3, org: 'Pathao / bKash', title: 'Junior SWE Intern', type: 'Internship', status: 'Applied', deadline: 'Dec 14' },
    { id: 4, org: 'Dept. AI & NLP Lab', title: 'Thesis / Research Fellow', type: 'Research', status: 'Wishlist', deadline: 'Dec 20' }
  ],
  exps: [
    {
      id: 1,
      title: 'Dhaka Bus Route & Fare Finder',
      metric: '2,200+ users',
      skill: 'React',
      bullet: 'Built a Dhaka bus route and fare web app with React, Node.js, and SQL.'
    },
    {
      id: 2,
      title: 'Intra-CSE Programming Contest',
      metric: '180+ coders',
      skill: 'DSA / CP',
      bullet: 'Organized a C++ and DSA contest and set 6 algorithmic problems for CSE students.'
    },
    {
      id: 3,
      title: 'Bangla Sentiment Analyzer',
      metric: '88% F1',
      skill: 'Machine Learning',
      bullet: 'Trained a Python ML classifier for Bangla and mixed Romanized comments.'
    }
  ],
  contacts: [
    { id: 1, name: 'Tanvir Ahmed', role: 'SWE @ Therap BD', org: 'Alumni', days: 18, note: 'Follow up after SQL & OOP prep.' },
    { id: 2, name: 'Nusrat Jahan', role: 'SWE @ Pathao', org: 'Alumni', days: 5, note: 'Shared interview tips.' },
    { id: 3, name: 'Dr. Mahmudul Hasan', role: 'CSE Faculty', org: 'AI Lab', days: 22, note: 'Ask about thesis slot.' }
  ],
  tasks: [
    { id: 1, title: 'Finish CSE-305 lab report & code', tag: 'Lab', energy: 'High', minutes: 90, done: false },
    { id: 2, title: 'Solve 3 Graph/DP problems on Codeforces', tag: 'CP', energy: 'High', minutes: 60, done: false },
    { id: 3, title: 'Message alumni mentor for quick tip', tag: '5m', energy: 'Low', minutes: 10, done: false },
    { id: 4, title: 'Push lab code to GitHub', tag: '10m', energy: 'Low', minutes: 15, done: true }
  ],
  copiedId: null,
  taskError: ''
};
