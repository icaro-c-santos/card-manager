import prisma from "@/lib/db";
import type { Person } from "@prisma/client";

export async function getAllPeople(): Promise<Person[]> {
  return prisma.person.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getPersonById(id: string): Promise<Person | null> {
  return prisma.person.findUnique({
    where: { id },
  });
}

export async function getPersonWithPurchases(id: string) {
  return prisma.person.findUnique({
    where: { id },
    include: {
      purchases: {
        orderBy: { purchaseDate: "desc" },
        include: {
          installments: {
            orderBy: { installmentNumber: "asc" },
          },
        },
      },
    },
  });
}

