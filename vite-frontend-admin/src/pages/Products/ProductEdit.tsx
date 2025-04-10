import React, { useState, useEffect } from 'react';
import useTitle from '../../hooks/useTitle';
import {
  Typography,
  Form,
  Input,
  InputNumber,
  Select,
  Radio,
  Upload,
  Button,
  UploadFile,
  message,
  Col,
  DatePicker,
  Row,
  Image,
  Divider,
  Card,
  UploadProps,
  Tooltip,
  Collapse,
} from 'antd';
import axios from 'axios';
import { SETTINGS } from '../../constants/settings';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PlusCircleOutlined,
  PlusOutlined,
  DeleteOutlined,
  MinusCircleOutlined,
  DownOutlined,
} from '@ant-design/icons';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';

interface ISpecification {
  type: string;
  operating_system: string;
  screen: {
    size: string;
    technology: string;
    resolution: string;
    refresh_rate: string;
  };
  processor: { chip: string; gpu: string };
  memory: { ram: string; storage: string };
  camera?: { main: string; selfie: string; features: string[] };
  graphics_card?: { model: string; vram: string };
  ports?: { usb: string; hdmi: string; others: string };
  battery?: { capacity: string; charging: string };
  connectivity: {
    sim?: string;
    network: string;
    wifi: string;
    bluetooth: string;
  };
  design: { dimensions: string; weight: string; material: string };
  custom_specs?: { [key: string]: { [subKey: string]: string } };
}

interface IColor {
  color: string;
  price: number;
  stock: number;
  fileList: UploadFile[];
}

interface IVariant {
  storage: string;
  product_name: string;
  colors: IColor[];
}

interface IProduct {
  _id?: string;
  product_name: string;
  price: number;
  discount: number;
  category: { _id?: string; category_name: string };
  brand: { _id?: string; brand_name: string };
  description: string;
  photos: string[];
  stock: number;
  slug: string;
  order: number;
  isBest: boolean;
  isRecentlyAdded: boolean;
  isShowHome: boolean;
  isDelete: boolean;
  specification: ISpecification;
  youtubeVideos?: { youtubeID: string; youtubeTitle: string }[];
  variants?: IVariant[];
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
type FileType = Parameters<UploadProps['beforeUpload']>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const VariantImageUpload: React.FC<{
  images: string[];
  onChange: (images: string[]) => void;
}> = ({ images = [], onChange }) => {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('files', file);

    try {
      const response = await axios.post(
        `${SETTINGS.URL_API}/v1/upload/single-handle`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      return response.data.photos;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const customRequest: UploadProps['customRequest'] = async ({
    file,
    onSuccess,
    onError,
  }) => {
    setLoading(true);
    try {
      const imageUrl = await handleUpload(file as File);
      onChange([...images, imageUrl]);
      onSuccess?.('ok');
    } catch (error) {
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (fileUrl: string) => {
    const newImages = images.filter((url) => url !== fileUrl);
    onChange(newImages);
  };

  const uploadButton = (
    <div>
      {loading ? 'Uploading' : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <Upload
      accept="image/*"
      listType="picture-card"
      fileList={images.map((url) => ({ uid: url, url, status: 'done' }))}
      customRequest={customRequest}
      onRemove={(file) => handleRemove(file.response || file.url!)}
    >
      {images.length < 5 && uploadButton}
    </Upload>
  );
};

const YoutubeVideoForm = () => (
  <Form.List name="youtubeVideos">
    {(fields, { add, remove }) => (
      <>
        <div style={{ marginBottom: 16 }}>
          <Typography.Text strong style={{ fontSize: 16 }}>
            YouTube Videos
          </Typography.Text>
        </div>
        {fields.map(({ key, name, ...restField }) => (
          <Row
            key={key}
            gutter={[16, 16]}
            align="middle"
            style={{ marginBottom: 16 }}
          >
            <Col span={10}>
              <Form.Item
                {...restField}
                label={<Typography.Text strong>YouTube ID</Typography.Text>}
                name={[name, 'youtubeID']}
                rules={[
                  { required: true, message: 'Please enter YouTube ID!' },
                ]}
              >
                <Input
                  placeholder="e.g., dQw4w9WgXcQ"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                {...restField}
                label={<Typography.Text strong>YouTube Title</Typography.Text>}
                name={[name, 'youtubeTitle']}
                rules={[
                  { required: true, message: 'Please enter video title!' },
                ]}
              >
                <Input
                  placeholder="e.g., Product Demo Video"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </Col>
            <Col span={2}>
              <Button
                type="link"
                danger
                icon={<MinusCircleOutlined />}
                onClick={() => remove(name)}
                style={{ marginTop: 8 }}
              />
            </Col>
          </Row>
        ))}
        <Button
          type="dashed"
          onClick={() => add()}
          block
          icon={<PlusOutlined />}
          style={{ borderRadius: 8, marginTop: 8 }}
        >
          Add Video
        </Button>
      </>
    )}
  </Form.List>
);

const ProductEdit: React.FC = () => {
  useTitle('Topzone - Edit Product');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [variants, setVariants] = useState<IVariant[]>([]);
  const [productType, setProductType] = useState<string>('phone');
  const [customSpecGroups, setCustomSpecGroups] = useState<
    { groupName: string; fields: { key: string; value: string }[] }[]
  >([]);

  const fetchProduct = async () => {
    const response = await axios.get(`${SETTINGS.URL_API}/v1/products/${id}`);
    return response.data.data;
  };

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: fetchProduct,
  });

  const updateProduct = async (payloads: IProduct) => {
    const url = `${SETTINGS.URL_API}/v1/products/${id}`;
    const res = await axios.put(url, payloads);
    return res.data;
  };

  const updateMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      setTimeout(() => {
        form.resetFields();
        setFileList([]);
        navigate('/product/list');
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Product updated successfully!',
        });
      }, 500);
    },
    onError: (error) => {
      console.error('Error updating product ==>', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'An error occurred while updating the product!',
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
      return response.data.photos;
    } catch (error) {
      console.error('Error uploading file:', error);
      return [];
    }
  };

  useEffect(() => {
    if (product) {
      form.setFieldsValue({
        ...product,
        category: product.category._id,
        brand: product.brand._id,
        specification: product.specification,
        youtubeVideos: product.youtubeVideos || [],
        discount_end_time: product.discount_end_time
          ? dayjs(product.discount_end_time)
          : null,
      });
      setFileList(
        product.photos.map((photoUrl: string, index: number) => ({
          uid: String(index),
          name: `image-${index}`,
          status: 'done',
          url: `${SETTINGS.URL_IMAGE}/${photoUrl}`,
        }))
      );
      const safeVariants = (product.variants || []).map(
        (variant: IVariant) => ({
          ...variant,
          images: variant.images || [], // Default to empty array if undefined
        })
      );
      setVariants(safeVariants);
      setProductType(product.specification.type);
      if (product.specification.custom_specs) {
        const customGroups = Object.entries(
          product.specification.custom_specs
        ).map(([groupName, fields]) => ({
          groupName,
          fields: Object.entries(fields).map(([key, value]) => ({
            key,
            value,
          })),
        }));
        setCustomSpecGroups(customGroups);
      }
    }
  }, [product, form]);

  const handleAddStorage = () => {
    setVariants([...variants, { storage: '', product_name: '', colors: [] }]);
  };

  const handleRemoveStorage = (storageIndex: number) => {
    const newVariants = variants.filter((_, i) => i !== storageIndex);
    setVariants(newVariants);
  };

  const handleAddColor = (storageIndex: number) => {
    const newVariants = [...variants];
    newVariants[storageIndex].colors.push({
      color: '',
      price: 0,
      stock: 0,
      fileList: [],
    });
    setVariants(newVariants);
  };

  const handleRemoveColor = (storageIndex: number, colorIndex: number) => {
    const newVariants = [...variants];
    newVariants[storageIndex].colors = newVariants[storageIndex].colors.filter(
      (_, i) => i !== colorIndex
    );
    setVariants(newVariants);
  };

  const handleStorageChange = (
    storageIndex: number,
    field: string,
    value: string
  ) => {
    const newVariants = [...variants];
    newVariants[storageIndex] = {
      ...newVariants[storageIndex],
      [field]: value,
    };
    setVariants(newVariants);
  };

  const handleColorChange = (
    storageIndex: number,
    colorIndex: number,
    field: string,
    value: string | number
  ) => {
    const newVariants = [...variants];
    newVariants[storageIndex].colors[colorIndex] = {
      ...newVariants[storageIndex].colors[colorIndex],
      [field]: value,
    };
    setVariants(newVariants);
  };

  const handleColorFileChange = (
    storageIndex: number,
    colorIndex: number,
    fileList: UploadFile[]
  ) => {
    const newVariants = [...variants];
    newVariants[storageIndex].colors[colorIndex].fileList = fileList;
    setVariants(newVariants);
  };

  const handleAddCustomSpecGroup = () => {
    setCustomSpecGroups([
      ...customSpecGroups,
      { groupName: '', fields: [{ key: '', value: '' }] },
    ]);
  };

  const handleRemoveCustomSpecGroup = (groupIndex: number) => {
    const newCustomSpecGroups = customSpecGroups.filter(
      (_, i) => i !== groupIndex
    );
    setCustomSpecGroups(newCustomSpecGroups);
  };

  const handleAddFieldToGroup = (groupIndex: number) => {
    const newCustomSpecGroups = [...customSpecGroups];
    newCustomSpecGroups[groupIndex].fields.push({ key: '', value: '' });
    setCustomSpecGroups(newCustomSpecGroups);
  };

  const handleRemoveFieldFromGroup = (
    groupIndex: number,
    fieldIndex: number
  ) => {
    const newCustomSpecGroups = [...customSpecGroups];
    newCustomSpecGroups[groupIndex].fields = newCustomSpecGroups[
      groupIndex
    ].fields.filter((_, i) => i !== fieldIndex);
    setCustomSpecGroups(newCustomSpecGroups);
  };

  const handleCustomSpecGroupChange = (
    groupIndex: number,
    field: 'groupName',
    value: string
  ) => {
    const newCustomSpecGroups = [...customSpecGroups];
    newCustomSpecGroups[groupIndex][field] = value;
    setCustomSpecGroups(newCustomSpecGroups);
  };

  const handleCustomSpecFieldChange = (
    groupIndex: number,
    fieldIndex: number,
    field: 'key' | 'value',
    value: string
  ) => {
    const newCustomSpecGroups = [...customSpecGroups];
    newCustomSpecGroups[groupIndex].fields[fieldIndex][field] = value;
    setCustomSpecGroups(newCustomSpecGroups);
  };

  const onFinish = async (values: any) => {
    try {
      if (fileList.length < 5) {
        message.error('You must upload at least 5 images!');
        return;
      }

      const uploadedImages = await handleUpload(
        fileList.map((file) => file.originFileObj as File).filter(Boolean)
      );

      if (uploadedImages.length === 0 && !product.photos) {
        message.error('Could not upload images!');
        return;
      }

      // Upload hình ảnh cho từng màu sắc trong biến thể
      const updatedVariants = await Promise.all(
        variants.map(async (variant) => {
          const updatedColors = await Promise.all(
            variant.colors.map(async (color) => {
              const newColorFiles = color.fileList
                .filter((file) => !file.url?.startsWith('http'))
                .map((file) => file.originFileObj as File)
                .filter(Boolean);

              let uploadedColorImages: string[] = [];
              if (newColorFiles.length > 0) {
                uploadedColorImages = await handleUpload(newColorFiles);
              }

              const existingColorImages = color.fileList
                .filter((file) => file.url?.startsWith('http'))
                .map((file) => file.url!);

              return {
                ...color,
                fileList: [...existingColorImages, ...uploadedColorImages],
              };
            })
          );

          return {
            ...variant,
            colors: updatedColors,
          };
        })
      );

      const customSpecsObject = customSpecGroups.reduce(
        (acc, group) => {
          if (group.groupName) {
            acc[group.groupName] = group.fields.reduce(
              (fieldAcc, field) => {
                if (field.key && field.value) fieldAcc[field.key] = field.value;
                return fieldAcc;
              },
              {} as { [key: string]: string }
            );
          }
          return acc;
        },
        {} as { [key: string]: { [subKey: string]: string } }
      );

      const info_product = {
        ...values,
        photos: uploadedImages.length > 0 ? uploadedImages : product.photos,
        slug: values.product_name.toLowerCase().replace(/\s+/g, '-'),
        isDelete: false,
        variants: updatedVariants.length > 0 ? updatedVariants : undefined,
        category: { _id: values.category },
        brand: { _id: values.brand },
        youtubeVideos: values.youtubeVideos || [],
        specification: {
          ...values.specification,
          custom_specs:
            Object.keys(customSpecsObject).length > 0
              ? customSpecsObject
              : undefined,
        },
        discount_end_time: values.discount_end_time
          ? dayjs(values.discount_end_time).toISOString()
          : undefined,
      };

      updateMutation.mutate(info_product);
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        title: 'Error!',
        text: 'An error occurred while updating the product.',
        icon: 'error',
      });
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

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
        console.error(
          'Error fetching categories ==>',
          (error as Error).message
        );
      }
    };

    const fetchBrands = async () => {
      try {
        const res = await axios.get(`${SETTINGS.URL_API}/v1/brands?limit=200`);
        setBrands(res.data.data.brands_list || []);
      } catch (error) {
        console.error('Error fetching brands:', error);
        setBrands([]);
      }
    };

    fetchCategories();
    fetchBrands();
  }, []);

  const uploadProps: UploadProps = {
    accept: 'image/*',
    onRemove: (file) => {
      setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
    },
    beforeUpload: (file) => {
      if (fileList.length >= 10) {
        message.error('You can only upload up to 10 images!');
        return false;
      }
      setFileList((prev) => [...prev, file]);
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

  const handleChange = ({ fileList }: { fileList: UploadFile[] }) => {
    setFileList(fileList);
  };

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      <PlusCircleOutlined className="text-lg" />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  const VariantForm = () => (
    <>
      <Collapse
        accordion={false}
        defaultActiveKey={[0]}
        destroyInactivePanel={false}
        expandIcon={({ isActive }) => (
          <DownOutlined rotate={isActive ? 180 : 0} />
        )}
      >
        {variants.map((variant, storageIndex) => (
          <Collapse.Panel
            key={storageIndex}
            header={`Dung lượng: ${variant.storage || 'Chưa có'}`}
            extra={
              <Button
                type="text"
                danger
                onClick={() => handleRemoveStorage(storageIndex)}
              >
                Xóa
              </Button>
            }
          >
            <Card className="mb-4">
              <Row gutter={16} align="middle">
                <Col span={12}>
                  <Form.Item label="Dung lượng" required>
                    <Input
                      value={variant.storage}
                      onChange={(e) =>
                        handleStorageChange(
                          storageIndex,
                          'storage',
                          e.target.value
                        )
                      }
                      placeholder="VD: 256GB"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Tên sản phẩm cho dung lượng này">
                    <Input
                      value={variant.product_name}
                      onChange={(e) =>
                        handleStorageChange(
                          storageIndex,
                          'product_name',
                          e.target.value
                        )
                      }
                      placeholder="VD: iPhone 16 Pro Max 256GB"
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Collapse cho từng màu sắc */}
              <Collapse accordion>
                {variant.colors.map((color, colorIndex) => (
                  <Collapse.Panel
                    key={colorIndex}
                    header={`Màu sắc: ${color.color || 'Chưa có'}`}
                    extra={
                      <Button
                        type="text"
                        danger
                        onClick={() =>
                          handleRemoveColor(storageIndex, colorIndex)
                        }
                      >
                        Xóa màu sắc
                      </Button>
                    }
                  >
                    <Card className="mb-2">
                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item label="Màu sắc" required>
                            <Input
                              value={color.color}
                              onChange={(e) =>
                                handleColorChange(
                                  storageIndex,
                                  colorIndex,
                                  'color',
                                  e.target.value
                                )
                              }
                              placeholder="VD: Titan Sạ Mạc"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item label="Giá" required>
                            <InputNumber
                              value={color.price}
                              onChange={(value) =>
                                handleColorChange(
                                  storageIndex,
                                  colorIndex,
                                  'price',
                                  value || 0
                                )
                              }
                              style={{ width: '100%' }}
                              min={0}
                              placeholder="Nhập giá"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item label="Tồn kho" required>
                            <InputNumber
                              value={color.stock}
                              onChange={(value) =>
                                handleColorChange(
                                  storageIndex,
                                  colorIndex,
                                  'stock',
                                  value || 0
                                )
                              }
                              style={{ width: '100%' }}
                              min={0}
                              placeholder="Nhập số lượng"
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item label="Hình ảnh biến thể">
                        <Upload
                          listType="picture-card"
                          fileList={color.fileList}
                          onChange={({ fileList }) =>
                            handleColorFileChange(
                              storageIndex,
                              colorIndex,
                              fileList
                            )
                          }
                          onPreview={handlePreview}
                          beforeUpload={() => false}
                          multiple={true}
                        >
                          {color.fileList.length < 5 && uploadButton}
                        </Upload>
                      </Form.Item>
                    </Card>
                  </Collapse.Panel>
                ))}
              </Collapse>

              <Button
                type="dashed"
                onClick={() => handleAddColor(storageIndex)}
                block
                icon={<PlusCircleOutlined />}
                className="mt-2"
              >
                Thêm màu sắc
              </Button>
            </Card>
          </Collapse.Panel>
        ))}
      </Collapse>

      <Button
        type="dashed"
        onClick={handleAddStorage}
        block
        icon={<PlusCircleOutlined />}
        className="mb-4 mt-4"
      >
        Thêm dung lượng
      </Button>
    </>
  );

  const CustomSpecForm = () => (
    <>
      {customSpecGroups.map((group, groupIndex) => (
        <Card
          key={groupIndex}
          title={
            <Input
              placeholder="Custom Specification Group (e.g., Audio)"
              value={group.groupName}
              onChange={(e) =>
                handleCustomSpecGroupChange(
                  groupIndex,
                  'groupName',
                  e.target.value
                )
              }
              style={{ width: '100%' }}
            />
          }
          extra={
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleRemoveCustomSpecGroup(groupIndex)}
            />
          }
          className="mb-4"
        >
          {group.fields.map((field, fieldIndex) => (
            <Row key={fieldIndex} gutter={16} align="middle" className="mb-2">
              <Col span={10}>
                <Input
                  placeholder="Field Name (e.g., Speaker Type)"
                  value={field.key}
                  onChange={(e) =>
                    handleCustomSpecFieldChange(
                      groupIndex,
                      fieldIndex,
                      'key',
                      e.target.value
                    )
                  }
                />
              </Col>
              <Col span={12}>
                <Input
                  placeholder="Value (e.g., Stereo)"
                  value={field.value}
                  onChange={(e) =>
                    handleCustomSpecFieldChange(
                      groupIndex,
                      fieldIndex,
                      'value',
                      e.target.value
                    )
                  }
                />
              </Col>
              <Col span={2}>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() =>
                    handleRemoveFieldFromGroup(groupIndex, fieldIndex)
                  }
                />
              </Col>
            </Row>
          ))}
          <Button
            type="dashed"
            onClick={() => handleAddFieldToGroup(groupIndex)}
            block
            icon={<PlusCircleOutlined />}
            className="mt-2"
          >
            Add Field
          </Button>
        </Card>
      ))}
      <Button
        type="dashed"
        onClick={handleAddCustomSpecGroup}
        block
        icon={<PlusCircleOutlined />}
        className="mb-4"
      >
        Add Custom Specification Group
      </Button>
    </>
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <Title className="text-center pb-10" level={2}>
        Edit Product
      </Title>
      <Form
        form={form}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        layout="vertical"
        style={{ maxWidth: '900px', margin: '0 auto' }}
      >
        <Form.Item
          name="product_name"
          label={<span className="text-[17px]">Product Name</span>}
          rules={[{ required: true, message: 'Please enter product name!' }]}
          hasFeedback
        >
          <Input placeholder="Enter product name" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="price"
              label={<span className="text-[17px]">Price</span>}
              rules={[
                { required: true, message: 'Please enter price!' },
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
              label={<span className="text-[17px]">Final Price</span>}
              rules={[
                { required: true, message: 'Please enter final price!' },
                {
                  type: 'number',
                  min: 0,
                  message: 'Final price cannot be negative!',
                },
              ]}
              hasFeedback
            >
              <InputNumber
                min={0}
                placeholder="Enter final price"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={<span className="text-[17px]">Discount (%)</span>}
              name="discount"
              rules={[
                { required: true, message: 'Please enter discount!' },
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
              label={<span className="text-[17px]">Discount End Time</span>}
              name="discount_end_time"
            >
              <DatePicker
                showTime
                style={{ width: '100%' }}
                placeholder="Select discount end time"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={<span className="text-[17px]">Stock</span>}
              name="stock"
              rules={[
                { required: true, message: 'Please enter stock!' },
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

        <Form.Item
          name="order"
          label={<span className="text-[17px]">Order</span>}
          rules={[
            { required: true, message: 'Please enter order!' },
            {
              type: 'number',
              min: 0,
              message: 'Order must be a positive number!',
            },
          ]}
          hasFeedback
        >
          <InputNumber placeholder="Enter order" style={{ width: '100%' }} />
        </Form.Item>

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

        <Form.Item
          name="description"
          label={<span className="text-[17px]">Description</span>}
          rules={[{ required: true, message: 'Please enter description!' }]}
          hasFeedback
        >
          <Input.TextArea
            showCount
            maxLength={500}
            rows={6}
            placeholder="Enter product description"
          />
        </Form.Item>

        <Divider orientation="left">Specification</Divider>

        <Form.Item
          label="Product Type"
          name={['specification', 'type']}
          rules={[{ required: true, message: 'Please select product type!' }]}
        >
          <Select
            placeholder="Select product type"
            onChange={(value) => setProductType(value)}
          >
            <Option value="phone">Phone</Option>
            <Option value="laptop">Laptop</Option>
            <Option value="other">Other</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Operating System"
          name={['specification', 'operating_system']}
          rules={[
            { required: true, message: 'Please select operating system!' },
          ]}
        >
          <Select placeholder="Select operating system">
            <Option value="iOS">iOS</Option>
            <Option value="Android">Android</Option>
            <Option value="HarmonyOS">HarmonyOS</Option>
            <Option value="Windows">Windows</Option>
            <Option value="macOS">macOS</Option>
          </Select>
        </Form.Item>

        <Card title="Screen" className="mb-4">
          <Form.Item
            label="Size"
            name={['specification', 'screen', 'size']}
            rules={[{ required: true, message: 'Please enter screen size!' }]}
          >
            <Input placeholder="e.g., 6.7 inches" />
          </Form.Item>
          <Form.Item
            label="Technology"
            name={['specification', 'screen', 'technology']}
            rules={[
              { required: true, message: 'Please enter screen technology!' },
            ]}
          >
            <Input placeholder="e.g., OLED" />
          </Form.Item>
          <Form.Item
            label="Resolution"
            name={['specification', 'screen', 'resolution']}
            rules={[{ required: true, message: 'Please enter resolution!' }]}
          >
            <Input placeholder="e.g., 2796 x 1290 pixels" />
          </Form.Item>
          <Form.Item
            label="Refresh Rate"
            name={['specification', 'screen', 'refresh_rate']}
            rules={[{ required: true, message: 'Please enter refresh rate!' }]}
          >
            <Input placeholder="e.g., 120Hz" />
          </Form.Item>
        </Card>

        <Card title="Processor" className="mb-4">
          <Form.Item
            label="Chip"
            name={['specification', 'processor', 'chip']}
            rules={[{ required: true, message: 'Please enter chip!' }]}
          >
            <Input placeholder="e.g., Apple A16 Bionic" />
          </Form.Item>
          <Form.Item
            label="GPU"
            name={['specification', 'processor', 'gpu']}
            rules={[{ required: true, message: 'Please enter GPU!' }]}
          >
            <Input placeholder="e.g., Apple GPU 5-core" />
          </Form.Item>
        </Card>

        <Card title="Memory" className="mb-4">
          <Form.Item
            label="RAM"
            name={['specification', 'memory', 'ram']}
            rules={[{ required: true, message: 'Please enter RAM!' }]}
          >
            <Input placeholder="e.g., 8GB" />
          </Form.Item>
          <Form.Item
            label="Internal Storage"
            name={['specification', 'memory', 'storage']}
            rules={[
              { required: true, message: 'Please enter internal storage!' },
            ]}
          >
            <Input placeholder="e.g., 256GB" />
          </Form.Item>
        </Card>

        {productType === 'phone' && (
          <Card title="Camera" className="mb-4">
            <Form.Item
              label="Main Camera"
              name={['specification', 'camera', 'main']}
              rules={[{ required: true, message: 'Please enter main camera!' }]}
            >
              <Input placeholder="e.g., 48MP, f/1.8" />
            </Form.Item>
            <Form.Item
              label="Selfie Camera"
              name={['specification', 'camera', 'selfie']}
              rules={[
                { required: true, message: 'Please enter selfie camera!' },
              ]}
            >
              <Input placeholder="e.g., 12MP, f/2.2" />
            </Form.Item>
            <Form.Item
              label="Features"
              name={['specification', 'camera', 'features']}
              rules={[
                { required: true, message: 'Please enter camera features!' },
              ]}
            >
              <Select
                mode="tags"
                placeholder="Enter camera features"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Card>
        )}

        {productType === 'laptop' && (
          <Card title="Graphics Card" className="mb-4">
            <Form.Item
              label="Model"
              name={['specification', 'graphics_card', 'model']}
              rules={[
                {
                  required: true,
                  message: 'Please enter graphics card model!',
                },
              ]}
            >
              <Input placeholder="e.g., NVIDIA RTX 3060" />
            </Form.Item>
            <Form.Item
              label="VRAM"
              name={['specification', 'graphics_card', 'vram']}
              rules={[{ required: true, message: 'Please enter VRAM!' }]}
            >
              <Input placeholder="e.g., 6GB" />
            </Form.Item>
          </Card>
        )}

        {productType === 'phone' && (
          <Card title="Battery & Charging" className="mb-4">
            <Form.Item
              label="Battery Capacity"
              name={['specification', 'battery', 'capacity']}
              rules={[
                { required: true, message: 'Please enter battery capacity!' },
              ]}
            >
              <Input placeholder="e.g., 4500 mAh" />
            </Form.Item>
            <Form.Item
              label="Charging Technology"
              name={['specification', 'battery', 'charging']}
              rules={[
                {
                  required: true,
                  message: 'Please enter charging technology!',
                },
              ]}
            >
              <Input placeholder="e.g., Fast charging 25W" />
            </Form.Item>
          </Card>
        )}

        <Card title="Connectivity" className="mb-4">
          {productType === 'phone' && (
            <Form.Item
              label="SIM"
              name={['specification', 'connectivity', 'sim']}
              rules={[
                { required: true, message: 'Please enter SIM information!' },
              ]}
            >
              <Input placeholder="e.g., 2 SIM (nano-SIM and eSIM)" />
            </Form.Item>
          )}
          <Form.Item
            label="Network"
            name={['specification', 'connectivity', 'network']}
            rules={[
              { required: true, message: 'Please enter network information!' },
            ]}
          >
            <Input placeholder="e.g., 5G" />
          </Form.Item>
          <Form.Item
            label="Wi-Fi"
            name={['specification', 'connectivity', 'wifi']}
            rules={[
              { required: true, message: 'Please enter Wi-Fi information!' },
            ]}
          >
            <Input placeholder="e.g., Wi-Fi 6 (802.11ax)" />
          </Form.Item>
          <Form.Item
            label="Bluetooth"
            name={['specification', 'connectivity', 'bluetooth']}
            rules={[
              {
                required: true,
                message: 'Please enter Bluetooth information!',
              },
            ]}
          >
            <Input placeholder="e.g., 5.3" />
          </Form.Item>
        </Card>

        {productType === 'laptop' && (
          <Card title="Ports" className="mb-4">
            <Form.Item
              label="USB"
              name={['specification', 'ports', 'usb']}
              rules={[{ required: true, message: 'Please enter USB ports!' }]}
            >
              <Input placeholder="e.g., 2x USB 3.0, 1x USB-C" />
            </Form.Item>
            <Form.Item
              label="HDMI"
              name={['specification', 'ports', 'hdmi']}
              rules={[
                { required: true, message: 'Please enter HDMI information!' },
              ]}
            >
              <Input placeholder="e.g., HDMI 2.0" />
            </Form.Item>
            <Form.Item
              label="Others"
              name={['specification', 'ports', 'others']}
            >
              <Input placeholder="e.g., SD card reader, headphone jack" />
            </Form.Item>
          </Card>
        )}

        <Card title="Design & Weight" className="mb-4">
          <Form.Item
            label="Dimensions"
            name={['specification', 'design', 'dimensions']}
            rules={[{ required: true, message: 'Please enter dimensions!' }]}
          >
            <Input placeholder="e.g., 160.7 x 77.6 x 7.85 mm" />
          </Form.Item>
          <Form.Item
            label="Weight"
            name={['specification', 'design', 'weight']}
            rules={[{ required: true, message: 'Please enter weight!' }]}
          >
            <Input placeholder="e.g., 240g" />
          </Form.Item>
          <Form.Item
            label="Material"
            name={['specification', 'design', 'material']}
            rules={[{ required: true, message: 'Please enter material!' }]}
          >
            <Input placeholder="e.g., Stainless steel frame, glass back" />
          </Form.Item>
        </Card>

        <Divider orientation="left">Custom Specifications</Divider>
        <CustomSpecForm />

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="isActive"
              label="Active"
              rules={[
                { required: true, message: 'Please select active status!' },
              ]}
            >
              <Radio.Group>
                <Radio value={true}>Enable</Radio>
                <Radio value={false}>Disable</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              name="isRecentlyAdded"
              label="Recently Added"
              rules={[
                {
                  required: true,
                  message: 'Please select recently added status!',
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
              label="Best Product"
              rules={[
                {
                  required: true,
                  message: 'Please select best product status!',
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
              label="Show on Home"
              rules={[
                {
                  required: true,
                  message: 'Please select show on home status!',
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

        <YoutubeVideoForm />

        <Form.Item
          label={<span className="font-sans">Images</span>}
          rules={[{ required: true, message: 'Please upload images!' }]}
          hasFeedback
        >
          <Upload
            {...uploadProps}
            listType="picture-card"
            multiple={true}
            onPreview={handlePreview}
            onChange={handleChange}
          >
            {fileList.length < 10 && (
              <Tooltip title="Please select images from your Pictures folder">
                {uploadButton}
              </Tooltip>
            )}
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

        <Divider orientation="left">Product Variants</Divider>
        <VariantForm />

        <Form.Item>
          <Button type="primary" htmlType="submit" >
            Update Product
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default ProductEdit;
