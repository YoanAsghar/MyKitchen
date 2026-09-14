import { colorPalette } from "../colorPallete"
import { Table } from "../models/table";

interface TableCardProps {
  table: Table;
  number: number;
  setSelectedTable: (table: Table) => void;
  selectedTable: Table;
}

const TableCards = ({table, number, setSelectedTable, selectedTable}: TableCardProps) => {
  const guests = table.order?.guests || 0;
  const productsTotal = table.order?.orderDetail?.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0) || 0;
  const tip = table.order?.tip || 0;
  const totalPrice = productsTotal + tip;

  return (
    <div
      onClick={() => setSelectedTable(table)}
      className={`rounded-2xl w-68 flex flex-col cursor-pointer bg-black ${selectedTable.id === table.id ? "outline-2 outline-indigo-600" : ""}`}
    >
      {/*<img className="rounded-t-2xl" src="/tables_image.png" alt="" />*/}
      <div className="flex flex-row space-betwen items-center relative">
        <h3 className="text-white p-4 pb-1">{`Mesa ${number}`}</h3>
        {(!table.order || table.order.orderDetail.length === 0) 
          ? 
          <h3 className="text-red-500 bg-red-800 right-4 absolute border-1 rounded-lg text-xs flex items-center w-15 h-5 justify-center">
            Inactiva
          </h3>
          :
          <h3 className="text-green-500 bg-green-800 right-4 absolute border-1 rounded-lg text-xs flex items-center w-15 h-5 justify-center">
            Activa
          </h3>

        }
      </div>
      <div className="flex flex-row items-center">
        <img
          className="p-2 m-3 rounded-lg"
          style={{ backgroundColor: colorPalette.DeepTwilight }}
          src="/person_icon.png"
          alt=""
        />
        <div className="flex flex-col">
          <p className="text-gray-500 text-xs">Personas</p>
          <p className="text-white">{`${guests} Comensales`}</p>
        </div>
      </div>
      <div className="flex flex-row items-center">
        <img
          className="p-2 m-3 rounded-lg"
          style={{ backgroundColor: colorPalette.DeepTwilight }}
          src="/currency_icon.png"
          alt=""
        />
        <div className="flex flex-col">
          <p className="text-gray-500 text-xs">Cuenta total</p>
          <p className="text-white">{`$${totalPrice}`}</p>
        </div>
      </div>
    </div>
  );
}

export default TableCards
