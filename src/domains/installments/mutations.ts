import prisma from "@/lib/db";
import { InstallmentStatus } from "@prisma/client";

export async function markInstallmentAsPaid(
  id: string,
  paymentReceiptPath?: string
) {
  return prisma.installment.update({
    where: { id },
    data: {
      status: InstallmentStatus.PAID,
      paidAt: new Date(),
      paymentReceipt: paymentReceiptPath || null,
    },
    include: {
      purchase: {
        include: {
          person: true,
        },
      },
    },
  });
}

export async function markInstallmentAsPending(id: string) {
  return prisma.installment.update({
    where: { id },
    data: {
      status: InstallmentStatus.PENDING,
      paidAt: null,
      paymentReceipt: null,
    },
    include: {
      purchase: {
        include: {
          person: true,
        },
      },
    },
  });
}

export async function updatePaymentReceipt(id: string, paymentReceiptPath: string) {
  return prisma.installment.update({
    where: { id },
    data: {
      paymentReceipt: paymentReceiptPath,
    },
  });
}

export async function removePaymentReceipt(id: string) {
  return prisma.installment.update({
    where: { id },
    data: {
      paymentReceipt: null,
    },
  });
}

export async function markInstallmentsForPersonPeriodAsPaid(
  personId: string,
  month: number,
  year: number,
  paymentReceiptPath?: string
) {
  const installments = await prisma.installment.findMany({
    where: {
      invoiceMonth: month,
      invoiceYear: year,
      purchase: {
        personId,
      },
      status: {
        not: InstallmentStatus.PAID,
      },
    },
    select: { id: true },
  });

  if (installments.length === 0) {
    return { updated: 0 };
  }

  const now = new Date();
  await prisma.$transaction(
    installments.map(({ id }) =>
      prisma.installment.update({
        where: { id },
        data: {
          status: InstallmentStatus.PAID,
          paidAt: now,
          paymentReceipt: paymentReceiptPath ?? null,
        },
      })
    )
  );

  return { updated: installments.length };
}

