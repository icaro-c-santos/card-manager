import prisma from "@/lib/db";

export async function getAllPurchases() {
  return prisma.purchase.findMany({
    orderBy: { purchaseDate: "desc" },
    include: {
      person: true,
      installments: {
        orderBy: { installmentNumber: "asc" },
      },
    },
  });
}

export async function getPurchaseById(id: string) {
  return prisma.purchase.findUnique({
    where: { id },
    include: {
      person: true,
      installments: {
        orderBy: { installmentNumber: "asc" },
      },
    },
  });
}

export async function getPurchasesByPerson(personId: string) {
  return prisma.purchase.findMany({
    where: { personId },
    orderBy: { purchaseDate: "desc" },
    include: {
      installments: {
        orderBy: { installmentNumber: "asc" },
      },
    },
  });
}

export async function getRecentPurchases(limit: number = 10) {
  return prisma.purchase.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      person: true,
      installments: {
        orderBy: { installmentNumber: "asc" },
      },
    },
  });
}

