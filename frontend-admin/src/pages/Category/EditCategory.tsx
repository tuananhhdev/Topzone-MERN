import React, { useEffect } from 'react';
import useTitle from '../../hooks/useTitle';
import { Button, Col, Form, Input, Radio, Row, Typography } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';

interface IPayloadCategory {
  _id: number;
  category_name: string;
  description: string;
  slug: string;
  photo: string;
}

const { Title } = Typography;

const EditCategory: React.FC = () => {
  useTitle('Topzone - Category Edit');
  const navigate = useNavigate();
  const [formUpdate] = Form.useForm();
  const { slug } = useParams();

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
      formUpdate.setFieldsValue({
        ...getUpdateCategoryBySlug.data,
      });
    }
  }, [getUpdateCategoryBySlug.data, formUpdate]);

  // ========== Fetch update category ==========
  const fetchUpdateCategory = async (payload: IPayloadCategory) => {
    const url = `http://localhost:8080/api/v1/categories/slug/${slug}`;
    const responseUpdate = await axios.put(url, payload);
    return responseUpdate.data.data;
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

  const onFinish = (values: IPayloadCategory) => {
    mutationUpdateCategory.mutate(values);
  };

  return (
    <>
      <div>
        <Title level={2}>Edit Category</Title>
        <div>
          <Form
            form={formUpdate}
            layout="vertical"
            onFinish={onFinish}
            style={{ maxWidth: '800px', margin: '0 auto' }} // Center the form
          >
            <Row gutter={[50, 16]}>
              {/* Name Field */}
              <Col span={12}>
                <Form.Item
                  label="Category Name"
                  name="category_name"
                  rules={[
                    { required: true, message: 'Please enter category name' },
                  ]}
                >
                  <Input placeholder="Enter category name" />
                </Form.Item>
              </Col>
              {/* Image Field */}
              <Col span={12}>
                <Form.Item
                  label="Image"
                  name="photo"
                  rules={[
                    { required: true, message: 'Please enter image URL' },
                  ]}
                >
                  <Input placeholder="Enter image URL" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Description"
                  name="description"
                  rules={[
                    { required: true, message: 'Please enter image URL' },
                  ]}
                >
                  <Input.TextArea rows={6} placeholder="Enter description" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Active Status"
                  name="isActive"
                  rules={[
                    { required: true, message: 'Please select a status' },
                  ]}
                >
                  <Radio.Group>
                    <Radio value={true}>Enable</Radio>
                    <Radio value={false}>Disable</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>
            {/* Submit Button */}
            <Row justify="end">
              <Col>
                <Button
                  style={{
                    background: '#000',
                    color: '#fff',
                    padding: '20px 50px',
                    borderRadius: '8px',
                  }}
                  htmlType="submit"
                >
                  Update
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    </>
  );
};

export default EditCategory;
