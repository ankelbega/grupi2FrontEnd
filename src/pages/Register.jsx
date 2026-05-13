import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Row, Col, Progress, message } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, BankOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import api from "../api/axiosInstance";

const { Title, Text } = Typography;

const PRIMARY = '#1e3a5f';

const cardStyle = {
  width: '100%',
  maxWidth: 480,
  borderRadius: 12,
  boxShadow: '0 2px 16px rgba(30,58,95,0.10)',
  border: '1px solid #e8edf3',
};

const inputStyle = { borderRadius: 6 };

const iconStyle = { color: '#9ca3af' };

function getPasswordStrength(pwd) {
  if (!pwd) return null;
  const hasLower   = /[a-z]/.test(pwd);
  const hasUpper   = /[A-Z]/.test(pwd);
  const hasDigit   = /\d/.test(pwd);
  const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);
  const variety = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length;
  if (pwd.length >= 10 && variety >= 3) return { label: 'E fortë',   percent: 100, color: '#16a34a' };
  if (pwd.length >= 6  && variety >= 2) return { label: 'Mesatare',  percent: 60,  color: '#d97706' };
  return                                       { label: 'E dobët',   percent: 25,  color: '#dc2626' };
}

export default function Register() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordValue, setPasswordValue] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Maps backend Albanian field names back to form field names for inline errors
  const errorFieldMap = {
    PERD_EMER:    'first_name',
    PERD_MBIEMER: 'last_name',
    PERD_EMAIL:   'email',
    PERD_FJKALIM: 'password',
  };

  const onFinish = async (values) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/register', {
        PERD_EMER:                 values.first_name,
        PERD_MBIEMER:              values.last_name,
        PERD_EMAIL:                values.email,
        PERD_FJKALIM:              values.password,
        PERD_FJKALIM_confirmation: values.password_confirmation,
        PERD_TIPI:                 'student',
      });
      if (res.data.success) {
        login(res.data.data.user, res.data.data.token);
        message.success('Account created successfully!');
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

  const strength = getPasswordStrength(passwordValue);

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
          Krijo një llogari
        </Title>

        <Form form={form} layout="vertical" onFinish={onFinish} size="large">
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="first_name"
                label={<Text style={{ color: '#374151', fontWeight: 500 }}>Emri</Text>}
                rules={[{ required: true, message: 'Kërkohet emri.' }]}
              >
                <Input
                  prefix={<UserOutlined style={iconStyle} />}
                  placeholder="Emri"
                  style={inputStyle}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="last_name"
                label={<Text style={{ color: '#374151', fontWeight: 500 }}>Mbiemri</Text>}
                rules={[{ required: true, message: 'Kërkohet mbiemri.' }]}
              >
                <Input
                  prefix={<UserOutlined style={iconStyle} />}
                  placeholder="Mbiemri"
                  style={inputStyle}
                />
              </Form.Item>
            </Col>
          </Row>

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
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={<Text style={{ color: '#374151', fontWeight: 500 }}>Fjalëkalimi</Text>}
            rules={[{ required: true, message: 'Ju lutem shkruani fjalëkalimin.' }]}
            style={{ marginBottom: strength ? 4 : undefined }}
          >
            <Input.Password
              prefix={<LockOutlined style={iconStyle} />}
              placeholder="••••••••"
              style={inputStyle}
              onChange={(e) => setPasswordValue(e.target.value)}
            />
          </Form.Item>

          {strength && (
            <div style={{ marginBottom: 16 }}>
              <Progress
                percent={strength.percent}
                strokeColor={strength.color}
                showInfo={false}
                size="small"
                style={{ marginBottom: 2 }}
              />
              <Text style={{ fontSize: 11, color: strength.color }}>{strength.label}</Text>
            </div>
          )}

          <Form.Item
            name="password_confirmation"
            label={<Text style={{ color: '#374151', fontWeight: 500 }}>Konfirmo fjalëkalimin</Text>}
            dependencies={['password']}
            rules={[
              { required: true, message: 'Ju lutem konfirmoni fjalëkalimin.' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Fjalëkalimet nuk përputhen.'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={iconStyle} />}
              placeholder="••••••••"
              style={inputStyle}
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
              Regjistrohu
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Ke llogari?{' '}
            <Link to="/login" style={{ color: PRIMARY, fontWeight: 500 }}>
              Hyr
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
