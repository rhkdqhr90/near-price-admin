import { Authenticated, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import {
  AuthPage,
  ErrorComponent,
  ThemedLayout,
  useNotificationProvider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import routerProvider, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { App as AntdApp } from "antd";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { ReportList } from "./pages/reports/list";
import { FaqCreate } from "./pages/faqs/create";
import { FaqEdit } from "./pages/faqs/edit";
import { FaqList } from "./pages/faqs/list";
import { FaqShow } from "./pages/faqs/show";
import { NoticeCreate } from "./pages/notices/create";
import { NoticeEdit } from "./pages/notices/edit";
import { NoticeList } from "./pages/notices/list";
import { NoticeShow } from "./pages/notices/show";
import { authProvider } from "./providers/auth";
import { dataProvider } from "./providers/data";

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <DevtoolsProvider>
              <Refine
                dataProvider={dataProvider}
                notificationProvider={useNotificationProvider}
                routerProvider={routerProvider}
                authProvider={authProvider}
                resources={[
                  {
                    name: "notice",
                    list: "/notice",
                    create: "/notice/create",
                    edit: "/notice/:id/edit",
                    show: "/notice/:id/show",
                    meta: { label: "공지사항" },
                  },
                  {
                    name: "faq",
                    list: "/faq",
                    create: "/faq/create",
                    edit: "/faq/:id/edit",
                    show: "/faq/:id/show",
                    meta: { label: "FAQ" },
                  },
                  {
                    name: "reports",
                    list: "/reports",
                    meta: { label: "신고 관리" },
                  },
                ]}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  projectId: "pn7QVe-8uVX3Y-VkK713",
                }}
              >
                <Routes>
                  <Route
                    element={
                      <Authenticated
                        key="authenticated-routes"
                        fallback={<CatchAllNavigate to="/login" />}
                      >
                        <ThemedLayout>
                          <Outlet />
                        </ThemedLayout>
                      </Authenticated>
                    }
                  >
                    <Route
                      index
                      element={<NavigateToResource resource="notice" />}
                    />
                    <Route path="/notice">
                      <Route index element={<NoticeList />} />
                      <Route path="create" element={<NoticeCreate />} />
                      <Route path=":id/edit" element={<NoticeEdit />} />
                      <Route path=":id/show" element={<NoticeShow />} />
                    </Route>
                    <Route path="/faq">
                      <Route index element={<FaqList />} />
                      <Route path="create" element={<FaqCreate />} />
                      <Route path=":id/edit" element={<FaqEdit />} />
                      <Route path=":id/show" element={<FaqShow />} />
                    </Route>
                    <Route path="/reports">
                      <Route index element={<ReportList />} />
                    </Route>
                    <Route path="*" element={<ErrorComponent />} />
                  </Route>

                  <Route
                    element={
                      <Authenticated
                        key="auth-pages"
                        fallback={<Outlet />}
                      >
                        <NavigateToResource resource="notice" />
                      </Authenticated>
                    }
                  >
                    <Route
                      path="/login"
                      element={<AuthPage type="login" />}
                    />
                  </Route>
                </Routes>
                <RefineKbar />
                <UnsavedChangesNotifier />
                <DocumentTitleHandler />
              </Refine>
              {import.meta.env.DEV && <DevtoolsPanel />}
            </DevtoolsProvider>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
