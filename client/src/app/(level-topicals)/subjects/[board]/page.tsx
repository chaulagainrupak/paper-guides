import { redirect } from "next/navigation";

export default function BoardPage({ params }: { params: { board: string } }) {
  const board = params.board.toLowerCase();

  if (board === "neb") {
    redirect(`/pastpapers`);
  }

  return null; 
}
