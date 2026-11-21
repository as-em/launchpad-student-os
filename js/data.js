const STAGES = ['Wishlist', 'Applied', 'Interview', 'Offer'];
const SKILL_OPTIONS = [
  'C++',
  'Python',
  'DSA / CP',
  'React',
  'Node.js',
  'SQL',
  'Machine Learning',
  'Leadership'
];

const I18N = {
  en: {
    title: 'Launchpad OS — CSE Edition',
    subtitle: 'Labs, CP & Thesis Tasks • Internships & Clubs • Alumni/Faculty Network • Project Bullets',
    reset: '↺ Reset Sample Data',
    tabCommand: '📌 Daily & Lab Sprint',
    tabPipeline: '💼 Internships & Clubs',
    tabNetwork: '🤝 Alumni & Faculty',
    tabExp: '🏆 Projects & CV Bank',
    addTask: '+ Add Task'
  },
  bn: {
    title: 'লঞ্চপ্যাড ওএস — সিএসই এডিশন',
    subtitle: 'ল্যাব, সিপি ও থিসিস টাস্ক • ইন্টার্নশিপ ও ক্লাব • অ্যালামনাই ও শিক্ষক • প্রজেক্ট সিভি ব্যাংক',
    reset: '↺ রিসেট ডেটা',
    tabCommand: '📌 ডেইলি ও ল্যাব স্প্রিন্ট',
    tabPipeline: '💼 ইন্টার্নশিপ ও ক্লাব',
    tabNetwork: '🤝 অ্যালামনাই ও শিক্ষক',
    tabExp: '🏆 প্রজেক্ট ও সিভি ব্যাংক',
    addTask: '+ টাস্ক যোগ করুন'
  }
};

const defaults = {
  lang: 'en',
  tab: 'command',
  taskFilter: 'all',
  taskQuery: '',
  activeTimerId: null,
  elapsedSeconds: 0,
  opps: [
    {
      id: 1,
      org: 'Therap (BD) Ltd.',
      title: 'Software Engineer Intern (Java / Web)',
      type: 'Internship',
      status: 'Interview',
      deadline: 'Dec 5',
      skills: ['SQL', 'React', 'DSA / CP'],
      desc: 'Backend and web engineering internship focusing on clean problem solving, SQL, and React.'
    },
    {
      id: 2,
      org: 'CSE ACM / Programming Club',
      title: 'Problem Setter & Contest Trainer',
      type: 'Club Role',
      status: 'Offer',
      deadline: 'Nov 28',
      skills: ['C++', 'DSA / CP', 'Leadership'],
      desc: 'Conduct weekly C++ and DSA practice sessions for juniors and help organize intra-university contests.'
    },
    {
      id: 3,
      org: 'Pathao / bKash Tech',
      title: 'Junior Software Engineer Intern',
      type: 'Internship',
      status: 'Applied',
      deadline: 'Dec 14',
      skills: ['Node.js', 'React', 'SQL'],
      desc: 'Build scalable web/API services and collaborate with product and QA engineers.'
    },
    {
      id: 4,
      org: 'Dept. AI & NLP Research Group',
      title: 'Undergraduate Thesis / Research Fellow',
      type: 'Research',
      status: 'Wishlist',
      deadline: 'Dec 20',
      skills: ['Python', 'Machine Learning'],
      desc: 'Research on Bangla NLP and low-resource vision models using Python.'
    }
  ],
  exps: [
    {
      id: 1,
      title: 'Dhaka Bus Route & Fare Finder',
      metric: '2,200+ users',
      skills: ['React', 'Node.js', 'SQL'],
      bullet: 'Built a crowdsourced Dhaka bus route and fare web app using React, Node.js, and SQL, helping commuters plan trips faster.'
    },
    {
      id: 2,
      title: 'Intra-CSE Programming Contest & Bootcamp',
      metric: '180+ participants',
      skills: ['C++', 'DSA / CP', 'Leadership'],
      bullet: 'Co-organized a 4-week C++ and DSA bootcamp and set 6 algorithmic problems for 180+ CSE students.'
    },
    {
      id: 3,
      title: 'Bangla Social Media Sentiment Classifier',
      metric: '88.4% F1-score',
      skills: ['Python', 'Machine Learning'],
      bullet: 'Trained and evaluated Python ML models on Bangla text datasets with preprocessing for mixed Romanized/Bangla comments.'
    }
  ],
  contacts: [
    { id: 1, name: 'Tanvir Ahmed', role: 'SWE @ Therap BD', org: 'Alumni Mentor', days: 18, note: 'Reviewed my resume; follow up after finishing SQL & OOP prep.' },
    { id: 2, name: 'Nusrat Jahan', role: 'Senior SWE', org: 'Pathao', days: 5, note: 'Shared interview tips on system basics and debugging.' },
    { id: 3, name: 'Dr. Mahmudul Hasan', role: 'Associate Professor, CSE', org: 'AI & NLP Lab', days: 22, note: 'Ask about available 4th-year thesis / research slots.' }
  ],
  tasks: [
    { id: 1, title: 'Complete CSE-305 (OS / DBMS) lab report & code', tag: 'Lab', energy: 'High', minutes: 90, done: false },
    { id: 2, title: 'Solve 3 DP / Graph problems on Codeforces (C++)', tag: 'CP', energy: 'High', minutes: 75, done: false },
    { id: 3, title: 'Send polite follow-up message to alumni mentor', tag: '5m', energy: 'Low', minutes: 10, done: false },
    { id: 4, title: 'Update GitHub README & CV link', tag: '10m', energy: 'Low', minutes: 15, done: true }
  ],
  modalOppId: null,
  customDesc: '',
  copiedBulletId: null,
  taskError: ''
};
