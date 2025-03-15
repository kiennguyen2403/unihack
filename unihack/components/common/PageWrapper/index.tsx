"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import PageFooter from "./Footer";
import PageHeader from "./Header";
import NavigationBar from "./Header/NavigationBar";

const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={store}>
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
      {["/", "/user"].includes(window.location.pathname) && <PageFooter />}
    </Provider>
  );
};

export default PageWrapper;
