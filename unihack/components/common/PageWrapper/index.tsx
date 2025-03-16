"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import PageFooter from "./Footer";
import PageHeader from "./Header";
import NavigationBar from "./Header/NavigationBar";
import MeetingsHistory from "@/app/user/MeetingsHistory";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation"; // Use Next.js's router

const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(true);
  const pathname = usePathname(); // Get current route safely

  const isUserPage = pathname === "/user";

  useEffect(() => {
    setCollapsed(true);
  }, [pathname]);

  // TODO: fethcmeetings
  // useEffect(() => {
  //   const fetchMeetings = async () => {
  //     const meetings = await getMeetings();
  //     setMeetings(meetings);
  //   };
  //   fetchMeetings();
  // }, []);

  return (
    <Provider store={store}>
      {isUserPage && (
        <MeetingsHistory collapsed={collapsed} setCollapsed={setCollapsed} />
      )}

      <div
        className={`${!collapsed ? "pl-[300px]" : isUserPage ? "pl-[40px]" : ""}`}
      >
        <PageHeader>
          <NavigationBar />
        </PageHeader>
        <main className="min-h-screen flex flex-col items-center">
          <div className="flex-1 w-full flex flex-col gap-20 items-center">
            <div className="flex flex-col gap-20 p-3 w-full justify-center items-center">
              {children}
            </div>
          </div>
        </main>
        {["/", "/user"].includes(pathname) && <PageFooter />}
      </div>
    </Provider>
  );
};

export default PageWrapper;
