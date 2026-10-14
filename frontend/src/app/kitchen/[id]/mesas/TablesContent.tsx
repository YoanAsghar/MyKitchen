import { colorPalette} from "../../../../colorPallete"
import TableCards from "../../../../components/TableCards";
import { Table } from "../../../../models/table";

interface TableContentPrompts{
  tables: Table[];
  onSelect: (id: number) => void;
  onAddTable: () => void;
  onRemoveTable: () => void;
  setSelectedTable: (table: Table) => void;
  role: string;
  selectedTable: Table;
}

const TablesContent = ({tables, onAddTable, onRemoveTable, role, setSelectedTable, selectedTable}: TableContentPrompts) => {
  return (
      <div className="h-full flex-1 min-w-0 flex flex-col overflow-y-auto" style={{ backgroundColor: colorPalette.Charcoal }}>
        <div className="grid w-full p-6 grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
          {tables.map((table, index) => (
          <TableCards key={table.id} number={index + 1} table={table} setSelectedTable={setSelectedTable} selectedTable={selectedTable}/>
          ))}
        </div>
      </div>
  )
}

export default TablesContent
