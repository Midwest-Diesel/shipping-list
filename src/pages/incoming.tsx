import { Layout } from "@/components/Layout";
import IncomingRow from "@/components/shippingList/incoming/IncomingRow";
import useAutoSave from "@/hooks/useAutoSave";
import { shippingListIncomingAtom } from "@/scripts/atoms/state";
import { offServerEvent, onServerEvent, socket } from "@/scripts/config/websockets";
import { addIncomingRow, editIncomingRow, getIncomingRow } from "@/scripts/services/shippingListService";
import { Button, Pagination, Table } from "@midwest-diesel/mwd-ui";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";


export default function IncomingPage() {
  const [section, setSection] = useAtom<'past'| 'current'>(shippingListIncomingAtom);
  const [editedRow, setEditedRow] = useState<{ row: IncomingRow, field: keyof IncomingRow } | null>(null);
  const [editingUser, setEditingUser] = useState<{ id: number, field: keyof IncomingRow, user: string } | null>(null);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const limit = 40;

  const { data, refetch } = useQuery<{ pageCount: number, rows: IncomingRow[] } | null>({
    queryKey: ['data', section, page],
    queryFn: () => getIncomingRow({ page, limit, received: section === 'past' })
  });

  useEffect(() => {
    const onEditIncomingRow = (data: { row?: IncomingRow, field?: keyof IncomingRow, socketId: string, user: string }) => {
      if (!data.row || !data.field) return;

      if (data.field === 'received' || data.field === 'date') {
        setEditingUser({ id: data.row.id, field: data.field, user: data.user });
        refetch();
        return;
      }

      if (data.socketId === socket.id) return;

      setEditingUser({ id: data.row.id, field: data.field, user: data.user });
      refetch();
    };

    const onRefreshShippingList = (data?: { socketId: string }) => {
      if (data?.socketId === socket.id) return;
      refetch();
    };

    onServerEvent('EDIT_INCOMING_LIST', onEditIncomingRow);
    onServerEvent('REFRESH_INCOMING_LIST', onRefreshShippingList);

    return () => {
      offServerEvent('EDIT_INCOMING_LIST', onEditIncomingRow);
      offServerEvent('REFRESH_INCOMING_LIST', onRefreshShippingList);
    };
  }, [section, refetch, queryClient]);
  
  useEffect(() => {
    if (!editingUser) return;

    const timeout = setTimeout(() => {
      setEditingUser(null);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [editingUser]);


  useAutoSave(editedRow, async (edited) => {
    if (!edited) return;
    await editIncomingRow(edited.row, edited.field);
  }, { delay: 0 });

  const onEditRow = (id: number, field: keyof IncomingRow, value: unknown) => {
    queryClient.setQueryData<{ pageCount: number, rows: IncomingRow[] } | null>(
      ['data', section, page],
      (currentData) => {
        if (!currentData) return currentData;

        const rows = currentData.rows.map((row) =>
          row.id === id
            ? { ...row, [field]: value }
            : row
        );

        const row = rows.find((row) => row.id === id);

        if (row) {
          setEditedRow({ row, field });
        }

        return {
          ...currentData,
          rows
        };
      }
    );
  };

  const onClickAddRow = async () => {
    await addIncomingRow();
    refetch();
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };


  return (
    <Layout title="Incoming">
      <div className="incoming-list">
        <div className="incoming-list__top-buttons">
          <Button
            style={section === 'past' ? { color: 'var(--yellow-2)' } : {}}
            onClick={() => setSection('past')}
          >
            Past
          </Button>
          <Button
            style={section === 'current' ? { color: 'var(--yellow-2)' } : {}}
            onClick={() => setSection('current')}
          >
            Current
          </Button>
        </div>

        <div className="incoming-list__top-right-buttons">
          <Button onClick={onClickAddRow}>
            <img alt="Add" src="/images/icons/plus.svg" draggable={false} />
          </Button>
        </div>

        {data &&
          <>
            <div className="incoming-list__table-container">
              <Table>
                <thead>
                  <tr>
                    <th>Schedule Date</th>
                    <th>Picked Up</th>
                    <th>Carrier</th>
                    <th>Company</th>
                    <th>Tracking #</th>
                    <th>Received</th>
                    <th>EDD</th>
                    <th>Notes</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data?.rows.map((row) => {
                    return (
                      <IncomingRow
                        key={row.id}
                        row={row}
                        onEditRow={onEditRow}
                        editingUser={editingUser}
                        refetch={refetch}
                      />
                    );
                  })}
                </tbody>
              </Table>

              <Pagination
                data={data.rows}
                setData={handleChangePage}
                pageCount={data.pageCount}
                pageSize={limit}
                page={page}
              />
            </div>
          </>
        }
      </div>
    </Layout>
  );
}
