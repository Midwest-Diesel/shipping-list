import { Layout } from "../components/Layout";
import { Button } from "@midwest-diesel/mwd-ui";
import MoveShippingListRowDialog from "../components/shippingList/dialogs/MoveShipppingListRowDialog";
import ShippingListTableEdit from "../components/shippingList/ShippingListTableEdit";
import useAutoSave from "@/hooks/useAutoSave";
import { shippingListDayAtom, shippingListWeekAtom, userAtom } from "../scripts/atoms/state";
import { confirm, invoke } from "../scripts/config/tauri";
import { offServerEvent, onServerEvent, socket } from "@/scripts/config/websockets";
import { exportShippingList } from "@/scripts/logic/shippingList";
import { addShippingListRow, editShippingList, getShippingList } from "@/scripts/services/shippingListService";
import { formatDate, formatWeightDims, getDay, parseWeightDims } from "@/scripts/tools/stringUtils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import EditWeightDimsDialog from "../components/shippingList/dialogs/EditWeightDimsDialog";
import { useTooltip } from "@/hooks/useTooltip";
import EditPartWeightDimsDialog from "@/components/shippingList/dialogs/EditPartWeightDimsDialog";
import { editWeightDims } from "@/scripts/services/partsService";


export default function Home() {
  const [user] = useAtom<User>(userAtom);
  const [week, setWeek] = useAtom<'Current' | 'Next'>(shippingListWeekAtom);
  const [date, setDate] = useAtom(shippingListDayAtom);
  const [editedRow, setEditedRow] = useState<{ row: ShippingListRow, field: keyof ShippingListRow } | null>(null);
  const [shipViaEdit, setShipViaEdit] = useState<{ row: ShippingListRow, field: 'shipVia' } | null>(null);
  const [editingUser, setEditingUser] = useState<{ id: number, field: keyof ShippingListRow, user: string } | null>(null);
  const [weightDimsEditId, setWeightDimsEditId] = useState<number | null>(null);
  const [partWeightDimsEditId, setPartWeightDimsEditId] = useState<number | null>(null);
  const [weightDimsVersion, setWeightDimsVersion] = useState(0);
  const [moveRow, setMoveRow] = useState<ShippingListRow | null>(null);
  const [focusShipViaId, setFocusShipViaId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const tooltip = useTooltip();

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

    const onRefreshShippingList = (data?: { date: string, socketId: string }) => {
      if (data?.socketId === socket.id) return;
      if (data?.date && formatDate(date) !== formatDate(data?.date)) return;
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

  useEffect(() => {
    if (focusShipViaId === null) return;

    requestAnimationFrame(() => {
      const input = document.querySelector<HTMLInputElement>(`[data-ship-via-id="${focusShipViaId}"]`);
      input?.focus();
    });

    setFocusShipViaId(null);
  }, [data, focusShipViaId]);

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

    const monday = new Date(date);
    const day = monday.getDay();
    monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));

    const dates = Array.from({ length: 5 }, (_, index) => {
      const currentDate = new Date(monday);
      currentDate.setDate(monday.getDate() + index);
      return currentDate;
    });

    const sections = (await Promise.all(
      dates.map((date) => getShippingList(date))
    )).flat();

    const res = await exportShippingList(sections, date);
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

  const onEditPartWeightDims = async (partNum: string, weightDims: WeightDims[]) => {
    await editWeightDims(partNum, formatWeightDims(weightDims));

    await queryClient.invalidateQueries({
      queryKey: ['isMissingWeightDims', partNum]
    });
    await queryClient.invalidateQueries({
      queryKey: ['partInfo', partNum]
    });
  };

  const onClickAddRow = async () => {
    const newRow = {
      handwrittenId: null,
      date,
      createdBy: user.initials,
      shipVia: '',
      customer: '',
      shipToContact: null,
      partNum: null,
      desc: null,
      stockNum: null,
      location: null,
      mp: 0,
      br: 0,
      cap: 0,
      fl: 0,
      marketingContact: null,
      pulled: false,
      packaged: false,
      gone: false,
      ready: false,
      weightDims: '',
      scheduled: null,
      isBlind: false,
      isMissingPartPhotos: false
    }

    const id = await addShippingListRow(newRow);
    setFocusShipViaId(id);
    refetch();
  };

  const weightDimsRow = data
    .flatMap((section) => section.rows)
    .find((row) => row.id === weightDimsEditId);

  const partWeightDimsRow = data
    .flatMap((section) => section.rows)
    .find((row) => row.id === partWeightDimsEditId);


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
          key={`weight-${weightDimsRow.id}-${weightDimsVersion}`}
          row={weightDimsRow}
          setRow={setWeightDimsEditId}
          onEditWeightDims={onEditWeightDims}
        />
      }

      {partWeightDimsRow &&
        <EditPartWeightDimsDialog
          key={`part-weight-${partWeightDimsRow.id}-${weightDimsVersion}`}
          row={partWeightDimsRow}
          setRow={setPartWeightDimsEditId}
          onEditPartWeightDims={onEditPartWeightDims}
        />
      }

      <div className="shipping-list">
        <div className="shipping-list__top-right-buttons">
          {user.type !== 'shop' &&
            <Button
              variant={['link']}
              onMouseEnter={() => tooltip.set('Presentation')}
              onMouseLeave={() => tooltip.set('')}
            >
              <a href={`/presentation?date=${date}`}>
                <img alt="TV" src="/images/icons/tv.svg" draggable={false} />
              </a>
            </Button>
          }

          <Button
            onClick={onClickAddRow}
            onMouseEnter={() => tooltip.set('Add Row')}
            onMouseLeave={() => tooltip.set('')}
          >
            <img alt="Add" src="/images/icons/plus.svg" draggable={false} />
          </Button>

          {user.type !== 'shop' &&
            <Button
              onClick={onClickSaveList}
              onMouseEnter={() => tooltip.set('Backup')}
              onMouseLeave={() => tooltip.set('')}
            >
              <img alt="Save" src="/images/icons/save.svg" draggable={false} />
            </Button>
          }

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
          onEditWeightDims={(id) => {
            setPartWeightDimsEditId(null);
            setWeightDimsEditId(id);
          }}
          onEditPartWeightDims={(id) => {
            setWeightDimsEditId(null);
            setPartWeightDimsEditId(id);
          }}
        />
      </div>
    </Layout>
  );
}
