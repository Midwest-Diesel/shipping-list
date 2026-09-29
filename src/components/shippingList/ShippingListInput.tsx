import { ReactNode } from "react";

interface Props {
  children: ReactNode
  row: ShippingListRow
  field: keyof ShippingListRow
  editingUser: { id: number, field: keyof ShippingListRow, user: string } | null
}


export default function ShippingListInput({ children, row, field, editingUser }: Props) {
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
