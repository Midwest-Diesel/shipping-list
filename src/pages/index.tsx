import { Layout } from "../components/Layout";
import { Button } from "@midwest-diesel/mwd-ui";
import MoveShippingListRowDialog from "../components/shippingList/dialogs/MoveShipppingListRowDialog";
import ShippingListTableEdit from "../components/shippingList/ShippingListTableEdit";
import useAutoSave from "@/hooks/useAutoSave";
import { shippingListDayAtom, shippingListWeekAtom } from "../scripts/atoms/state";
import { confirm, invoke } from "../scripts/config/tauri";
import { offServerEvent, onServerEvent, socket } from "@/scripts/config/websockets";
import { exportShippingList } from "@/scripts/logic/shippingList";
import { editShippingList, getShippingList } from "@/scripts/services/shippingListService";
import { formatDate, getDay, parseWeightDims } from "@/scripts/tools/stringUtils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import EditWeightDimsDialog from "../components/shippingList/dialogs/EditWeightDimsDialog";


export default function Home() {
  const [week, setWeek] = useAtom<'Current' | 'Next'>(shippingListWeekAtom);
  const [date, setDate] = useAtom(shippingListDayAtom);
  const [editedRow, setEditedRow] = useState<{ row: ShippingListRow, field: keyof ShippingListRow } | null>(null);
  const [shipViaEdit, setShipViaEdit] = useState<{ row: ShippingListRow, field: 'shipVia' } | null>(null);
  const [editingUser, setEditingUser] = useState<{ id: number, field: keyof ShippingListRow, user: string } | null>(null);
  const [weightDimsEditId, setWeightDimsEditId] = useState<number | null>(null);
  const [weightDimsVersion, setWeightDimsVersion] = useState(0);
  const [moveRow, setMoveRow] = useState<ShippingListRow | null>(null);
  const queryClient = useQueryClient();

  const { data = [], refetch } = useQuery<ShippingListSection[]>({
    queryKey: ['sections', formatDate(date)],
    queryFn: () => getShippingList(date)
  });

  useEffect(() => {
    const onEditShippingList = (data: { row?: ShippingListRow, field?: keyof ShippingListRow, socketId: string, user: string, oldDate?: string }) => {
      if (!data.row || !data.field) return;
      if (data.socketId === socket.id) return;

      if (data.field === 'date') {
        const currentDate = formatDate(date);
        const oldDate = data.oldDate ? formatDate(data.oldDate) : null;
        const newDate = formatDate(data.row.date);

        if (currentDate === oldDate || currentDate === newDate) {
          refetch();
        }
        return;
      }

      if (formatDate(date) !== formatDate(data.row.date)) return;

      setEditingUser({ id: data.row.id, field: data.field, user: data.user });

      if (data.field === 'shipVia') {
        refetch();
        return;
      }

      queryClient.setQueryData<ShippingListSection[]>(['sections', formatDate(date)], (currentSections = []) => {
        return currentSections.map((section) => ({
          ...section,
          rows: section.rows.map((row) =>
            row.id === data.row!.id
              ? {
                  ...row,
                  [data.field!]: data.field === 'weightDims'
                    ? data.row!.weightDims
                      ? parseWeightDims(data.row!.weightDims.toString())
                      : []
                    : data.row![data.field!]
                }
              : row
          )
        }));
      });

      if (data.field === 'weightDims') {
        setWeightDimsVersion((version) => version + 1);
      }
    };

    const onRefreshShippingList = (data: { date: string, socketId: string }) => {
      if (data.socketId === socket.id) return;
      if (formatDate(date) !== formatDate(data.date)) return;
      refetch();
    };

    onServerEvent('EDIT_SHIPPING_LIST', onEditShippingList);
    onServerEvent('REFRESH_SHIPPING_LIST', onRefreshShippingList);

    return () => {
      offServerEvent('EDIT_SHIPPING_LIST', onEditShippingList);
      offServerEvent('REFRESH_SHIPPING_LIST', onRefreshShippingList);
    };
  }, [date, refetch, queryClient]);

  useEffect(() => {
    if (!editingUser) return;

    const timeout = setTimeout(() => {
      setEditingUser(null);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [editingUser]);

  useAutoSave(editedRow, async (edited) => {
    if (!edited) return;
    await editShippingList(edited.row, edited.field);
  }, { delay: 0 });

  useAutoSave(shipViaEdit, async (edited) => {
    if (!edited) return;

    await editShippingList(edited.row, edited.field);
    await refetch();

    requestAnimationFrame(() => {
      const input = document.querySelector<HTMLInputElement>(`[data-ship-via-id="${edited.row.id}"]`);
      input?.focus();
      input?.setSelectionRange(input.value.length, input.value.length);
    });
  }, { delay: 500 });

  const onClickChangeWeek = () => {
    const days = week === 'Next' ? -7 : 7;

    setDate((currentDate) => {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + days);
      return newDate;
    });

    setWeek((currentWeek) => currentWeek === 'Next' ? 'Current' : 'Next');
  };

  const onClickChangeDate = (dayName: string) => {
    const dayMap: Record<string, number> = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5 };
    const targetDay = dayMap[dayName];
    if (targetDay === undefined) return;

    setDate((currentDate) => {
      const newDate = new Date(currentDate);
      const currentDay = newDate.getDay();

      const sunday = new Date(newDate);
      sunday.setDate(newDate.getDate() - currentDay);
      sunday.setDate(sunday.getDate() + targetDay);

      return sunday;
    });
  };

  const onEditRow = (id: number, field: keyof ShippingListRow, value: unknown) => {
    queryClient.setQueryData<ShippingListSection[]>(['sections', formatDate(date)], (currentSections = []) => {
      const newSections = currentSections.map((section) => ({
        ...section,
        rows: section.rows.map((row) =>
          row.id === id
            ? { ...row, [field]: value }
            : row
        )
      }));

      const row = newSections
        .flatMap((section) => section.rows)
        .find((row) => row.id === id);

      if (row) {
        if (field === 'shipVia') {
          setShipViaEdit({ row, field });
        } else {
          setEditedRow({ row, field });
        }
      }

      return newSections;
    });
  };

  const onClickSaveList = async () => {
    if (!await confirm('Create backup for current week?')) return;
    
    const res = await exportShippingList(data, new Date());
    if (!res) return;

    const args = { name: res.name, path: res.path };
    await invoke('backup_shipping_list', { args });
  };

  const onEditWeightDims = async (row: ShippingListRow, weightDims: WeightDims[]) => {
    await editShippingList({ ...row, weightDims }, 'weightDims');

    queryClient.setQueryData<ShippingListSection[]>(['sections', formatDate(date)], (currentSections = []) => {
      return currentSections.map((section) => ({
        ...section,
        rows: section.rows.map((currentRow) =>
          currentRow.id === row.id
            ? { ...currentRow, weightDims }
            : currentRow
        )
      }));
    });
  };

  const weightDimsRow = data
    .flatMap((section) => section.rows)
    .find((row) => row.id === weightDimsEditId);


  return (
    <Layout title="Shipping List">
      {moveRow &&
        <MoveShippingListRowDialog
          row={moveRow}
          setRow={setMoveRow}
          refetch={refetch}
        />
      }

      {weightDimsRow &&
        <EditWeightDimsDialog
          key={`${weightDimsRow.id}-${weightDimsVersion}`}
          row={weightDimsRow}
          setRow={setWeightDimsEditId}
          onEditWeightDims={onEditWeightDims}
        />
      }

      <div className="shipping-list">
        <div className="shipping-list__top-right-buttons">
          <Button variant={['link']}>
            <a href={`/presentation?date=${date}`}>
              <img alt="tv" src="/images/icons/tv.svg" draggable={false} />
            </a>
          </Button>
          <Button onClick={onClickSaveList}>
            <img alt="save" src="/images/icons/save.svg" draggable={false} />
          </Button>
          <Button variant={['link']} className="shipping-list__system-btn">
            <a href="/system">
              <img alt="System" src="/images/icons/gear.svg" draggable={false} />
            </a>
          </Button>
        </div>

        <div className="shipping-list__top-buttons">
          <Button onClick={onClickChangeWeek}>{ week } Week</Button> |

          <div className="shipping-list__date-buttons">
            <Button style={getDay(date) === 'Monday' ? { color: 'var(--yellow-2)' } : {}} onClick={() => onClickChangeDate('Monday')}>
              Monday
            </Button>
            <Button style={getDay(date) === 'Tuesday' ? { color: 'var(--yellow-2)' } : {}} onClick={() => onClickChangeDate('Tuesday')}>
              Tuesday
            </Button>
            <Button style={getDay(date) === 'Wednesday' ? { color: 'var(--yellow-2)' } : {}} onClick={() => onClickChangeDate('Wednesday')}>
              Wednesday
            </Button>
            <Button style={getDay(date) === 'Thursday' ? { color: 'var(--yellow-2)' } : {}} onClick={() => onClickChangeDate('Thursday')}>
              Thursday
            </Button>
            <Button style={getDay(date) === 'Friday' ? { color: 'var(--yellow-2)' } : {}} onClick={() => onClickChangeDate('Friday')}>
              Friday
            </Button>
          </div>
        </div>

        <h2 style={{ marginBottom: '0.3rem', textAlign: 'center' }}>
          Shipping List ({ getDay(date) } { formatDate(date) })
        </h2>
        
        <ShippingListTableEdit
          sections={data}
          onEditRow={onEditRow}
          editingUser={editingUser}
          refetch={refetch}
          setMoveRow={setMoveRow}
          onEditWeightDims={setWeightDimsEditId}
        />
      </div>
    </Layout>
  );
}
