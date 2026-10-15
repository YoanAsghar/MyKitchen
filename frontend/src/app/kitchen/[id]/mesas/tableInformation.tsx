import { useEffect, useMemo, useRef, useState } from "react";
import { colorPalette } from "../../../../colorPallete";
import { Product } from "../../../../models/product";
import { Category } from "../../../../models/category";
import { Order } from "../../../../models/order";
import { Table } from "../../../../models/table";
import { orderDetail } from "../../../../models/orderDetails";
import TablePayment from "./TablePayment";

interface TableInformationProps {
  table: Table | undefined;
  tableNumber: number;
  onUpdateTable: (updatedTable: Table) => void;
  setIsLoading: (isLoading: boolean) => void;
  products: Product[];
  categories: Category[];
}

const TableInformation = ({ table, tableNumber, onUpdateTable, setIsLoading, products, categories }: TableInformationProps) => {
  const [amountOfPersons, setAmountOfPersons] = useState(table?.order?.guests || 0); // kept to avoid type/flow issues; not displayed
  const [propina, setPropina] = useState(table?.order?.tip || 0);
  const [comment, setComment] = useState(table?.order?.comment || "");
  const [searchBarValue, setSearchBarValue] = useState("");
  const [currentProducts, setCurrentProducts] = useState<orderDetail[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [openCategoryIds, setOpenCategoryIds] = useState<number[]>([]);

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
      o?.comment ?? "",
      (o?.orderDetail ?? []).map((d) => `${d.productId}x${d.quantity}`).join(","),
    ]);
    if (key === appliedKeyRef.current) return;
    appliedKeyRef.current = key;
    setAmountOfPersons(o?.guests ?? 0);
    setPropina(o?.tip ?? 0);
    setComment(o?.comment ?? "");
    setCurrentProducts(o?.orderDetail || []);
  }, [table]);

  useEffect(() => {
    const productsTotal = currentProducts.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);
    setTotalPrice(productsTotal + propina);
  }, [currentProducts, propina]);

  const filteredProducts = useMemo(() => {
    if (!searchBarValue.trim()) return products;
    return products.filter((product) => product.name.toLowerCase().includes(searchBarValue));
  }, [searchBarValue, products]);

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => a.id - b.id);
  }, [categories]);

  const toggleCategory = (categoryId: number) => {
    setOpenCategoryIds((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  // Builds the Order from the local draft. Nothing is sent to the backend until
  // the user presses the Save/Update button.
  const buildOrderDraft = (): Order => {
    const draft = new Order(table?.id ?? 0, table?.restaurantId ?? 0);
    draft.guests = 0;
    draft.orderDetail = currentProducts;
    draft.tip = propina;
    draft.comment = comment;
    draft.totalPrice = currentProducts.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0) + propina;
    return draft;
  };

  // Single commit point: creates when no open order exists, updates when it does.
  // An empty draft cancels the table's OPEN order.
  function handleSaveOrder() {
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

  const hasOpenOrder = Boolean(table?.order);

  return (
    <div className="h-full w-full lg:w-[45%] xl:w-[42%] max-w-[760px] shrink-0 flex flex-col overflow-hidden" style={{ backgroundColor: colorPalette.DeepTwilight }}>
      {/* TOP ROW: SEARCH/CATEGORIES + ORDER DETAILS */}
      <div className="flex-1 flex flex-row overflow-hidden">
        {/* LEFT: PRODUCT LIST */}
        <div className="h-full w-1/2 flex flex-col border-r border-white/10">
          <div className="shrink-0 p-3">
            <h2 className="text-base font-bold text-white mb-2">{`Mesa ${tableNumber} — Productos`}</h2>
            <div className="relative">
              <img
                src="/search_icon.png"
                alt="Buscar"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none brightness-0 invert"
              />
              <input
                onChange={(e) => setSearchBarValue(e.target.value.toLowerCase())}
                type="text"
                placeholder="Buscar producto"
                className="w-full bg-white text-black text-sm rounded-lg p-1.5 pl-8 border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-y-auto p-2 gap-2">
            {sortedCategories.map((category) => {
              const categoryProducts = filteredProducts.filter(
                (p) => p.categoryId === category.id
              );
              if (categoryProducts.length === 0 && searchBarValue.trim()) return null;
              const isOpen = openCategoryIds.includes(category.id) || searchBarValue.trim();
              return (
                <div key={category.id} className="flex flex-col rounded-lg overflow-hidden border border-white/10">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="flex flex-row items-center justify-between p-2 text-white cursor-pointer"
                    style={{ backgroundColor: colorPalette.Navy }}
                  >
                    <p className="font-bold text-sm">{category.name}</p>
                    <span className="text-base">{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen && (
                    <ul className="flex flex-col gap-1.5 p-1.5" style={{ backgroundColor: colorPalette.DeepTwilight }}>
                      {categoryProducts.map((product) => (
                        <li
                          key={product.id}
                          className="flex flex-row justify-between items-center rounded-lg text-black p-2 bg-white shadow-sm hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex flex-col">
                            <p className="font-bold text-sm leading-tight">{product.name}</p>
                            <p className="text-xs opacity-60 font-medium">${product.price}</p>
                          </div>
                          <button
                            onClick={() => addProductToTable(product)}
                            className="rounded-lg cursor-pointer transition-transform hover:scale-110 shadow-md"
                          >
                            <img className="bg-stone-950 rounded-lg size-7 p-1.5" src="/plus.png" alt="Agregar" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
            {!searchBarValue.trim() && sortedCategories.length === 0 && (
              <p className="text-white/50 text-xs text-center mt-4">No hay categorías</p>
            )}
            {searchBarValue.trim() && filteredProducts.length === 0 && (
              <p className="text-white/50 text-xs text-center mt-4">No se encontraron productos</p>
            )}
          </div>
        </div>

        {/* RIGHT: ORDER DETAILS */}
        <div className="h-full w-1/2 flex flex-col">
          <div className="shrink-0 p-3 flex flex-col gap-2">
            <h2 className="text-base font-bold text-white">{`Mesa ${tableNumber} — Pedido`}</h2>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <label className="text-white text-xs">Propina:</label>
                <input
                  type="number"
                  min={0}
                  value={propina}
                  onChange={(e) => handlePropinaChange(Number(e.target.value) || 0)}
                  className="bg-black text-white text-sm text-center w-16 h-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-2">
            <table className="w-full text-white">
              <thead className="sticky top-0 z-10" style={{ backgroundColor: colorPalette.DeepTwilight }}>
                <tr>
                  <th className="text-left py-1.5 px-1.5 text-xs">Artículo</th>
                  <th className="text-center py-1.5 px-1.5 text-xs">Precio</th>
                  <th className="text-center py-1.5 px-1.5 text-xs">Cant.</th>
                  <th className="w-6"></th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((detail: orderDetail, index: number) => (
                  <tr key={index} className="border-b border-white/10">
                    <td className="py-1.5 px-1.5 text-xs">{detail.product?.name}</td>
                    <td className="py-1.5 px-1.5 text-center text-xs">${detail.product?.price}</td>
                    <td className="py-1.5 px-1.5 text-center text-xs">{detail.quantity}</td>
                    <td className="py-1.5 px-1.5">
                      <img
                        className="cursor-pointer mx-auto hover:scale-110 transition-transform size-4"
                        src="/trash_icon.png"
                        alt="Eliminar"
                        onClick={() => removeProductFromTable(index)}
                      />
                    </td>
                  </tr>
                ))}
              {propina !== 0 && (
                <tr>
                  <td colSpan={4} className="py-1.5 px-1.5 text-xs font-medium">
                    Propina: ${propina}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </div>
      </div>

      {/* KITCHEN NOTE (local draft, only persisted on commit) */}
      <div className="shrink-0 p-2 bg-black/20 border-t border-white/10">
        <label htmlFor="kitchen-comment" className="block text-white/70 text-xs font-medium mb-1">
          Nota para la cocina
        </label>
        <textarea
          id="kitchen-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          rows={2}
          placeholder="Ej: sin cebolla, servir primero a los niños…"
          className="w-full resize-none bg-black/40 text-white text-xs rounded-lg p-2 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-white/30"
        />
      </div>

      {/* TOTAL + SAVE (full width, spans both sections) */}
      <div className="shrink-0 p-2 bg-black/20 border-t border-white/10">
        <div className="flex justify-between items-center text-base font-bold text-white mb-1.5">
          <span>Total:</span>
          <span>${totalPrice.toFixed(0)}</span>
        </div>

        <button
          onClick={handleSaveOrder}
          className="cursor-pointer w-full bg-[#22007c] hover:bg-[#140152] h-9 rounded-xl text-white font-bold text-sm transition-colors"
        >
          {hasOpenOrder ? "Actualizar orden" : "Crear orden"}
        </button>
      </div>

      {/* BOTTOM: PAYMENT SECTION */}
      {table?.order && (
        <div className="shrink-0">
          <TablePayment table={table} tableNumber={tableNumber} setIsLoading={setIsLoading} />
        </div>
      )}
    </div>
  );
};

export default TableInformation;
