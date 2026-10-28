import { Users, Wallet } from "lucide-react";
import { Table } from "../models/table";

interface TableCardProps {
  table: Table;
  number: number;
  setSelectedTable: (table: Table) => void;
  selectedTable: Table;
}

const TableCards = ({ table, number, setSelectedTable, selectedTable }: TableCardProps) => {
  const guests = table.order?.guests || 0;
  const productsTotal = table.order?.orderDetail?.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0) || 0;
  const tip = table.order?.tip || 0;
  const totalPrice = productsTotal + tip;
  const isSelected = selectedTable.id === table.id;
  const isActive = Boolean(table.order && table.order.orderDetail.length > 0);

  return (
    <div
      onClick={() => setSelectedTable(table)}
      className={`rounded-2xl w-68 flex flex-col cursor-pointer bg-night-raised border border-night-line transition-colors hover:border-night-line-strong ${
        isSelected ? "outline-4 outline-brand-600" : ""
      }`}
    >
      <div className="flex flex-row items-center justify-between relative px-4 pt-4 pb-1">
        <h3 className="text-white font-semibold">{`Mesa ${number}`}</h3>
        {!isActive ? (
          <span className="flex items-center gap-1.5 rounded-full border border-red/20 bg-red/10 px-2 py-0.5 text-[11px] font-medium text-red">
            <span className="size-1.5 rounded-full bg-red" aria-hidden="true" />
            Inactiva
          </span>
        ) : (
          <span className="flex items-center gap-1.5 rounded-full border border-green/20 bg-green/10 px-2 py-0.5 text-[11px] font-medium text-green">
            <span className="size-1.5 rounded-full bg-green" aria-hidden="true" />
            Activa
          </span>
        )}
      </div>
      <div className="flex flex-row items-center">
        <span className="m-3 rounded-lg bg-brand-500/10 p-2 text-brand-500">
          <Users className="size-5" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div className="flex flex-col">
          <p className="text-xs text-white/60">Personas</p>
          <p className="text-white">{`${guests} Comensales`}</p>
        </div>
      </div>
      <div className="flex flex-row items-center">
        <span className="m-3 rounded-lg bg-brand-500/10 p-2 text-brand-500">
          <Wallet className="size-5" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div className="flex flex-col">
          <p className="text-xs text-white/60">Cuenta total</p>
          <p className="text-white">{`$${totalPrice}`}</p>
        </div>
      </div>
    </div>
  );
};

export default TableCards;
