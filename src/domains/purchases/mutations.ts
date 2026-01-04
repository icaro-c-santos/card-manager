import prisma from "@/lib/db";
import { generateInstallments } from "@/lib/credit-card";
import { Decimal } from "@prisma/client/runtime/library";

export interface CreatePurchaseInput {
  personId: string;
  purchaseDate: Date;
  description?: string;
  totalAmount: number;
  installmentsCount: number;
}

export async function createPurchase(input: CreatePurchaseInput) {
  const { personId, purchaseDate, description, totalAmount, installmentsCount } = input;

  // Generate installment data
  const installmentsData = generateInstallments(purchaseDate, totalAmount, installmentsCount);

  // Create purchase with installments in a transaction
  return prisma.purchase.create({
    data: {
      personId,
      purchaseDate,
      description: description || null,
      totalAmount: new Decimal(totalAmount),
      installmentsCount,
      installments: {
        create: installmentsData.map((inst) => ({
          installmentNumber: inst.installmentNumber,
          amount: new Decimal(inst.amount),
          invoiceMonth: inst.invoiceMonth,
          invoiceYear: inst.invoiceYear,
          status: "PENDING",
        })),
      },
    },
    include: {
      person: true,
      installments: {
        orderBy: { installmentNumber: "asc" },
      },
    },
  });
}

export async function deletePurchase(id: string): Promise<void> {
  await prisma.purchase.delete({
    where: { id },
  });
}

