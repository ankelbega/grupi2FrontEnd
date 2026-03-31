import { Layout, Card, Typography, Avatar, Button, Tag, Space } from 'antd';
import { MailOutlined, LogoutOutlined } from '@ant-design/icons';
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
  const { user, logout } = useAuth();

  const roleColor = roleColors[user?.role] ?? 'default';
  const fullName = `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim();
  const avatarLetter = user?.first_name?.[0]?.toUpperCase() ?? '?';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#001529',
          padding: '0 24px',
        }}
      >
        <Title level={4} style={{ color: '#fff', margin: 0 }}>
          University MS
        </Title>
        <Space>
          <Avatar style={{ backgroundColor: '#1677ff' }}>{avatarLetter}</Avatar>
          <Text style={{ color: '#fff' }}>{fullName}</Text>
          <Button
            type="text"
            danger
            icon={<LogoutOutlined />}
            onClick={logout}
            style={{ color: '#ff4d4f' }}
          >
            Logout
          </Button>
        </Space>
      </Header>
      <Content style={{ padding: '48px 24px', display: 'flex', justifyContent: 'center' }}>
        <Card style={{ width: 480 }}>
          <Title level={4}>Welcome, {fullName}</Title>
          <Space direction="vertical" size="small">
            <Space>
              <MailOutlined />
              <Text>{user?.email}</Text>
            </Space>
            <Space>
              <Text>Role:</Text>
              <Tag color={roleColor}>{user?.role ?? 'N/A'}</Tag>
            </Space>
          </Space>
        </Card>
      </Content>
    </Layout>
  );
}
