import { Link } from "react-router-dom";
import { ChevronLeft, Download } from "lucide-react";

const UserManagement = () => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/admin"
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft size={16} />
          Back to Dashboard
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-900 text-white rounded-lg">
          <Download size={16} />
          Export
        </button>
      </div>
    </div>
  );
};

export default UserManagement;
