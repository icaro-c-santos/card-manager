import prisma from "@/lib/db";
import { InstallmentStatus } from "@prisma/client";

export async function getInstallmentsByMonth(month: number, year: number) {
  return prisma.installment.findMany({
    where: {
      invoiceMonth: month,
      invoiceYear: year,
    },
    orderBy: [
      { purchase: { person: { name: "asc" } } },
      { purchase: { purchaseDate: "desc" } },
      { installmentNumber: "asc" },
    ],
    include: {
      purchase: {
        include: {
          person: true,
        },
      },
    },
  });
}

export async function getInstallmentById(id: string) {
  return prisma.installment.findUnique({
    where: { id },
    include: {
      purchase: {
        include: {
          person: true,
        },
      },
    },
  });
}

export async function getPendingInstallments() {
  return prisma.installment.findMany({
    where: {
      status: InstallmentStatus.PENDING,
    },
    orderBy: [
      { invoiceYear: "asc" },
      { invoiceMonth: "asc" },
      { purchase: { person: { name: "asc" } } },
    ],
    include: {
      purchase: {
        include: {
          person: true,
        },
      },
    },
  });
}

export async function getInstallmentsByPerson(personId: string) {
  return prisma.installment.findMany({
    where: {
      purchase: {
        personId,
      },
    },
    orderBy: [
      { invoiceYear: "desc" },
      { invoiceMonth: "desc" },
      { installmentNumber: "asc" },
    ],
    include: {
      purchase: true,
    },
  });
}

export async function getAvailableInvoicePeriods() {
  const result = await prisma.installment.findMany({
    select: {
      invoiceMonth: true,
      invoiceYear: true,
    },
    distinct: ["invoiceMonth", "invoiceYear"],
    orderBy: [
      { invoiceYear: "desc" },
      { invoiceMonth: "desc" },
    ],
  });

  return result.map((r) => ({
    month: r.invoiceMonth,
    year: r.invoiceYear,
  }));
}

