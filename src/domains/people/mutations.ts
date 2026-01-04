import prisma from "@/lib/db";
import type { Person } from "@prisma/client";

export async function createPerson(name: string): Promise<Person> {
  return prisma.person.create({
    data: { name },
  });
}

export async function updatePerson(id: string, name: string): Promise<Person> {
  return prisma.person.update({
    where: { id },
    data: { name },
  });
}

export async function deletePerson(id: string): Promise<void> {
  await prisma.person.delete({
    where: { id },
  });
}

