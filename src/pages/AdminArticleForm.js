import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, message } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import BASE_API_URL from "../utils/apiConfig";

const AdminNews = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [form] = Form.useForm();
  const [selectedImage, setSelectedImage] = useState(null);

  // Fetch all news
  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_API_URL}/api/news`);
      const data = await res.json();
      setNewsList(data);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
    setLoading(false);
  };

  // Handle Add/Edit Modal
  const handleOpenModal = (news = null) => {
    setEditingNews(news);
    setIsModalOpen(true);
    form.setFieldsValue(news || { title: "", content: "", author: "" });
    setSelectedImage(null); // Reset selected image
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNews(null);
    form.resetFields();
    setSelectedImage(null);
  };

  // Handle Image Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  // Handle Form Submission
  const handleFormSubmit = async (values) => {
    setLoading(true);

    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("content", values.content);
    formData.append("author", values.author);
    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    try {
      const response = await fetch(
        `${BASE_API_URL}/api/news${editingNews ? `/${editingNews._id}` : ""}`,
        {
          method: editingNews ? "PUT" : "POST",
          body: formData,
        }
      );

      if (response.ok) {
        message.success(editingNews ? "News updated successfully" : "News added successfully");
        fetchNews();
        handleCloseModal();
      } else {
        message.error("Failed to save news");
      }
    } catch (error) {
      console.error("Error saving news:", error);
      message.error("Something went wrong");
    }

    setLoading(false);
  };

  // Delete News
  const handleDeleteNews = async (id) => {
    if (!window.confirm("Are you sure you want to delete this news?")) return;

    setLoading(true);
    try {
      await fetch(`${BASE_API_URL}/api/news/${id}`, { method: "DELETE" });
      message.success("News deleted successfully");
      fetchNews();
    } catch (error) {
      console.error("Error deleting news:", error);
      message.error("Failed to delete news");
    }
    setLoading(false);
  };

  // Table Columns
  const columns = [
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Author", dataIndex: "author", key: "author" },
    {
      title: "Image",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (img) => <img src={img} alt="News" width="60" height="40" />,
    },
    { title: "Date", dataIndex: "date", key: "date", render: (text) => new Date(text).toLocaleDateString() },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <>
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
          <Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDeleteNews(record._id)} style={{ marginLeft: 8 }} />
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin News Management</h1>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()} style={{ marginBottom: 16 }}>
        Add News
      </Button>
      <Table columns={columns} dataSource={newsList} rowKey="_id" loading={loading} />

      {/* Modal for Adding/Editing News */}
      <Modal
        title={editingNews ? "Edit News" : "Add News"}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
      >
        <Form form={form} onFinish={handleFormSubmit} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true, message: "Title is required" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="content" label="Content" rules={[{ required: true, message: "Content is required" }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="author" label="Author" rules={[{ required: true, message: "Author is required" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Image">
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {editingNews ? "Update News" : "Add News"}
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminNews;
