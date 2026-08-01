"use client";

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

const COLORS = ["#1a4d80", "#2563eb", "#f59e0b", "#d97706", "#0f2b4a"];

interface DashboardChartsProps {
  classAverages: Array<{ name: string; average: number }>;
  subjectDistribution: Array<{ name: string; value: number }>;
  trend: Array<{ name: string; average: number }>;
}

export function DashboardCharts({ classAverages, subjectDistribution, trend }: DashboardChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="card lg:col-span-2">
        <h3 className="text-lg font-semibold text-slate-900">Average scores by class</h3>
        <div className="mt-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={classAverages} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="average" fill="#1a4d80" radius={[6, 6, 0, 0]}>
                {classAverages.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-slate-900">Score distribution</h3>
        <div className="mt-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={subjectDistribution} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={80} innerRadius={40} paddingAngle={4}>
                {subjectDistribution.map((entry, index) => (
                  <Cell key={`slice-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card lg:col-span-3">
        <h3 className="text-lg font-semibold text-slate-900">Current term progress</h3>
        <div className="mt-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="average" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
