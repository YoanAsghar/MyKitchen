import { useEffect, useMemo, useRef, useState } from "react";
import { colorPalette } from "../../../../colorPallete";
import { Product } from "../../../../models/product";
import { Order } from "../../../../models/order";
import { Table } from "../../../../models/table";
import { orderDetail } from "../../../../models/orderDetails";
import TablePayment from "./TablePayment";

interface TableInformationProps{
  table: Table | undefined;
  tableNumber: number;
  onUpdateTable: (updatedTable: Table) => void;
  setIsLoading: (isLoading: boolean) => void;
  products: Product[];
}

const TableInformation = ({table, tableNumber, onUpdateTable, setIsLoading, products }: TableInformationProps) => {
  const [amountOfPersons, setAmountOfPersons] = useState(table?.order?.guests || 0);
  const [propina, setPropina] = useState(table?.order?.tip || 0);
  const [currentTab, setCurrenTab] = useState(false);
  const [searchBarValue, setSearchBarValue] = useState("");
  const [currentProducts, setCurrentProducts] = useState<orderDetail[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // Content signature of the last order we applied to the draft, so we can tell
  // "a real change arrived over the wire" apart from harmless re-render noise.
  const appliedKeyRef = useRef("");

  // Keep the draft in sync with the shared real-time order state: whenever the
  // *content* of the selected table's order changes (a hub broadcast from
  // another connection, or the canonical result of our own commit), re-seed the
  // form instead of staling on the last selection. Guests, tip and products all
  // travel in that payload, so a tip set on laptop A shows up on laptop B's
  // selected-table panel too. (Last-write-wins: a peer editing the same table
  // simultaneously overwrites the local draft.)
  useEffect(() => {
    const o = table?.order;
    const key = JSON.stringify([
      o?.guests ?? 0,
      o?.tip ?? 0,
      (o?.orderDetail ?? []).map((d) => `${d.productId}x${d.quantity}`).join(","),
    ]);
    if (key === appliedKeyRef.current) return;
    appliedKeyRef.current = key;
    setAmountOfPersons(o?.guests ?? 0);
    setPropina(o?.tip ?? 0);
    setCurrentProducts(o?.orderDetail || []);
  }, [table]);

  useEffect(() => {
    const productsTotal = currentProducts.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);
    setTotalPrice(productsTotal + propina);
  }, [currentProducts, propina]);

  const filteredProducts = useMemo(() => {
    if(!searchBarValue.trim()) return products
    return products.filter(product => product.name.toLowerCase().includes(searchBarValue));
  }, [searchBarValue, products])

  // Builds the Order from the local draft. Nothing is sent to the backend from
  // here — it is only committed when the user presses the "Crear orden" button
  // in the add-products tab (PESTAÑA 2). "Editar orden" lives in the
  // list-of-elements tab (PESTAÑA 1) and only switches this panel to editing.
  const buildOrderDraft = (): Order => {
    const draft = new Order(table?.id ?? 0, table?.restaurantId ?? 0);
    draft.guests = amountOfPersons;
    draft.orderDetail = currentProducts;
    draft.tip = propina;
    draft.totalPrice = currentProducts.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0) + propina;
    return draft;
  };

  // The single commit point for a table's order: composing products/guests/tip
  // is purely local until this is pressed. It both creates (no order yet) and
  // updates (table already has an OPEN order) — the label never changes here.
  // An empty draft cancels the table's OPEN order.
  function handleCreateOrder() {
    if (!table) return;

    if (currentProducts.length === 0) {
      onUpdateTable({ ...table, order: undefined });
      return;
    }

    onUpdateTable({ ...table, order: buildOrderDraft() });
  }

  function handlePropinaChange(value: number) {
    setPropina(value);
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
      const newDetail = new orderDetail(0, item.id, item, 1, table?.restaurantId ?? 0);
      newDetails = [...currentProducts, newDetail];
    }

    setCurrentProducts(newDetails);
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
  }

  return (
    <div className="h-full w-full lg:w-[30%] flex flex-col overflow-hidden">
      {/* CABECERA */}
      <div 
        className="shrink-0 p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
        style={{ backgroundColor: colorPalette.Navy }}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white">{`Mesa ${tableNumber}`}</h2>
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

            {/* PAYMENT + ACTIONS — lives only in this "list of elements" tab
                (PESTAÑA 1), never in the add-products tab, and only when the
                selected table already has a created OPEN order. */}
            {table?.order && (
              <div className="shrink-0 ">
                <TablePayment
                  table={table}
                  tableNumber={tableNumber}
                  onEditOrder={() => setCurrenTab(false)}
                  setIsLoading={setIsLoading}
                />
              </div>
            )}
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

            {/* CREAR ORDEN — only lives in this add-products tab (PESTAÑA 2):
                the single commit point that sends the local draft to the
                kitchen. Payment/actions never appear here. */}
            <div className="shrink-0 px-5 pb-4">
              <button
                onClick={handleCreateOrder}
                className="cursor-pointer w-full bg-[#22007c] hover:bg-[#140152] h-14 rounded-2xl text-white font-bold text-xl transition-colors"
              >
                Crear orden
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableInformation;
