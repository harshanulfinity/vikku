import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Square, Rocket, Globe, Megaphone, Map, BookOpen, TrendingUp, UserPlus, PenTool, Bug, Users, ClipboardCheck, Calendar, CalendarCheck, Target, PieChart, Search, Layers, Server, Palette, Flag, ClipboardList, Video, Mic, FileText, Award, Plane, Shield, Receipt, BarChart, LifeBuoy, HelpCircle, MessageSquare, GraduationCap, Presentation, CheckSquare, Home, Compass, Dumbbell, Briefcase, Newspaper } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { createProject, bulkCreateTasks, bulkCreateMilestones } from '../../lib/pmService'
import AppHeader from '../../components/AppHeader'

const COLORS = [
  '#ffffff', '#6ee7b7', '#93c5fd', '#fbbf24', '#f87171',
  '#c084fc', '#fb923c', '#34d399', '#60a5fa', '#f472b6',
]

const STATUS_OPTIONS = ['active', 'on-hold']

function daysFromNow(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

const TEMPLATES = [
  {
    key: 'blank',
    Icon: Square,
    name: 'Blank',
    tasks: [],
    milestones: [],
  },
  {
    key: 'startup',
    category: 'Business & Sales',
    Icon: Rocket,
    name: 'Startup Launch',
    description: '12 tasks · 4 milestones',
    tasks: [
      { title: 'Define MVP features and scope', status: 'todo', priority: 'high' },
      { title: 'Set up development environment', status: 'todo', priority: 'medium' },
      { title: 'Design wireframes and user flows', status: 'todo', priority: 'high' },
      { title: 'Build core product features', status: 'todo', priority: 'high' },
      { title: 'Set up landing page', status: 'todo', priority: 'medium' },
      { title: 'Integrate payment gateway', status: 'todo', priority: 'high' },
      { title: 'Write onboarding copy', status: 'todo', priority: 'medium' },
      { title: 'Set up analytics tracking', status: 'todo', priority: 'low' },
      { title: 'Beta test with 10 users', status: 'todo', priority: 'high' },
      { title: 'Fix bugs from beta feedback', status: 'todo', priority: 'urgent' },
      { title: 'Set up customer support channel', status: 'todo', priority: 'medium' },
      { title: 'Prepare launch announcement', status: 'todo', priority: 'medium' },
    ],
    milestones: [
      { title: 'Wireframes approved', daysFromNow: 7 },
      { title: 'MVP feature complete', daysFromNow: 21 },
      { title: 'Beta launch', daysFromNow: 35 },
      { title: 'Public launch', daysFromNow: 45 },
    ],
  },
  {
    key: 'webdev',
    category: 'Design & Engineering',
    Icon: Globe,
    name: 'Web Development',
    description: '14 tasks · 5 milestones',
    tasks: [
      { title: 'Gather requirements from client', status: 'todo', priority: 'high' },
      { title: 'Create sitemap and architecture', status: 'todo', priority: 'high' },
      { title: 'Design UI mockups', status: 'todo', priority: 'high' },
      { title: 'Get design approval', status: 'todo', priority: 'medium' },
      { title: 'Set up project repository', status: 'todo', priority: 'medium' },
      { title: 'Build homepage', status: 'todo', priority: 'high' },
      { title: 'Build inner pages', status: 'todo', priority: 'high' },
      { title: 'Add animations and interactions', status: 'todo', priority: 'medium' },
      { title: 'Integrate CMS or backend', status: 'todo', priority: 'medium' },
      { title: 'Cross-browser and mobile testing', status: 'todo', priority: 'high' },
      { title: 'SEO setup and meta tags', status: 'todo', priority: 'medium' },
      { title: 'Performance optimization', status: 'todo', priority: 'medium' },
      { title: 'Client review round', status: 'todo', priority: 'high' },
      { title: 'Deploy to production', status: 'todo', priority: 'urgent' },
    ],
    milestones: [
      { title: 'Design approved', daysFromNow: 5 },
      { title: 'Homepage done', daysFromNow: 14 },
      { title: 'All pages complete', daysFromNow: 25 },
      { title: 'Client review done', daysFromNow: 32 },
      { title: 'Site live', daysFromNow: 38 },
    ],
  },
  {
    key: 'marketing',
    category: 'Business & Sales',
    Icon: Megaphone,
    name: 'Marketing Campaign',
    description: '10 tasks · 3 milestones',
    tasks: [
      { title: 'Define campaign goals and KPIs', status: 'todo', priority: 'high' },
      { title: 'Identify target audience', status: 'todo', priority: 'high' },
      { title: 'Create campaign messaging and hooks', status: 'todo', priority: 'high' },
      { title: 'Design ad creatives', status: 'todo', priority: 'medium' },
      { title: 'Write ad copy for all channels', status: 'todo', priority: 'medium' },
      { title: 'Set up ad campaigns (Meta/Google)', status: 'todo', priority: 'high' },
      { title: 'Launch email sequence', status: 'todo', priority: 'medium' },
      { title: 'Monitor and optimize ads daily', status: 'todo', priority: 'urgent' },
      { title: 'A/B test creatives', status: 'todo', priority: 'medium' },
      { title: 'Final performance report', status: 'todo', priority: 'low' },
    ],
    milestones: [
      { title: 'Campaign assets ready', daysFromNow: 7 },
      { title: 'Campaign goes live', daysFromNow: 10 },
      { title: 'Performance review', daysFromNow: 30 },
    ],
  },
  {
    key: 'roadmap',
    category: 'Design & Engineering',
    Icon: Map,
    name: 'Product Roadmap',
    description: '12 tasks · 5 milestones',
    tasks: [
      { title: 'Collect customer feedback and pain points', status: 'todo', priority: 'high' },
      { title: 'Prioritize features using impact/effort matrix', status: 'todo', priority: 'high' },
      { title: 'Define Q1 goals', status: 'todo', priority: 'high' },
      { title: 'Write product specs for top features', status: 'todo', priority: 'medium' },
      { title: 'Validate concepts with users', status: 'todo', priority: 'medium' },
      { title: 'Build feature A', status: 'todo', priority: 'high' },
      { title: 'Build feature B', status: 'todo', priority: 'high' },
      { title: 'Build feature C', status: 'todo', priority: 'medium' },
      { title: 'Internal QA testing', status: 'todo', priority: 'high' },
      { title: 'Staged rollout to users', status: 'todo', priority: 'medium' },
      { title: 'Monitor metrics post-launch', status: 'todo', priority: 'medium' },
      { title: 'Plan Q2 roadmap', status: 'todo', priority: 'low' },
    ],
    milestones: [
      { title: 'Roadmap finalized', daysFromNow: 7 },
      { title: 'Feature A shipped', daysFromNow: 21 },
      { title: 'Feature B shipped', daysFromNow: 35 },
      { title: 'Feature C shipped', daysFromNow: 50 },
      { title: 'Q1 review complete', daysFromNow: 60 },
    ],
  },
  {
    key: 'course',
    category: 'Personal & Productivity',
    Icon: BookOpen,
    name: 'Personal Course',
    description: '8 tasks · 3 milestones',
    tasks: [
      { title: 'Define course topic and target student', status: 'todo', priority: 'high' },
      { title: 'Outline curriculum and modules', status: 'todo', priority: 'high' },
      { title: 'Record module 1 videos', status: 'todo', priority: 'high' },
      { title: 'Record module 2 videos', status: 'todo', priority: 'high' },
      { title: 'Record module 3 videos', status: 'todo', priority: 'high' },
      { title: 'Edit and export videos', status: 'todo', priority: 'medium' },
      { title: 'Set up course on platform', status: 'todo', priority: 'medium' },
      { title: 'Launch to first students', status: 'todo', priority: 'urgent' },
    ],
    milestones: [
      { title: 'Curriculum approved', daysFromNow: 5 },
      { title: 'All videos recorded', daysFromNow: 20 },
      { title: 'Course live', daysFromNow: 30 },
    ],
  },

  // ── Business & Sales ──────────────────────────────────────
  {
    key: 'sales-pipeline',
    category: 'Business & Sales',
    Icon: TrendingUp,
    name: 'Sales Pipeline',
    description: '8 tasks · 3 milestones',
    tasks: [
      { title: 'Build target account and lead list', status: 'todo', priority: 'high' },
      { title: 'Write cold outreach templates', status: 'todo', priority: 'high' },
      { title: 'Send first outreach batch', status: 'todo', priority: 'high' },
      { title: 'Book discovery calls', status: 'todo', priority: 'high' },
      { title: 'Send proposals to qualified leads', status: 'todo', priority: 'urgent' },
      { title: 'Follow up on open proposals', status: 'todo', priority: 'high' },
      { title: 'Negotiate and close deals', status: 'todo', priority: 'urgent' },
      { title: 'Hand off won deals to delivery', status: 'todo', priority: 'medium' },
    ],
    milestones: [
      { title: 'Lead list ready', daysFromNow: 3 },
      { title: 'First proposals sent', daysFromNow: 14 },
      { title: 'First deal closed', daysFromNow: 30 },
    ],
  },
  {
    key: 'client-onboarding',
    category: 'Business & Sales',
    Icon: UserPlus,
    name: 'Client Onboarding',
    description: '8 tasks · 3 milestones',
    tasks: [
      { title: 'Send welcome email and contract', status: 'todo', priority: 'high' },
      { title: 'Collect brand assets and access', status: 'todo', priority: 'high' },
      { title: 'Schedule kickoff call', status: 'todo', priority: 'high' },
      { title: 'Document goals and success metrics', status: 'todo', priority: 'high' },
      { title: 'Set up shared workspace and channels', status: 'todo', priority: 'medium' },
      { title: 'Agree on timeline and milestones', status: 'todo', priority: 'high' },
      { title: 'Send first status update', status: 'todo', priority: 'medium' },
      { title: 'Confirm invoicing and billing details', status: 'todo', priority: 'medium' },
    ],
    milestones: [
      { title: 'Contract signed', daysFromNow: 3 },
      { title: 'Kickoff complete', daysFromNow: 7 },
      { title: 'Onboarding complete', daysFromNow: 14 },
    ],
  },

  // ── Design & Engineering ──────────────────────────────────
  {
    key: 'design-sprint',
    category: 'Design & Engineering',
    Icon: PenTool,
    name: 'Design Sprint',
    description: '8 tasks · 3 milestones',
    tasks: [
      { title: 'Map the problem and pick a target', status: 'todo', priority: 'high' },
      { title: 'Gather lightning demos and inspiration', status: 'todo', priority: 'medium' },
      { title: 'Sketch competing solutions', status: 'todo', priority: 'high' },
      { title: 'Decide on the strongest concept', status: 'todo', priority: 'high' },
      { title: 'Build a clickable prototype', status: 'todo', priority: 'high' },
      { title: 'Recruit 5 test users', status: 'todo', priority: 'medium' },
      { title: 'Run usability tests', status: 'todo', priority: 'high' },
      { title: 'Synthesize findings and next steps', status: 'todo', priority: 'medium' },
    ],
    milestones: [
      { title: 'Concept decided', daysFromNow: 2 },
      { title: 'Prototype ready', daysFromNow: 4 },
      { title: 'Test results in', daysFromNow: 5 },
    ],
  },
  {
    key: 'bug-tracker',
    category: 'Design & Engineering',
    Icon: Bug,
    name: 'Bug Tracker / Sprint',
    description: '8 tasks · 2 milestones',
    tasks: [
      { title: 'Triage incoming bug reports', status: 'todo', priority: 'high' },
      { title: 'Reproduce and confirm top bugs', status: 'todo', priority: 'high' },
      { title: 'Prioritize by severity and impact', status: 'todo', priority: 'high' },
      { title: 'Fix critical / blocker bugs', status: 'todo', priority: 'urgent' },
      { title: 'Fix high-priority bugs', status: 'todo', priority: 'high' },
      { title: 'Write regression tests', status: 'todo', priority: 'medium' },
      { title: 'Code review and QA pass', status: 'todo', priority: 'high' },
      { title: 'Deploy fixes and verify in prod', status: 'todo', priority: 'urgent' },
    ],
    milestones: [
      { title: 'Backlog triaged', daysFromNow: 2 },
      { title: 'Sprint bugs cleared', daysFromNow: 14 },
    ],
  },

  // ── HR & Operations ───────────────────────────────────────
  {
    key: 'hiring',
    category: 'HR & Operations',
    Icon: Users,
    name: 'Hiring Pipeline',
    description: '9 tasks · 3 milestones',
    tasks: [
      { title: 'Write the job description', status: 'todo', priority: 'high' },
      { title: 'Post to job boards and network', status: 'todo', priority: 'high' },
      { title: 'Screen incoming applications', status: 'todo', priority: 'high' },
      { title: 'Run phone screens', status: 'todo', priority: 'high' },
      { title: 'Send take-home / skills assessment', status: 'todo', priority: 'medium' },
      { title: 'Conduct on-site / final interviews', status: 'todo', priority: 'high' },
      { title: 'Check references', status: 'todo', priority: 'medium' },
      { title: 'Make offer and negotiate', status: 'todo', priority: 'urgent' },
      { title: 'Close role and notify candidates', status: 'todo', priority: 'medium' },
    ],
    milestones: [
      { title: 'Role posted', daysFromNow: 2 },
      { title: 'Shortlist ready', daysFromNow: 14 },
      { title: 'Offer accepted', daysFromNow: 30 },
    ],
  },
  {
    key: 'employee-onboarding',
    category: 'HR & Operations',
    Icon: ClipboardCheck,
    name: 'Employee Onboarding',
    description: '8 tasks · 2 milestones',
    tasks: [
      { title: 'Prepare offer letter and paperwork', status: 'todo', priority: 'high' },
      { title: 'Set up accounts, email, and tools', status: 'todo', priority: 'high' },
      { title: 'Ship equipment / laptop', status: 'todo', priority: 'high' },
      { title: 'Assign an onboarding buddy', status: 'todo', priority: 'medium' },
      { title: 'Schedule week-1 intro meetings', status: 'todo', priority: 'medium' },
      { title: 'Share handbook and policies', status: 'todo', priority: 'medium' },
      { title: 'Set 30/60/90 day goals', status: 'todo', priority: 'high' },
      { title: 'First-week check-in', status: 'todo', priority: 'medium' },
    ],
    milestones: [
      { title: 'Day 1 ready', daysFromNow: 5 },
      { title: '30-day check-in', daysFromNow: 30 },
    ],
  },
  {
    key: 'event-planning',
    category: 'HR & Operations',
    Icon: Calendar,
    name: 'Event Planning',
    description: '9 tasks · 3 milestones',
    tasks: [
      { title: 'Define event goals and budget', status: 'todo', priority: 'high' },
      { title: 'Pick date and book venue', status: 'todo', priority: 'high' },
      { title: 'Confirm speakers / agenda', status: 'todo', priority: 'high' },
      { title: 'Arrange catering and logistics', status: 'todo', priority: 'medium' },
      { title: 'Build registration page', status: 'todo', priority: 'medium' },
      { title: 'Promote the event', status: 'todo', priority: 'high' },
      { title: 'Prepare signage and materials', status: 'todo', priority: 'medium' },
      { title: 'Run the event', status: 'todo', priority: 'urgent' },
      { title: 'Send thank-you and collect feedback', status: 'todo', priority: 'low' },
    ],
    milestones: [
      { title: 'Venue booked', daysFromNow: 7 },
      { title: 'Registration open', daysFromNow: 21 },
      { title: 'Event day', daysFromNow: 45 },
    ],
  },

  // ── Personal & Productivity ───────────────────────────────
  {
    key: 'weekly-planner',
    category: 'Personal & Productivity',
    Icon: CalendarCheck,
    name: 'Weekly Planner',
    description: '7 tasks · 2 milestones',
    tasks: [
      { title: 'Review last week and open items', status: 'todo', priority: 'medium' },
      { title: 'Set top 3 priorities for the week', status: 'todo', priority: 'high' },
      { title: 'Block deep-work time on calendar', status: 'todo', priority: 'high' },
      { title: 'Plan errands and admin', status: 'todo', priority: 'low' },
      { title: 'Schedule exercise and breaks', status: 'todo', priority: 'medium' },
      { title: 'Prep for key meetings', status: 'todo', priority: 'medium' },
      { title: 'Friday review and reset', status: 'todo', priority: 'medium' },
    ],
    milestones: [
      { title: 'Week planned', daysFromNow: 1 },
      { title: 'Week reviewed', daysFromNow: 7 },
    ],
  },
  {
    key: 'goal-tracker',
    category: 'Personal & Productivity',
    Icon: Target,
    name: 'Goal Tracker',
    description: '7 tasks · 3 milestones',
    tasks: [
      { title: 'Write down the goal and why it matters', status: 'todo', priority: 'high' },
      { title: 'Break it into monthly targets', status: 'todo', priority: 'high' },
      { title: 'Define this week’s action steps', status: 'todo', priority: 'high' },
      { title: 'Set up a daily habit / streak', status: 'todo', priority: 'medium' },
      { title: 'Track progress weekly', status: 'todo', priority: 'medium' },
      { title: 'Adjust plan based on what’s working', status: 'todo', priority: 'medium' },
      { title: 'Reward hitting the milestone', status: 'todo', priority: 'low' },
    ],
    milestones: [
      { title: 'Plan set', daysFromNow: 2 },
      { title: 'Month 1 target', daysFromNow: 30 },
      { title: 'Goal reached', daysFromNow: 90 },
    ],
  },

  // ── Business & Sales (more) ───────────────────────────────
  {
    key: 'account-outreach', category: 'Business & Sales', Icon: Target, name: 'Account-Based Outreach', description: '7 tasks · 2 milestones',
    tasks: [
      { title: 'Pick 20 dream accounts', status: 'todo', priority: 'high' },
      { title: 'Map decision-makers per account', status: 'todo', priority: 'high' },
      { title: 'Research each account’s pain points', status: 'todo', priority: 'medium' },
      { title: 'Write personalized outreach per account', status: 'todo', priority: 'high' },
      { title: 'Run multi-touch sequence (email + LinkedIn)', status: 'todo', priority: 'high' },
      { title: 'Book intro meetings', status: 'todo', priority: 'urgent' },
      { title: 'Log outcomes and next steps', status: 'todo', priority: 'medium' },
    ],
    milestones: [ { title: 'Account list locked', daysFromNow: 3 }, { title: 'First meetings booked', daysFromNow: 21 } ],
  },
  {
    key: 'partnership-deal', category: 'Business & Sales', Icon: Briefcase, name: 'Partnership Deal', description: '7 tasks · 3 milestones',
    tasks: [
      { title: 'Shortlist potential partners', status: 'todo', priority: 'high' },
      { title: 'Draft partnership proposal', status: 'todo', priority: 'high' },
      { title: 'Pitch to partner stakeholders', status: 'todo', priority: 'high' },
      { title: 'Align on terms and revenue split', status: 'todo', priority: 'high' },
      { title: 'Legal review of agreement', status: 'todo', priority: 'medium' },
      { title: 'Sign and announce partnership', status: 'todo', priority: 'urgent' },
      { title: 'Plan joint go-to-market', status: 'todo', priority: 'medium' },
    ],
    milestones: [ { title: 'Proposal sent', daysFromNow: 7 }, { title: 'Terms agreed', daysFromNow: 21 }, { title: 'Deal signed', daysFromNow: 35 } ],
  },
  {
    key: 'qbr', category: 'Business & Sales', Icon: PieChart, name: 'Quarterly Business Review', description: '6 tasks · 2 milestones',
    tasks: [
      { title: 'Pull quarter’s metrics and revenue', status: 'todo', priority: 'high' },
      { title: 'Compare vs targets and last quarter', status: 'todo', priority: 'high' },
      { title: 'Gather wins, losses, and lessons', status: 'todo', priority: 'medium' },
      { title: 'Build the QBR deck', status: 'todo', priority: 'high' },
      { title: 'Set next-quarter goals', status: 'todo', priority: 'high' },
      { title: 'Present to leadership / client', status: 'todo', priority: 'urgent' },
    ],
    milestones: [ { title: 'Data compiled', daysFromNow: 5 }, { title: 'QBR presented', daysFromNow: 10 } ],
  },

  // ── Marketing ─────────────────────────────────────────────
  {
    key: 'content-calendar', category: 'Marketing', Icon: Calendar, name: 'Content Calendar', description: '7 tasks · 2 milestones',
    tasks: [
      { title: 'Define monthly content themes', status: 'todo', priority: 'high' },
      { title: 'Brainstorm 20 post ideas', status: 'todo', priority: 'high' },
      { title: 'Assign owners and due dates', status: 'todo', priority: 'medium' },
      { title: 'Draft posts for week 1', status: 'todo', priority: 'high' },
      { title: 'Design accompanying graphics', status: 'todo', priority: 'medium' },
      { title: 'Schedule posts', status: 'todo', priority: 'medium' },
      { title: 'Review engagement and iterate', status: 'todo', priority: 'low' },
    ],
    milestones: [ { title: 'Calendar filled', daysFromNow: 5 }, { title: 'Month published', daysFromNow: 30 } ],
  },
  {
    key: 'product-launch-mktg', category: 'Marketing', Icon: Rocket, name: 'Product Launch (GTM)', description: '8 tasks · 3 milestones',
    tasks: [
      { title: 'Define positioning and messaging', status: 'todo', priority: 'high' },
      { title: 'Build launch landing page', status: 'todo', priority: 'high' },
      { title: 'Prepare press kit and assets', status: 'todo', priority: 'medium' },
      { title: 'Line up launch-day partners/influencers', status: 'todo', priority: 'medium' },
      { title: 'Write launch email + social posts', status: 'todo', priority: 'high' },
      { title: 'Schedule Product Hunt / launch post', status: 'todo', priority: 'high' },
      { title: 'Go live and monitor', status: 'todo', priority: 'urgent' },
      { title: 'Post-launch recap and metrics', status: 'todo', priority: 'low' },
    ],
    milestones: [ { title: 'Assets ready', daysFromNow: 10 }, { title: 'Launch day', daysFromNow: 14 }, { title: 'Recap done', daysFromNow: 21 } ],
  },
  {
    key: 'seo-campaign', category: 'Marketing', Icon: Search, name: 'SEO Campaign', description: '7 tasks · 2 milestones',
    tasks: [
      { title: 'Run keyword research', status: 'todo', priority: 'high' },
      { title: 'Audit current site + fix issues', status: 'todo', priority: 'high' },
      { title: 'Map keywords to pages', status: 'todo', priority: 'medium' },
      { title: 'Write / optimize target pages', status: 'todo', priority: 'high' },
      { title: 'Build internal links', status: 'todo', priority: 'medium' },
      { title: 'Earn backlinks / outreach', status: 'todo', priority: 'medium' },
      { title: 'Track rankings monthly', status: 'todo', priority: 'low' },
    ],
    milestones: [ { title: 'Audit complete', daysFromNow: 7 }, { title: 'Pages optimized', daysFromNow: 30 } ],
  },

  // ── Design & Engineering (more) ───────────────────────────
  {
    key: 'mobile-app', category: 'Design & Engineering', Icon: Layers, name: 'Mobile App Build', description: '9 tasks · 4 milestones',
    tasks: [
      { title: 'Define app scope and platforms', status: 'todo', priority: 'high' },
      { title: 'Design app screens and flows', status: 'todo', priority: 'high' },
      { title: 'Set up project and CI', status: 'todo', priority: 'medium' },
      { title: 'Build authentication', status: 'todo', priority: 'high' },
      { title: 'Build core screens', status: 'todo', priority: 'high' },
      { title: 'Integrate push notifications', status: 'todo', priority: 'medium' },
      { title: 'QA on real devices', status: 'todo', priority: 'high' },
      { title: 'Prepare store listings', status: 'todo', priority: 'medium' },
      { title: 'Submit to App Store / Play Store', status: 'todo', priority: 'urgent' },
    ],
    milestones: [ { title: 'Designs done', daysFromNow: 10 }, { title: 'Auth + core built', daysFromNow: 30 }, { title: 'Beta ready', daysFromNow: 45 }, { title: 'Live in stores', daysFromNow: 60 } ],
  },
  {
    key: 'api-integration', category: 'Design & Engineering', Icon: Server, name: 'API Integration', description: '6 tasks · 2 milestones',
    tasks: [
      { title: 'Read the API docs and auth model', status: 'todo', priority: 'high' },
      { title: 'Get API keys / sandbox access', status: 'todo', priority: 'high' },
      { title: 'Build the integration layer', status: 'todo', priority: 'high' },
      { title: 'Handle errors, retries, and rate limits', status: 'todo', priority: 'high' },
      { title: 'Write tests against sandbox', status: 'todo', priority: 'medium' },
      { title: 'Deploy and monitor in prod', status: 'todo', priority: 'urgent' },
    ],
    milestones: [ { title: 'Sandbox working', daysFromNow: 7 }, { title: 'Live in prod', daysFromNow: 18 } ],
  },
  {
    key: 'design-system', category: 'Design & Engineering', Icon: Palette, name: 'Design System', description: '7 tasks · 3 milestones',
    tasks: [
      { title: 'Audit existing UI patterns', status: 'todo', priority: 'high' },
      { title: 'Define tokens (color, type, spacing)', status: 'todo', priority: 'high' },
      { title: 'Build core components', status: 'todo', priority: 'high' },
      { title: 'Document usage guidelines', status: 'todo', priority: 'medium' },
      { title: 'Publish component library', status: 'todo', priority: 'medium' },
      { title: 'Migrate one product surface', status: 'todo', priority: 'high' },
      { title: 'Roll out to the team', status: 'todo', priority: 'low' },
    ],
    milestones: [ { title: 'Tokens defined', daysFromNow: 7 }, { title: 'Components shipped', daysFromNow: 25 }, { title: 'Team adopted', daysFromNow: 40 } ],
  },

  // ── Product Management ────────────────────────────────────
  {
    key: 'feature-launch', category: 'Product Management', Icon: Flag, name: 'Feature Launch', description: '7 tasks · 3 milestones',
    tasks: [
      { title: 'Write the feature spec', status: 'todo', priority: 'high' },
      { title: 'Align design and engineering', status: 'todo', priority: 'high' },
      { title: 'Build behind a feature flag', status: 'todo', priority: 'high' },
      { title: 'Internal dogfooding', status: 'todo', priority: 'medium' },
      { title: 'Beta with a subset of users', status: 'todo', priority: 'high' },
      { title: 'Gradual rollout to 100%', status: 'todo', priority: 'urgent' },
      { title: 'Measure adoption and impact', status: 'todo', priority: 'medium' },
    ],
    milestones: [ { title: 'Spec approved', daysFromNow: 5 }, { title: 'Beta live', daysFromNow: 20 }, { title: 'Full rollout', daysFromNow: 30 } ],
  },
  {
    key: 'user-research', category: 'Product Management', Icon: Users, name: 'User Research', description: '6 tasks · 2 milestones',
    tasks: [
      { title: 'Define research questions', status: 'todo', priority: 'high' },
      { title: 'Recruit participants', status: 'todo', priority: 'high' },
      { title: 'Write the interview script', status: 'todo', priority: 'medium' },
      { title: 'Run interviews / usability tests', status: 'todo', priority: 'high' },
      { title: 'Synthesize themes and insights', status: 'todo', priority: 'high' },
      { title: 'Share findings and recommendations', status: 'todo', priority: 'medium' },
    ],
    milestones: [ { title: 'Interviews done', daysFromNow: 14 }, { title: 'Insights shared', daysFromNow: 20 } ],
  },
  {
    key: 'backlog-grooming', category: 'Product Management', Icon: ClipboardList, name: 'Backlog Grooming', description: '6 tasks · 2 milestones',
    tasks: [
      { title: 'Collect and tag all backlog items', status: 'todo', priority: 'medium' },
      { title: 'Merge duplicates, archive stale ones', status: 'todo', priority: 'medium' },
      { title: 'Score by impact vs effort', status: 'todo', priority: 'high' },
      { title: 'Write clear acceptance criteria', status: 'todo', priority: 'high' },
      { title: 'Prioritize next sprint', status: 'todo', priority: 'high' },
      { title: 'Review with the team', status: 'todo', priority: 'medium' },
    ],
    milestones: [ { title: 'Backlog cleaned', daysFromNow: 3 }, { title: 'Sprint planned', daysFromNow: 7 } ],
  },

  // ── Content & Media ───────────────────────────────────────
  {
    key: 'youtube-video', category: 'Content & Media', Icon: Video, name: 'YouTube Video', description: '7 tasks · 2 milestones',
    tasks: [
      { title: 'Pick topic and hook', status: 'todo', priority: 'high' },
      { title: 'Write the script', status: 'todo', priority: 'high' },
      { title: 'Film the video', status: 'todo', priority: 'high' },
      { title: 'Edit and add b-roll', status: 'todo', priority: 'high' },
      { title: 'Design thumbnail', status: 'todo', priority: 'medium' },
      { title: 'Write title + description + tags', status: 'todo', priority: 'medium' },
      { title: 'Publish and promote', status: 'todo', priority: 'urgent' },
    ],
    milestones: [ { title: 'Filmed', daysFromNow: 5 }, { title: 'Published', daysFromNow: 10 } ],
  },
  {
    key: 'podcast-episode', category: 'Content & Media', Icon: Mic, name: 'Podcast Episode', description: '7 tasks · 2 milestones',
    tasks: [
      { title: 'Book the guest', status: 'todo', priority: 'high' },
      { title: 'Prep questions and outline', status: 'todo', priority: 'high' },
      { title: 'Record the episode', status: 'todo', priority: 'high' },
      { title: 'Edit audio and add intro/outro', status: 'todo', priority: 'medium' },
      { title: 'Write show notes', status: 'todo', priority: 'medium' },
      { title: 'Create audiograms / clips', status: 'todo', priority: 'low' },
      { title: 'Publish and share', status: 'todo', priority: 'urgent' },
    ],
    milestones: [ { title: 'Recorded', daysFromNow: 5 }, { title: 'Episode live', daysFromNow: 9 } ],
  },
  {
    key: 'blog-post', category: 'Content & Media', Icon: Newspaper, name: 'Blog Article', description: '6 tasks · 2 milestones',
    tasks: [
      { title: 'Pick topic and target keyword', status: 'todo', priority: 'high' },
      { title: 'Outline the article', status: 'todo', priority: 'high' },
      { title: 'Write the first draft', status: 'todo', priority: 'high' },
      { title: 'Edit and add visuals', status: 'todo', priority: 'medium' },
      { title: 'SEO pass (meta, links, alt text)', status: 'todo', priority: 'medium' },
      { title: 'Publish and distribute', status: 'todo', priority: 'urgent' },
    ],
    milestones: [ { title: 'Draft done', daysFromNow: 4 }, { title: 'Published', daysFromNow: 7 } ],
  },

  // ── HR & Operations (more) ────────────────────────────────
  {
    key: 'performance-review', category: 'HR & Operations', Icon: Award, name: 'Performance Reviews', description: '6 tasks · 2 milestones',
    tasks: [
      { title: 'Set the review cycle and timeline', status: 'todo', priority: 'high' },
      { title: 'Share self-assessment forms', status: 'todo', priority: 'medium' },
      { title: 'Collect peer / 360 feedback', status: 'todo', priority: 'high' },
      { title: 'Managers write reviews', status: 'todo', priority: 'high' },
      { title: 'Hold 1:1 review meetings', status: 'todo', priority: 'high' },
      { title: 'Finalize ratings and next-cycle goals', status: 'todo', priority: 'medium' },
    ],
    milestones: [ { title: 'Feedback collected', daysFromNow: 14 }, { title: 'Reviews delivered', daysFromNow: 28 } ],
  },
  {
    key: 'team-offsite', category: 'HR & Operations', Icon: Plane, name: 'Team Offsite', description: '7 tasks · 2 milestones',
    tasks: [
      { title: 'Set offsite goals and budget', status: 'todo', priority: 'high' },
      { title: 'Pick dates and destination', status: 'todo', priority: 'high' },
      { title: 'Book travel and lodging', status: 'todo', priority: 'high' },
      { title: 'Plan agenda and activities', status: 'todo', priority: 'medium' },
      { title: 'Arrange meals and logistics', status: 'todo', priority: 'medium' },
      { title: 'Run the offsite', status: 'todo', priority: 'urgent' },
      { title: 'Collect feedback and follow-ups', status: 'todo', priority: 'low' },
    ],
    milestones: [ { title: 'Booked', daysFromNow: 14 }, { title: 'Offsite done', daysFromNow: 45 } ],
  },
  {
    key: 'policy-rollout', category: 'HR & Operations', Icon: Shield, name: 'Policy Rollout', description: '6 tasks · 2 milestones',
    tasks: [
      { title: 'Draft the new policy', status: 'todo', priority: 'high' },
      { title: 'Legal / compliance review', status: 'todo', priority: 'high' },
      { title: 'Get leadership sign-off', status: 'todo', priority: 'high' },
      { title: 'Communicate to the team', status: 'todo', priority: 'high' },
      { title: 'Update handbook and docs', status: 'todo', priority: 'medium' },
      { title: 'Answer questions and enforce', status: 'todo', priority: 'medium' },
    ],
    milestones: [ { title: 'Approved', daysFromNow: 10 }, { title: 'Rolled out', daysFromNow: 20 } ],
  },

  // ── Finance ───────────────────────────────────────────────
  {
    key: 'monthly-close', category: 'Finance', Icon: Receipt, name: 'Monthly Books Close', description: '7 tasks · 2 milestones',
    tasks: [
      { title: 'Import and categorize transactions', status: 'todo', priority: 'high' },
      { title: 'Reconcile bank and card accounts', status: 'todo', priority: 'high' },
      { title: 'Chase and record outstanding invoices', status: 'todo', priority: 'medium' },
      { title: 'Record expenses and receipts', status: 'todo', priority: 'medium' },
      { title: 'Review P&L and balance sheet', status: 'todo', priority: 'high' },
      { title: 'Flag anomalies', status: 'todo', priority: 'medium' },
      { title: 'Send monthly summary', status: 'todo', priority: 'low' },
    ],
    milestones: [ { title: 'Reconciled', daysFromNow: 3 }, { title: 'Books closed', daysFromNow: 5 } ],
  },
  {
    key: 'fundraising', category: 'Finance', Icon: TrendingUp, name: 'Fundraising Round', description: '8 tasks · 3 milestones',
    tasks: [
      { title: 'Define raise amount and use of funds', status: 'todo', priority: 'high' },
      { title: 'Build pitch deck', status: 'todo', priority: 'high' },
      { title: 'Prepare financial model', status: 'todo', priority: 'high' },
      { title: 'Build target investor list', status: 'todo', priority: 'medium' },
      { title: 'Warm intros and outreach', status: 'todo', priority: 'high' },
      { title: 'Run investor meetings', status: 'todo', priority: 'urgent' },
      { title: 'Due diligence and term sheet', status: 'todo', priority: 'high' },
      { title: 'Close the round', status: 'todo', priority: 'urgent' },
    ],
    milestones: [ { title: 'Deck ready', daysFromNow: 10 }, { title: 'Meetings underway', daysFromNow: 30 }, { title: 'Round closed', daysFromNow: 75 } ],
  },
  {
    key: 'budget-planning', category: 'Finance', Icon: BarChart, name: 'Annual Budget', description: '6 tasks · 2 milestones',
    tasks: [
      { title: 'Review last year’s actuals', status: 'todo', priority: 'high' },
      { title: 'Gather department requests', status: 'todo', priority: 'high' },
      { title: 'Forecast revenue', status: 'todo', priority: 'high' },
      { title: 'Allocate budgets by team', status: 'todo', priority: 'high' },
      { title: 'Build scenarios (base / lean / growth)', status: 'todo', priority: 'medium' },
      { title: 'Present and approve', status: 'todo', priority: 'urgent' },
    ],
    milestones: [ { title: 'Draft budget', daysFromNow: 10 }, { title: 'Budget approved', daysFromNow: 21 } ],
  },

  // ── Customer Support ──────────────────────────────────────
  {
    key: 'support-sprint', category: 'Customer Support', Icon: LifeBuoy, name: 'Support Backlog Sprint', description: '6 tasks · 2 milestones',
    tasks: [
      { title: 'Triage and tag open tickets', status: 'todo', priority: 'high' },
      { title: 'Resolve quick wins first', status: 'todo', priority: 'high' },
      { title: 'Escalate bugs to engineering', status: 'todo', priority: 'high' },
      { title: 'Reply to aging tickets', status: 'todo', priority: 'urgent' },
      { title: 'Identify top recurring issues', status: 'todo', priority: 'medium' },
      { title: 'Write macros for common replies', status: 'todo', priority: 'low' },
    ],
    milestones: [ { title: 'Backlog triaged', daysFromNow: 2 }, { title: 'Inbox at zero', daysFromNow: 7 } ],
  },
  {
    key: 'help-docs', category: 'Customer Support', Icon: HelpCircle, name: 'Help Center / Docs', description: '6 tasks · 2 milestones',
    tasks: [
      { title: 'List top questions from support', status: 'todo', priority: 'high' },
      { title: 'Outline article structure', status: 'todo', priority: 'medium' },
      { title: 'Write getting-started guides', status: 'todo', priority: 'high' },
      { title: 'Add screenshots and videos', status: 'todo', priority: 'medium' },
      { title: 'Publish to help center', status: 'todo', priority: 'medium' },
      { title: 'Link docs inside the product', status: 'todo', priority: 'low' },
    ],
    milestones: [ { title: 'Core articles live', daysFromNow: 10 }, { title: 'Help center launched', daysFromNow: 18 } ],
  },
  {
    key: 'customer-feedback', category: 'Customer Support', Icon: MessageSquare, name: 'Customer Feedback Loop', description: '6 tasks · 2 milestones',
    tasks: [
      { title: 'Set up a feedback channel', status: 'todo', priority: 'high' },
      { title: 'Send an NPS / CSAT survey', status: 'todo', priority: 'high' },
      { title: 'Interview a few power users', status: 'todo', priority: 'medium' },
      { title: 'Tag and theme the feedback', status: 'todo', priority: 'high' },
      { title: 'Share top requests with product', status: 'todo', priority: 'medium' },
      { title: 'Close the loop with customers', status: 'todo', priority: 'medium' },
    ],
    milestones: [ { title: 'Survey sent', daysFromNow: 5 }, { title: 'Insights shared', daysFromNow: 14 } ],
  },

  // ── Education ─────────────────────────────────────────────
  {
    key: 'course-cohort', category: 'Education', Icon: GraduationCap, name: 'Cohort Course', description: '7 tasks · 3 milestones',
    tasks: [
      { title: 'Design curriculum and schedule', status: 'todo', priority: 'high' },
      { title: 'Open enrollment', status: 'todo', priority: 'high' },
      { title: 'Prepare week 1 materials', status: 'todo', priority: 'high' },
      { title: 'Run live sessions', status: 'todo', priority: 'high' },
      { title: 'Grade assignments / give feedback', status: 'todo', priority: 'medium' },
      { title: 'Host office hours', status: 'todo', priority: 'medium' },
      { title: 'Graduation and certificates', status: 'todo', priority: 'low' },
    ],
    milestones: [ { title: 'Enrollment closed', daysFromNow: 14 }, { title: 'Cohort starts', daysFromNow: 21 }, { title: 'Cohort ends', daysFromNow: 60 } ],
  },
  {
    key: 'workshop-prep', category: 'Education', Icon: Presentation, name: 'Workshop Prep', description: '6 tasks · 2 milestones',
    tasks: [
      { title: 'Define learning outcomes', status: 'todo', priority: 'high' },
      { title: 'Build slides and exercises', status: 'todo', priority: 'high' },
      { title: 'Prepare handouts / worksheets', status: 'todo', priority: 'medium' },
      { title: 'Do a dry run', status: 'todo', priority: 'medium' },
      { title: 'Set up room / virtual room', status: 'todo', priority: 'medium' },
      { title: 'Run the workshop', status: 'todo', priority: 'urgent' },
    ],
    milestones: [ { title: 'Materials ready', daysFromNow: 7 }, { title: 'Workshop delivered', daysFromNow: 14 } ],
  },
  {
    key: 'study-plan', category: 'Education', Icon: CheckSquare, name: 'Exam Study Plan', description: '6 tasks · 3 milestones',
    tasks: [
      { title: 'List all topics to cover', status: 'todo', priority: 'high' },
      { title: 'Break topics into a weekly schedule', status: 'todo', priority: 'high' },
      { title: 'Gather notes and resources', status: 'todo', priority: 'medium' },
      { title: 'Do daily study blocks', status: 'todo', priority: 'high' },
      { title: 'Take practice tests', status: 'todo', priority: 'high' },
      { title: 'Review weak areas', status: 'todo', priority: 'medium' },
    ],
    milestones: [ { title: 'Half syllabus done', daysFromNow: 14 }, { title: 'Full syllabus done', daysFromNow: 28 }, { title: 'Exam day', daysFromNow: 35 } ],
  },

  // ── Personal & Productivity (more) ────────────────────────
  {
    key: 'home-reno', category: 'Personal & Productivity', Icon: Home, name: 'Home Renovation', description: '7 tasks · 3 milestones',
    tasks: [
      { title: 'Set budget and scope', status: 'todo', priority: 'high' },
      { title: 'Get contractor quotes', status: 'todo', priority: 'high' },
      { title: 'Finalize design and materials', status: 'todo', priority: 'medium' },
      { title: 'Order materials', status: 'todo', priority: 'medium' },
      { title: 'Demolition and prep', status: 'todo', priority: 'high' },
      { title: 'Main build / installation', status: 'todo', priority: 'high' },
      { title: 'Final walkthrough and snag list', status: 'todo', priority: 'medium' },
    ],
    milestones: [ { title: 'Contractor booked', daysFromNow: 10 }, { title: 'Build starts', daysFromNow: 21 }, { title: 'Project done', daysFromNow: 60 } ],
  },
  {
    key: 'trip-planning', category: 'Personal & Productivity', Icon: Compass, name: 'Trip Planning', description: '7 tasks · 2 milestones',
    tasks: [
      { title: 'Pick destination and dates', status: 'todo', priority: 'high' },
      { title: 'Set a budget', status: 'todo', priority: 'medium' },
      { title: 'Book flights', status: 'todo', priority: 'high' },
      { title: 'Book accommodation', status: 'todo', priority: 'high' },
      { title: 'Plan daily itinerary', status: 'todo', priority: 'medium' },
      { title: 'Sort visas / documents / insurance', status: 'todo', priority: 'high' },
      { title: 'Pack and prep', status: 'todo', priority: 'low' },
    ],
    milestones: [ { title: 'Flights + stay booked', daysFromNow: 14 }, { title: 'Departure', daysFromNow: 45 } ],
  },
  {
    key: 'fitness-plan', category: 'Personal & Productivity', Icon: Dumbbell, name: 'Fitness Plan', description: '6 tasks · 3 milestones',
    tasks: [
      { title: 'Set a specific fitness goal', status: 'todo', priority: 'high' },
      { title: 'Design a weekly workout split', status: 'todo', priority: 'high' },
      { title: 'Plan meals and nutrition', status: 'todo', priority: 'medium' },
      { title: 'Track workouts daily', status: 'todo', priority: 'high' },
      { title: 'Log progress weekly', status: 'todo', priority: 'medium' },
      { title: 'Adjust plan monthly', status: 'todo', priority: 'low' },
    ],
    milestones: [ { title: 'Plan set', daysFromNow: 2 }, { title: 'Week 4 check-in', daysFromNow: 28 }, { title: 'Goal reached', daysFromNow: 84 } ],
  },
]

const CATEGORY_ORDER = ['Business & Sales', 'Marketing', 'Design & Engineering', 'Product Management', 'Content & Media', 'HR & Operations', 'Finance', 'Customer Support', 'Education', 'Personal & Productivity']

export default function NewProject() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const fromEstimate = location.state?.fromEstimate || null
  const [selectedTemplate, setSelectedTemplate] = useState('blank')
  const [form, setForm] = useState({
    name: fromEstimate?.name || '',
    description: fromEstimate?.description || '',
    client_name: '',
    client_email: '',
    color: '#ffffff',
    status: 'active',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [bannerDismissed, setBannerDismissed] = useState(false)

  const template = TEMPLATES.find((t) => t.key === selectedTemplate)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmedName = form.name.trim()
    if (!trimmedName) { setError('Project name is required'); return }
    if (trimmedName.length > 100) { setError('Project name must be under 100 characters'); return }
    if (form.client_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.client_email)) {
      setError('Please enter a valid client email address')
      return
    }
    setSaving(true)
    setError('')
    try {
      const project = await createProject({ ...form, name: trimmedName, user_id: user.id })

      if (template && template.tasks.length > 0) {
        await bulkCreateTasks(template.tasks.map((t) => ({ ...t, project_id: project.id, created_by_email: user.email })))
      }
      const estimateMilestones = fromEstimate?.phases?.length && (!template || template.milestones.length === 0)
        ? fromEstimate.phases
        : null
      if (estimateMilestones) {
        await bulkCreateMilestones(estimateMilestones.map((m) => ({
          project_id: project.id,
          title: m.title,
          due_date: daysFromNow(m.daysFromNow),
          completed: false,
        })))
      } else if (template && template.milestones.length > 0) {
        await bulkCreateMilestones(template.milestones.map((m) => ({
          project_id: project.id,
          title: m.title,
          due_date: daysFromNow(m.daysFromNow),
          completed: false,
        })))
      }

      const isBlank = !template || template.tasks.length === 0
      navigate(`/pm/projects/${project.slug || project.id}${isBlank ? '?onboard=1' : ''}`)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader breadcrumbs={[{ label: 'PM', href: '/pm' }, { label: 'Projects', href: '/pm/dashboard' }, { label: 'New Project' }]} />

      <div className="max-w-2xl mx-auto px-6 py-10">

        {fromEstimate && !bannerDismissed && (
          <div className="mb-6 flex items-center gap-3 bg-white/[0.06] border border-white/[0.12] rounded-xl px-4 py-3">
            <span className="text-xs text-white/80 flex-1">Pre-filled from your estimate. You can edit any field before creating.</span>
            <button onClick={() => setBannerDismissed(true)} className="text-white/30 hover:text-white/60 transition-colors text-xs">Dismiss</button>
          </div>
        )}

        {/* Template picker */}
        <div className="mb-8">
          <label className="text-xs text-white/50 mb-3 block">Choose a template</label>
          {(() => {
            const tplBtn = (t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setSelectedTemplate(t.key)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                  selectedTemplate === t.key
                    ? 'border-white bg-white/10'
                    : 'border-white/[0.08] hover:border-white/25 hover:bg-white/[0.04]'
                }`}
              >
                <t.Icon size={16} className={selectedTemplate === t.key ? 'text-white' : 'text-white/50'} />
                <span className="text-[10px] text-white/70 leading-tight">{t.name}</span>
              </button>
            )
            return (
              <div className="space-y-5">
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {TEMPLATES.filter((t) => !t.category).map(tplBtn)}
                </div>
                {CATEGORY_ORDER.map((cat) => {
                  const group = TEMPLATES.filter((t) => t.category === cat)
                  if (group.length === 0) return null
                  return (
                    <div key={cat}>
                      <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2">{cat}</p>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {group.map(tplBtn)}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}
          {template && template.key !== 'blank' && (
            <div className="mt-3 flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3">
              <template.Icon size={16} className="text-white/50 flex-shrink-0" />
              <div>
                <p className="text-xs text-white font-medium">{template.name} template</p>
                <p className="text-[10px] text-white/40">{template.description} will be created automatically</p>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Color picker */}
          <div>
            <label className="text-xs text-white/50 mb-3 block">Project Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={`w-8 h-8 rounded-full transition-all ${
                    form.color === c ? 'ring-2 ring-offset-2 ring-offset-black ring-white scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs text-white/50 mb-2 block">Project Name *</label>
            <input
              autoFocus
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. HSO CCTV Website"
              maxLength={200}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/20"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-white/50 mb-2 block">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="What are you building? Keep it brief."
              maxLength={2000}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/20 resize-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-xs text-white/50 mb-2 block">Status</label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, status: s })}
                  className={`text-xs px-4 py-2 rounded-lg border transition-all capitalize ${
                    form.status === s
                      ? 'bg-white text-black border-white font-semibold'
                      : 'border-white/10 text-white/50 hover:border-white/20'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Client */}
          <div className="glass rounded-xl p-5">
            <p className="text-xs font-semibold text-white/60 mb-4">Client Details (optional)</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/40 mb-2 block">Client Name</label>
                <input
                  value={form.client_name}
                  onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                  placeholder="e.g. Suresh Reddy"
                  className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-white/20"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-2 block">Client Email</label>
                <input
                  type="email"
                  value={form.client_email}
                  onChange={(e) => setForm({ ...form, client_email: e.target.value })}
                  placeholder="client@example.com"
                  className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-white/20"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-white text-black font-semibold text-sm px-6 py-3 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-40"
            >
              {saving ? 'Creating...' : 'Create Project'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/pm/dashboard')}
              className="text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
