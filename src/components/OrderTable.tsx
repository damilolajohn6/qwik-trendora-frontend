"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

interface Order {
  _id: string;
  invoiceNumber: string;
  customer: { fullname: string; email: string };
  totalAmount: number;
  status: string;
  paymentStatus: string;
}

interface OrderTableProps {
  orders: Order[];
}

export default function OrderTable({ orders }: OrderTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Total Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Payment Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order._id}>
            <TableCell>{order.invoiceNumber}</TableCell>
            <TableCell>{order.customer.fullname}</TableCell>
            <TableCell>₦{order.totalAmount.toFixed(2)}</TableCell>
            <TableCell>{order.status}</TableCell>
            <TableCell>{order.paymentStatus}</TableCell>
            <TableCell>
              <Link
                href={`/orders/${order._id}`}
                className="text-blue-500 hover:underline"
              >
                View
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
