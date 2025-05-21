import Link from "next/link";

interface Order {
  _id: string;
  invoiceNumber: string;
  customer: { fullname: string; email: string };
  totalAmount: number;
  status: string;
}

interface RecentOrdersTableProps {
  orders: Order[];
}

const RecentOrdersTable = ({ orders }: RecentOrdersTableProps) => {
  return (
    <div className="bg-white p-3 md:p-4 rounded-lg shadow overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
              Invoice
            </th>
            <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order._id}>
              <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm">
                {order.invoiceNumber}
              </td>
              <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm">
                {order.customer.fullname}
              </td>
              <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm">
                ₦{order.totalAmount.toLocaleString()}
              </td>
              <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    order.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : order.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {order.status}
                </span>
              </td>
              <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm">
                <Link
                  className="text-blue-600 hover:underline"
                  href={`/orders/${order._id}`}
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentOrdersTable;
