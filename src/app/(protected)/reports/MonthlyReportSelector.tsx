"use client";

import { useState, useEffect } from "react";
import { getMonthName } from "@/lib/credit-card";

interface MonthlyData {
  month: number;
  year: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  byPerson: Array<{
    personId: string;
    personName: string;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
  }>;
}

export default function MonthlyReportSelector() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return now.getMonth() + 1;
  });
  const [selectedYear, setSelectedYear] = useState(() => {
    return new Date().getFullYear();
  });
  const [data, setData] = useState<MonthlyData | null>(null);
  const [loading, setLoading] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/reports/monthly?month=${selectedMonth}&year=${selectedYear}`
        );
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Error fetching monthly report:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedMonth, selectedYear]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Relatório por Mês
        </h2>

        <div className="flex gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {getMonthName(m)}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <svg
            className="animate-spin h-8 w-8 text-primary-600"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>
      ) : data && data.byPerson.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-xl font-bold">{formatCurrency(data.totalAmount)}</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4">
              <p className="text-sm text-emerald-600">Pago</p>
              <p className="text-xl font-bold text-emerald-700">
                {formatCurrency(data.paidAmount)}
              </p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <p className="text-sm text-amber-600">Pendente</p>
              <p className="text-xl font-bold text-amber-700">
                {formatCurrency(data.pendingAmount)}
              </p>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Pessoa</th>
                  <th className="text-right">Total</th>
                  <th className="text-right">Pago</th>
                  <th className="text-right">Pendente</th>
                </tr>
              </thead>
              <tbody>
                {data.byPerson.map((person) => (
                  <tr key={person.personId}>
                    <td className="font-medium">{person.personName}</td>
                    <td className="text-right">{formatCurrency(person.totalAmount)}</td>
                    <td className="text-right text-emerald-600">
                      {formatCurrency(person.paidAmount)}
                    </td>
                    <td className="text-right text-amber-600">
                      {formatCurrency(person.pendingAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="text-gray-500 text-center py-8">
          Nenhuma parcela neste período
        </p>
      )}
    </div>
  );
}

