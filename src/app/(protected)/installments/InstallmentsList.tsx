"use client";

import { useState } from "react";
import type { Installment, Purchase, Person } from "@prisma/client";
import PaymentModal from "./PaymentModal";

type InstallmentWithPurchase = Installment & {
  purchase: Purchase & { person: Person };
};

interface InstallmentsListProps {
  installments: InstallmentWithPurchase[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("pt-BR");
}

export default function InstallmentsList({ installments }: InstallmentsListProps) {
  const [selectedInstallment, setSelectedInstallment] =
    useState<InstallmentWithPurchase | null>(null);

  if (installments.length === 0) {
    return (
      <div className="card text-center py-12">
        <svg
          className="w-16 h-16 mx-auto text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhuma parcela neste período
        </h3>
        <p className="text-gray-500">
          Não há parcelas programadas para esta fatura.
        </p>
      </div>
    );
  }

  // Group by person
  const byPerson = installments.reduce((acc, installment) => {
    const personId = installment.purchase.personId;
    if (!acc[personId]) {
      acc[personId] = {
        person: installment.purchase.person,
        installments: [],
      };
    }
    acc[personId].installments.push(installment);
    return acc;
  }, {} as Record<string, { person: Person; installments: InstallmentWithPurchase[] }>);

  return (
    <>
      <div className="space-y-4">
        {Object.values(byPerson).map(({ person, installments: personInstallments }) => {
          const personTotal = personInstallments.reduce(
            (sum, i) => sum + Number(i.amount),
            0
          );
          const personPaid = personInstallments
            .filter((i) => i.status === "PAID")
            .reduce((sum, i) => sum + Number(i.amount), 0);

          return (
            <div key={person.id} className="card p-4 lg:p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                <div>
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900">
                    {person.name}
                  </h3>
                  <p className="text-xs lg:text-sm text-gray-500">
                    {personInstallments.length} parcela
                    {personInstallments.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-base lg:text-lg font-semibold text-gray-900">
                    {formatCurrency(personTotal)}
                  </p>
                  <p className="text-xs lg:text-sm text-gray-500">
                    {formatCurrency(personPaid)} pago
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {personInstallments.map((installment) => (
                  <button
                    key={installment.id}
                    onClick={() => setSelectedInstallment(installment)}
                    className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm lg:text-base truncate">
                          {installment.purchase.description || "Compra sem descrição"}
                        </p>
                        <p className="text-xs lg:text-sm text-gray-500 mt-0.5">
                          Parcela {installment.installmentNumber}/
                          {installment.purchase.installmentsCount} •{" "}
                          {formatDate(installment.purchase.purchaseDate)}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <p className="font-semibold text-gray-900 text-sm lg:text-base">
                          {formatCurrency(Number(installment.amount))}
                        </p>
                        {installment.status === "PAID" ? (
                          <span className="badge-paid text-xs">Paga</span>
                        ) : (
                          <span className="badge-pending text-xs">Pendente</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedInstallment && (
        <PaymentModal
          installment={selectedInstallment}
          onClose={() => setSelectedInstallment(null)}
        />
      )}
    </>
  );
}
