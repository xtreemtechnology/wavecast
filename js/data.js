/**
 * data.js
 * Static data used across the app.
 * Topics, artwork palette, and mock episode fallback data.
 */

const TOPICS = [
  { label: 'Technology',  query: 'technology' },
  { label: 'Business',    query: 'business' },
  { label: 'Comedy',      query: 'comedy' },
  { label: 'True Crime',  query: 'true crime' },
  { label: 'Health',      query: 'health' },
  { label: 'Education',   query: 'education' },
  { label: 'Sports',      query: 'sports' },
  { label: 'News',        query: 'news' },
  { label: 'Science',     query: 'science' },
  { label: 'Finance',     query: 'finance' },
];

/**
 * Rotating color palette for artwork tiles.
 * Each entry is { bg, fg } — a soft background with a dark matching foreground.
 */
const ART_COLORS = [
  { bg: '#faeeda', fg: '#633806' },
  { bg: '#e1f5ee', fg: '#085041' },
  { bg: '#faece7', fg: '#4a1b0c' },
  { bg: '#e6f1fb', fg: '#042c53' },
  { bg: '#fbeaf0', fg: '#4b1528' },
  { bg: '#eaf3de', fg: '#173404' },
  { bg: '#f1efff', fg: '#2d1e6b' },
  { bg: '#fff4e0', fg: '#6b3a00' },
];

/**
 * Fallback episode data shown when the RSS feed cannot be parsed.
 * In a full build this would be replaced with real feed data.
 */
const MOCK_EPISODES = [
  {
    title: '#1 — Getting Started: What You Need to Know',
    desc: 'The host dives into the fundamentals and sets the stage for the season ahead. A solid introduction for new listeners.',
    date: 'Jun 10, 2025',
    duration: '42 min',
  },
  {
    title: '#2 — Deep Dive: The Tools That Changed Everything',
    desc: 'A detailed look at the platforms and workflows reshaping the industry, with practical takeaways you can apply today.',
    date: 'Jun 3, 2025',
    duration: '38 min',
  },
  {
    title: '#3 — Interview: Building a Career from Scratch',
    desc: 'A raw conversation with a creator who built an audience with zero connections and no prior experience.',
    date: 'May 27, 2025',
    duration: '51 min',
  },
  {
    title: '#4 — The Business of Content: Monetise Without Selling Out',
    desc: 'Practical strategies for earning from your work without compromising your integrity or your audience.',
    date: 'May 20, 2025',
    duration: '33 min',
  },
  {
    title: '#5 — Listener Q&A: Your Questions Answered',
    desc: 'Answering the most common questions submitted by the community this month — honest, direct, no fluff.',
    date: 'May 13, 2025',
    duration: '29 min',
  },
];
