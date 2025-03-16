import {
  Button,
  Form,
  GetProp,
  Image,
  Input,
  Upload,
  UploadFile,
  UploadProps,
} from 'antd';
import React, { useEffect, useState } from 'react';
import useTitle from '../../hooks/useTitle';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { SETTINGS } from '../../constants/settings';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { buildSlug } from '../../helper/buildSlug';
import { PlusOutlined } from '@ant-design/icons';

interface IPayloadBrand {
  _id: string;
  brand_name: string;
  description: string;
  thumbnail: string;
  slug: string;
  isActive: boolean;
}

interface CustomUploadFile extends UploadFile {
  isOld?: boolean;
}

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const EditBrand = () => {
  useTitle('Topzone - Category Edit');
  const navigate = useNavigate();
  const [formUpdate] = Form.useForm();
  const { slug } = useParams();
  const [fileList, setFileList] = useState<CustomUploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [loading, setLoading] = useState(false);

  // ========== Fetch brand by slug ==========
  const fetchBrandBySlug = async (slug: string) => {
    const url = `${SETTINGS.URL_API}/v1/brands/slug/${slug}`;
    const responseFetch = await axios.get(url);
    return responseFetch.data.data;
  };

  const getUpdateBrandBySlug = useQuery({
    queryKey: ['brand', slug],
    queryFn: () => fetchBrandBySlug(slug!),
    enabled: !!slug,
  });

  useEffect(() => {
    if (getUpdateBrandBySlug.data) {
      console.log('Data from API:', getUpdateBrandBySlug.data);
      // Gán dữ liệu vào form
      formUpdate.setFieldsValue({
        ...getUpdateBrandBySlug.data,
      });

      // Gán dữ liệu ảnh vào fileList nếu có ảnh
      if (getUpdateBrandBySlug.data.thumbnail) {
        setFileList([
          {
            uid: '-1', // UID cần phải là duy nhất
            name: 'brand_image', // Tên hiển thị
            status: 'done', // Trạng thái tải lên
            url: `${SETTINGS.URL_IMAGE}/${getUpdateBrandBySlug.data.thumbnail}`, // URL của ảnh
            isOld: true,
          },
        ]);
      }
      console.log('fileList after useEffect:', fileList);
    }
  }, [getUpdateBrandBySlug.data, formUpdate]);

  // ========== Fetch update brand ==========
  const fetchUpdateBrand = async (payload: IPayloadBrand) => {
    const url = `${SETTINGS.URL_API}/v1/brands/slug/${slug}`;
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

  const mutationUpdateBrand = useMutation({
    mutationFn: fetchUpdateBrand,
    onMutate: () => {
      setLoading(true); // Kích hoạt loading trước khi thực hiện mutation
    },
    onSuccess: () => {
      setLoading(true);
      queryClient.invalidateQueries({
        queryKey: ['brand', slug],
      });
      navigate('/brand/list');
      Swal.fire({
        position: 'top',
        icon: 'success',
        title: 'Updated successfully',
        showConfirmButton: false,
        timer: 1500,
      });
    },
    onError: (error) => {
      setLoading(true);
      console.error('Something error while update category:', error);
      Swal.fire({
        icon: 'error',
        title: 'Something when wrong!',
        showConfirmButton: false,
        timer: 1500,
      });
    },
  });

  const onFinishUpdate = async (values: IPayloadBrand) => {
    setLoading(true);
    try {
      if (!values.slug) {
        values.slug = buildSlug(String(values.brand_name));
      } else if (values.slug) {
        values.slug = buildSlug(String(values.slug));
      }

      if (fileList.length === 0) {
        mutationUpdateBrand.mutate(values);
      } else {
        const fileToUpload = fileList.find((file) => !file.isOld); // Tìm file mới
        if (fileToUpload) {
          const resultUpload = await handleUpload(fileToUpload);
          if (resultUpload !== null) {
            const info_category = { ...values, thumbnail: resultUpload };
            mutationUpdateBrand.mutate(info_category);
          }
        } else {
          // Không có file mới, giữ nguyên ảnh cũ
          mutationUpdateBrand.mutate(values);
        }
      }

      // Swal.fire({
      //   title: 'Success!',
      //   text: 'Category updated successfully!',
      //   icon: 'success',
      // });
    } catch (error) {
      // Swal.fire({
      //   title: 'Error!',
      //   text: 'Failed to update category.',
      //   icon: 'error',
      // });
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailedUpdate = async (errorInfo: unknown) => {
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

  return (
    <div>
      <Form
        form={formUpdate}
        onFinish={onFinishUpdate}
        onFinishFailed={onFinishFailedUpdate}
        initialValues={{
          isActive: true, // Default value for isActive
        }}
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
          label="Brand Name"
          name="brand_name"
          rules={[{ required: true, message: 'Brand name is required !' }]}
          hasFeedback
        >
          <Input placeholder="Enter brand name" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Description is required !' }]}
          hasFeedback
        >
          <Input.TextArea
            showCount
            maxLength={500}
            rows={8}
            placeholder="Enter brand description"
          />
        </Form.Item>

        <Form.Item
          label="Brand Photo"
          rules={[
            {
              required: true,
              message: 'Please upload brand photo !',
            },
          ]}
        >
          <Upload
            {...uploadProps}
            onPreview={handlePreview}
            onChange={handleChange}
            listType="picture-card"
          >
            {' '}
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
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update brand'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditBrand;
