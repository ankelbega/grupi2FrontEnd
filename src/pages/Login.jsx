import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { MailOutlined, LockOutlined, BankOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';

const { Title, Text } = Typography;

const PRIMARY = '#1e3a5f';

const cardStyle = {
  width: '100%',
  maxWidth: 420,
  borderRadius: 12,
  boxShadow: '0 2px 16px rgba(30,58,95,0.10)',
  border: '1px solid #e8edf3',
};

const inputStyle = { borderRadius: 6 };

const iconStyle = { color: '#9ca3af' };

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
    try {
      const res = await api.post('/login', {
        PERD_EMAIL:   values.email,
        PERD_FJKALIM: values.password,
      });
      if (res.data.success) {
        login(res.data.data.user, res.data.data.token);
        message.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 429) {
        message.error(err.response.data.message);
      } else if (status === 422 || status === 401) {
        message.error('Email ose fjalëkalim i gabuar.');
      } else if (status === 500) {
        message.error('Gabim në server. Provo përsëri më vonë.');
      } else {
        message.error('Diçka shkoi gabim. Provo përsëri.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      {/* University branding */}
      <div className="stagger-in" style={{ textAlign: 'center', marginBottom: 28 }}>
        <div className="brand-mark">
          <BankOutlined style={{ fontSize: 28, color: '#fff' }} />
        </div>
        <Title level={4} style={{ color: PRIMARY, margin: 0, fontWeight: 700, letterSpacing: 0.3 }}>
          Universiteti
        </Title>
        <Text type="secondary" style={{ fontSize: 12 }}>University Management System</Text>
      </div>

      <Card className="glass-card stagger-in delay-1" style={cardStyle} styles={{ body: { padding: 32 } }}>
        <Title level={4} style={{ textAlign: 'center', color: PRIMARY, marginBottom: 24, fontWeight: 600 }}>
          Hyr në llogarinë tuaj
        </Title>

        <Form form={form} layout="vertical" onFinish={onFinish} size="large">
          <Form.Item
            name="email"
            label={<Text style={{ color: '#374151', fontWeight: 500 }}>Email</Text>}
            rules={[
              { required: true, message: 'Ju lutem shkruani emailin tuaj.' },
              { type: 'email', message: 'Email i pavlefshëm.' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={iconStyle} />}
              placeholder="emri@universiteti.edu.al"
              style={inputStyle}
              onChange={() => setError(null)}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={<Text style={{ color: '#374151', fontWeight: 500 }}>Fjalëkalimi</Text>}
            rules={[{ required: true, message: 'Ju lutem shkruani fjalëkalimin.' }]}
            style={{ marginBottom: 20 }}
          >
            <Input.Password
              prefix={<LockOutlined style={iconStyle} />}
              placeholder="••••••••"
              style={inputStyle}
              onChange={() => setError(null)}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{
                background: PRIMARY,
                borderColor: PRIMARY,
                borderRadius: 6,
                height: 44,
                fontWeight: 600,
                fontSize: 15,
                letterSpacing: 0.3,
              }}
            >
              Hyr
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Nuk ke llogari?{' '}
            <Link to="/register" style={{ color: PRIMARY, fontWeight: 500 }}>
              Regjistrohu
            </Link>
          </Text>
        </div>
      </Card>

      <Text type="secondary" className="stagger-in delay-2" style={{ marginTop: 18, fontSize: 12 }}>
        <Link to="/ui-kit" style={{ color: PRIMARY, fontWeight: 600 }}>Shiko UI Kit</Link>
      </Text>

      <Text type="secondary" className="stagger-in delay-3" style={{ marginTop: 16, fontSize: 11 }}>
        University Management System © 2025
      </Text>
    </div>
  );
}
