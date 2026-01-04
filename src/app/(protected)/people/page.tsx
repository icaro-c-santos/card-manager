import Link from "next/link";
import { getAllPeople } from "@/domains/people";
import DeletePersonButton from "./DeletePersonButton";

export const dynamic = "force-dynamic";

export default async function PeoplePage() {
  const people = await getAllPeople();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {people.length} {people.length === 1 ? "pessoa cadastrada" : "pessoas cadastradas"}
        </p>
        <Link href="/people/new" className="btn-primary">
          <svg
            className="w-4 h-4 mr-2"
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
          Nova Pessoa
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
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Cadastrado em</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {people.map((person) => (
                <tr key={person.id}>
                  <td className="font-medium text-gray-900">{person.name}</td>
                  <td className="text-gray-500">
                    {new Date(person.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/people/${person.id}/edit`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Editar
                      </Link>
                      <DeletePersonButton id={person.id} name={person.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

