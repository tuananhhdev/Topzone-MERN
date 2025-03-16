import React, { useEffect, useState } from 'react';
import useTitle from '../../hooks/useTitle';
import {
  Button,
  Checkbox,
  Col,
  Form,
  GetProp,
  Image,
  Input,
  InputNumber,
  message,
  Radio,
  Row,
  Select,
  Typography,
  Upload,
  UploadFile,
  UploadProps,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { SETTINGS } from '../../constants/settings';
import axios from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import { PlusOutlined } from '@ant-design/icons';
import { useConfetti } from '../../context/ConfettiContext';

interface IProduct {
  _id: number;
  product_name: string;
  description: string;
  photos: string[];
  price: number;
  discount: number;
  stock: number;
  order: number;
  slug: string;
  category: {
    _id: number;
    category_name: string;
  };
  brand: {
    _id: number;
    brand_name: string;
  };
  isActive: boolean;
  isBest: boolean;
  isRecentlyAdded: boolean;
  isDelete: boolean;
  isShowHome: boolean;
}

interface ICategory {
  _id?: string;
  category_name: string;
}
interface IBrand {
  _id?: string;
  brand_name: string;
}

interface CustomUploadFile extends UploadFile {
  isOld?: boolean;
}

const { Title } = Typography;
const { Option } = Select;
type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const ProductEdit: React.FC = () => {
  useTitle('Topzone - Product Edit');

  const navigate = useNavigate();
  const [formUpdate] = Form.useForm();
  const { id } = useParams();
  const [fileList, setFileList] = useState<CustomUploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { handleShowConfetti } = useConfetti();

  // ========== Fetch category by slug ==========
  const fetchUpdateProductBySlug = async (id: string) => {
    const url = `http://localhost:8080/api/v1/products/${id}`;
    const res = await axios.get(url);
    return res.data.data;
  };

  const getUpdateProductBySlug = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchUpdateProductBySlug(id!),
    enabled: !!id,
  });

  console.log(getUpdateProductBySlug.data);

  useEffect(() => {
    if (getUpdateProductBySlug.isLoading) {
      console.log('Loading...');
      return;
    }

    if (getUpdateProductBySlug.isError) {
      console.error('Error loading data:', getUpdateProductBySlug.error);
      return;
    }

    if (!getUpdateProductBySlug.isSuccess) {
      console.log('Data not loaded yet.');
      return;
    }

    if (getUpdateProductBySlug.data) {
      console.log('Data from API:', getUpdateProductBySlug.data);
      formUpdate.setFieldsValue({
        ...getUpdateProductBySlug.data,
        category: getUpdateProductBySlug.data.category._id,
        brand: getUpdateProductBySlug.data.brand?._id,
      });

      const newFileList = getUpdateProductBySlug.data.photos.map(
        (photoUrl: string, index: number) => ({
          uid: `${index}`,
          name: `product_image_${index}`,
          status: 'done',
          url: `${SETTINGS.URL_IMAGE}/${photoUrl}`,
          isOld: true,
        })
      );
      setFileList(newFileList);
      console.log('photos', getUpdateProductBySlug.data.photos);
      console.log('fileList after useEffect:', fileList);
    }
  }, [
    getUpdateProductBySlug.isLoading,
    getUpdateProductBySlug.isError,
    getUpdateProductBySlug.isSuccess,
    getUpdateProductBySlug.data,
    formUpdate,
  ]);

  const updateMutationProduct = useMutation({
    mutationFn: async (payload: IProduct & { id: string }) => {
      const url = `${SETTINGS.URL_API}/v1/products/${payload.id}`;
      const res = await axios.put(url, payload);
      return res.data;
    },
    onSuccess: () => {
      messageApi.open({
        type: 'success',
        content: 'Cập nhật sản phẩm thành công',
      });
      navigate('/product/list');
      handleShowConfetti(); 
    },
    onError: (error) => {
      console.log('Lỗi khi cập nhật sản phẩm:', error);
      messageApi.open({
        type: 'error',
        content: `Cập nhật lỗi: ${error.message || 'Có lỗi xảy ra'}`,
      });
    },
  });

  // const handleUpload = async (files: File[]): Promise<string[]> => {
  //   const formData = new FormData();
  //   files.forEach((file) => formData.append('files', file));

  //   try {
  //     const response = await axios.post(
  //       `${SETTINGS.URL_API}/v1/upload/array-handle`,
  //       formData,
  //       {
  //         headers: { 'Content-Type': 'multipart/form-data' },
  //       }
  //     );

  //     if (response.data && response.data.photos) {
  //       return response.data.photos; // Trả về danh sách URL ảnh
  //     } else {
  //       throw new Error('Upload failed');
  //     }
  //   } catch (error) {
  //     console.error('Error uploading file:', error);
  //     return [];
  //   }
  // };

  // const onFinishUpdate = async (values: IProduct) => {
  //   setLoading(true);
  //   try {
  //     if (fileList.length === 0) {
  //       const info_product = { id: id!, ...values };
  //       updateMutationProduct.mutate(info_product);
  //       console.log('success update product ==> :', info_product);
  //     }

  //     if (fileList.length < 5) {
  //       message.error('Bạn phải upload ít nhất 5 hình!');
  //       return;
  //     }

  //     const uploadedImages = await handleUpload(
  //       fileList.map((file) => file.originFileObj as File)
  //     );

  //     if (uploadedImages.length === 0) {
  //       message.error('Không thể tải lên hình ảnh!');
  //       return;
  //     }

  //     const info_product = { id: id!, ...values, photos: uploadedImages };
  //     // Tạo sản phẩm
  //     updateMutationProduct.mutate(info_product);

  //     // Reset form và chuyển hướng
  //     Swal.fire({
  //       title: 'Success!',
  //       text: 'Sản phẩm đã được cập nhật thành công',
  //       icon: 'success',
  //     });

  //     formUpdate.resetFields();
  //     setFileList([]);
  //     navigate('/product/list');
  //   } catch (error) {
  //     Swal.fire({
  //       title: 'Error!',
  //       text: 'Đã xảy ra lỗi khi thêm sản phẩm.',
  //       icon: 'error',
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const onFinishUpdate = async (values: IProduct) => {
    setLoading(true);
    try {
      let uploadedImages = [];

      // Lọc ảnh cũ ra khỏi fileList
      const newFiles = fileList.filter((file) => !file.isOld);

      if (newFiles.length > 0) {
        // Nếu có ảnh mới
        uploadedImages = await handleUpload(
          newFiles.map((file) => file.originFileObj as File)
        );
        if (uploadedImages.length === 0) {
          message.error('Không thể tải lên hình ảnh!');
          return;
        }
      } else {
        // Nếu không có ảnh mới, giữ lại các ảnh cũ còn lại.
        uploadedImages = fileList
          .filter((file) => file.isOld && file.url)
          .map((file) => file.url!.replace(`${SETTINGS.URL_IMAGE}/`, ''));
      }

      const info_product = { id: id!, ...values, photos: uploadedImages };
      updateMutationProduct.mutate(info_product);

      // ... (phần xử lý sau khi cập nhật thành công)
    } catch (error) {
      // ... (phần xử lý lỗi)
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) {
      return getUpdateProductBySlug.data?.photos || [];
    }
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    try {
      const response = await axios.post(
        `${SETTINGS.URL_API}/v1/upload/array-handle`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (response.data && response.data.photos) {
        return response.data.photos;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      return [];
    }
  };

  const onFinishUpdateFailed = async (errorInfo: unknown) => {
    console.log('ErrorInfo', errorInfo);
  };

  const uploadProps: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
      setPreviewImage('');
    },
    beforeUpload: (file) => {
      setFileList([file]);
      return false;
    },
    fileList,
  };

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    console.log('New fileList:', newFileList); // Thêm console.log
    setFileList(newFileList);
  };

  /* ============= GET CATEGORIES, BRANDS ================ */
  const fetchCategories = async () => {
    const url = `${SETTINGS.URL_API}/v1/categories?limit=200`;
    const res = await axios.get(url);
    return res.data.data;
  };
  const queryCategories = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });
  //console.log(queryCategories.data?.categories_list);
  // Get brands
  const fetchBrands = async () => {
    const url = `${SETTINGS.URL_API}/v1/brands?limit=200`;
    const res = await axios.get(url);
    return res.data.data;
  };

  const queryBrands = useQuery({
    queryKey: ['brands'],
    queryFn: fetchBrands,
  });

  return (
    <>
      {contextHolder}
      <Title className="text-center pb-10" level={2}>
        Product Edit
      </Title>

      <Form
        form={formUpdate}
        onFinish={onFinishUpdate}
        onFinishFailed={onFinishUpdateFailed}
        layout="vertical"
        style={{ maxWidth: '900px', margin: '0 auto' }}
      >
        {/* Product Name  */}
        <Form.Item
          name="product_name"
          label={<span className="text-[17px]">Product Name</span>}
          rules={[
            {
              required: true,
              message: 'Please enter a product name!',
            },
          ]}
          hasFeedback
        >
          <Input placeholder="Enter product name" />
        </Form.Item>

        {/* Price & Price End  */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="price"
              label={<span className="text-[17px]">Price</span>}
              rules={[
                {
                  required: true,
                  message: 'Please enter price!',
                },
                {
                  type: 'number',
                  min: 0,
                  message: 'Price cannot be negative!',
                },
              ]}
              hasFeedback
            >
              <InputNumber
                min={0}
                placeholder="Enter price"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="price_end"
              label={<span className="text-[17px]">Price End</span>}
              rules={[
                {
                  required: true,
                  message: 'Please enter price end!',
                },
                {
                  type: 'number',
                  min: 0,
                  message: 'Price end cannot be negative!',
                },
              ]}
              hasFeedback
            >
              <InputNumber
                min={0}
                placeholder="Enter price end"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Discoutn & Stock  */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={<span className="text-[17px]">Discount (%)</span>}
              name="discount"
              rules={[
                { required: true, message: 'Please input discount!' },
                {
                  type: 'number',
                  min: 0,
                  max: 100,
                  message: 'Discount must be between 0 and 100!',
                },
              ]}
              hasFeedback
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Enter discount percentage"
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={<span className="text-[17px]">Stock</span>}
              name="stock"
              rules={[
                { required: true, message: 'Please input stock!' },
                {
                  type: 'number',
                  min: 0,
                  message: 'Stock must be a positive number!',
                },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Enter stock quantity"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Order  */}
        <Form.Item
          name="order"
          label={<span className="text-[17px]">Order</span>}
          rules={[
            { required: true, message: 'Please input order quantity!' },
            {
              type: 'number',
              min: 0,
              message: 'Order must be a positive number!',
            },
          ]}
          hasFeedback
        >
          <InputNumber
            placeholder="Enter order quantity"
            style={{ width: '100%' }}
          />
        </Form.Item>

        {/* Category & Brand  */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={<span className="text-[17px]">Category</span>}
              name="category"
              rules={[{ required: true, message: 'Please select category!' }]}
              hasFeedback
            >
              <Select
                placeholder="Select category"
                allowClear
                options={queryCategories.data?.categories_list.map(
                  (category: ICategory) => ({
                    value: category._id,
                    label: category.category_name,
                  })
                )}
              ></Select>
            </Form.Item>
          </Col>

          {/* Brand */}
          <Col span={12}>
            <Form.Item
              label={<span className="text-[17px]">Brand</span>}
              name="brand"
              rules={[{ required: true, message: 'Please select brand!' }]}
              hasFeedback
            >
              {queryBrands.isSuccess && (
                <Select
                  placeholder="Select brand"
                  allowClear
                  options={queryBrands.data?.brands_list.map(
                    (brand: IBrand) => ({
                      value: brand._id,
                      label: brand.brand_name,
                    })
                  )}
                />
              )}
            </Form.Item>
          </Col>
        </Row>

        {/* Description  */}
        <Form.Item
          name="description"
          label={<span className="text-[17px]">Description</span>}
          rules={[
            {
              required: true,
              message: 'Please enter description!',
            },
          ]}
          hasFeedback
        >
          <Input.TextArea
            showCount
            maxLength={500}
            rows={7}
            placeholder="Enter product description"
          />
        </Form.Item>

        {/* isBest & isRecentlyAdded & isShowHome & isDelete  */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="isShowHome"
              label="Show Home"
              rules={[
                {
                  required: true,
                  message: 'Please select an option for Show Home!',
                },
              ]}
            >
              <Radio.Group>
                <Radio value={true}>Enable</Radio>
                <Radio value={false}>Disable</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="isRecentlyAdded"
              label="Recently Add"
              rules={[
                {
                  required: true,
                  message: 'Please select an option for Recently Add!',
                },
              ]}
            >
              <Radio.Group>
                <Radio value={true}>Enable</Radio>
                <Radio value={false}>Disable</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="isBest"
              label="Best"
              rules={[
                {
                  required: true,
                  message: 'Please select an option for Best!',
                },
              ]}
            >
              <Radio.Group>
                <Radio value={true}>Enable</Radio>
                <Radio value={false}>Disable</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="isDelete"
              label="Delete"
              rules={[
                {
                  required: true,
                  message: 'Please select an option for Delete!',
                },
              ]}
            >
              <Radio.Group>
                <Radio value={true}>Enable</Radio>
                <Radio value={false}>Disable</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>

        {/* Thumbnail  */}
        <Form.Item
          label={<span className="font-sans">Thumbnail</span>}
          rules={[
            {
              required: true,
              message: 'Please upload Thumbnail!',
            },
          ]}
          hasFeedback
        >
          <Upload
            {...uploadProps}
            listType="picture-card"
            multiple={true}
            onPreview={handlePreview}
            onChange={handleChange}
          >
            {fileList.length < 10 && uploadButton}
          </Upload>

          {/* {previewImage && (
            <Image
              wrapperStyle={{ display: 'none' }}
              preview={{
                visible: previewOpen,
                onVisibleChange: (visible) => setPreviewOpen(visible),
                afterOpenChange: (visible) => !visible && setPreviewImage(''),
              }}
              src={previewImage}
            />
          )} */}
          {previewImage && (
            <Image
              wrapperStyle={{ display: 'none' }}
              preview={{
                visible: previewOpen,
                onVisibleChange: (visible) => setPreviewOpen(visible),
                afterOpenChange: (visible) => !visible && setPreviewImage(''),
              }}
              src={previewImage}
            />
          )}
        </Form.Item>

        {/* Button Submit  */}
        <Form.Item>
          <Button type="primary" htmlType="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update'}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default ProductEdit;
