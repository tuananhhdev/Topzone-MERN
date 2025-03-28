import React, { useState } from 'react';
import useTitle from '../../hooks/useTitle';
import {
  Form,
  Input,
  Typography,
  UploadFile,
  UploadProps,
  Upload,
  Radio,
  GetProp,
  Image,
  message,
  Select,
  Divider,
  Card,
  Space,
} from 'antd';
import { SETTINGS } from '../../constants/settings';
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { buildSlug } from '../../helper/buildSlug';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { Button } from '@material-tailwind/react';

interface ICategory {
  product_name: string;
  description: string;
  photo: string;
  order: number;
  isActive: boolean;
  slug: string;
  specification: {
    operating_system: string;
    screen: {
      size: string;
      technology: string;
      resolution: string;
      refresh_rate: string;
    };
    processor: {
      chip: string;
      gpu: string;
    };
    memory: {
      ram: string;
      storage: string;
    };
    camera: {
      main: string;
      selfie: string;
      features: string[];
    };
    battery: {
      capacity: string;
      charging: string;
    };
    connectivity: {
      sim: string;
      network: string;
      wifi: string;
      bluetooth: string;
    };
    design: {
      dimensions: string;
      weight: string;
      material: string;
    };
  };
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

const AddCategory: React.FC = () => {
  useTitle('Topzone - Category Add');

  const [formCreate] = Form.useForm();
  const navigate = useNavigate();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  // ========== Fetch add category ==========
  const queryClient = useQueryClient();

  const fetchAddCategory = async (payload: ICategory) => {
    const url = `${SETTINGS.URL_API}/v1/categories`;
    const response = await axios.post(url, payload);
    return response.data;
  };

  const handleUpload = async (file: UploadFile) => {
    const formData = new FormData();
    formData.append('file', file as unknown as File);
    try {
      const response = await axios.post(
        `${SETTINGS.URL_API}/v1/upload/single-handle`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      if (response.data.statusCode === 200) {
        return response.data.data.link;
      } else {
        return null;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.data.statusCode;
        if (statusCode === 400) {
          messageApi.open({
            type: 'error',
            content: 'Dung lượng ảnh không lớn hơn 2MB',
          });
        } else {
          messageApi.open({
            type: 'error',
            content:
              'Chỉ dược upload hình .png, .gif, .jpg, webp, and .jpeg format allowed!',
          });
        }
        return null;
      } else {
        console.log('Unexpected error:', error);
        return null;
      }
    }
  };

  // ========== Mutation create ==========

  const createMutationCategory = useMutation({
    mutationFn: fetchAddCategory,
    onSuccess: () => {
      //Clear data form

      formCreate.resetFields();
      setFileList([]);
      navigate('/category/list');
      queryClient.invalidateQueries({
        queryKey: ['categories'],
      });
    },
  });

  // ========== onFinish Add & Failed ==========
  const onFinishAdd = async (values: ICategory) => {
    setLoading(true);
    //   try {
    //     if (fileList.length < 5) {
    //       message.error("Bạn phải upload ít nhất 5 hình!");
    //       return;
    //     }

    //     const uploadedImages = await handleUpload(fileList.map(file => file.originFileObj as File));

    //     if (uploadedImages.length === 0) {
    //       message.error("Không thể tải lên hình ảnh!");
    //       return;
    //     }

    //     const info_category = { ...values, photos: uploadedImages };

    //     await createMutationCategory.mutate(info_category);

    //     Swal.fire({
    //       title: "Success!",
    //       text: "Category added successfully!",
    //       icon: "success",
    //     });

    //     formCreate.resetFields();
    //     setFileList([]);
    //     navigate("/category/list");
    //   } catch (error) {
    //     Swal.fire({
    //       title: "Error!",
    //       text: "Failed to add category.",
    //       icon: "error",
    //     });
    //   } finally {
    //     setLoading(false);
    //   }
    if (!values.slug) {
      values.slug = buildSlug(String(values.product_name));
    } else if (values.slug) {
      values.slug = buildSlug(String(values.slug));
    }
    if (fileList.length === 0) {
      createMutationCategory.mutate(values);
    } else {
      // const resultUpload = await handleUpload(fileList[0]);
      const file = fileList[0].originFileObj as File;
      const resultUpload = await handleUpload(file as unknown as UploadFile);
      if (resultUpload !== null) {
        const info_cate = { ...values, photo: resultUpload };
        createMutationCategory.mutate(info_cate);
        console.log(resultUpload);
      }
    }
  };

  const onFinishFailedAdd = async (errorInfo: unknown) => {
    console.log('ErrorInfo', errorInfo);
  };

  const uploadProps: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
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

  // ========== Handle show image ==========

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) =>
    setFileList(newFileList);

  // console.log('select img', selectedImage);
  return (
    <>
      {contextHolder}
      <Title level={2} className="text-center pb-4">
        Add Category
      </Title>

      <div>
        <Form
          onFinish={onFinishAdd}
          onFinishFailed={onFinishFailedAdd}
          form={formCreate}
          layout="vertical"
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '20px',
            border: '1px solid #f0f0f0',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#fff',
          }}
        >
          <Form.Item
            label="Category Name"
            name="product_name"
            rules={[{ required: true, message: 'Category name is required!' }]}
          >
            <Input placeholder="Enter category name" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Description is required!' }]}
          >
            <Input.TextArea rows={8} placeholder="Enter a description" />
          </Form.Item>

          <Form.Item
            label="Order Number"
            name="order"
            rules={[{ required: true, message: 'Order number is required!' }]}
          >
            <Input type="number" placeholder="Enter order number" />
          </Form.Item>

          <Form.Item
            label="Active Status"
            name="isActive"
            rules={[{ required: true, message: 'Active status is required!' }]}
          >
            <Radio.Group>
              <Radio value={true}>Enable</Radio>
              <Radio value={false}>Disable</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="Photo"
            name="photo"
            // rules={[{ required: true, message: 'Upload photo is required!' }]}
          >
            <Upload
              {...uploadProps}
              listType="picture-card"
              onPreview={handlePreview}
              onChange={handleChange}
            >
              {fileList.length <= 1 && uploadButton}
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

          <Divider orientation="left">Thông số kỹ thuật</Divider>

          <Form.Item
            label="Hệ điều hành"
            name={['specification', 'operating_system']}
          >
            <Select placeholder="Chọn hệ điều hành">
              <Option value="iOS">iOS</Option>
              <Option value="Android">Android</Option>
              <Option value="HarmonyOS">HarmonyOS</Option>
              <Option value="Windows">Windows</Option>
              <Option value="macOS">macOS</Option>
            </Select>
          </Form.Item>

          <Card title="Màn hình" className="mb-4">
            <Form.Item
              label="Kích thước"
              name={['specification', 'screen', 'size']}
            >
              <Input placeholder="Ví dụ: 6.7 inches" />
            </Form.Item>
            <Form.Item
              label="Công nghệ"
              name={['specification', 'screen', 'technology']}
            >
              <Input placeholder="Ví dụ: OLED" />
            </Form.Item>
            <Form.Item
              label="Độ phân giải"
              name={['specification', 'screen', 'resolution']}
            >
              <Input placeholder="Ví dụ: 2796 x 1290 pixels" />
            </Form.Item>
            <Form.Item
              label="Tần số quét"
              name={['specification', 'screen', 'refresh_rate']}
            >
              <Input placeholder="Ví dụ: 120Hz" />
            </Form.Item>
          </Card>

          <Card title="Vi xử lý" className="mb-4">
            <Form.Item
              label="Chip"
              name={['specification', 'processor', 'chip']}
            >
              <Input placeholder="Ví dụ: Apple A16 Bionic" />
            </Form.Item>
            <Form.Item label="GPU" name={['specification', 'processor', 'gpu']}>
              <Input placeholder="Ví dụ: Apple GPU 5-core" />
            </Form.Item>
          </Card>

          <Card title="Bộ nhớ" className="mb-4">
            <Form.Item label="RAM" name={['specification', 'memory', 'ram']}>
              <Input placeholder="Ví dụ: 8GB" />
            </Form.Item>
            <Form.Item
              label="Bộ nhớ trong"
              name={['specification', 'memory', 'storage']}
            >
              <Input placeholder="Ví dụ: 256GB" />
            </Form.Item>
          </Card>

          <Card title="Camera" className="mb-4">
            <Form.Item
              label="Camera chính"
              name={['specification', 'camera', 'main']}
            >
              <Input placeholder="Ví dụ: 48MP, f/1.8" />
            </Form.Item>
            <Form.Item
              label="Camera selfie"
              name={['specification', 'camera', 'selfie']}
            >
              <Input placeholder="Ví dụ: 12MP, f/2.2" />
            </Form.Item>
            <Form.Item
              label="Tính năng"
              name={['specification', 'camera', 'features']}
            >
              <Select
                mode="tags"
                placeholder="Nhập các tính năng camera"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Card>

          <Card title="Pin & Sạc" className="mb-4">
            <Form.Item
              label="Dung lượng pin"
              name={['specification', 'battery', 'capacity']}
            >
              <Input placeholder="Ví dụ: 4500 mAh" />
            </Form.Item>
            <Form.Item
              label="Công nghệ sạc"
              name={['specification', 'battery', 'charging']}
            >
              <Input placeholder="Ví dụ: Fast charging 25W" />
            </Form.Item>
          </Card>

          <Card title="Kết nối" className="mb-4">
            <Form.Item
              label="SIM"
              name={['specification', 'connectivity', 'sim']}
            >
              <Input placeholder="Ví dụ: 2 SIM (nano‑SIM và eSIM)" />
            </Form.Item>
            <Form.Item
              label="Mạng"
              name={['specification', 'connectivity', 'network']}
            >
              <Input placeholder="Ví dụ: 5G" />
            </Form.Item>
            <Form.Item
              label="Wi-Fi"
              name={['specification', 'connectivity', 'wifi']}
            >
              <Input placeholder="Ví dụ: Wi-Fi 6 (802.11ax)" />
            </Form.Item>
            <Form.Item
              label="Bluetooth"
              name={['specification', 'connectivity', 'bluetooth']}
            >
              <Input placeholder="Ví dụ: 5.3" />
            </Form.Item>
          </Card>

          <Card title="Thiết kế & Trọng lượng" className="mb-4">
            <Form.Item
              label="Kích thước"
              name={['specification', 'design', 'dimensions']}
            >
              <Input placeholder="Ví dụ: 160.7 x 77.6 x 7.85 mm" />
            </Form.Item>
            <Form.Item
              label="Trọng lượng"
              name={['specification', 'design', 'weight']}
            >
              <Input placeholder="Ví dụ: 240g" />
            </Form.Item>
            <Form.Item
              label="Chất liệu"
              name={['specification', 'design', 'material']}
            >
              <Input placeholder="Ví dụ: Khung thép không gỉ, mặt lưng kính" />
            </Form.Item>
          </Card>

          <Form.Item>
            <Button
              type="submit"
              color="gray"
              placeholder={false}
              onPointerEnterCapture={false}
              onPointerLeaveCapture={false}
              style={{
                width: '100%',
                height: '45px',
                fontWeight: 'bold',
                borderRadius: '10px',
              }}
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default AddCategory;
