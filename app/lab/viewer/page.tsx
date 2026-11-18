import { redirect } from "next/navigation";
import { sculptures } from "@/lib/sculptures";
import { catalogueOrder, groupByForm } from "@/lib/catalogue-order";

// /lab/viewer opens the first work in the viewing room.
export default function ViewingRoomIndex() {
  redirect(`/lab/viewer/${groupByForm(catalogueOrder(sculptures))[0].slug}`);
}
