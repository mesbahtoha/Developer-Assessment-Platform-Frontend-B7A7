import { redirect } from "next/navigation";

export default function PaymentCancelledAlias() {
  redirect("/payment/cancel");
}
