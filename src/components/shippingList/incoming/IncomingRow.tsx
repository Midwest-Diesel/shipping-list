import { parseDateInputValue } from "@/scripts/tools/stringUtils";
import { Button, DropdownOption, Input, MiniDialog } from "@midwest-diesel/mwd-ui";
import IncomingRowInput from "./IncomingRowInput";
import { InputDropdown } from "@/components/library/InputDropdown";
import useFreightCarriers from "@/hooks/useFreightCarriers";
import { ask } from "@/scripts/config/tauri";
import { useState } from "react";
import { deleteIncomingRow } from "@/scripts/services/shippingListService";

interface Props {
  row: IncomingRow
  onEditRow: (id: number, key: keyof IncomingRow, value: unknown) => void
  editingUser: { id: number, field: keyof IncomingRow, user: string } | null
  refetch: () => void
}


export default function IncomingRow({ row, onEditRow, editingUser, refetch }: Props) {
  const [actionButtonsOpen, setActionButtonsOpen] = useState(false);
  const { freightCarriers } = useFreightCarriers();

  const onClickDeleteRow = async () => {
    if (!await ask('Are you sure you want to delete this row?')) return;

    setActionButtonsOpen(false);
    await deleteIncomingRow(row.id);
    refetch();
  };


  return (
    <tr style={{ position: 'relative' }} className="shipping-list-row">
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
          <InputDropdown
            value={row.shipVia ?? ''}
            onChange={(value) => onEditRow(row.id, 'shipVia', value)}
            maxHeight="20rem"
            data-ship-via-id={row.id}
          >
            {freightCarriers.map((carrier) => {
              return (
                <DropdownOption value={carrier.name}>{ carrier.name }</DropdownOption>
              );
            })}
          </InputDropdown>
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
      <td style={{ width: '1.5rem' }} className="shipping-list-row__menu-btn" onClick={() => !actionButtonsOpen && setActionButtonsOpen(true)}>
        <p style={{ color: 'white' }}>...</p>

        <div style={{ position: 'absolute', right: '4.2rem', top: 0 }}>
          <MiniDialog
            open={actionButtonsOpen}
            setOpen={setActionButtonsOpen}
          >
            <div className="shipping-list-row__mini-dialog-content">
              <Button
                variant={['x-small', 'fit', 'danger']}
                onClick={onClickDeleteRow}
              >
                <img alt="Delete" src="/images/icons/delete.svg" width={14} height={14} />
              </Button>
            </div>
          </MiniDialog>
        </div>
      </td>
    </tr>
  );
}
