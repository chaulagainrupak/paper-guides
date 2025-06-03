
import { redirect } from "next/navigation";

export default async function BoardPage( props: {  params: { board: string } }) {
  const {board} = props.params;

  if (board.toLowerCase() === "neb") {
    redirect(`/pastpapers`);
  }

}
