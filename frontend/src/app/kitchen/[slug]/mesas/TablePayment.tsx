import { useState } from "react";
import { ArrowLeftRight, Banknote, CreditCard, type LucideIcon } from "lucide-react";
import { Order, PaymentMethod } from "../../../../models/order";
import { OrderServices } from "../../../../services/OrderServices";
import { Table } from "../../../../models/table";

interface TablePaymentProps {
  table: Table;
  tableNumber: number;
  setIsLoading: (isLoading: boolean) => void;
}

// Payment section for a table that already has a created OPEN order.
const TablePayment = ({ table, setIsLoading }: TablePaymentProps) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);

  async function handleProcessPayment() {
    const order = table.order;
    if (!order || order.orderDetail.length === 0) return;

    const finalOrder = new Order(table.id, table.restaurantId);
    finalOrder.totalPrice = order.totalPrice;
    finalOrder.guests = order.guests;
    finalOrder.tip = order.tip;
    finalOrder.paymentMethod = paymentMethod;
    finalOrder.orderDetail = order.orderDetail;
    finalOrder.comment = order.comment;

    setIsLoading(true);
    try {
      await OrderServices.createOrder(finalOrder);
    } catch (error) {
      console.error("Error processing payment:", error);
    } finally {
      setIsLoading(false);
    }
    // The backend clears the table's open order and broadcasts OrderClosed;
    // the global state drops it, so this block disappears on its own.
  }

  return (
    <div className="space-y-2 border-t border-line bg-canvas p-2">
      <div className="grid grid-cols-3 gap-2">
        <PaymentButton
          active={paymentMethod === PaymentMethod.CASH}
          onClick={() => setPaymentMethod(PaymentMethod.CASH)}
          icon={Banknote}
          label="Efectivo"
        />
        <PaymentButton
          active={paymentMethod === PaymentMethod.BANK_TRANS}
          onClick={() => setPaymentMethod(PaymentMethod.BANK_TRANS)}
          icon={ArrowLeftRight}
          label="Transferencia"
        />
        <PaymentButton
          active={paymentMethod === PaymentMethod.CARD}
          onClick={() => setPaymentMethod(PaymentMethod.CARD)}
          icon={CreditCard}
          label="Tarjeta"
        />
      </div>

      <button
        onClick={handleProcessPayment}
        className="cursor-pointer w-full bg-brand-600 hover:bg-brand-700 h-10 rounded-xl text-white font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/30"
      >
        Procesar pago
      </button>
    </div>
  );
};

interface PaymentButtonProps {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
}

const PaymentButton = ({ active, onClick, icon: Icon, label }: PaymentButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/30 ${
      active
        ? "border-brand-600 bg-brand-600 text-white"
        : "border-line bg-surface text-muted hover:bg-canvas-deep hover:text-ink"
    }`}
  >
    <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
    <p className="text-xs font-medium">{label}</p>
  </button>
);

export default TablePayment;
