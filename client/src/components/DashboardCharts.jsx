import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useTheme } from '../context/ThemeContext.jsx';

const STATUS_COLORS = {
  todo: '#B45309',
  'in-progress': '#FF9F0A',
  done: '#34C759',
};
const STATUS_LABELS = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
};
const PRIORITY_COLORS = {
  low: '#34C759',
  medium: '#FF9F0A',
  high: '#FF3B30',
};

export default function DashboardCharts({ tasks }) {
  const { theme } = useTheme();
  const axisColor = theme === 'dark' ? '#98989D' : '#6E6E73';
  const gridColor = theme === 'dark' ? '#1C1C1E' : '#FFFFFF';

  const statusData = ['todo', 'in-progress', 'done'].map((s) => ({
    name: STATUS_LABELS[s],
    key: s,
    value: tasks.filter((t) => t.status === s).length,
  }));

  const priorityData = ['low', 'medium', 'high'].map((p) => ({
    name: p.charAt(0).toUpperCase() + p.slice(1),
    key: p,
    value: tasks.filter((t) => t.priority === p).length,
  }));

  const hasData = tasks.length > 0;

  const tooltipStyle = {
    backgroundColor: theme === 'dark' ? '#1C1C1E' : '#FFFFFF',
    border: 'none',
    borderRadius: 12,
    boxShadow: '0 2px 20px rgba(0,0,0,0.12)',
    color: theme === 'dark' ? '#F5F5F7' : '#1D1D1F',
    fontSize: 13,
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="card p-6">
        <h3 className="mb-1 text-[15px] font-semibold text-ink dark:text-ink-dark">
          Tasks by status
        </h3>
        <p className="mb-4 text-[13px] text-muted dark:text-muted-dark">
          {tasks.length} total across all boards
        </p>
        {hasData ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                stroke={gridColor}
                strokeWidth={3}
              >
                {statusData.map((entry) => (
                  <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: 13, color: axisColor }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart />
        )}
      </div>

      <div className="card p-6">
        <h3 className="mb-1 text-[15px] font-semibold text-ink dark:text-ink-dark">
          Tasks by priority
        </h3>
        <p className="mb-4 text-[13px] text-muted dark:text-muted-dark">
          Distribution of urgency
        </p>
        {hasData ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={priorityData} barSize={44}>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: axisColor, fontSize: 13 }}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: axisColor, fontSize: 12 }}
                width={28}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                cursor={{ fill: 'rgba(0,0,0,0.04)' }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {priorityData.map((entry) => (
                  <Cell key={entry.key} fill={PRIORITY_COLORS[entry.key]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart />
        )}
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[220px] items-center justify-center text-sm text-muted dark:text-muted-dark">
      No tasks yet — create one to see analytics.
    </div>
  );
}
