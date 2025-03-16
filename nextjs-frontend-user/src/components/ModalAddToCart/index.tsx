"use client";

import React, { useEffect } from "react";
import { Modal, Box, Typography, Button } from "@mui/material";
import "../../styles/breadcumb.css";

interface AddedToCartModalProps {
  isVisible: boolean; // Trạng thái hiển thị modal
  onClose: () => void; // Hàm đóng modal
}

const ModalAddToCart: React.FC<AddedToCartModalProps> = ({
  isVisible,
  onClose,
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 2000); // Tự động đóng modal sau 3 giây
      return () => clearTimeout(timer); // Clear timeout khi component bị unmount
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null; // Không render nếu modal không hiển thị

  return (
    <div>
      <Modal open={isVisible} onClose={onClose} aria-labelledby="modal-title">
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography
            id="modal-title"
            variant="h6"
            component="h2"
            color="success.main"
            gutterBottom
          >
            Thêm vào giỏ hàng thành công!
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Sản phẩm đã được thêm vào giỏ hàng của bạn. Bạn có thể tiếp tục mua
            sắm hoặc kiểm tra giỏ hàng.
          </Typography>
          <Box display="flex" justifyContent="space-between">
            <Button variant="outlined" color="primary" onClick={onClose}>
              Tiếp tục mua sắm
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                onClose();
                window.location.href = "/cart"; // Điều hướng đến trang giỏ hàng
              }}
            >
              Xem giỏ hàng
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default ModalAddToCart;
