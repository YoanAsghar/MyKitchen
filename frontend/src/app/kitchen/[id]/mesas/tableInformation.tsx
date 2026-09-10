import { useEffect, useMemo, useState } from "react";
import { colorPalette } from "../../../../colorPallete";
import { Product } from "../../../../models/product";
import { Order, PaymentMethod } from "../../../../models/order";
import { OrderServices } from "../../../../services/OrderServices";
import { Table } from "../../../../models/table";
import { orderDetail } from "../../../../models/orderDetails";

interface TableInformationProps{
  table: Table | undefined;
  onUpdateTable: (updatedTable: Table) => void;
  setIsLoading: (isLoading: boolean) => void;
  products: Product[];
}

const TableInformation = ({table, onUpdateTable, setIsLoading, products }: TableInformationProps) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [amountOfPersons, setAmountOfPersons] = useState(table?.order?.guests || 0);
  const [propina, setPropina] = useState(table?.order?.tip || 0);
  const [currentTab, setCurrenTab] = useState(false);
  const [searchBarValue, setSearchBarValue] = useState("");
  const [currentProducts, setCurrentProducts] = useState<orderDetail[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    setAmountOfPersons(table?.order?.guests || 0);
    setPropina(table?.order?.tip || 0);
    setCurrentProducts(table?.order?.orderDetail || []);
  }, [table?.id]);

  useEffect(() => {
    const productsTotal = currentProducts.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);
    setTotalPrice(productsTotal + propina);
  }, [currentProducts, propina]);

  const filteredProducts = useMemo(() => {
    if(!searchBarValue.trim()) return products
    return products.filter(product => product.name.toLowerCase().includes(searchBarValue));
  }, [searchBarValue, products])

  // Función para sincronizar los datos locales con el componente padre (y las tarjetas)
  const syncWithParent = (guests: number, orderDetail: orderDetail[], tip: number) => {
    if (!table) return;
    const updatedOrder = new Order(table.id);
    updatedOrder.guests = guests;
    updatedOrder.orderDetail = orderDetail;
    updatedOrder.tip = tip;
    updatedOrder.totalPrice = orderDetail.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0) + tip;

    onUpdateTable({
      ...table,
      order: updatedOrder
    });
  };

  function handlePersonsChange(value: number) {
    setAmountOfPersons(value);
    syncWithParent(value, currentProducts, propina);
  }

  function handlePropinaChange(value: number) {
    setPropina(value);
    syncWithParent(amountOfPersons, currentProducts, value);
  }

  function addProductToTable(item: Product){
    const existingDetailIndex = currentProducts.findIndex(detail => detail.productId === item.id);
    let newDetails: orderDetail[];

    if (existingDetailIndex >= 0) {
      newDetails = currentProducts.map((detail, index) => 
        index === existingDetailIndex 
          ? { ...detail, quantity: detail.quantity + 1 }
          : detail
      );
    } else {
      const newDetail = new orderDetail(0, item.id, item, 1, 0);
      newDetails = [...currentProducts, newDetail];
    }

    setCurrentProducts(newDetails);
    syncWithParent(amountOfPersons, newDetails, propina);
  }

  function removeProductFromTable(index: number){

    const detail = currentProducts[index];
    let newDetails: orderDetail[];

    if (detail.quantity > 1) {
      newDetails = currentProducts.map((d, i) => 
        i === index ? { ...d, quantity: d.quantity - 1 } : d
      );
    } else {
      newDetails = currentProducts.filter((_, i) => i !== index);
    }

    setCurrentProducts(newDetails);
    syncWithParent(amountOfPersons, newDetails, propina);
  }

  function resetTableData(){
    setAmountOfPersons(0);
    setCurrentProducts([]);
    setPropina(0);

    if(table){
      onUpdateTable({
        ...table,
        order: undefined
      })
    }
  }

  async function handleProcessPayment() {
    if (!table) return;
    if (currentProducts.length === 0) return;

    const finalOrder = new Order(table.id);
    finalOrder.totalPrice = totalPrice;
    finalOrder.guests = amountOfPersons;
    finalOrder.tip = propina;
    finalOrder.paymentMethod = paymentMethod;
    finalOrder.orderDetail = currentProducts;

    setIsLoading(true);
    try{
      await OrderServices.createOrder(finalOrder);
    }catch(err){
      throw new Error(`Error creating order ${err}`);
    }finally{
      setIsLoading(false);
    }

    // The backend clears the table's open order and broadcasts OrderClosed,
    // so the global state removes it — no need to re-push the paid order here.
    resetTableData();
  }

  return (
    <div className="h-full w-full lg:w-[30%] flex flex-col overflow-hidden">
      {/* CABECERA */}
      <div 
        className="shrink-0 p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
        style={{ backgroundColor: colorPalette.Navy }}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white">{`Mesa ${table?.id}`}</h2>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <label className="text-white text-sm">Propina:</label>
            <input
              type="text"
              value={propina}
              onChange={(e) => handlePropinaChange(Number(e.target.value) || 0)}
              className="bg-black text-white text-center w-20 h-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* CONTENEDOR DE PESTAÑAS ANIMADAS */}
      <div className="flex-1 flex flex-col overflow-hidden relative" style={{ backgroundColor: colorPalette.DeepTwilight }}>
        
        {/* PESTAÑA 1: PEDIDOS ACTUALES */}
        <div className={`tab-pane-vertical ${currentTab ? "active" : ""}`}>
          <div className="inner-content-vertical">
            {/* Botón integrado */}
            <div className="flex justify-center w-full shrink-0">
              <button 
                className="cursor-pointer rounded-b-lg w-16 flex items-center justify-center transition-transform hover:scale-110" 
                style={{backgroundColor: colorPalette.Navy}} 
                onClick={() => setCurrenTab(false)}
              >
                <img className="p-1" src="/swap_icon.png" alt="Cambiar" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              <table className="w-full text-white">
                <thead className="sticky top-0 z-10" style={{ backgroundColor: colorPalette.DeepTwilight }}>
                  <tr>
                    <th className="text-left py-3 px-2">Artículo</th>
                    <th className="text-center py-3 px-2">Precio</th>
                    <th className="text-center py-3 px-2">Cant.</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {currentProducts.map((detail: orderDetail, index: number) => (
                    <tr key={index} className="border-b border-white/10">
                      <td className="py-3 px-2">{detail.product?.name}</td>
                      <td className="py-3 px-2 text-center">${detail.product?.price}</td>
                      <td className="py-3 px-2 text-center">{detail.quantity}</td>
                      <td className="py-3 px-2">
                        <img
                          className="cursor-pointer mx-auto hover:scale-110 transition-transform"
                          src="/trash_icon.png"
                          alt="Eliminar"
                          onClick={() => removeProductFromTable(index)}
                        />
                      </td>
                    </tr>
                  ))}
                  {propina !== 0 && (
                    <tr>
                      <td colSpan={4} className="py-3 px-2 font-medium">
                        Propina: ${propina}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-5 bg-black/20">
              <div className="flex justify-between items-center text-xl font-bold text-white">
                <span>Total:</span>
                <span>${totalPrice.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* PESTAÑA 2: AGREGAR PRODUCTOS */}
        <div className={`tab-pane-vertical ${!currentTab ? "active" : ""}`}>
          <div className="inner-content-vertical bg-stone-950">
            {/* Botón integrado */}
            <div className="flex justify-center w-full shrink-0">
              <button 
                className="cursor-pointer rounded-b-lg w-16 flex items-center justify-center transition-transform hover:scale-110" 
                style={{backgroundColor: colorPalette.Navy}} 
                onClick={() => setCurrenTab(true)}
              >
                <img className="p-1 rotate-180" src="/swap_icon.png" alt="Cambiar" />
              </button>
            </div>

            <div className="relative w-full px-15 mt-3 mb-4">
              <img 
                src="/search_icon.png" 
                alt="Buscar" 
                className="absolute left-7 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none brightness-0 invert"
              />
              <input 
                onChange={(e) => setSearchBarValue(e.target.value.toLowerCase())}
                type="text" 
                placeholder="Buscar producto"
                className="w-full bg-white text-black rounded-lg p-3 pl-14 border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <ul className="flex-1 flex flex-col w-full overflow-y-auto px-15 gap-2 pb-4">
              {filteredProducts.map((product) => (
                <li key={product.id} className="flex flex-row justify-between items-center rounded-lg text-black p-3 bg-white shadow-sm hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col">
                    <p className="font-bold text-lg leading-tight">{product.name}</p>
                    <p className="text-sm opacity-60 font-medium">${product.price}</p>
                  </div>
                  <button onClick={() => addProductToTable(product)} className="rounded-lg cursor-pointer transition-transform hover:scale-110 shadow-md"> 
                    <img className="bg-stone-950 rounded-lg size-10 p-2.5" src="/plus.png" alt="Agregar" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* MÉTODOS DE PAGO */}
      <div className="shrink-0 bg-black p-5 space-y-4">
        <h2 className="text-2xl font-semibold text-white">Métodos de pago</h2>
        <div className="grid grid-cols-3 gap-3">
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
          className="cursor-pointer w-full bg-[#22007c] hover:bg-[#140152] h-14 rounded-2xl text-white font-bold text-xl transition-colors"
        >
          Procesar pago
        </button>
      </div>
    </div>
  );
};

const PaymentButton = ({ active, onClick, icon, label }: any) => (
  <div
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-3 rounded-2xl cursor-pointer transition-all
${active 
? "bg-[#22007c] scale-105" 
: "bg-zinc-900 hover:bg-zinc-800"}`}
  >
    <img className="w-8 h-8 mb-1" src={icon} alt={label} />
    <p className="text-white text-sm font-medium">{label}</p>
  </div>
);

export default TableInformation;
