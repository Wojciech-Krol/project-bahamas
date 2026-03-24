import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partner Dashboard | Hakuna",
  description: "Manage your classes, track enrollments, and grow your business with the Hakuna Partner Dashboard.",
};

const stats = [
  { icon: "event_available", label: "Active Classes", value: "24", change: "+12%", changeColor: "text-emerald-500 bg-emerald-50", barColor: "bg-[#553ce2]", progress: "w-1/3" },
  { icon: "groups", label: "Total Enrollments", value: "1,284", change: "+5.4%", changeColor: "text-emerald-500 bg-emerald-50", barColor: "bg-[#4d616c]", progress: "w-1/2" },
  { icon: "payments", label: "Monthly Revenue", value: "$12,450", change: "+8%", changeColor: "text-emerald-500 bg-emerald-50", barColor: "bg-[#ba002e]", progress: "w-3/4" },
  { icon: "star", label: "Average Rating", value: "4.9", change: "Stable", changeColor: "text-slate-400 bg-slate-50", barColor: "bg-[#c7bfff]", progress: "w-[90%]" },
];

const sessions = [
  { icon: "self_improvement", iconBg: "bg-[#553ce2]/5", iconColor: "text-[#553ce2]", name: "Morning Vinyasa", sub: "Advanced Yoga", instructor: "Sarah Chen", time: "08:00 AM", spots: "12/15", spotsColor: "bg-emerald-500", progress: "w-[80%]" },
  { icon: "sports_martial_arts", iconBg: "bg-[#d0e6f3]/30", iconColor: "text-[#4d616c]", name: "Beginner Karate", sub: "Kids Program", instructor: "Mark Thompson", time: "04:30 PM", spots: "15/15", spotsColor: "bg-[#553ce2]", progress: "w-full" },
  { icon: "palette", iconBg: "bg-[#ffdad9]/30", iconColor: "text-[#ba002e]", name: "Abstract Canvas", sub: "Weekend Art", instructor: "Elena Rodriguez", time: "06:00 PM", spots: "6/20", spotsColor: "bg-[#e31c40]", progress: "w-[30%]" },
];

const chartBars = [
  { month: "JAN", height: "h-32", fill: "h-2/3" },
  { month: "FEB", height: "h-48", fill: "h-3/4" },
  { month: "MAR", height: "h-40", fill: "h-1/2" },
  { month: "APR", height: "h-56", fill: "h-[90%]" },
  { month: "MAY", height: "h-44", fill: "h-2/3" },
  { month: "JUN", height: "h-60", fill: "h-full" },
];

const requests = [
  { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBOU3siDBfDjcnumpH5xy3VYJ8miM8difghwXcglY21Xt7LFCXXlAeGUODBwit6uw0YZJGtKlLfQgjTCO9ymdfktBdCe4av8D1JZgzy2ffTLcB0DP62HpV1i_BCqVtP6NTDdnkpb-CH9j4-ohhMSL2GtS6TquLxxPemWoyo0sjig0_cjkUcgYOEAhkkIV5V9A0qjqXTcow8l9WdgTAU3Ufg_2SSImamy7MF8WVJo_9Z1ZDTV-AxJ6C4PucM2MAIV36gxmaibPuD68s", name: "James Wilson", desc: "Wants to join: Advanced MMA", borderColor: "border-[#553ce2]", actions: ["Approve", "Decline"] },
  { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_9I934B53Hk74KKLHgg7mJOQKZQ9ckJYDkRxj1lrCTWfnHl6soDXvTbS3YXVKSde-uw12ZQXtajE-zLlb9G_oAWBJxVZEL1AkSFAshsXqn5RUCSVtxedLbwdfrkKPJJDBQy1rWq_s_fFqnYY_2q7xSLnJZIYXPZue20GCy1rMh-a-HFFadl25rb2HZOLQIs3sCb7VXpAJO6Ce6vbo0F_6mzAkZ1MMJlwUPRSvUDAx7n2gVUN7dauQd6Ez2Ii8joR-TZXYHeezyBE", name: "Sophie Lane", desc: "Waitlist: Toddler Tumbling", borderColor: "border-[#ba002e]", actions: ["Enroll", "Keep Wait"] },
];

export default function PartnerDashboardPage() {
  return (
    <div className="bg-[#f7f9ff] text-[#181c21] font-sans min-h-screen">
      {/* Sidebar */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-slate-50 flex flex-col h-full py-6 px-4 z-50 hidden md:flex">
        <div className="mb-10 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#553ce2] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#553ce2]/20">
              <span className="material-symbols-outlined">school</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#725DFF] tracking-tighter" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Hakuna Partner</h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Management Portal</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {[
            { icon: "analytics", label: "Analytics", active: true },
            { icon: "school", label: "Classes" },
            { icon: "person_add", label: "Enrollments" },
            { icon: "calendar_month", label: "Schedule" },
          ].map(({ icon, label, active }) => (
            <Link key={label} href="#" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 ${active ? "text-[#725DFF] font-bold border-r-4 border-[#725DFF] bg-slate-100" : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"}`}>
              <span className="material-symbols-outlined">{icon}</span>
              <span className="font-medium text-sm tracking-tight" style={{ fontFamily: "var(--font-plus-jakarta)" }}>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-6 border-t border-slate-200 space-y-1">
          {["settings", "help"].map(icon => (
            <Link key={icon} href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 transition-colors duration-200">
              <span className="material-symbols-outlined">{icon}</span>
              <span className="font-medium text-sm tracking-tight capitalize" style={{ fontFamily: "var(--font-plus-jakarta)" }}>{icon === "help" ? "Support" : "Settings"}</span>
            </Link>
          ))}
        </div>
      </aside>

      {/* Top Nav */}
      <header className="fixed top-0 right-0 left-64 h-16 z-40 bg-white/70 backdrop-blur-md flex justify-between items-center px-8 border-b-0 shadow-sm">
        <div className="flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
            <input className="w-full bg-[#f1f4fb] border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#553ce2]/20 placeholder:text-slate-400" placeholder="Search sessions, students..." type="text" />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            {["notifications", "chat_bubble"].map(icon => (
              <button key={icon} className="text-slate-600 hover:text-[#725DFF] transition-opacity opacity-80 hover:opacity-100">
                <span className="material-symbols-outlined">{icon}</span>
              </button>
            ))}
          </div>
          <div className="h-8 w-[1px] bg-slate-200" />
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-[#181c21]" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Alex Rivera</p>
              <p className="text-[10px] text-slate-500">Studio Owner</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#553ce2]/20 border-2 border-[#553ce2]/10 flex items-center justify-center text-[#553ce2] font-bold text-sm">AR</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pl-64 pt-16 min-h-screen">
        <div className="p-8 space-y-8">
          {/* Welcome Header */}
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#181c21]" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Dashboard</h2>
              <p className="text-slate-500">Welcome back, here is what&apos;s happening today.</p>
            </div>
            <button className="bg-[#553ce2] hover:bg-[#6f59fc] text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-all shadow-lg shadow-[#553ce2]/20 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">add</span>
              Create New Class
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(({ icon, label, value, change, changeColor, barColor, progress }) => (
              <div key={label} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-[#553ce2]/10 rounded-lg flex items-center justify-center text-[#553ce2]">
                    <span className="material-symbols-outlined">{icon}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${changeColor}`}>{change}</span>
                </div>
                <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
                <h3 className="text-2xl font-bold text-[#181c21]" style={{ fontFamily: "var(--font-plus-jakarta)" }}>{value}</h3>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-[#553ce2]/20" />
                <div className={`absolute bottom-0 left-0 h-1 ${barColor} transition-all duration-500 group-hover:w-full ${progress}`} />
              </div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Upcoming Sessions Table */}
              <section className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-[#181c21]" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Upcoming Sessions</h3>
                  <button className="text-[#553ce2] text-sm font-bold hover:underline">View Schedule</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-slate-400 text-xs uppercase tracking-widest font-bold">
                        <th className="pb-4 font-medium">Class Name</th>
                        <th className="pb-4 font-medium">Instructor</th>
                        <th className="pb-4 font-medium text-center">Time</th>
                        <th className="pb-4 font-medium text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sessions.map(({ icon, iconBg, iconColor, name, sub, instructor, time, spots, spotsColor, progress }) => (
                        <tr key={name} className="group hover:bg-[#f1f4fb]/50 transition-colors">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}>
                                <span className={`material-symbols-outlined ${iconColor} text-lg`}>{icon}</span>
                              </div>
                              <div>
                                <p className="font-bold text-sm text-[#181c21]">{name}</p>
                                <p className="text-xs text-slate-500">{sub}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-sm text-slate-600 font-medium">{instructor}</td>
                          <td className="py-4 text-center">
                            <span className="bg-[#f1f4fb] text-[#181c21] text-[10px] font-bold px-2 py-1 rounded-full">{time}</span>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex flex-col items-end">
                              <p className="text-sm font-bold text-[#181c21]">{spots} spots</p>
                              <div className="w-20 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                <div className={`${spotsColor} h-full ${progress}`} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Enrollment Trends Chart */}
              <section className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-[#181c21]" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Enrollment Trends</h3>
                    <p className="text-xs text-slate-500 font-medium">Performance over the last 6 months</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-xs rounded-full bg-[#ebeef5] text-[#181c21] font-bold">Month</button>
                    <button className="px-3 py-1 text-xs rounded-full text-slate-400 font-bold hover:bg-[#ebeef5]">Year</button>
                  </div>
                </div>
                <div className="h-64 flex items-end justify-between gap-4 px-4">
                  {chartBars.map(({ month, height, fill }) => (
                    <div key={month} className="flex flex-col items-center gap-3 w-full">
                      <div className={`w-full bg-[#553ce2]/10 rounded-t-lg ${height} group relative`}>
                        <div className={`absolute bottom-0 w-full bg-[#553ce2] rounded-t-lg ${fill} group-hover:opacity-80 transition-opacity`} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{month}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Panel */}
            <div className="space-y-8">
              {/* Pending Requests */}
              <section className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-[#181c21]" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Pending Requests</h3>
                  <span className="w-5 h-5 bg-[#ba002e] text-white rounded-full flex items-center justify-center text-[10px] font-bold">4</span>
                </div>
                <div className="space-y-4">
                  {requests.map(({ img, name, desc, borderColor, actions }) => (
                    <div key={name} className={`p-4 rounded-xl bg-[#f1f4fb] border-l-4 ${borderColor}`}>
                      <div className="flex gap-3 mb-3">
                        <img className="w-10 h-10 rounded-full object-cover" alt={name} src={img} />
                        <div>
                          <p className="text-sm font-bold text-[#181c21]">{name}</p>
                          <p className="text-[10px] text-slate-500">{desc}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 bg-[#553ce2] text-white text-xs font-bold py-2 rounded-lg hover:bg-[#6f59fc] transition-colors">{actions[0]}</button>
                        <button className="flex-1 bg-white text-slate-600 text-xs font-bold py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">{actions[1]}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Activity Feed */}
              <section className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-[#181c21] mb-6" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Recent Activity</h3>
                <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                  {[
                    { color: "bg-emerald-500", text: "Family Pottery class fully booked for Saturday.", badge: "New Booking:", time: "2 hours ago" },
                    { color: "bg-[#553ce2]", text: "$450 processed for Monthly Studio Rental.", badge: "Payment Received:", time: "4 hours ago" },
                    { color: "bg-[#e31c40]", text: "Intermediate Hip Hop (6:00 PM) by Instructor request.", badge: "Class Canceled:", time: "Yesterday" },
                  ].map(({ color, text, badge, time }) => (
                    <div key={time} className="flex gap-4 relative">
                      <div className={`w-4 h-4 rounded-full ${color} ring-4 ring-white z-10 flex-shrink-0`} />
                      <div>
                        <p className="text-sm font-medium text-[#181c21]">
                          <span className="font-bold">{badge}</span> {text}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">{time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 py-3 text-sm font-bold text-slate-500 hover:text-[#553ce2] transition-colors border-t border-slate-50">View All Activity</button>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
