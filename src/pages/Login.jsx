import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert, message } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const { Title } = Typography;

export default function Login() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Maps backend Albanian field names back to form field names for inline errors
  const errorFieldMap = {
    PERD_EMAIL:   'email',
    PERD_FJKALIM: 'password',
  };

  const onFinish = async (values) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/login', {
        PERD_EMAIL:   values.email,
        PERD_FJKALIM: values.password,
      });
      if (res.data.success) {
        login(res.data.data.user, res.data.data.token);
        message.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid email or password.');
      } else if (err.response?.status === 422) {
        const fieldErrors = err.response.data.errors;
        form.setFields(
          Object.entries(fieldErrors).map(([name, messages]) => ({
            name: errorFieldMap[name] ?? name,
            errors: messages,
          }))
        );
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="full-page-center">
      <Card style={{ width: 420 }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
          Sign in
        </Title>
        {error && (
          <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />
        )}
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email.' },
              { type: 'email', message: 'Please enter a valid email.' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="you@example.com" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter your password.' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 8 }}>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Log in
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center' }}>
          <Typography.Text>
            Don&apos;t have an account?{' '}
            <Link to="/register">Register</Link>
          </Typography.Text>
        </div>
      </Card>
    </div>
  );
}
