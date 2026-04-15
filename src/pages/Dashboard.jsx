import { Layout, Card, Typography, Avatar, Button, Tag, Space, Row, Col } from 'antd';
import { MailOutlined, LogoutOutlined, CalendarOutlined, TeamOutlined, BookOutlined, ApartmentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const roleColors = {
  student: 'blue',
  admin: 'red',
  teacher: 'green',
  dean: 'purple',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const roleColor = roleColors[user?.role] ?? 'default';
  const fullName = `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim();
  const avatarLetter = user?.first_name?.[0]?.toUpperCase() ?? '?';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#001529', padding: '0 24px' }}>
        <Title level={4} style={{ color: '#fff', margin: 0 }}>University MS</Title>
        <Space>
          <Avatar style={{ backgroundColor: '#1677ff' }}>{avatarLetter}</Avatar>
          <Text style={{ color: '#fff' }}>{fullName}</Text>
          <Button type="text" danger icon={<LogoutOutlined />} onClick={logout} style={{ color: '#ff4d4f' }}>
            Logout
          </Button>
        </Space>
      </Header>
      <Content style={{ padding: '48px 24px' }}>
        <Row justify="center">
          <Col xs={24} sm={20} md={16} lg={12}>
            <Card style={{ marginBottom: 24 }}>
              <Title level={4}>Mirë se vini, {fullName}</Title>
              <Space direction="vertical" size="small">
                <Space>
                  <MailOutlined />
                  <Text>{user?.email}</Text>
                </Space>
                <Space>
                  <Text>Roli:</Text>
                  <Tag color={roleColor}>{user?.role ?? 'N/A'}</Tag>
                </Space>
              </Space>
            </Card>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Card hoverable style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/lende')}>
                  <BookOutlined style={{ fontSize: 32, color: '#1677ff', marginBottom: 8 }} />
                  <Title level={5} style={{ margin: 0 }}>Menaxho Lëndët</Title>
                  <Text type="secondary">Shiko, shto dhe edito lëndët</Text>
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card hoverable style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/programe')}>
                  <ApartmentOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
                  <Title level={5} style={{ margin: 0 }}>Menaxho Programet</Title>
                  <Text type="secondary">Shiko, shto dhe edito programet e studimit</Text>
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card hoverable style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/pedagoget')}>
                  <TeamOutlined style={{ fontSize: 32, color: '#722ed1', marginBottom: 8 }} />
                  <Title level={5} style={{ margin: 0 }}>Menaxho Pedagogët</Title>
                  <Text type="secondary">Shto, edito dhe fshi pedagogët</Text>
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card hoverable style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/orare')}>
                  <CalendarOutlined style={{ fontSize: 32, color: '#fa8c16', marginBottom: 8 }} />
                  <Title level={5} style={{ margin: 0 }}>Menaxho Oraret</Title>
                  <Text type="secondary">Shiko dhe shto orare mësimore</Text>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}