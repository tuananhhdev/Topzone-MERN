import React, { useCallback, useEffect, useState } from 'react';
import useTitle from '../../hooks/useTitle';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import '../../styles/CategoriesList.css';
import {
  Image,
  Table,
  Typography,
  Modal,
  Card,
  Skeleton,
  Empty,
  Pagination,
  Flex,
  Input,
  Form,
} from 'antd';
import { BsTrash3 } from 'react-icons/bs';
import { FiEdit2 } from 'react-icons/fi';
import { HiOutlineEye } from 'react-icons/hi2';
import { TbZoom } from 'react-icons/tb';
import { Button } from '@material-tailwind/react';
import { PlusIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Tag } from 'primereact/tag';
import { SETTINGS } from '../../constants/settings';
import { Link } from 'react-router-dom';

interface ICategory {
  _id: string;
  category_name: string;
  description: string;
  slug: string;
  photo: string;
  order: number;
  isActive: boolean;
}

interface TFilter {
  keyword: string;
  name: string;
  slug: string;
}

const { Title, Paragraph } = Typography;

const CategoriesList: React.FC = () => {
  useTitle('Topzone - Category List');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewDetails, setViewDetails] = useState<ICategory | null>(null);
  const [loadingView, setLoadingView] = useState<boolean>(true);
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [formSearch] = Form.useForm();

  const defaultLimit = 5;
  const limit_str = params.get('limit');
  const limit = limit_str ? parseInt(limit_str) : defaultLimit;
  const page_str = params.get('page');
  const page = page_str ? parseInt(page_str) : 1;

  const keyword = params.get('keyword');
  const name = keyword ? keyword : null;
  // ========== Fetch categories ==========
  const fetchCategories = useCallback(async () => {
    let url = `${SETTINGS.URL_API}/v1/categories?`;
    if (name) {
      url += `keyword=${name}&`;
    }

    url += `page=${page}&limit=${limit}`;
    const response = await axios.get(url);
    console.log('Dữ liệu trả về từ API:', response.data.data);
    return response.data.data;
  }, [name, page, limit]);

  useEffect(() => {
    if (location.state?.reload) {
    }
  }, [location.state, fetchCategories]);

  const getCategories = useQuery({
    queryKey: ['categories', page, name, limit],
    queryFn: fetchCategories,
  });

  // ========== Fetch delete ==========
  const queryClient = useQueryClient();

  const fetchDeleteCategory = async (slug: string) => {
    const response = await axios.delete(
      `${SETTINGS.URL_API}/v1/categories/slug/${slug}`
    );
    return response.data;
  };

  const deleteMutationCategory = useMutation({
    mutationFn: fetchDeleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['categories'],
      });
    },
    onError: (error) => {
      console.error('Error when deleting category!', error);
    },
  });

  const handleDelete = (slug: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Deleted!',
          text: 'Category name has been deleted.',
          icon: 'success',
        });
        deleteMutationCategory.mutate(slug);
      }
    });
  };

  // ========== Handle view details category ==========
  const fetchCategoryDetails = async (slug: string) => {
    const response = await axios.get(
      `http://localhost:8080/api/v1/categories/slug/${slug}`
    );
    return response.data.data;
  };

  const handleViewDetails = async (category: any) => {
    const data = await fetchCategoryDetails(category.slug);
    setViewDetails(data);
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

  // ========== Handle limit change ==========
  const handleLimitChange = (newLimit: number) => {
    // Cập nhật URL với limit mới và quay lại trang 1
    navigate(`/category/list?page=1&limit=${newLimit}`);
  };

  // ========== Handle search ==========
  // const onFinishSearch = async (values: TFilter) => {
  //   const { keyword } = values;
  //   const queryString = [keyword ? `keyword=${keyword.trim()}` : '']
  //     .filter(Boolean)
  //     .join('&');

  //   console.log('Tìm kiếm với từ khóa:', keyword);

  //   navigate(`/category/list${queryString ? `?${queryString}` : ''}`);
  // };
  const onFinishSearch = async (values: TFilter) => {
    const { keyword } = values;
    const encodedKeyword = keyword ? encodeURIComponent(keyword.trim()) : '';
    const queryString = encodedKeyword ? `keyword=${encodedKeyword}` : '';

    navigate(`/category/list${queryString ? `?${queryString}` : ''}`);
  };

  const onFinishFailedSearch = async (errorInfo: any) => {
    console.error('Lỗi khi tìm kiếm:', errorInfo); // Sử dụng console.error và thêm thông báo
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value;

    // Nếu ô tìm kiếm trống, quay lại trang danh sách mà không có tham số tìm kiếm
    if (!keyword.trim()) {
      navigate('/category/list');
    }
  };

  const loadingTable = getCategories.isLoading;

  const tableColumns = [
    {
      title: 'Name',
      dataIndex: 'category_name',
      key: 'category_name',
      width: '15%',
      render: (text: string) => (
        <span style={{ fontSize: '16px' }}>{text}</span>
      ),
    },

    {
      title: 'Photo',
      dataIndex: 'photo',
      key: 'photo',
      render: (_: any, record: ICategory) => {
        return (
          <Image
            style={{ width: '120px', height: '120px', objectFit: 'contain' }}
            src={`${SETTINGS.URL_IMAGE}/${record.photo}`}
            alt={record.category_name}
          />
        );
      },
      width: '15%',
    },

    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      // with: '10%',
      render: (text: string) => (
        <Paragraph
          style={{
            display: 'block',
            lineClamp: 2,
            maxWidth: '600px',
            fontSize: '16px',
          }}
        >
          {text}
        </Paragraph>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (_: any, record: ICategory) => (
        <Tag
          severity={record.isActive ? 'success' : 'danger'}
          style={{
            padding: '5px 12px',
          }}
          rounded
        >
          {record.isActive ? 'Enable' : 'Disable'}
        </Tag>
      ),
      width: '10%',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ICategory) => (
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
              fontSize: '30px',
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
              fontSize: '25px',
            }}
            onClick={() => navigate(`/category/edit/${record.slug}`)}
          >
            <FiEdit2 />
          </button>
          <button
            style={{
              background: 'transparent',
              color: '#ef4472',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '25px',
            }}
            onClick={() => handleDelete(record.slug)}
          >
            <BsTrash3 />
          </button>
        </div>
      ),
    },
  ];

  const start =
    getCategories?.data?.pagination?.totalRecords === 0
      ? 0
      : (page - 1) * limit + 1;

  const end = Math.min(
    start + limit - 1,
    getCategories?.data?.pagination?.totalRecords
  );

  console.log('Total records:', getCategories?.data?.pagination?.totalRecords);
  console.log('Limit:', limit);
  console.log('Page:', page);
  console.log('Start:', start);
  console.log('End:', end);

  return (
    <>
      <Title level={2} style={{ marginLeft: '70px' }}>
        Category List
      </Title>
      <div
        style={{
          maxWidth: '1500px', // Giới hạn chiều rộng chung cho cả Flex và Table
          margin: '0 auto',
          transition: 'width 0.3s',
        }}
      >
        <Flex
          className="mx-16 mt-20"
          justify="space-between"
          align="center"
          style={{
            margin: '0 auto',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Form
              form={formSearch}
              name="form-search"
              onFinish={onFinishSearch}
              onFinishFailed={onFinishFailedSearch}
              autoComplete="on"
              layout="inline" // Dùng layout inline để các phần tử nằm trên cùng một hàng
            >
              <Form.Item name="keyword">
                <Input
                  onChange={handleSearchChange}
                  placeholder="Search by category name"
                  style={{
                    width: 250,
                    marginRight: '10px',
                    borderRadius: '4px',
                    padding: '9px 12px',
                    border: '1px solid #d9d9d9',
                  }}
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="submit"
                  color="gray"
                  placeholder={undefined}
                  onPointerEnterCapture={false}
                  onPointerLeaveCapture={false}
                  style={{
                    padding: '0px 15px',
                    height: '40px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '25px',
                    background: '#212121',
                    color: '#fff',
                  }}
                >
                  <TbZoom />
                </Button>
              </Form.Item>
            </Form>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label
              style={{
                marginRight: '10px',
                fontSize: '16px',
                color: '#333',
                fontWeight: '500',
              }}
            >
              Show
            </label>
            <select
              value={limit}
              onChange={(e) => handleLimitChange(parseInt(e.target.value))}
              style={{
                padding: '6px 13px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                fontSize: '14px',
                fontWeight: '500',
                marginRight: '10px',
              }}
            >
              {[5, 10, 20, 30, 50].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <span style={{ fontSize: '16px', color: '#333' }}>entries</span>

            <Link to={'/category/add'}>
              <Button
                variant="gradient"
                size="md"
                color="gray"
                onClick={() => console.log('Button clicked')}
                placeholder={false}
                onPointerEnterCapture={false}
                onPointerLeaveCapture={false}
                className="flex items-center gap-x-2 ml-10 px-7 py-4"
              >
                <PlusIcon className="h-5 w-5 text-white" /> add category
              </Button>
            </Link>
          </div>
        </Flex>
        {loadingTable ? (
          <Skeleton
            active
            paragraph={{ rows: 6 }}
            title={{ width: '40%' }}
            style={{ padding: '20px' }}
          />
        ) : (
          <>
            <Table
              columns={tableColumns.map((col) => ({
                ...col,
                onHeaderCell: () => ({
                  style: {
                    fontSize: '17px', // Kích thước chữ
                    fontWeight: 'bold', // Độ đậm chữ
                    background: '#212121',
                    color: '#fff',
                  },
                }),
              }))}
              dataSource={getCategories.data?.categories_list || []}
              rowKey="_id"
              style={{
                maxWidth: '1500px',
                margin: '0 auto',
                marginTop: '50px',
              }}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      getCategories.isError ? (
                        <span>No data available</span> // Thông báo khi có lỗi trong fetch dữ liệu
                      ) : getCategories.data?.categories_list?.length === 0 ? (
                        <span>Không tìm thấy dữ liệu bạn tìm kiếm !</span> // Thông báo khi không có dữ liệu sau tìm kiếm
                      ) : (
                        <span></span>
                      )
                    }
                  />
                ),
              }}
              pagination={false}
            />

            <div
              className="pagination mt-5"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                // margin: '25px 50px',
              }}
            >
              <div
                className="pagination-info"
                style={{
                  fontSize: '18px',
                  color: '#333',
                  fontWeight: '500',
                }}
              >
                Showing{' '}
                <span
                  className="highlight"
                  style={{
                    color: '#2bace3',
                    fontWeight: 'bold',
                  }}
                >
                  {start}
                </span>{' '}
                -{' '}
                <span
                  className="highlight"
                  style={{
                    color: '#2bace3',
                    fontWeight: 'bold',
                  }}
                >
                  {end}
                </span>{' '}
                of{' '}
                <span
                  className="highlight"
                  style={{
                    color: '#2bace3',
                    fontWeight: 'bold',
                  }}
                >
                  {getCategories?.data?.pagination?.totalRecords}
                </span>{' '}
                entries
              </div>
              {getCategories?.data?.pagination.totalRecords > limit && (
                <Pagination
                  current={page}
                  onChange={(newPage) => {
                    navigate(`/category/list?page=${newPage}`);
                  }}
                  total={getCategories?.data?.pagination.totalRecords || 0}
                  pageSize={getCategories?.data?.pagination.limit}
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal view details category */}
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
              <Title level={4}>Category Details</Title>
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
                    src={`${SETTINGS.URL_IMAGE}/${viewDetails.photo}`}
                    alt={viewDetails.category_name}
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
                    <strong>Name :</strong> {viewDetails.category_name}
                  </p>
                  <p>
                    <strong>Description :</strong> {viewDetails.description}
                  </p>
                  <p>
                    <strong>Slug :</strong> {viewDetails.slug}
                  </p>
                  <p>
                    <strong>Order :</strong> {viewDetails.order}
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

export default CategoriesList;
