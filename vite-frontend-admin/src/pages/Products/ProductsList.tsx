import React, { useCallback, useEffect, useState } from 'react';
import useTitle from '../../hooks/useTitle';
import {
  Typography,
  Image,
  Table,
  Popconfirm,
  message,
  Pagination,
  Form,
  Input,
  Select,
  Flex,
  Tooltip,
  Skeleton,
  Modal,
  Card,
} from 'antd';
import { SETTINGS } from '../../constants/settings';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@material-tailwind/react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { TbZoom } from 'react-icons/tb';
import Confetti from 'react-confetti';
import { useConfetti } from '../../context/ConfettiContext';
import ProductSkeleton from '../../components/ProductSkeleton';
import '../../styles/ProductList.css';
interface IProduct {
  _id?: string;
  product_name: string;
  price: number;
  discount: number;
  category: {
    _id?: string;
    category_name: string;
  };
  brand: {
    _id?: string;
    brand_name: string;
  };
  description: string;
  photos: string[];
  stock: number;
  slug: string;
  order: number;
  isBest: boolean;
  isRecentlyAdded: boolean;
  isShowHome: boolean;
  isDelete: boolean;
}
interface ICategory {
  _id?: string;
  category_name: string;
}
interface IBrand {
  _id?: string;
  brand_name: string;
}

const { Title } = Typography;
const { Option } = Select;
const ProductList: React.FC = () => {
  useTitle('Topzone - Products List');

  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const defaultLimit = 10;
  const limit_str = params.get('limit');
  const limit = limit_str ? parseInt(limit_str) : defaultLimit;

  const page_str = params.get('page');
  const page = page_str ? parseInt(page_str) : 1;

  const category_str = params.get('category');
  const category_id = category_str ? category_str : null;

  const brand_str = params.get('brand');
  const brand_id = brand_str ? brand_str : null;

  const keyword_str = params.get('keyword');
  const keyword = keyword_str ? keyword_str : null;

  const [sort, setSort] = useState<string | null>(params.get('sort') || null);
  const [order, setOrder] = useState<string | null>(
    params.get('order') || null
  );
  const [filteredProducts, setFilteredProducts] = useState<IProduct[]>([]);

  const [currentPage, setCurrentPage] = useState(page);
  const [formSearch] = Form.useForm();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [brands, setBrands] = useState<IBrand[]>([]);
  const { showConfetti } = useConfetti();

  // State for modal visibility and product details
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewDetails, setViewDetails] = useState<IProduct | null>(null);
  const [loadingView, setLoadingView] = useState<boolean>(true);

  const fetchProducts = useCallback(async () => {
    let url = `${SETTINGS.URL_API}/v1/products?`;

    if (category_id) url += `category=${category_id}&`;
    if (keyword) url += `keyword=${keyword}&`;
    if (brand_id) url += `brand=${brand_id}&`;
    if (sort) url += `sort=${sort}&`;
    if (order) url += `order=${order}&`;

    url += `page=${page}&limit=${limit}`;

    const res = await axios.get(url);
    return res.data.data;
  }, [keyword, page, limit, category_id, brand_id, sort, order]);

  const getProducts = useQuery({
    queryKey: [
      'products',
      page,
      category_id,
      brand_id,
      keyword,
      limit,
      sort,
      order,
    ],
    queryFn: fetchProducts,
  });

  // ========== Delete product ==========
  const queryClient = useQueryClient();

  const fetchDeleteProduct = async (id: string) => {
    const url = `${SETTINGS.URL_API}/v1/products/${id}`;
    const res = await axios.delete(url);
    return res.data;
  };

  const deleteMutationProduct = useMutation({
    mutationFn: fetchDeleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['products', page],
      });
      messageApi.open({
        type: 'success',
        content: 'Xóa sản phẩm thành công',
      });
    },
    onError: (error) => {
      console.error('Lỗi khi xóa sản phẩm:', error);
      messageApi.open({
        type: 'error',
        content: 'Xóa sản phẩm thất bại',
      });
    },
  });

  // ========== Fetch categories & brands ==========
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(
          `${SETTINGS.URL_API}/v1/categories?page=1&limit=200`
        );
        setCategories(res.data.data?.categories_list || []);
      } catch (error) {
        console.error('Lỗi khi lấy danh mục', error);
        setCategories([]);
      }
    };

    const fetchBrands = async () => {
      try {
        const res = await axios.get(
          `${SETTINGS.URL_API}/v1/brands?page=1&limit=200`
        );
        setBrands(res.data.data?.brands_list || []);
      } catch (error) {
        console.error('Lỗi khi lấy thương hiệu', error);
      }
    };
    fetchCategories();
    fetchBrands();
  }, []);

  // ========== Handle view details product ==========
  const fetchProductDetails = async (slug: string) => {
    const response = await axios.get(
      `${SETTINGS.URL_API}/v1/products/slug/${slug}`
    );
    return response.data.data;
  };

  const handleViewDetails = async (product: any) => {
    const data = await fetchProductDetails(product.slug);
    setViewDetails(data);
    setIsModalOpen(true);
    setLoadingView(true);

    setTimeout(() => {
      setLoadingView(false);
    }, 1000);
  };

  console.log('View Data Product:', viewDetails);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setViewDetails(null);
  };

  // Column table products
  const columns = [
    {
      title: 'Photo',
      dataIndex: 'photos',
      key: 'photos',
      render: (photos: string[], record: IProduct) => {
        return (
          <Tooltip title={record.product_name}>
            <Image
              style={{
                width: '120px',
                height: '120px',
                objectFit: 'contain',
                borderRadius: '10px', // Bo góc 10px
              }}
              src={
                photos?.length
                  ? `${SETTINGS.URL_IMAGE}/${photos[0]}`
                  : '/images/noimage.jpg'
              }
              alt={record.product_name}
            />
          </Tooltip>
        );
      },
      width: '15%',
    },

    {
      title: 'Product Name',
      dataIndex: 'product_name',
      key: 'product_name',
      render: (text: string) => (
        <span className="line-clamp-2 w-64">{text}</span>
      ),
    },
    {
      title: 'Category Name',
      dataIndex: 'category',
      key: 'category',
      render: (_: any, record: IProduct) => (
        <span>{record.category.category_name}</span>
      ),
    },
    {
      title: 'Brand Name',
      dataIndex: 'brand',
      key: 'brand',
      render: (_: any, record: IProduct) => (
        <span>{record.brand?.brand_name}</span>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      // sorter: true,
      render: (_: any, record: IProduct) => (
        <span>
          {/* {record.price.toLocaleString('vi-VN', {
            style: 'currency',
            currency: 'VND',
          })} */}
          {record.price != null
            ? record.price.toLocaleString('vi-VN', {
                style: 'currency',
                currency: 'VND',
              })
            : 'Đang cập nhật...'}
        </span>
      ),
    },
    {
      title: 'Discount',
      dataIndex: 'discount',
      key: 'discount',
      render: (text: string) => <span>{text}%</span>,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: 'Order',
      dataIndex: 'order',
      key: 'order',
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: IProduct) => (
        <div>
          {/* Nút View */}
          <button
            onClick={() => handleViewDetails(record)}
            style={{ marginRight: 9 }}
          >
            <EyeIcon className="h-6 w-6 text-gray-500 hover:text-sky-500" />
          </button>

          {/* Nút Edit */}
          <button
            onClick={() => navigate(`/product/edit/${record._id}`)}
            style={{ marginRight: 8 }}
          >
            <PencilSquareIcon className="h-6 w-6 text-gray-500 hover:text-yellow-500" />
          </button>

          {/* Nút Delete với Popconfirm */}
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa sản phẩm này?"
            onConfirm={() => deleteMutationProduct.mutate(record._id!)}
            okText="Xóa"
            cancelText="Không"
          >
            <button>
              <TrashIcon className="h-6 w-6 text-gray-500 hover:text-rose-500" />
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const totalRecords = getProducts?.data?.pagination?.totalRecords || 0;
  const start = totalRecords > 0 ? (page - 1) * limit + 1 : 0;
  const end = totalRecords > 0 ? Math.min(start + limit - 1, totalRecords) : 0;

  useEffect(() => {
    setCurrentPage(page);
  }, [page, params]);

  const onFinishSearch = (values: {
    keyword?: string;
    category?: string;
    brand?: string;
  }) => {
    console.log(values);
    const { keyword, category, brand } = values;

    const queryString = [
      keyword ? `keyword=${keyword.trim()}` : '',
      category ? `category=${category}` : '',
      brand ? `brand=${brand}` : '',
    ]
      .filter(Boolean)
      .join('&');

    navigate(`/product/list${queryString ? `?${queryString}` : ''}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value;

    // Nếu ô tìm kiếm trống, quay lại trang danh sách mà không có tham số tìm kiếm
    if (!keyword.trim()) {
      navigate('/product/list');
    }
  };

  const handleSortChange = (value: string) => {
    const [newSort, newOrder] = value.split(',');
    setSort(newSort);
    setOrder(newOrder);

    // Reset page to 1 when changing sort
    const queryParams = new URLSearchParams(params);
    if (newSort && newOrder) {
      // Convert sort value to match API format
      let sortValue = '';
      if (newSort === 'price') {
        sortValue =
          newOrder === 'asc' ? 'gia-thap-den-cao' : 'gia-cao-den-thap';
      }
      queryParams.set('sort', sortValue);
    } else {
      queryParams.delete('sort');
    }
    queryParams.set('page', '1');
    navigate(`/product/list?${queryParams.toString()}`);
  };

  useEffect(() => {
    if (!getProducts.data) return;
    setFilteredProducts(getProducts.data.products_list);
  }, [getProducts.data]);

  return (
    <>
      {contextHolder}
      {showConfetti && (
        <Confetti width={window.innerWidth} height={window.innerHeight} />
      )}
      <Title level={2}>Danh sách sản phẩm</Title>
      <Flex className="my-10" justify="space-between" align="center">
        {/* Bộ lọc & Tìm kiếm */}
        <Flex align="center" gap="10px">
          <Form
            layout="inline"
            autoComplete="on"
            form={formSearch}
            onFinish={onFinishSearch}
          >
            <Form.Item name="keyword">
              <Input
                onChange={handleSearchChange}
                placeholder="Tìm kiếm tên sản phẩm..."
                style={{
                  width: 250,
                  borderRadius: '4px',
                  padding: '9px 12px',
                  border: '1px solid #d9d9d9',
                  height: 42, // ✅ Đảm bảo cùng chiều cao
                }}
              />
            </Form.Item>
            <Form.Item name="category">
              <Select
                allowClear
                placeholder="Tìm kiếm danh mục"
                style={{ width: 200, height: 42 }} // ✅ Đảm bảo cùng chiều cao
              >
                {categories.length > 0 ? (
                  categories.map((category: ICategory) => (
                    <Option key={category._id} value={category._id}>
                      {category.category_name}
                    </Option>
                  ))
                ) : (
                  <Option value="">Không có danh mục...</Option>
                )}
              </Select>
            </Form.Item>
            <Form.Item name="brand">
              <Select
                style={{ width: 200, height: 42 }} // ✅ Đảm bảo cùng chiều cao
                placeholder="Tìm kiếm thương hiệu"
                allowClear
              >
                {brands.length > 0 ? (
                  brands.map((brand: IBrand) => (
                    <Option key={brand._id} value={brand._id}>
                      {brand.brand_name}
                    </Option>
                  ))
                ) : (
                  <Option value="">Không có thương hiệu...</Option>
                )}
              </Select>
            </Form.Item>
            <Form.Item>
              <Tooltip title="Tìm kiếm">
                <Button
                  type="submit"
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                  placeholder=""
                  style={{
                    padding: '0px 20px',
                    height: 42, // ✅ Đảm bảo cùng chiều cao
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '20px',
                    background: '#212121',
                    color: '#fff',
                  }}
                >
                  <TbZoom />
                </Button>
              </Tooltip>
            </Form.Item>
          </Form>
        </Flex>

        {/* Sort & Add Product */}
        <Flex align="center" gap="10px">
          <Form.Item name="sort" style={{ marginBottom: 0 }}>
            <Select
              value={sort && order ? `${sort},${order}` : ''}
              onChange={handleSortChange}
              style={{ width: 200, height: 42 }}
            >
              <Option value="">Sắp xếp theo giá</Option>
              <Option value="price,asc">Giá thấp → cao</Option>
              <Option value="price,desc">Giá cao → thấp</Option>
            </Select>
          </Form.Item>
          <Link to={'/product/add'}>
            <Button
              variant="gradient"
              size="md"
              color="gray"
              placeholder={false}
              onPointerEnterCapture={false}
              onPointerLeaveCapture={false}
              className="flex items-center gap-x-2 px-7 py-4"
              style={{ height: 42 }} // ✅ Đảm bảo cùng chiều cao
            >
              <PlusIcon className="h-5 w-5 text-white" /> THÊM SẢN PHẨM
            </Button>
          </Link>
        </Flex>
      </Flex>

      {getProducts.isLoading ? (
        <ProductSkeleton />
      ) : (
        <Table
          columns={columns}
          dataSource={filteredProducts}
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

      {/* Showing entries */}
      <div
        className="pagination mt-5"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
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
            {totalRecords}
          </span>{' '}
          entries
        </div>

        {getProducts?.data?.pagination.totalRecords >
          getProducts?.data?.pagination.limit && (
          <Pagination
            current={currentPage}
            onChange={(newPage) => {
              navigate(`/product/list?page=${newPage}`);
            }}
            total={getProducts?.data?.pagination.totalRecords || 0}
            pageSize={getProducts?.data?.pagination.limit}
          />
        )}
      </div>

      {/* Modal view details product */}
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
              <Title level={4}>Product Details</Title>
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
                    src={`${SETTINGS.URL_IMAGE}/${viewDetails.photos[0]}`}
                    alt={viewDetails.product_name}
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
                    {viewDetails.product_name ? (
                      viewDetails.product_name
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
                    <strong>Category :</strong>{' '}
                    {viewDetails.category?.category_name ? (
                      viewDetails.category.category_name
                    ) : (
                      <span style={{ color: 'red' }}>N/A</span>
                    )}
                  </p>
                  <p>
                    <strong>Brand :</strong>{' '}
                    {viewDetails.brand?.brand_name ? (
                      viewDetails.brand.brand_name
                    ) : (
                      <span style={{ color: 'red' }}>N/A</span>
                    )}
                  </p>
                  <p>
                    <strong>Price :</strong>{' '}
                    {viewDetails.price ? (
                      viewDetails.price.toLocaleString('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      })
                    ) : (
                      <span style={{ color: 'red' }}>N/A</span>
                    )}
                  </p>
                  <p>
                    <strong>Discount :</strong>{' '}
                    {viewDetails.discount ? (
                      `${viewDetails.discount}%`
                    ) : (
                      <span style={{ color: 'red' }}>N/A</span>
                    )}
                  </p>
                  <p>
                    <strong>Stock :</strong>{' '}
                    {viewDetails.stock ? (
                      viewDetails.stock
                    ) : (
                      <span style={{ color: 'red' }}>N/A</span>
                    )}
                  </p>
                  <p>
                    <strong>Order :</strong>{' '}
                    {viewDetails.order ? (
                      viewDetails.order
                    ) : (
                      <span style={{ color: 'red' }}>N/A</span>
                    )}
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

export default ProductList;
