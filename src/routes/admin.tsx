import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Owner Admin — FLORA" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <Outlet />,
});
