import React, { useCallback, useEffect, useState } from 'react';
import { SETTINGS } from '../../constants/settings';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  message,
  Table,
  Popconfirm,
  Checkbox,
  Input,
  Form,
  Flex,
  Tooltip,
  Modal,
  Card,
  Skeleton,
  Image,
  Typography,
} from 'antd';
import { Button } from '@material-tailwind/react';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import { BsTrash3 } from 'react-icons/bs';
import { FiEdit2 } from 'react-icons/fi';
import { HiOutlineEye } from 'react-icons/hi2';
import ProductSkeleton from '../../components/ProductSkeleton';
import '../../styles/BrandList.css';
import { Tag } from 'primereact/tag';
interface IBrand {
  _id: string;
  brand_name: string;
  description: string;
  thumbnail: string;
  slug: string;
  isActive: boolean;
}

interface TFilter {
  keyword: string;
}

const { Title } = Typography;

const BrandList = () => {
  const location = useLocation();
  const [params] = useSearchParams();
  const limit = 10;

  const keyword = params.get('keyword');
  const name = keyword ? keyword : null;
  const [formSearch] = Form.useForm();

  const page_str = params.get('page');
  const page = page_str ? parseInt(page_str) : 1;

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [messageApi, contextHolder] = message.useMessage();

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewDetails, setViewDetails] = useState<IBrand | null>(null);
  const [loadingView, setLoadingView] = useState<boolean>(true);

  const fetchBrands = useCallback(async () => {
    let url = `${SETTINGS.URL_API}/v1/brands?`;
    url += `page=${page}&limit=${limit}&`;
    if (name) url += `keyword=${name}&`;
    const response = await axios.get(url);
    return response.data.data;
  }, [name, page, limit]);

  const getAllBrand = useQuery({
    queryKey: ['brands', page, name, limit],
    queryFn: fetchBrands,
  });

  const fetchDeleteBrand = async (id: string) => {
    const url = `${SETTINGS.URL_API}/v1/brands/${id}`;
    const response = await axios.delete(url);
    return response.data.data;
  };

  const deleteBrandMutation = useMutation({
    mutationFn: fetchDeleteBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['brands'],
      });
      messageApi.open({
        type: 'success',
        content: 'Xóa thương hiệu thành công!',
      });
    },
    onError: () => {
      messageApi.open({
        type: 'error',
        content: 'Có lỗi trong quá trình xóa thương hiệu!',
      });
    },
  });

  const handleSelectChange = (e: any, _id: string) => {
    const checked = e.target.checked;
    if (checked) {
      setSelectedRowKeys([...selectedRowKeys, _id]);
    } else {
      setSelectedRowKeys(selectedRowKeys.filter((key) => key !== _id));
    }
  };

  const handleSelectAllChange = (e: any) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked && getAllBrand.data?.brands_list) {
      setSelectedRowKeys(
        getAllBrand.data.brands_list.map((record: IBrand) => record._id)
      );
    } else {
      setSelectedRowKeys([]);
    }
  };

  const handleDeleteSelected = () => {
    Swal.fire({
      title: 'Bạn có chắc chắn muốn xóa?',
      text: 'Bạn sẽ không thể hoàn tác hành động này!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Có, xóa!',
      cancelButtonText: 'Không, hủy!',
    }).then((result) => {
      if (result.isConfirmed) {
        selectedRowKeys.forEach((_id) =>
          deleteBrandMutation.mutate(String(_id))
        );
        setSelectedRowKeys([]);
        setSelectAll(false);
        Swal.fire('Đã xóa!', 'Các mục đã được xóa thành công.', 'success');
      }
    });
  };

  const columns = [
    {
      title: (
        <Checkbox
          checked={selectAll}
          onChange={handleSelectAllChange}
          indeterminate={
            selectedRowKeys.length > 0 &&
            selectedRowKeys.length <
              (getAllBrand.data?.brands_list?.length || 0)
          }
        >
          Tất cả chọn
        </Checkbox>
      ),
      key: 'select',
      render: (_: any, record: IBrand) => (
        <Checkbox
          checked={selectedRowKeys.includes(record._id)}
          onChange={(e) => handleSelectChange(e, record._id)}
        />
      ),
    },
    {
      title: 'Photo',
      dataIndex: 'thumbnail',
      key: 'thumbnail',
      render: (_: any, record: IBrand) => {
        return (
          <Image
            src={`${SETTINGS.URL_IMAGE}/${record.thumbnail}` || ''}
            alt={record.brand_name}
            style={{
              width: '100px',
              height: '100px',
              objectFit: 'contain', // Hoặc 'crop'
              borderRadius: '10px',
            }}
          />
        );
      },
    },
    {
      title: 'Brand Name',
      dataIndex: 'brand_name',
      key: 'brand_name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => {
        if (text.length > 50) {
          return text.substring(0, 100) + '...';
        }
        return text;
      },
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (_: any, record: IBrand) => (
        <Tag
          severity={record.isActive ? 'success' : 'danger'}
          style={{
            padding: '5px 12px',
          }}
          rounded
        >
          {record.isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },

    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: IBrand) => (
        <div
          style={{
            display: 'flex',
            // gap: '10px',
          }}
        >
          <button
            style={{
              background: 'transparent',
              color: '#2bace3',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '28px',
            }}
            onClick={() => handleViewDetails(record)}
          >
            <HiOutlineEye />
          </button>
          <button
            style={{
              background: 'transparent',
              color: '#2cdc1c',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '22px',
            }}
            onClick={() => navigate(`/brand/edit/${record.slug}`)}
          >
            <FiEdit2 />
          </button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa ?"
            onConfirm={() => deleteBrandMutation.mutate(record._id)}
          >
            <button
              style={{
                background: 'transparent',
                color: '#ef4472',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '22px',
              }}
            >
              <BsTrash3 />
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const onFinishSearch = (values: { keyword?: string }) => {
    console.log(values);
    const { keyword } = values;

    const queryString = [keyword ? `keyword=${keyword.trim()}` : '']
      .filter(Boolean)
      .join('&');

    navigate(`/brand/list${queryString ? `?${queryString}` : ''}`);
  };

  const onFinishFailedSearch = async (errorInfo: any) => {
    console.error('Lỗi khi tìm kiếm:', errorInfo); // Sử dụng console.error và thêm thông báo
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value;

    // Nếu ô tìm kiếm trống, quay lại trang danh sách mà không có tham số tìm kiếm
    if (!keyword.trim()) {
      navigate('/brand/list');
    }
  };

  // ========== Handle view details brand ==========
  const fetchBrandDetails = async (id: string) => {
    const url = `${SETTINGS.URL_API}/v1/brands/${id}`;
    const response = await axios.get(url);
    return response.data.data;
  };

  const handleViewDetails = async (brand: IBrand) => {
    const dataBrand = await fetchBrandDetails(brand._id);
    setViewDetails(dataBrand);
    setIsModalOpen(true);
    setLoadingView(true);

    setTimeout(() => {
      setLoadingView(false);
    }, 1000);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setViewDetails(null);
  };

  return (
    <>
      {contextHolder}
      <Flex justify="space-between" align="center" className="mb-5">
        {/* Search Form  */}
        <Form
          form={formSearch}
          name="form-search"
          onFinish={onFinishSearch}
          onFinishFailed={onFinishFailedSearch}
          autoComplete="on"
          layout="inline"
          style={{ width: '100%', marginBottom: '10px' }}
        >
          <Form.Item name="keyword">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <Input
                placeholder="Tìm kiếm thương hiệu..."
                onChange={handleSearchChange}
                style={{
                  width: 220,
                  borderRadius: '10px',
                  padding: '9px 12px',
                  border: '1px solid #d9d9d9',
                  height: 42,
                }}
              />
              <Tooltip title="Tìm kiếm">
                <Button
                  type="submit"
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                  placeholder=""
                  style={{
                    padding: '0px 15px',
                    height: 42,
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    background: '#212121',
                    color: '#fff',
                    border: 'none',
                    marginLeft: '10px', // Thêm khoảng cách giữa input và button
                  }}
                >
                  <MagnifyingGlassIcon className="h-5 w-5 text-white" />
                </Button>
              </Tooltip>
            </div>
          </Form.Item>
        </Form>
        {/* Button add new brand */}

        <Button
          variant="gradient"
          size="md"
          color="gray"
          onClick={() => navigate('/brand/add')}
          placeholder=""
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          className="btn_add_brand flex items-center gap-x-2 px-7 py-7"
          style={{ height: 42 }}
        >
          <PlusIcon className="h-5 w-5 text-white" /> add brand
        </Button>
      </Flex>

      <Button
        variant="gradient"
        size="md"
        color="red"
        onClick={handleDeleteSelected}
        style={{ display: selectedRowKeys.length === 0 ? 'none' : 'flex' }}
        className="flex items-center gap-x-2 px-7 py-4 mb-5"
        placeholder=""
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      >
        Xóa
      </Button>

      {getAllBrand.isLoading ? (
        <ProductSkeleton />
      ) : (
        <Table
          dataSource={getAllBrand.data?.brands_list || []}
          columns={columns}
          rowKey="_id"
          scroll={{ x: 'max-content' }}
          pagination={false}
          locale={{
            emptyText: (
              <span className="custom-empty-text">
                🔍 Không tìm thấy sản phẩm nào !
              </span>
            ),
          }}
        />
      )}

      {/* Modal View Details */}
      <Modal open={isModalOpen} onCancel={handleCloseModal} footer={null}>
        <Card
          bordered
          style={{
            maxWidth: 600,
            margin: '20px auto',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          {loadingView ? (
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <Skeleton
                active
                paragraph={false}
                title
                style={{
                  width: '210px',
                  margin: '0 auto',
                }}
              />
            </div>
          ) : (
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <Title level={4}>Brand Details</Title>
            </div>
          )}
          {loadingView ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              {/* Skeleton for Image */}
              <Skeleton.Image
                active
                style={{
                  width: '200px',
                  height: '150px',
                  borderRadius: '8px',
                  marginBottom: '50px',
                }}
              />

              {/* Skeleton for Text */}
              <Skeleton
                active
                paragraph={{ rows: 4 }}
                title={{ width: '60%' }}
                style={{ lineHeight: 2 }}
              />
            </div>
          ) : (
            viewDetails && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <Image
                    src={`${SETTINGS.URL_IMAGE}/${viewDetails.thumbnail}`}
                    alt={viewDetails.brand_name}
                    style={{
                      maxHeight: '200px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                    }}
                    fallback="https://via.placeholder.com/200"
                  />
                </div>
                <div style={{ lineHeight: '2', fontSize: '16px' }}>
                  <p>
                    <strong>Name :</strong>{' '}
                    {viewDetails.brand_name ? (
                      viewDetails.brand_name
                    ) : (
                      <span style={{ color: 'red' }}>N/A</span>
                    )}
                  </p>
                  <p>
                    <strong>Description :</strong>{' '}
                    {viewDetails.description ? (
                      viewDetails.description
                    ) : (
                      <span style={{ color: 'red' }}>N/A</span>
                    )}
                  </p>
                  <p>
                    <strong>Status :</strong>{' '}
                    <span
                      style={{
                        color: viewDetails.isActive ? 'green' : 'red',
                        fontWeight: 'bold',
                      }}
                    >
                      {viewDetails.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </>
            )
          )}
        </Card>
      </Modal>
    </>
  );
};

export default BrandList;
