import { useState } from "react";
import { Order, PaymentMethod } from "../../../../models/order";
import { OrderServices } from "../../../../services/OrderServices";
import { Table } from "../../../../models/table";

interface TablePaymentProps {
  table: Table;
  tableNumber: number;
  setIsLoading: (isLoading: boolean) => void;
}

// Payment section for a table that already has a created OPEN order.
const TablePayment = ({ table, tableNumber, setIsLoading }: TablePaymentProps) => {
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
    <div className="bg-black p-3 space-y-2">

      <div className="grid grid-cols-3 gap-2">
        <PaymentButton
          active={paymentMethod === PaymentMethod.CASH}
          onClick={() => setPaymentMethod(PaymentMethod.CASH)}
          icon="/dollar_icon.png"
          label="Efectivo"
        />
        <PaymentButton
          active={paymentMethod === PaymentMethod.BANK_TRANS}
          onClick={() => setPaymentMethod(PaymentMethod.BANK_TRANS)}
          icon="/currency_icon.png"
          label="Transferencia"
        />
        <PaymentButton
          active={paymentMethod === PaymentMethod.CARD}
          onClick={() => setPaymentMethod(PaymentMethod.CARD)}
          icon="/credit_card.png"
          label="Tarjeta"
        />
      </div>

      <button
        onClick={handleProcessPayment}
        className="cursor-pointer w-full bg-[#22007c] hover:bg-[#140152] h-10 rounded-2xl text-white font-bold text-sm transition-colors"
      >
        Procesar pago
      </button>

    </div>
  );
};

const PaymentButton = ({ active, onClick, icon, label }: any) => (
  <div
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-2 rounded-2xl cursor-pointer transition-all
${active
    ? "bg-[#22007c] scale-105"
    : "bg-zinc-900 hover:bg-zinc-800"}`}
  >
    <img className="w-6 h-6 mb-1" src={icon} alt={label} />
    <p className="text-white text-xs font-medium">{label}</p>
  </div>
);

export default TablePayment;
