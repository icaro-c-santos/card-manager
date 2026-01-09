import Link from "next/link";
import { getAllPurchases } from "@/domains/purchases";
import DeletePurchaseButton from "./DeletePurchaseButton";

export const dynamic = "force-dynamic";

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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {purchases.length} {purchases.length === 1 ? "compra" : "compras"}
        </p>
        <Link href="/purchases/new" className="btn-primary text-sm py-2 px-3">
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
        <div className="space-y-2">
          {purchases.map((purchase) => {
            const paidCount = purchase.installments.filter(
              (i) => i.status === "PAID"
            ).length;
            const totalCount = purchase.installments.length;
            const allPaid = paidCount === totalCount;

            return (
              <Link
                key={purchase.id}
                href={`/purchases/${purchase.id}`}
                className="card p-4 block hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">
                      {purchase.description || "Compra sem descrição"}
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {purchase.person.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(purchase.purchaseDate)} • {paidCount}/{totalCount} pagas
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(Number(purchase.totalAmount))}
                    </p>
                    <span className={`text-xs ${allPaid ? "badge-paid" : "badge-pending"}`}>
                      {allPaid ? "Pago" : "Pendente"}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <DeletePurchaseButton
                    id={purchase.id}
                    description={purchase.description || `Compra de ${formatCurrency(Number(purchase.totalAmount))}`}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
