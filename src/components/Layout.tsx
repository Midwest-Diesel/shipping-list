import React, { useEffect } from "react";
import Navbar from "./Navbar";
import { useAtom } from "jotai";
import { userAtom } from "@/scripts/atoms/state";

interface Props {
  children: React.ReactNode
  title?: string
}


export function Layout({ children, title }: Props) {
  const [user] = useAtom<User>(userAtom);
  const baseTitle = 'Shipping List';

  useEffect(() => {
    document.title = title ? `${title} | ${baseTitle}` : baseTitle;

    document.addEventListener('wheel', (e: any) => {
      if (e.target.type === 'number') {
        e.preventDefault();
      }
    }, { passive: false });
  }, []);


  return (
    <div style={{ height: '100%' }}>
      <div className="layout__container">
        <div className="layout__main-content">
          {import.meta.env.DEV &&
            <p
              style={{
                position: 'fixed',
                right: '0.2rem',
                top: '0.2rem',
                backgroundColor: 'var(--purple-1)',
                padding: '0 0.3rem 0.1rem',
                borderRadius: '0.3rem',
                color: 'white'
              }}
            >
              <strong>DEVELOPMENT</strong>
            </p>
          }

          { user.id && <Navbar /> }
          { children }
        </div>
      </div>
    </div>
  );
}
