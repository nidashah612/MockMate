import React, { useState } from 'react';
import { useInterview } from '../context/InterviewContext';
import {
  Target,
  FileText,
  Briefcase,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Building,
  Upload,
  Layers
} from 'lucide-react';

export const TargetProfileManager: React.FC = () => {
  const { targetProfiles, activeProfile, setActiveProfile, addProfile, deleteProfile } = useInterview();
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [roleCategory, setRoleCategory] = useState('Frontend Engineering');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleResumes = [
    {
      label: 'Alex Rivera (Senior Web / Frontend)',
      text: `Alex Rivera | Senior Frontend Developer
Email: alex.candidate@example.com | GitHub: github.com/alexrivera-dev

SUMMARY:
Frontend Engineer with 6 years of experience scaling React/TypeScript web apps. Specialized in performance optimization, design systems, and state management.

EXPERIENCE:
Senior Web Developer @ TechCore (2022 - Present)
- Reduced web dashboard load time by 42% by implementing code-splitting, lazy loading, and dynamic SVG rendering.
- Re-architected data fetching pipeline using React Query, cutting redundant API requests by 65%.
- Led a team of 4 frontend engineers building high-density real-time analytics widgets.

Frontend Software Engineer @ WebMetrics (2019 - 2022)
- Built custom component library used across 12 micro-frontends with 100% WCAG accessibility compliance.
- Resolved memory leaks in WebSocket streaming dashboard during heavy market volatility events.

SKILLS:
React, TypeScript, Next.js, Webpack, Tailwind CSS, Jest, GraphQL, REST APIs, Web Vitals, WebSockets.`
    },
    {
      label: 'Morgan Vance (Fullstack / Backend Lead)',
      text: `Morgan Vance | Staff Fullstack Software Engineer
Email: morgan.v@example.com

SUMMARY:
8+ years building high-throughput distributed backend services, GraphQL APIs, and React frontend portals.

EXPERIENCE:
Lead Backend Engineer @ CloudSync (2021 - Present)
- Architected PostgreSQL & Redis caching strategy handling 12k QPS with sub-20ms latency.
- Migrated legacy monolith into Golang & Node.js microservices, cutting server infrastructure costs by $140k/yr.
- Mentored 8 software engineers and standardized code review SLAs across engineering teams.

Full Stack Developer @ DataStack (2017 - 2021)
- Designed real-time event processing pipelines using Kafka & Express.js server endpoints.`
    }
  ];

  const sampleJDs = [
    {
      label: 'Frontend (Stripe)',
      category: 'Frontend Engineering',
      title: 'Senior Frontend Engineer',
      company: 'Stripe',
      text: `Key Responsibilities:
- Architect and build accessible, ultra-performant Web UI components for financial dashboards.
- Optimize React component rendering pipelines and client state synchronization.
- Lead code reviews, drive system design discussions, and mentor junior engineers.
Requirements:
- 5+ years with React, TypeScript, state management, and Web Vitals optimization.
- Proven experience handling heavy data grids and async API performance bottlenecks.
- Excellent behavioral STAR communication and system architecture design skills.`
    },
    {
      label: 'Product Manager (Meta)',
      category: 'Product Management',
      title: 'Senior Product Manager - Engagement',
      company: 'Meta',
      text: `Responsibilities:
- Define product vision, 3-year roadmap, and success metrics for core social engagement surfaces.
- Analyze user funnel drop-offs using SQL and A/B test experiments; balance retention vs growth trade-offs.
- Collaborate closely with engineering leads, product designers, and cross-functional exec stakeholders.
Requirements:
- 4+ years of Product Management experience driving consumer or enterprise web products.
- Mastery of product execution, metrics breakdown, prioritization frameworks (RICE), and strategic tradeoffs.
- Strong behavioral leadership stories managing cross-functional conflicts.`
    },
    {
      label: 'AI & Data Science (OpenAI)',
      category: 'AI & Data Science',
      title: 'Senior Machine Learning Engineer',
      company: 'OpenAI',
      text: `Responsibilities:
- Train, evaluate, and fine-tune large language models and multi-modal neural networks.
- Build resilient high-throughput data processing pipelines for model pre-training and reinforcement learning.
- Optimize inference latency, batch quantization, and GPU memory utilization for production APIs.
Requirements:
- Strong foundations in Python, PyTorch/TensorFlow, Transformers, CUDA, and distributed training.
- Deep understanding of model evaluation metrics, hallucinations mitigation, and prompt engineering.`
    },
    {
      label: 'Backend & Systems (AWS)',
      category: 'Backend & Distributed Systems',
      title: 'Senior Distributed Systems Engineer',
      company: 'Amazon Web Services',
      text: `Responsibilities:
- Design, implement, and operate multi-region microservices handling 50k+ QPS with 99.999% availability.
- Solve concurrency, consensus algorithms (Raft/Paxos), distributed locking, and cache invalidation challenges.
- Lead operational excellence, post-mortems, and capacity planning for cloud infrastructure.
Requirements:
- 5+ years building backend microservices in Java, Go, Rust, or C++.
- Proven experience with SQL/NoSQL distributed databases, Kafka messaging queues, and gRPC.`
    },
    {
      label: 'Cybersecurity (Cloudflare)',
      category: 'Cybersecurity & SecOps',
      title: 'Security Operations & Response Engineer',
      company: 'Cloudflare',
      text: `Responsibilities:
- Threat hunting, vulnerability mitigation, zero-trust architecture enforcement, and incident response.
- Perform penetration testing, security code reviews, and automate SIEM security alert parsing.
Requirements:
- Knowledge of OWASP Top 10, TLS cryptography, IAM policies, networking protocols (TCP/IP, BGP, DNS).
- Hands-on experience with threat detection tools and secure software development lifecycle (SSDLC).`
    }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setResumeText(text || '');
      };
      reader.readAsText(file);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !jobDescription || !resumeText) {
      setError('Please fill out Title, Job Description, and Resume');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await addProfile({
        title,
        company,
        roleCategory,
        jobDescription,
        resumeText
      });
      setShowAddForm(false);
      setTitle('');
      setCompany('');
      setJobDescription('');
      setResumeText('');
    } catch (err: any) {
      setError(err.message || 'Failed to create target profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-slate-800 font-semibold text-xs uppercase tracking-wider mb-1">
            <Target className="w-4 h-4 text-slate-700" />
            <span>Target Role & Resume Alignment</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Target Roles</h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Upload or paste target Job Descriptions alongside your Resume. MockMate’s Gemini engine analyzes skill overlaps, flags potential gaps, and tailors adaptive interview questions to your exact target position.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Cancel' : 'Add Target Role'}</span>
        </button>
      </div>

      {/* Add New Target Role Form */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="bg-white border border-slate-300 rounded-2xl p-6 shadow-md space-y-6 animate-slideDown">
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-4">
            <Sparkles className="w-5 h-5 text-slate-800" />
            <h2 className="text-base font-bold text-slate-900">Create New Target Role Profile</h2>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Role Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer @ Stripe"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Stripe, Meta, Netflix"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Role Domain / Field *</label>
                <span className="text-[10px] text-slate-500 font-normal">Type custom or pick suggestion</span>
              </div>
              <input
                type="text"
                list="role-domain-suggestions"
                value={roleCategory}
                onChange={(e) => setRoleCategory(e.target.value)}
                placeholder="e.g. AI Engineering, Healthcare Data, Sales Ops..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 font-medium"
              />
              <datalist id="role-domain-suggestions">
                <option value="Frontend Engineering" />
                <option value="Backend & Distributed Systems" />
                <option value="Fullstack Engineering" />
                <option value="AI & Machine Learning / Data Science" />
                <option value="Product Management" />
                <option value="System Architecture & Cloud" />
                <option value="DevOps & Infrastructure / SRE" />
                <option value="Cybersecurity & SecOps" />
                <option value="UX / UI & Product Design" />
                <option value="QA & Test Automation" />
                <option value="Data Engineering & Analytics" />
                <option value="Mobile Engineering (iOS / Android)" />
                <option value="Embedded Systems & Hardware" />
                <option value="Finance, Accounting & Fintech" />
                <option value="Business Operations & Strategy" />
                <option value="Healthcare, Biotech & Medical" />
                <option value="Executive Leadership & Management" />
                <option value="Marketing & Growth" />
                <option value="Sales Engineering & Account Management" />
                <option value="Legal, Risk & Compliance" />
                <option value="Human Resources & Talent Acquisition" />
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Job Description Paste */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Paste Job Description (JD) *
                </label>
              </div>
              <textarea
                required
                rows={8}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description requirements, technical stack expectations, and key responsibilities..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 font-mono"
              />

              {/* Sample JDs Quick Load */}
              <div className="mt-2 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">Quick load template JD:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {sampleJDs.map((sample, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => {
                        setJobDescription(sample.text);
                        setTitle(sample.title);
                        setCompany(sample.company);
                        setRoleCategory(sample.category);
                      }}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 text-[10px] transition-colors font-medium"
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Resume Upload / Paste */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Paste or Upload Resume *
                </label>
                <label className="cursor-pointer text-[11px] text-slate-800 hover:text-slate-900 font-semibold flex items-center space-x-1">
                  <Upload className="w-3 h-3" />
                  <span>Upload .txt/.md</span>
                  <input type="file" accept=".txt,.md,.pdf,.doc" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <textarea
                required
                rows={7}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume content or click Upload..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 font-mono"
              />

              {/* Sample Resume Quick Load */}
              <div className="mt-2 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">Quick preset resume:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {sampleResumes.map((sample, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setResumeText(sample.text)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 text-[10px] transition-colors font-medium"
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Analyzing with Gemini AI...' : 'Analyze & Save Role'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Target Roles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {targetProfiles.map((tp) => {
          const isActive = activeProfile?.id === tp.id;
          return (
            <div
              key={tp.id}
              className={`bg-white border rounded-2xl p-6 transition-all shadow-xs relative flex flex-col justify-between ${
                isActive
                  ? 'border-slate-800 ring-2 ring-slate-800/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-800 border border-slate-200 uppercase">
                        {tp.roleCategory}
                      </span>
                      {isActive && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Active Role</span>
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-base text-slate-900">{tp.title}</h3>
                    <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                      <Building className="w-3.5 h-3.5" />
                      <span>{tp.company}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteProfile(tp.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Role"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Parsed AI Insights Summary */}
                {tp.parsedSummary && (
                  <div className="mt-4 space-y-3 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider mb-1 flex items-center space-x-1">
                        <Zap className="w-3 h-3 text-slate-800" />
                        <span>Key Requirements</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {tp.parsedSummary.keyRequirements.slice(0, 3).map((req, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium">
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>

                    {tp.parsedSummary.potentialGaps?.length > 0 && (
                      <div>
                        <div className="font-bold text-amber-700 text-[11px] uppercase tracking-wider mb-1 flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Target Experience Gaps</span>
                        </div>
                        <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5">
                          {tp.parsedSummary.potentialGaps.map((gap, i) => (
                            <li key={i}>{gap}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setActiveProfile(tp)}
                  className={`w-full py-2 text-xs font-semibold rounded-xl transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white cursor-default border border-slate-900'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                  }`}
                >
                  {isActive ? 'Active Target Role' : 'Set as Active Target Role'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
