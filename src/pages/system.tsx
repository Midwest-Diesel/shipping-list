import { Layout } from "../components/Layout";
import { invoke } from "@/scripts/config/tauri";
import { getVersion } from "@tauri-apps/api/app";
import { useEffect, useState } from "react";
import { logout } from "@/scripts/services/accountService";
import { useAtom } from "jotai";
import { userAtom } from "../scripts/atoms/state";
import { cap } from "@/scripts/tools/stringUtils";
import { check } from '@tauri-apps/plugin-updater';
import { Button } from "@midwest-diesel/mwd-ui";


export default function System() {
  const [user] = useAtom<User>(userAtom);
  const [version, setVersion] = useState('0.0.0');
  const [status, setStatus] = useState('');
  const [theme, setTheme] = useState<Theme>(localStorage.getItem('theme') as Theme ?? 'dark');

  useEffect(() => {
    const fetchData = async () => {
      setVersion(await getVersion());
    };
    fetchData();
  }, []);

  const checkForUpdates = async () => {
    try {
      const update = await check();
      if (update) {
        invoke('install_update');
        setStatus('Installing update...');
        localStorage.removeItem('showUpdate');
      } else {
        setStatus('Most recent version is installed');
        setTimeout(() => setStatus(''), 2000);
      } 
    } catch (error) {
      console.error(error);
    }
  };

  const onClickChangeTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  
  return (
    <Layout title="System">
      <div className="system-page">
        <h3>v{ version }</h3>
        <p className="system-page__username">Logged in as <span>{ cap(user.username) }</span></p>
        <Button variant={['fit']} onClick={onClickChangeTheme}>{ theme === 'dark' ? 'Light' : 'Dark'} Mode</Button>
        { !status && <Button variant={['fit']} onClick={checkForUpdates}>Check For Updates</Button> }
        { status && <p className="system-page__status-text">{ status }</p> }
        
        <Button variant={['fit']} onClick={logout}>Logout</Button>
      </div>
    </Layout>
  );
}
