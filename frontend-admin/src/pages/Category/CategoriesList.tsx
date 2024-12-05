import React from 'react';
import useTitle from '../../hooks/useTitle';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import '../../styles/CategoriesList.css';
import { Image, Table, Typography } from 'antd';
import { BsTrash3 } from 'react-icons/bs';
import { FiEdit2 } from 'react-icons/fi';
import { HiOutlineEye } from 'react-icons/hi2';
import Swal from 'sweetalert2';

interface ICategory {
  id?: number;
  name: string;
  image: string;
}

const { Title } = Typography;

const CategoriesList: React.FC = () => {
  useTitle('Topzone - Category List');

  // ========== Fetch categories ==========
  const fetchCategories = async () => {
    const response = await axios.get(
      'https://api.escuelajs.co/api/v1/categories'
    );
    return response.data;
  };

  const { data, isLoading, isError, error } = useQuery<ICategory[]>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  // ========== Fetch delete ==========
  const queryClient = useQueryClient();

  const fetchDeleteCategory = async (id: number) => {
    const response = await axios.delete(
      `https://api.escuelajs.co/api/v1/categories/${id}`
    );
    return response.data;
  };

  const deleteMutationCategory = useMutation({
    mutationFn: fetchDeleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['categories'],
      });
      Swal.fire({
        title: 'Deleted!',
        text: 'Deleted category successfully',
        icon: 'success',
        confirmButtonText: 'OK',
      });
    },
    onError: (error) => {
      console.error('Error when deleting category!', error);
    },
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error: {(error as Error).message}</p>;

  const tableColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: '10%',
    },

    {
      title: 'Category Name',
      dataIndex: 'name',
      key: 'name',
      width: '30%',
    },
    {
      title: 'Photo',
      dataIndex: 'image',
      key: 'image',
      render: (_: any, record: ICategory) => (
        <Image
          src={record.image}
          alt={record.name}
          width={80}
          height={80}
          style={{ objectFit: 'cover', borderRadius: '10px' }}
        />
      ),
      width: '20%',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: ICategory) => (
        <div
          style={{
            display: 'flex',
            gap: '16px',
          }}
        >
          <button
            style={{
              background: 'transparent',
              color: '#2bace3',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '30px',
            }}
            onClick={() => console.log('View', record.id)}
          >
            <HiOutlineEye />
          </button>
          <button
            style={{
              background: 'transparent',
              color: '#2cdc1c',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '25px',
            }}
            onClick={() => alert(record.id)}
          >
            <FiEdit2 />
          </button>
          <button
            style={{
              background: 'transparent',
              color: '#ef4472',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '25px',
            }}
            onClick={() => deleteMutationCategory.mutate(record.id)}
          >
            <BsTrash3 />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Title level={2}>Category List</Title>
      <Table
        columns={tableColumns}
        dataSource={data}
        rowKey="id"
        pagination={{ pageSize: 5 }} // Hiển thị 4 dòng mỗi trang
        style={{ margin: '20px' }}
      />
    </>
  );
};

export default CategoriesList;

{
  /* <div className="category-list ">
        {data.slice(0, 8).map(
          (
            category: ICategory // Lấy tối đa 8 danh mục
          ) => (
            <div className="category-card " key={category.id}>
              <img
                className="category-image"
                src={category.image}
                alt={category.name}
              />
              <div className="category-info">
                <h3>{category.name}</h3>
                <p>ID: {category.id}</p>
              </div>
            </div>
          )
        )}
      </div> */
}
