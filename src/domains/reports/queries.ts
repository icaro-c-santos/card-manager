import prisma from "@/lib/db";
import { InstallmentStatus } from "@prisma/client";

export interface PersonSpendingSummary {
  personId: string;
  personName: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  installmentsCount: number;
  paidInstallmentsCount: number;
}

export interface MonthlySpendingSummary {
  month: number;
  year: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  byPerson: PersonSpendingSummary[];
}

/**
 * Gets total spending summary for each person (all time)
 */
export async function getTotalSpendingByPerson(): Promise<PersonSpendingSummary[]> {
  const people = await prisma.person.findMany({
    include: {
      purchases: {
        include: {
          installments: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return people.map((person) => {
    let totalAmount = 0;
    let paidAmount = 0;
    let pendingAmount = 0;
    let installmentsCount = 0;
    let paidInstallmentsCount = 0;

    for (const purchase of person.purchases) {
      for (const installment of purchase.installments) {
        const amount = Number(installment.amount);
        totalAmount += amount;
        installmentsCount += 1;

        if (installment.status === InstallmentStatus.PAID) {
          paidAmount += amount;
          paidInstallmentsCount += 1;
        } else {
          pendingAmount += amount;
        }
      }
    }

    return {
      personId: person.id,
      personName: person.name,
      totalAmount: Math.round(totalAmount * 100) / 100,
      paidAmount: Math.round(paidAmount * 100) / 100,
      pendingAmount: Math.round(pendingAmount * 100) / 100,
      installmentsCount,
      paidInstallmentsCount,
    };
  });
}

/**
 * Gets spending summary for a specific month/year (by invoice period)
 */
export async function getMonthlySpending(
  month: number,
  year: number
): Promise<MonthlySpendingSummary> {
  const installments = await prisma.installment.findMany({
    where: {
      invoiceMonth: month,
      invoiceYear: year,
    },
    include: {
      purchase: {
        include: {
          person: true,
        },
      },
    },
  });

  // Group by person
  const byPersonMap = new Map<string, PersonSpendingSummary>();

  let totalAmount = 0;
  let paidAmount = 0;
  let pendingAmount = 0;

  for (const installment of installments) {
    const personId = installment.purchase.personId;
    const personName = installment.purchase.person.name;
    const amount = Number(installment.amount);

    totalAmount += amount;

    if (!byPersonMap.has(personId)) {
      byPersonMap.set(personId, {
        personId,
        personName,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        installmentsCount: 0,
        paidInstallmentsCount: 0,
      });
    }

    const personSummary = byPersonMap.get(personId)!;
    personSummary.totalAmount += amount;
    personSummary.installmentsCount += 1;

    if (installment.status === InstallmentStatus.PAID) {
      paidAmount += amount;
      personSummary.paidAmount += amount;
      personSummary.paidInstallmentsCount += 1;
    } else {
      pendingAmount += amount;
      personSummary.pendingAmount += amount;
    }
  }

  // Round values
  const byPerson = Array.from(byPersonMap.values())
    .map((p) => ({
      ...p,
      totalAmount: Math.round(p.totalAmount * 100) / 100,
      paidAmount: Math.round(p.paidAmount * 100) / 100,
      pendingAmount: Math.round(p.pendingAmount * 100) / 100,
    }))
    .sort((a, b) => a.personName.localeCompare(b.personName));

  return {
    month,
    year,
    totalAmount: Math.round(totalAmount * 100) / 100,
    paidAmount: Math.round(paidAmount * 100) / 100,
    pendingAmount: Math.round(pendingAmount * 100) / 100,
    byPerson,
  };
}

/**
 * Gets dashboard summary data
 */
export async function getDashboardSummary() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Get current month installments
  const currentMonthData = await getMonthlySpending(currentMonth, currentYear);

  // Get total people count
  const peopleCount = await prisma.person.count();

  // Get total purchases count
  const purchasesCount = await prisma.purchase.count();

  // Get pending installments count
  const pendingInstallmentsCount = await prisma.installment.count({
    where: { status: InstallmentStatus.PENDING },
  });

  // Get recent purchases
  const recentPurchases = await prisma.purchase.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      person: true,
    },
  });

  return {
    currentMonth: {
      ...currentMonthData,
    },
    stats: {
      peopleCount,
      purchasesCount,
      pendingInstallmentsCount,
    },
    recentPurchases: recentPurchases.map((p) => ({
      id: p.id,
      personName: p.person.name,
      description: p.description,
      totalAmount: Number(p.totalAmount),
      installmentsCount: p.installmentsCount,
      purchaseDate: p.purchaseDate,
      createdAt: p.createdAt,
    })),
  };
}

