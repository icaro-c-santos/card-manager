import Link from "next/link";
import { getAllPeople } from "@/domains/people";
import DeletePersonButton from "./DeletePersonButton";

export const dynamic = "force-dynamic";

export default async function PeoplePage() {
  const people = await getAllPeople();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {people.length} {people.length === 1 ? "pessoa" : "pessoas"}
        </p>
        <Link href="/people/new" className="btn-primary text-sm py-2 px-3">
          <svg
            className="w-4 h-4 mr-1.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Nova
        </Link>
      </div>

      {people.length === 0 ? (
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma pessoa cadastrada
          </h3>
          <p className="text-gray-500 mb-4">
            Comece adicionando as pessoas que fazem compras no cartão.
          </p>
          <Link href="/people/new" className="btn-primary">
            Adicionar Primeira Pessoa
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {people.map((person) => (
            <div
              key={person.id}
              className="card p-4 flex items-center justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 truncate">
                  {person.name}
                </p>
                <p className="text-xs text-gray-500">
                  Desde {new Date(person.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <Link
                  href={`/people/${person.id}/edit`}
                  className="p-2 text-primary-600 hover:bg-primary-50 active:bg-primary-100 rounded-lg transition-colors"
                  title="Editar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Link>
                <DeletePersonButton id={person.id} name={person.name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
