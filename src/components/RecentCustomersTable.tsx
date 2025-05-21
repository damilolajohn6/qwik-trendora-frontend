"use client";
import Link from "next/link";

interface Customer {
  _id: string;
  fullname: string;
  email: string;
  phoneNumber: string;
}

interface RecentCustomersTableProps {
  customers: Customer[];
}

const RecentCustomersTable = ({ customers }: RecentCustomersTableProps) => {
  return (
    <div className="bg-white p-3 md:p-4 rounded-lg shadow overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
              Phone
            </th>
            <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {customers.map((customer) => (
            <tr key={customer._id}>
              <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm">
                {customer.fullname}
              </td>
              <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm">
                {customer.email}
              </td>
              <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm">
                {customer.phoneNumber}
              </td>
              <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm">
                <Link
                  className="text-blue-600 hover:underline"
                  href={`/admin/customers/${customer._id}`}
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

export default RecentCustomersTable;
