"use client";

import { useRouter } from "next/navigation";
import { getMonthName } from "@/lib/credit-card";

interface MonthSelectorProps {
  currentMonth: number;
  currentYear: number;
  availablePeriods: Array<{ month: number; year: number }>;
}

export default function MonthSelector({
  currentMonth,
  currentYear,
  availablePeriods,
}: MonthSelectorProps) {
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const [month, year] = e.target.value.split("-");
    router.push(`/installments?month=${month}&year=${year}`);
  }

  // Generate list of months (current + available)
  const now = new Date();
  const currentPeriodValue = `${currentMonth}-${currentYear}`;

  // Create a set of unique periods
  const periodsSet = new Set<string>();

  // Add current viewing period
  periodsSet.add(currentPeriodValue);

  // Add all available periods from DB
  availablePeriods.forEach((p) => {
    periodsSet.add(`${p.month}-${p.year}`);
  });

  // Add next 3 months from today
  for (let i = 0; i < 3; i++) {
    const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    periodsSet.add(`${futureDate.getMonth() + 1}-${futureDate.getFullYear()}`);
  }

  // Convert to sorted array
  const periods = Array.from(periodsSet)
    .map((p) => {
      const [month, year] = p.split("-").map(Number);
      return { month, year, value: p };
    })
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });

  return (
    <select
      value={currentPeriodValue}
      onChange={handleChange}
      className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
    >
      {periods.map((period) => (
        <option key={period.value} value={period.value}>
          {getMonthName(period.month)} / {period.year}
        </option>
      ))}
    </select>
  );
}

