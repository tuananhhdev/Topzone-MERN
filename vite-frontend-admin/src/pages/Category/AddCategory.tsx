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
  message
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
  category_name: string;
  description: string;
  photo: string;
  order: number;
  isActive: boolean;
  slug: string;
}

const { Title } = Typography;

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
  const [messageApi, contextHolder] = message.useMessage()
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
    values.slug = buildSlug(String(values.category_name));
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
  
  

  const onFinishFailedAdd = async (errorInfo: any) => {
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
            maxWidth: '600px',
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
            name="category_name"
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
