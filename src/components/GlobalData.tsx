import { userAtom, tooltipAtom } from "../scripts/atoms/state";
import { useAtom } from "jotai";
import { ReactNode, useEffect, useState } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { check } from "@tauri-apps/plugin-updater";
import { getUser } from "@/scripts/services/accountService";
import UpdateModal from "./UpdateModal";
import { Tooltip } from "@midwest-diesel/mwd-ui";
import Login from "@/components/Login";

interface Props {
  children: ReactNode
}


export default function GlobalData({ children }: Props) {
  const [, setUserData] = useAtom<User>(userAtom);
  const [tooltip] = useAtom<string>(tooltipAtom);
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateNotes, setUpdateNotes] = useState('');

  useEffect(() => {
    checkForUpdates();
    
    const fetchData = async () => {
      await handleGetUser();
      setLoaded(true);
    };
    fetchData();

    const handleMiddleClick = async (e: MouseEvent) => {
      if (e.button === 1) {
        const target = e.target as HTMLElement;
        const link = target.closest('a');
        if (!link) return;
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };
    document.addEventListener('auxclick', handleMiddleClick);
  
    return () => {
      document.removeEventListener('auxclick', handleMiddleClick);
    };
  }, []);

  const handleGetUser = async () => {
    const res = await getUser();
    if (!res) return;
    setUser(res);
    (setUserData as any)(res);
  };

  const checkForUpdates = async () => {
    if (!isTauri()) return;
    const update = await check();
    if (update) {
      setUpdateDialogOpen(true);
      setUpdateNotes(update.body ?? '');
    }
  };


  return (
    <>
      <UpdateModal open={updateDialogOpen} notes={updateNotes} />
      { tooltip && <Tooltip msg={tooltip} /> }
      { user ? children : loaded && <Login /> }
    </>
  );
}
