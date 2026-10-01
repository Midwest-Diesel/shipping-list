import { useEffect, useState } from "react";
import { Button, Input, MiniDialog } from "@midwest-diesel/mwd-ui";
import ShippingListInput from "./ShippingListInput";
import { ask } from "@/scripts/config/tauri";
import { deleteShippingListRow, editShippingList } from "@/scripts/services/shippingListService";
import { getRowClasses } from "@/scripts/logic/shippingList";
import { useTooltip } from "@/hooks/useTooltip";
import { useQuery } from "@tanstack/react-query";
import { getPartInfoByPartNum } from "@/scripts/services/partsService";
import { useAtom } from "jotai";
import { userAtom } from "@/scripts/atoms/state";
import { formatShippingListWeightDims } from "@/scripts/tools/stringUtils";

interface Props {
  row: ShippingListRow
  onEditRow: (id: number, key: keyof ShippingListRow, value: unknown) => void
  editingUser: { id: number, field: keyof ShippingListRow, user: string } | null
  refetch: () => void
  setMoveRow: (value: ShippingListRow | null) => void
  onEditWeightDims: (id: number) => void
  onEditPartWeightDims: (id: number) => void
  hoveredRow: number | null
  setHoveredRow: (id: number | null) => void
}


export default function ShippingListRow({ row, onEditRow, editingUser, refetch, setMoveRow, onEditWeightDims, onEditPartWeightDims, hoveredRow, setHoveredRow }: Props) {
  const [user] = useAtom<User>(userAtom);
  const [actionButtonsOpen, setActionButtonsOpen] = useState(false);
  const [className, setClassName] = useState('shipping-list-row');
  const tooltip = useTooltip();
  
  const { data: isMissingWeightDims = false } = useQuery<boolean>({
    queryKey: ['isMissingWeightDims', row.partNum],
    queryFn: async () => {
      if (user.type === 'shop') return false;

      const partInfo = await getPartInfoByPartNum(row.partNum);
      if (!partInfo || partInfo.weightDims) return false;
      return true;
    }
  });

  useEffect(() => {
    setClassName(getRowClasses(row));
  }, [row]);

  const onClickSetAwaitingPayment = async () => {
    setActionButtonsOpen(false);
    await editShippingList({ ...row, awaitingPayment: !row.awaitingPayment }, 'awaitingPayment');
    refetch();
  };

  const onClickCompleteRow = async () => {
    setActionButtonsOpen(false);
    await editShippingList({ ...row, isComplete: !row.isComplete }, 'isComplete');
    refetch();
  };

  const onClickSetBlind = async () => {
    setActionButtonsOpen(false);
    await editShippingList({ ...row, isBlind: !row.isBlind }, 'isBlind');
    refetch();
  };

  const onClickSetMissingPhotos = async () => {
    setActionButtonsOpen(false);
    await editShippingList({ ...row, isMissingPartPhotos: !row.isMissingPartPhotos }, 'isMissingPartPhotos');
    refetch();
  };

  const onClickMoveRow = async () => {
    setActionButtonsOpen(false);
    setMoveRow(row);
  };

  const onClickDeleteRow = async () => {
    if (!await ask('Are you sure you want to delete this row?')) return;

    setActionButtonsOpen(false);
    await deleteShippingListRow(row.id);
    refetch();
  };
  

  return (
    <tr style={{ position: 'relative'}} className={className}>
      <td>
        <ShippingListInput row={row} field="createdBy" editingUser={editingUser}>
          <Input
            style={{ margin: '0' }}
            variant={['no-style', 'x-small']}
            value={row.createdBy ?? ''}
            onChange={(e) => onEditRow(row.id, 'createdBy', e.target.value)}
          />
        </ShippingListInput>
      </td>
      <td>
        <ShippingListInput row={row} field="shipVia" editingUser={editingUser}>
          <Input
            className={row.shipVia === 'UPS Red' ? 'shipping-list-row--ups-red' : ''}
            style={{ margin: '0' }}
            variant={['no-style']}
            value={row.shipVia ?? ''}
            onChange={(e) => onEditRow(row.id, 'shipVia', e.target.value)}
            data-ship-via-id={row.id}
          />
        </ShippingListInput>
      </td>
      <td>
        <ShippingListInput row={row} field="customer" editingUser={editingUser}>
          <Input
            style={{ margin: '0' }}
            variant={['no-style']}
            value={row.customer ?? ''}
            onChange={(e) => onEditRow(row.id, 'customer', e.target.value)}
          />
        </ShippingListInput>
      </td>
      <td>
        <ShippingListInput row={row} field="shipToContact" editingUser={editingUser}>
          <Input
            style={{ margin: '0' }}
            variant={['no-style']}
            value={row.shipToContact ?? ''}
            onChange={(e) => onEditRow(row.id, 'shipToContact', e.target.value)}
          />
        </ShippingListInput>
      </td>
      <td>
        <ShippingListInput row={row} field="partNum" editingUser={editingUser}>
          <Input
            style={{ margin: '0' }}
            variant={['no-style']}
            value={row.partNum ?? ''}
            onChange={(e) => onEditRow(row.id, 'partNum', e.target.value)}
          />
        </ShippingListInput>
      </td>
      <td>
        <ShippingListInput row={row} field="desc" editingUser={editingUser}>
          <Input
            style={{ margin: '0' }}
            variant={['no-style']}
            value={row.desc ?? ''}
            onChange={(e) => onEditRow(row.id, 'desc', e.target.value)}
          />
        </ShippingListInput>
      </td>
      <td>
        <ShippingListInput row={row} field="stockNum" editingUser={editingUser}>
          <Input
            style={{ margin: '0' }}
            variant={['no-style']}
            value={row.stockNum ?? ''}
            onChange={(e) => onEditRow(row.id, 'stockNum', e.target.value)}
          />
        </ShippingListInput>
      </td>
      <td>
        <ShippingListInput row={row} field="location" editingUser={editingUser}>
          <Input
            style={{ margin: '0' }}
            variant={['no-style']}
            value={row.location ?? ''}
            onChange={(e) => onEditRow(row.id, 'location', e.target.value)}
          />
        </ShippingListInput>
      </td>
      <td>
        <ShippingListInput row={row} field="mp" editingUser={editingUser}>
          <Input
            className="shipping-list__marketing-inputs"
            style={{ margin: '0' }}
            variant={['no-style', 'x-small', 'no-arrows']}
            value={row.mp || ''}
            onChange={(e) => onEditRow(row.id, 'mp', e.target.value ? Number(e.target.value) : null)}
            type="number"
          />
        </ShippingListInput>
      </td>
      <td>
        <ShippingListInput row={row} field="br" editingUser={editingUser}>
          <Input
            className="shipping-list__marketing-inputs"
            style={{ margin: '0' }}
            variant={['no-style', 'x-small', 'no-arrows']}
            value={row.br || ''}
            onChange={(e) => onEditRow(row.id, 'br', e.target.value ? Number(e.target.value) : null)}
            type="number"
          />
        </ShippingListInput>
      </td>
      <td>
        <ShippingListInput row={row} field="cap" editingUser={editingUser}>
          <Input
            className="shipping-list__marketing-inputs"
            style={{ margin: '0' }}
            variant={['no-style', 'x-small', 'no-arrows']}
            value={row.cap || ''}
            onChange={(e) => onEditRow(row.id, 'cap', e.target.value ? Number(e.target.value) : null)}
            type="number"
          />
        </ShippingListInput>
      </td>
      <td>
        <ShippingListInput row={row} field="fl" editingUser={editingUser}>
          <Input
            className="shipping-list__marketing-inputs"
            style={{ margin: '0' }}
            variant={['no-style', 'x-small', 'no-arrows']}
            value={row.fl || ''}
            onChange={(e) => onEditRow(row.id, 'fl', e.target.value ? Number(e.target.value) : null)}
            type="number"
          />
        </ShippingListInput>
      </td>
      <td>
        <ShippingListInput row={row} field="marketingContact" editingUser={editingUser}>
          <Input
            style={{ margin: '0' }}
            variant={['no-style']}
            value={row.marketingContact ?? ''}
            onChange={(e) => onEditRow(row.id, 'marketingContact', e.target.value)}
          />
        </ShippingListInput>
      </td>
      <td style={{ textAlign: 'center' }}>
        <Input
          checked={row.pulled}
          onChange={(e) => onEditRow(row.id, 'pulled', e.target.checked)}
          type="checkbox"
        />
      </td>
      <td style={{ textAlign: 'center' }}>
        <Input
          checked={row.packaged}
          onChange={(e) => onEditRow(row.id, 'packaged', e.target.checked)}
          type="checkbox"
        />
      </td>
      <td style={{ textAlign: 'center' }}>
        <Input
          checked={row.gone}
          onChange={(e) => onEditRow(row.id, 'gone', e.target.checked)}
          type="checkbox"
        />
      </td>
      <td style={{ textAlign: 'center' }}>
        <Input
          checked={row.ready}
          onChange={(e) => onEditRow(row.id, 'ready', e.target.checked)}
          type="checkbox"
        />
      </td>
      <td
        className="shipping-list-row__weight-dims"
        onMouseEnter={() => setHoveredRow(row.id)}
        onMouseLeave={() => setHoveredRow(null)}
      >
        {(user.type !== 'shop' && row.partNum?.toLowerCase() !== 'multiple') &&
          <Button
            style={isMissingWeightDims ? { color: 'var(--orange-1)' } : {}}
            variant={['xx-small']}
            className="shipping-list-row__indicator"
            onMouseEnter={() => tooltip.set('Part Missing Weight/Dims')}
            onMouseLeave={() => tooltip.set('')}
            onClick={() => onEditPartWeightDims(row.id)}
          >
            Part
          </Button>
        }

        {hoveredRow === row.id ?
          <Button
            style={{ backgroundColor: 'var(--grey-light-1)' }}
            variant={['xx-small']}
            onClick={() => onEditWeightDims(row.id)}
          >
            Edit
          </Button>
          :
          <span style={{ display: 'inline-flex', overflow: 'hidden', width: '8.3rem', fontSize: 'var(--font-xsm)' }}>
            { formatShippingListWeightDims(row.weightDims).replaceAll('\n', ', ') }
          </span>
        }
      </td>
      <td>
        <ShippingListInput row={row} field="handwrittenId" editingUser={editingUser}>
          <Input
            style={{ margin: '0' }}
            variant={['no-style', 'no-arrows']}
            value={row.handwrittenId || ''}
            onChange={(e) => onEditRow(row.id, 'handwrittenId', e.target.value ? Number(e.target.value) : null)}
            type="number"
          />
        </ShippingListInput>
      </td>
      <td>
        <ShippingListInput row={row} field="scheduled" editingUser={editingUser}>
          <Input
            style={{ margin: '0' }}
            variant={['no-style', 'x-small']}
            value={row.scheduled || ''}
            onChange={(e) => onEditRow(row.id, 'scheduled', e.target.value)}
          />
        </ShippingListInput>
      </td>

      <td className="shipping-list-row__menu-btn" onClick={() => !actionButtonsOpen && setActionButtonsOpen(true)}>
        <p style={{ color: 'white' }}>...</p>

        <div style={{ position: 'absolute', right: '8rem', top: 0 }}>
          <MiniDialog
            open={actionButtonsOpen}
            setOpen={setActionButtonsOpen}
          >
            <div className="shipping-list-row__mini-dialog-content">
              <Button
                variant={['x-small', 'fit']}
                onClick={onClickSetAwaitingPayment}
                onMouseEnter={() => tooltip.set('Awaiting Payment')}
                onMouseLeave={() => tooltip.set('')}
              >
                <img alt="Awaiting payment" src="/images/icons/dollar-sign.svg" width={14} height={14} />
              </Button>

              <Button
                variant={['x-small', 'fit']}
                onClick={onClickCompleteRow}
                onMouseEnter={() => tooltip.set('Complete')}
                onMouseLeave={() => tooltip.set('')}
              >
                <img alt="Complete" src="/images/icons/check.svg" width={14} height={14} />
              </Button>

              <Button
                variant={['x-small', 'fit']}
                onClick={onClickSetBlind}
                onMouseEnter={() => tooltip.set('Blind')}
                onMouseLeave={() => tooltip.set('')}
              >
                <img alt="Blind" src="/images/icons/eye-slash.svg" width={14} height={14} />
              </Button>

              <Button
                variant={['x-small', 'fit']}
                onClick={onClickSetMissingPhotos}
                onMouseEnter={() => tooltip.set('Missing Photos')}
                onMouseLeave={() => tooltip.set('')}
              >
                <img alt="Blind" src="/images/icons/image.svg" width={14} height={14} />
              </Button>
              
              <Button
                variant={['x-small', 'fit']}
                onClick={onClickMoveRow}
                onMouseEnter={() => tooltip.set('Move')}
                onMouseLeave={() => tooltip.set('')}
              >
                <img alt="Move" src="/images/icons/move.svg" width={14} height={14} />
              </Button>

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
