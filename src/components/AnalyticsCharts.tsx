"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface AnalyticsChartsProps {
  schoolData: Array<{ name: string; average: number }>;
  classData: Array<{ name: string; average: number }>;
  subjectData: Array<{ name: string; value: number }>;
}

const COLORS = ["#1a4d80", "#2563eb", "#f59e0b", "#d97706", "#0f2b4a"];

export function AnalyticsCharts({ schoolData, classData, subjectData }: AnalyticsChartsProps) {
  const [tab, setTab] = useState<"school" | "class" | "subject">("school");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <button type="button" className={`btn-ghost ${tab === "school" ? "bg-primary/10 text-primary" : ""}`} onClick={() => setTab("school")}>School</button>
        <button type="button" className={`btn-ghost ${tab === "class" ? "bg-primary/10 text-primary" : ""}`} onClick={() => setTab("class")}>Class</button>
        <button type="button" className={`btn-ghost ${tab === "subject" ? "bg-primary/10 text-primary" : ""}`} onClick={() => setTab("subject")}>Subject</button>
      </div>

      {tab === "school" && (
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900">School averages</h3>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={schoolData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="average" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === "class" && (
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900">Class average performance</h3>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={classData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="average" stroke="#1a4d80" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === "subject" && (
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900">Subject performance</h3>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={subjectData} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={40} outerRadius={80} paddingAngle={4}>
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
