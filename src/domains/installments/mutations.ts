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

