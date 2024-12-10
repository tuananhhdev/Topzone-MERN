import React, { useEffect, useState } from 'react';
import useTitle from '../../hooks/useTitle';
import {
  Form,
  GetProp,
  Image,
  Input,
  Radio,
  Typography,
  Upload,
  UploadFile,
  UploadProps,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { Button } from '@material-tailwind/react';
import { SETTINGS } from '../../constants/settings';
import { buildSlug } from '../../helper/buildSlug';
import { PlusOutlined } from '@ant-design/icons';

interface IPayloadCategory {
  _id: number;
  category_name: string;
  description: string;
  slug: string;
  photo: string;
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

const EditCategory: React.FC = () => {
  useTitle('Topzone - Category Edit');
  const navigate = useNavigate();
  const [formUpdate] = Form.useForm();
  const { slug } = useParams();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [loading, setLoading] = useState(false);

  // ========== Fetch category by id ==========
  const fetchCategoryBySlug = async (slug: string) => {
    const url = `http://localhost:8080/api/v1/categories/slug/${slug}`;
    const responseFetch = await axios.get(url);
    return responseFetch.data.data;
  };

  const getUpdateCategoryBySlug = useQuery({
    queryKey: ['category', slug],
    queryFn: () => fetchCategoryBySlug(slug!),
    enabled: !!slug,
  });

  useEffect(() => {
    if (getUpdateCategoryBySlug.data) {
      // Gán dữ liệu vào form
      formUpdate.setFieldsValue({
        ...getUpdateCategoryBySlug.data,
      });
  
      // Gán dữ liệu ảnh vào fileList nếu có ảnh
      if (getUpdateCategoryBySlug.data.photo) {
        setFileList([
          {
            uid: '-1', // UID cần phải là duy nhất
            name: 'category_image', // Tên hiển thị
            status: 'done', // Trạng thái tải lên
            url: `${SETTINGS.URL_IMAGE}/${getUpdateCategoryBySlug.data.photo}`, // URL của ảnh
          },
        ]);
      }
    }
  }, [getUpdateCategoryBySlug.data, formUpdate]);
  

  // ========== Fetch update category ==========
  const fetchUpdateCategory = async (payload: IPayloadCategory) => {
    const url = `http://localhost:8080/api/v1/categories/slug/${slug}`;
    const responseUpdate = await axios.put(url, payload);
    return responseUpdate.data.data;
  };

  const handleUpload = async (file: UploadFile) => {
    const formData = new FormData();
    // formData.append('file', file as unknown as File);
    formData.append('file', file.originFileObj as File);
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
          // messageApi.open({
          //   type: "error",
          //   content: "Dung lượng ảnh không lớn hơn 2MB",
          // });
          Swal.fire({
            title: 'Upload Failed',
            text: 'Please upload a valid image under 2MB in size.',
            icon: 'error',
          });
        } else {
          Swal.fire({
            title: 'Oops...',
            text: 'Chỉ dược upload hình .png, .gif, .jpg, webp, and .jpeg format allowed!',
            icon: 'error',
          });
        }
        return null;
      } else {
        console.log('Unexpected error:', error);
        return null;
      }
    }
  };

  const queryClient = useQueryClient();

  const mutationUpdateCategory = useMutation({
    mutationFn: fetchUpdateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['category', slug],
      });
      navigate('/category/list');
      Swal.fire({
        position: 'top',
        icon: 'success',
        title: 'Updated successfully',
        showConfirmButton: false,
        timer: 1500,
      });
    },
    onError: (error) => {
      console.error('Something error while update category:', error);
      Swal.fire({
        icon: 'error',
        title: 'Something when wrong!',
        showConfirmButton: false,
        timer: 1500,
      });
    },
  });

  const onFinishUpdate = async (values: IPayloadCategory) => {
    setLoading(true); // Bắt đầu quá trình thêm
    try {
      if (!values.slug) {
        values.slug = buildSlug(String(values.category_name));
      } else if (values.slug) {
        values.slug = buildSlug(String(values.slug));
      }
      if (fileList.length === 0) {
        await mutationUpdateCategory.mutateAsync(values);
      } else {
        const resultUpload = await handleUpload(fileList[0]);
        if (resultUpload !== null) {
          const info_category = { ...values, photo: resultUpload };
          await mutationUpdateCategory.mutateAsync(info_category);
        }
      }
      Swal.fire({
        title: 'Success!',
        text: 'Category updated successfully!',
        icon: 'success',
      });
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update category.',
        icon: 'error',
      });
    } finally {
      setLoading(false); // Kết thúc quá trình thêm
    }
  };

  const uploadProps: UploadProps = {
    onRemove: () => {
      setFileList([]);
      setPreviewImage('');
    },
    beforeUpload: (file) => {
      setFileList([file]);
      return false;
    },
    fileList,
  };

  const onFinishFailedUpdate = async (errorInfo: unknown) => {
    console.log('ErrorInfo', errorInfo);
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

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) =>
    setFileList(newFileList);

  return (
    <>
      <div>
        <Title level={2}>Edit Category</Title>
        <div>
          <Form
            onFinish={onFinishUpdate}
            onFinishFailed={onFinishFailedUpdate}
            form={formUpdate}
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
              rules={[
                { required: true, message: 'Category name is required!' },
              ]}
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
              rules={[
                { required: true, message: 'Active status is required!' },
              ]}
            >
              <Radio.Group>
                <Radio value={true}>Enable</Radio>
                <Radio value={false}>Disable</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              label="Photo"
              name="photo"
              rules={[{ required: true, message: 'Upload photo is required!' }]}
            >
              <Upload
                {...uploadProps}
                listType="picture-card"
                onPreview={handlePreview}
                onChange={handleChange}
              >
                {fileList.length < 1 && uploadButton}
              </Upload>
              {previewImage && (
                <Image
                  wrapperStyle={{ display: 'none' }}
                  preview={{
                    visible: previewOpen,
                    onVisibleChange: (visible) => setPreviewOpen(visible),
                    afterOpenChange: (visible) =>
                      !visible && setPreviewImage(''),
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
                {loading ? 'Updating...' : 'Update'}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </>
  );
};

export default EditCategory;
