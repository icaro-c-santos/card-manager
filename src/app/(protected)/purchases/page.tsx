import Link from "next/link";
import { getAllPurchases } from "@/domains/purchases";
import DeletePurchaseButton from "./DeletePurchaseButton";

export default async function PurchasesPage() {
  const purchases = await getAllPurchases();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-600">Gerencie as compras parceladas</p>
        <Link href="/purchases/new" className="btn-primary">
          Nova Compra
        </Link>
      </div>

      {purchases.length === 0 ? (
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
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Nenhuma compra cadastrada
          </h3>
          <p className="mt-2 text-gray-500">
            Comece adicionando uma nova compra.
          </p>
          <Link
            href="/purchases/new"
            className="btn-primary inline-flex mt-4"
          >
            Nova Compra
          </Link>
        </div>
      ) : (
        <div className="card p-0">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Pessoa</th>
                  <th>Descrição</th>
                  <th className="text-right">Valor Total</th>
                  <th className="text-center">Parcelas</th>
                  <th className="text-center">Status</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => {
                  const paidCount = purchase.installments.filter(
                    (i) => i.status === "PAID"
                  ).length;
                  const totalCount = purchase.installments.length;
                  const allPaid = paidCount === totalCount;

                  return (
                    <tr key={purchase.id}>
                      <td className="whitespace-nowrap">
                        {formatDate(purchase.purchaseDate)}
                      </td>
                      <td className="font-medium">{purchase.person.name}</td>
                      <td className="max-w-xs truncate">
                        {purchase.description || "-"}
                      </td>
                      <td className="text-right whitespace-nowrap">
                        {formatCurrency(Number(purchase.totalAmount))}
                      </td>
                      <td className="text-center">
                        {paidCount}/{totalCount}
                      </td>
                      <td className="text-center">
                        <span
                          className={allPaid ? "badge-paid" : "badge-pending"}
                        >
                          {allPaid ? "Pago" : "Pendente"}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/purchases/${purchase.id}`}
                            className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                          >
                            Ver
                          </Link>
                          <DeletePurchaseButton id={purchase.id} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

