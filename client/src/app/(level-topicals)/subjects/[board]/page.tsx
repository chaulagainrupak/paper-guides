import { redirect } from "next/navigation";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ board: string }>;
}) {
  const board = (await params).board.toLowerCase();

  if (board === "neb") {
    redirect(`/pastpapers`);
  }

  return null;
}
