import { Search, ArrowDownUp } from 'lucide-react';
import Select from './Select.jsx';
import { PRIORITIES } from '../utils.js';

const priorityOptions = [
  { value: 'all', label: 'All priorities' },
  ...PRIORITIES.map((p) => ({ value: p.value, label: `${p.label} priority` })),
];

const sortOptions = [
  { value: 'created', label: 'Sort: Newest first' },
  { value: 'due-asc', label: 'Sort: Due date (soonest)' },
  { value: 'due-desc', label: 'Sort: Due date (latest)' },
];

export default function FilterBar({
  search,
  onSearch,
  priority,
  onPriority,
  sort,
  onSort,
}) {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted dark:text-muted-dark"
        />
        <input
          className="input pl-9"
          placeholder="Search tasks…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <Select
        className="sm:w-44"
        value={priority}
        onChange={onPriority}
        options={priorityOptions}
        aria-label="Filter by priority"
      />

      <Select
        className="sm:w-52"
        value={sort}
        onChange={onSort}
        options={sortOptions}
        icon={ArrowDownUp}
        aria-label="Sort tasks"
      />
    </div>
  );
}
