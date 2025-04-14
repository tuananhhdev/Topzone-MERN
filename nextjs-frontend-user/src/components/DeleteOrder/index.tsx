import { useState } from "react";
import axios from "axios";
import { SETTINGS } from "@/config/settings";
import { toast } from "react-toastify";

interface DeleteOrderProps {
  orderId: string;
  onDelete: (orderId: string) => void;
  token: string;
}

const DeleteOrder = ({ orderId, onDelete, token }: DeleteOrderProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State để mở/đóng modal
  const [selectedReason, setSelectedReason] = useState<string>("");

  // Danh sách lý do hủy
  const cancelReasons = [
    "Thay đổi địa chỉ giao hàng",
    "Thay đổi sản phẩm",
    "Thay đổi màu sắc",
    "Không cần sản phẩm nữa",
    "Giá sản phẩm không phù hợp",
    "Thời gian giao hàng quá lâu",
    "Sản phẩm không đúng mô tả",
    "Lý do cá nhân",
  ];

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReason(""); // Reset lý do khi đóng modal
  };

  const handleReasonChange = (reason: string) => {
    setSelectedReason(reason);
  };

  const handleDelete = async () => {
    if (!selectedReason) {
      toast.error("Vui lòng chọn lý do hủy đơn hàng!");
      return;
    }

    // Xác nhận trước khi xóa
    if (!confirm("Bạn có chắc chắn muốn xóa đơn hàng này?")) {
      handleCloseModal();
      return;
    }

    // Kiểm tra token trước khi gửi request
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) {
      alert("Token không hợp lệ. Vui lòng đăng nhập lại.");
      window.location.href = "/login";
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.delete(`${SETTINGS.URL_API}/v1/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          cancelReason: selectedReason, // Gửi lý do hủy trong body
        },
      });
      onDelete(orderId); // Gọi callback để cập nhật danh sách
      toast.success("Xóa đơn hàng thành công!");
      handleCloseModal();
    } catch (err: unknown) {
      const errorMessage =
        err.response?.data?.message || "Lỗi khi xóa đơn hàng";
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      {/* Nút Xóa */}
      <button
        onClick={handleOpenModal}
        disabled={loading}
        style={{
          padding: "8px 16px",
          borderRadius: "4px",
          fontSize: "14px",
          fontWeight: "bold",
          color: "#fff",
          backgroundColor: loading ? "#999" : "#e74c3c",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background-color 0.2s",
        }}
        onMouseEnter={(e) => {
          if (!loading) e.currentTarget.style.backgroundColor = "#c0392b";
        }}
        onMouseLeave={(e) => {
          if (!loading) e.currentTarget.style.backgroundColor = "#e74c3c";
        }}
      >
        {loading ? "Đang xóa..." : "Xóa"}
      </button>
      {error && (
        <p style={{ color: "#e74c3c", fontSize: "12px", marginTop: "5px" }}>
          {error}
        </p>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "8px",
              width: "400px",
              maxWidth: "90%",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "#333",
                marginBottom: "15px",
              }}
            >
              Chọn lý do hủy đơn hàng
            </h3>
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {cancelReasons.map((reason) => (
                <label
                  key={reason}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "10px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => handleReasonChange(reason)}
                    style={{ marginRight: "10px" }}
                  />
                  <span style={{ color: "#555" }}>{reason}</span>
                </label>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <button
                onClick={handleCloseModal}
                style={{
                  padding: "8px 16px",
                  borderRadius: "4px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#fff",
                  backgroundColor: "#999",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={loading || !selectedReason}
                style={{
                  padding: "8px 16px",
                  borderRadius: "4px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#fff",
                  backgroundColor:
                    loading || !selectedReason ? "#ccc" : "#e74c3c",
                  border: "none",
                  cursor:
                    loading || !selectedReason ? "not-allowed" : "pointer",
                }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteOrder;
