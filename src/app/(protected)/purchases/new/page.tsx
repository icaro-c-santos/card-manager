import { getAllPeople } from "@/domains/people";
import NewPurchaseForm from "./NewPurchaseForm";

export const dynamic = "force-dynamic";

export default async function NewPurchasePage() {
  const people = await getAllPeople();

  if (people.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Nenhuma pessoa cadastrada
          </h3>
          <p className="mt-2 text-gray-500">
            Cadastre uma pessoa antes de adicionar compras.
          </p>
          <a href="/people/new" className="btn-primary inline-flex mt-4">
            Cadastrar Pessoa
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Nova Compra
        </h2>
        <NewPurchaseForm people={people} />
      </div>
    </div>
  );
}

