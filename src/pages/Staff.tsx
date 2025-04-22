import { useState, useEffect } from "react";
import { StaffResponse } from "@/types/staff.type";
import { getAllStaff, deleteStaff, updateStaffStatus } from "@/api/staff.api";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash, Eye } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { CreateStaffModal } from "@/components/modals/create-staff-modal";
import { UpdateStaffModal } from "@/components/modals/update-staff-modal";

export default function Staff() {
  const [staffMembers, setStaffMembers] = useState<StaffResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchStaffMembers();
  }, []);

  const fetchStaffMembers = async () => {
    setLoading(true);
    try {
      const data = await getAllStaff();
      setStaffMembers(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching staff:", error);
      setLoading(false);
    }
  };

  const handleAddStaff = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditStaff = (staffId: string) => {
    setSelectedStaffId(staffId);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteStaff = (staffId: string) => {
    setSelectedStaffId(staffId);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleStatus = async (
    staffId: string,
    currentStatus: boolean
  ) => {
    setStatusUpdateLoading(staffId);
    try {
      await updateStaffStatus(staffId, !currentStatus);

      // Update local state to reflect the change
      setStaffMembers((prev) =>
        prev.map((staff) =>
          staff._id === staffId ? { ...staff, status: !currentStatus } : staff
        )
      );

      toast.success(
        `Staff status updated to ${!currentStatus ? "active" : "inactive"}`
      );
    } catch (error) {
      console.error("Error updating staff status:", error);
      toast.error("Failed to update staff status");
    }
    setStatusUpdateLoading(null);
  };

  const confirmDelete = async () => {
    if (!selectedStaffId) return;

    setDeleteLoading(true);
    try {
      await deleteStaff(selectedStaffId);
      fetchStaffMembers();
      setIsDeleteDialogOpen(false);
      setSelectedStaffId(null);
      toast.success("Staff member deleted successfully");
    } catch (error) {
      console.error("Error deleting staff member:", error);
      toast.error("Failed to delete staff member");
    }
    setDeleteLoading(false);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedStaffId(null);
  };

  const handleStaffCreated = () => {
    // Refresh the staff list after successful creation
    fetchStaffMembers();
  };

  const handleStaffUpdated = () => {
    // Refresh the staff list after successful update
    fetchStaffMembers();
  };

  // Format date string for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Define columns for staff table
  const columns: ColumnDef<StaffResponse>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone Number",
      cell: ({ row }) => {
        const phoneNumber = row.getValue("phoneNumber") as string;
        return phoneNumber || "N/A";
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return (
          <Badge variant="outline" className="capitalize">
            {role}
          </Badge>
        );
      },
    },
    {
      accessorKey: "id_store",
      header: "Store",
      cell: ({ row }) => {
        const storeId = row.getValue("id_store") as string;
        // In a real implementation, you might want to fetch store details
        // or have a mapping of store IDs to names
        return storeId || "N/A";
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as boolean;
        const staffId = row.original._id;
        const isLoading = statusUpdateLoading === staffId;

        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={status}
              onCheckedChange={() => handleToggleStatus(staffId, status)}
              disabled={isLoading}
            />
            <Badge variant={status ? "default" : "secondary"}>
              {status ? "Active" : "Inactive"}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => formatDate(row.getValue("createdAt") as string),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const staff = row.original;

        return (
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleEditStaff(staff._id)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => handleDeleteStaff(staff._id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <Button onClick={handleAddStaff} className="flex items-center gap-1">
          <PlusCircle size={16} />
          <span>Add Staff</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading staff members...</p>
        </div>
      ) : (
        <div>
          <DataTable
            columns={columns}
            data={staffMembers || []}
            searchColumn="name"
            searchPlaceholder="Search by name..."
          />
          {staffMembers.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No staff members found
            </div>
          )}
        </div>
      )}

      <CreateStaffModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={handleStaffCreated}
      />

      <UpdateStaffModal
        isOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        onSuccess={handleStaffUpdated}
        staffId={selectedStaffId}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              staff member and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedStaffId(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
