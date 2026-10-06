import { parseDateInputValue } from "@/scripts/tools/stringUtils";
import { Input } from "@midwest-diesel/mwd-ui";
import IncomingRowInput from "./IncomingRowInput";

interface Props {
  row: IncomingRow
  onEditRow: (id: number, key: keyof IncomingRow, value: unknown) => void
  editingUser: { id: number, field: keyof IncomingRow, user: string } | null
}


export default function IncomingRow({ row, onEditRow, editingUser }: Props) {
  return (
    <tr className="shipping-list-row">
      <td>
        <IncomingRowInput row={row} field="date" editingUser={editingUser}>
          <Input
            style={{ margin: '0' }}
            variant={['no-style']}
            value={parseDateInputValue(row.date)}
            onChange={(e) => onEditRow(row.id, 'date', new Date(e.target.value))}
            type="date"
          />
        </IncomingRowInput>
      </td>
      <td>
        <IncomingRowInput row={row} field="pickedUp" editingUser={editingUser}>
          <Input
            checked={row.pickedUp}
            onChange={(e) => onEditRow(row.id, 'pickedUp', e.target.checked)}
            type="checkbox"
          />
        </IncomingRowInput>
      </td>
      <td>
        <IncomingRowInput row={row} field="shipVia" editingUser={editingUser}>
          <Input
            style={{ margin: '0' }}
            variant={['no-style']}
            value={row.shipVia ?? ''}
            onChange={(e) => onEditRow(row.id, 'shipVia', e.target.value)}
          />
        </IncomingRowInput>
      </td>
      <td>
        <IncomingRowInput row={row} field="company" editingUser={editingUser}>
          <Input
            style={{ margin: '0' }}
            variant={['no-style']}
            value={row.company ?? ''}
            onChange={(e) => onEditRow(row.id, 'company', e.target.value)}
          />
        </IncomingRowInput>
      </td>
      <td>
        <IncomingRowInput row={row} field="trackingNumber" editingUser={editingUser}>
          <Input
            style={{ margin: '0' }}
            variant={['no-style']}
            value={row.trackingNumber ?? ''}
            onChange={(e) => onEditRow(row.id, 'trackingNumber', e.target.value)}
          />
        </IncomingRowInput>
      </td>
      <td>
        <IncomingRowInput row={row} field="received" editingUser={editingUser}>
          <Input
            checked={row.received}
            onChange={(e) => onEditRow(row.id, 'received', e.target.checked)}
            type="checkbox"
          />
        </IncomingRowInput>
      </td>
      <td>
        <IncomingRowInput row={row} field="estimatedDeliveryDate" editingUser={editingUser}>
          <Input
            style={{ margin: '0' }}
            variant={['no-style']}
            value={parseDateInputValue(row.estimatedDeliveryDate)}
            onChange={(e) => onEditRow(row.id, 'estimatedDeliveryDate', new Date(e.target.value))}
            type="date"
          />
        </IncomingRowInput>
      </td>
      <td>
        <IncomingRowInput row={row} field="notes" editingUser={editingUser}>
          <Input
            style={{ margin: '0' }}
            variant={['no-style']}
            value={row.notes ?? ''}
            onChange={(e) => onEditRow(row.id, 'notes', e.target.value)}
          />
        </IncomingRowInput>
      </td>
    </tr>
  );
}
