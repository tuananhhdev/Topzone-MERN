import React, { useState, useEffect } from 'react';
import useTitle from '../../hooks/useTitle';
import {
  Typography,
  Form,
  Input,
  InputNumber,
  Select,
  Checkbox,
  Radio,
  Upload,
  Button,
  UploadFile,
  message,
  UploadProps,
  Modal,
  Col,
  DatePicker,
  Row,
  GetProp,
  Image,
} from 'antd';
// import { Button } from '@material-tailwind/react';
import * as Yup from 'yup';
import axios from 'axios';
import { SETTINGS } from '../../constants/settings';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { buildSlug } from '../../helper/buildSlug';
import { PlusCircleOutlined } from '@ant-design/icons';
import Swal from 'sweetalert2';

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
  specifications: ISpecification;
}

interface ISpecification {
  origin: string;
  release_date: string;
  warranty: number;
  dimensions: string;
  weight: number;
  water_resistance: string;
  material: string;
  cpu_version: string;
  cpu_type: string;
  cpu_cores: number;
  ram: number;
  screen_size: number;
  screen_type: string;
  screen_resolution: string;
  glass_material: string;
  touch_type: string;
  brightness: number;
  contrast_ratio: string;
  gpu: string;
  storage: number;
  expandable_memory: boolean;
  rear_camera: string;
  video_quality: string[];
  selfie_camera: {
    resolution: number;
    video_quality: string[];
  };
  sensors: string[];
  security: {
    password_unlock: boolean;
    face_unlock: boolean;
  };
  sim: number;
  connectivity: {
    Wifi: string;
    GPS: string;
    Bluetooth: string;
    Another_connection: string;
  };
  battery: {
    battery_type: string;
    battery_life: number;
  };
  more_infor: {
    fast_charging: boolean;
    wireless_charging: boolean;
  };
  os: string;
  os_version: string;
  accessories: string[];
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
type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const ProductAdd: React.FC = () => {
  useTitle('Topzone - Product Add');

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [formCreate] = Form.useForm();

  // ========== Fetch create product ==========
  const fetchCreateProduct = async (payloads: IProduct) => {
    const url = `${SETTINGS.URL_API}/v1/products/`;
    const res = await axios.post(url, payloads);
    return res.data;
  };

  const createMutationProduct = useMutation({
    mutationFn: fetchCreateProduct,
    onSuccess: () => {
      setTimeout(() => {
        formCreate.resetFields();
        setFileList([]);
        navigate('/product/list');
        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Sản phẩm đã được thêm thành công!',
        });
      }, 500);
    },
    onError: (error) => {
      console.error('Lỗi khi thêm sản phẩm ==>', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Có lỗi xảy ra khi thêm sản phẩm!',
      });
    },
  });

  const handleUpload = async (files: File[]): Promise<string[]> => {
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
        return response.data.photos; // Trả về danh sách URL ảnh
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      return [];
    }
  };

  const onFinish = async (values: IProduct) => {
    setLoading(true);
    try {
      if (fileList.length < 5) {
        message.error('Bạn phải upload ít nhất 5 hình!');
        return;
      }

      const uploadedImages = await handleUpload(
        fileList.map((file) => file.originFileObj as File)
      );

      if (uploadedImages.length === 0) {
        message.error('Không thể tải lên hình ảnh!');
        return;
      }

      const info_product = { ...values, photos: uploadedImages };
      // Tạo sản phẩm
      await createMutationProduct.mutate(info_product);

      // Reset form và chuyển hướng
      Swal.fire({
        title: 'Success!',
        text: 'Sản phẩm đã được thêm thành công!',
        icon: 'success',
      });

      formCreate.resetFields();
      setFileList([]);
      navigate('/product/list');
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Đã xảy ra lỗi khi thêm sản phẩm.',
        icon: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('ErrorInfo:', errorInfo);
  };

  // ========= Fetch categories & brands ==========
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [brands, setBrands] = useState<IBrand[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(
          `${SETTINGS.URL_API}/v1/categories?limit=200`
        );
        setCategories(res.data.data.categories_list || []);
      } catch (error: unknown) {
        console.error('Lỗi khi fetch danh mục ==> :', (error as Error).message);
      }
    };

    const fetchBrands = async () => {
      try {
        const res = await axios.get(`${SETTINGS.URL_API}/v1/brands?limit=200`);
        setBrands(res.data.data.brands_list || []);
      } catch (error) {
        console.error('Lỗi khi lấy thương hiệu:', error);
        setBrands([]);
      }
    };

    fetchCategories();
    fetchBrands();
  }, []);

  // const handleUpload = async (file: UploadFile) => {
  //   const formData = new FormData();
  //   formData.append('file', file.originFileObj as File);
  //   try {
  //     const response = await axios.post(
  //       `${SETTINGS.URL_API}/v1/upload/array-handle`,
  //       formData,
  //       {
  //         headers: {
  //           'Content-Type': 'multipart/form-data',
  //         },
  //       }
  //     );
  //     if (response.data.statusCode === 200) {
  //       return response.data.data.link;
  //     } else {
  //       return null;
  //     }
  //   } catch (error) {
  //     if (axios.isAxiosError(error)) {
  //       const statusCode = error.response?.data.statusCode;
  //       if (statusCode === 400) {
  //         messageApi.open({
  //           type: 'error',
  //           content: 'Dung lượng ảnh không lớn hơn 2MB',
  //         });
  //       } else {
  //         messageApi.open({
  //           type: 'error',
  //           content: 'Chỉ dược upload hình .png, .gif, .jpg, webp, and .jpeg!',
  //         });
  //       }
  //       return null;
  //     } else {
  //       console.log('Unexpected error:', error);
  //       return null;
  //     }
  //   }
  // };

  const uploadProps: UploadProps = {
    //  multiple: true, // Cho phép upload nhiều ảnh
    //  listType: "picture-card", // Hiển thị dạng card ảnh
    onRemove: (file) => {
      setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
    },
    beforeUpload: (file) => {
      if (fileList.length >= 10) {
        message.error('Bạn chỉ có thể upload tối đa 10 hình!');
        return false;
      }
      setFileList((prev) => [...prev, file]); // Giữ lại ảnh cũ và thêm ảnh mới
      return false; // Không tự động upload
    },
    fileList,
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleChange = ({ fileList }: { fileList: UploadFile[] }) => {
    setFileList(fileList); // Cập nhật danh sách ảnh
  };

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      <PlusCircleOutlined className="text-lg" />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  return (
    <>
      {contextHolder}
      <Title className="text-center pb-10" level={2}>
        Product Add
      </Title>
      <Form
        form={formCreate}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
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
              <Select placeholder="Select category" allowClear>
                {categories.map((category) => (
                  <Option key={category._id} value={category._id}>
                    {category.category_name}
                  </Option>
                ))}
              </Select>
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
              <Select placeholder="Select brand" allowClear>
                {brands.map((brand) => (
                  <Option key={brand._id} value={brand._id}>
                    {brand.brand_name}
                  </Option>
                ))}
              </Select>
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
            rows={6}
            placeholder="Enter product description"
          />
        </Form.Item>

        {/* isBest & isRecentlyAdded & isShowHome & isDelete  */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="isActive"
              label="Active"
              rules={[
                {
                  required: true,
                  message: 'Please select an option for Active!',
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
          <Button type="primary" htmlType="submit">
            Add product
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default ProductAdd;
