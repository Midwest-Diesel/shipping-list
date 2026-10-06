import { ReactNode } from "react";

interface Props {
  children: ReactNode
  row: IncomingRow
  field: keyof IncomingRow
  editingUser: { id: number, field: keyof IncomingRow, user: string } | null
}


export default function IncomingRowInput({ children, row, field, editingUser }: Props) {
  const isEditing = editingUser?.id === row.id && editingUser?.field === field;


  return (
    <div style={{ position: 'relative' }}>
      {isEditing && (
        <span className="shipping-list__editing-user">
          { editingUser?.user }
        </span>
      )}

      { children }
    </div>
  );
}
