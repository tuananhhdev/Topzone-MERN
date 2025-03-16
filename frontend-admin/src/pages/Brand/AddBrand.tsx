import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Form,
  GetProp,
  Image,
  Input,
  message,
  Upload,
  UploadFile,
  UploadProps,
} from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SETTINGS } from '../../constants/settings';
import axios from 'axios';
import { buildSlug } from '../../helper/buildSlug';
import { PlusCircleOutlined } from '@ant-design/icons';

interface IBrand {
  _id: string;
  brand_name: string;
  description: string;
  thumbnail: string;
  slug: string;
}

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const AddBrand = () => {
  const [formCreate] = Form.useForm<IBrand>();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewImage, setPreviewImage] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const queryClient = useQueryClient();

  // ========== Fetch Brands ========== \\
  const fetchCreateBrands = async (payload: IBrand) => {
    const url = `${SETTINGS.URL_API}/v1/brands`;
    const response = await axios.post(url, payload);
    return response.data;
  };

  const createMutationBrand = useMutation({
    mutationFn: fetchCreateBrands,
    onSuccess: () => {
      formCreate.resetFields();
      setFileList([]);
      navigate('/brand/list');
      queryClient.invalidateQueries({
        queryKey: ['brands'],
      });
      messageApi.open({
        type: 'success',
        content: 'Thêm thương hiệu thành công',
      });
    },
    onError: () => {
      messageApi.open({
        type: 'error',
        content: 'Thêm thương hiệu lỗi!',
      });
    },
  });

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

  const onFinishAdd = async (values: IBrand) => {
    if (!values.slug) {
      values.slug = buildSlug(String(values.brand_name));
    } else if (values.slug) {
      values.slug = buildSlug(String(values.slug));
    }
    if (fileList.length === 0) {
      createMutationBrand.mutate(values);
    } else {
      // const resultUpload = await handleUpload(fileList[0]);
      const file = fileList[0].originFileObj as File;
      const resultUpload = await handleUpload(file as unknown as UploadFile);
      if (resultUpload !== null) {
        const info_brand = { ...values, thumbnail: resultUpload };
        createMutationBrand.mutate(info_brand);
        console.log(resultUpload);
      }
    }
  };

  const onFinishFailedAdd = (errorInfo: unknown) => {
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

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) =>
    setFileList(newFileList);

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      <PlusCircleOutlined className="text-lg" />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  return (
    <>
      {contextHolder}
      <Form
        form={formCreate}
        onFinish={onFinishAdd}
        onFinishFailed={onFinishFailedAdd}
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
          <Button type="primary" htmlType="submit">
            Add brand
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default AddBrand;
