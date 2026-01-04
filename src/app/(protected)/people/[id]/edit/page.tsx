import { notFound } from "next/navigation";
import { getPersonById } from "@/domains/people";
import EditPersonForm from "./EditPersonForm";

export const dynamic = "force-dynamic";

interface EditPersonPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPersonPage({ params }: EditPersonPageProps) {
  const { id } = await params;
  const person = await getPersonById(id);

  if (!person) {
    notFound();
  }

  return (
    <div className="max-w-lg">
      <EditPersonForm person={person} />
    </div>
  );
}

