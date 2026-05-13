import { Layout, Card, Typography, Avatar, Button, Tag, Space, Row, Col, Switch } from 'antd';
import {
  MailOutlined, LogoutOutlined, CalendarOutlined, TeamOutlined,
  BookOutlined, ApartmentOutlined, BankOutlined, SunOutlined, MoonOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const roleColors = {
  student: 'blue',
  admin: 'red',
  teacher: 'green',
  dean: 'purple',
};

const NAV_CARDS = [
  {
    path: '/lende',
    icon: BookOutlined,
    iconColor: '#1677ff',
    iconBg: '#e6f4ff',
    accentColor: '#1677ff',
    title: 'Menaxho Lëndët',
    desc: 'Shiko, shto dhe edito lëndët',
    delay: 'delay-1',
  },
  {
    path: '/programe',
    icon: ApartmentOutlined,
    iconColor: '#52c41a',
    iconBg: '#f6ffed',
    accentColor: '#52c41a',
    title: 'Menaxho Programet',
    desc: 'Shiko, shto dhe edito programet e studimit',
    delay: 'delay-2',
  },
  {
    path: '/pedagoget',
    icon: TeamOutlined,
    iconColor: '#722ed1',
    iconBg: '#f9f0ff',
    accentColor: '#722ed1',
    title: 'Menaxho Pedagogët',
    desc: 'Shto, edito dhe fshi pedagogët',
    delay: 'delay-3',
  },
  {
    path: '/orare/kalendar',
    icon: CalendarOutlined,
    iconColor: '#eb2f96',
    iconBg: '#fff0f6',
    accentColor: '#eb2f96',
    title: 'Kalendari i Orareve',
    desc: 'Pamja kalendarike javore',
    delay: 'delay-4',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

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
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5986 100%)',
          padding: '0 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          height: 64,
        }}
      >
        <Space align="center" size={10}>
          <div
            style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <BankOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <Title level={4} style={{ color: '#fff', margin: 0 }}>University MS</Title>
        </Space>
        <Space>
          <Switch
            checked={isDark}
            onChange={toggleTheme}
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
          />
          <Avatar style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700 }}>
            {avatarLetter}
          </Avatar>
          <Text style={{ color: 'rgba(255,255,255,0.9)' }}>{fullName}</Text>
          <Button type="text" danger icon={<LogoutOutlined />} onClick={logout} style={{ color: '#ff7875' }}>
            Logout
          </Button>
        </Space>
      </Header>

      <Content style={{ padding: '40px 32px' }}>
        <Row justify="center">
          <Col xs={24} sm={22} md={18} lg={16}>
            {/* Welcome Hero */}
            <div
              className="stagger-in"
              style={{
                marginBottom: 32,
                background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5986 100%)',
                borderRadius: 16,
                boxShadow: '0 4px 24px rgba(30,58,95,0.35)',
                padding: '28px 32px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{
                position: 'absolute',
                width: 300,
                height: 300,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.04)',
                right: -50,
                top: -80,
                pointerEvents: 'none',
              }} />
              <Space align="center" size={20} style={{ width: '100%', position: 'relative' }}>
                <Avatar
                  size={56}
                  className="avatar-pulse"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: '#fff',
                    fontSize: 22,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {avatarLetter}
                </Avatar>
                <div>
                  <Title level={4} style={{ color: '#fff', margin: 0, marginBottom: 6 }}>
                    Mirë se vini, {fullName}
                  </Title>
                  <Space size={12} wrap>
                    <Space size={4}>
                      <MailOutlined style={{ color: 'rgba(255,255,255,0.65)' }} />
                      <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>{user?.email}</Text>
                    </Space>
                    <Tag
                      color={roleColor}
                      style={{ borderRadius: 20, fontWeight: 600, padding: '1px 12px', border: 'none' }}
                    >
                      {user?.role ?? 'N/A'}
                    </Tag>
                  </Space>
                </div>
              </Space>
            </div>

            {/* Section label */}
            <Text style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: '#8c8c8c',
              display: 'block',
              marginBottom: 16,
            }}>
              Modulet e Sistemit
            </Text>

            {/* Navigation Cards */}
            <Row gutter={[16, 16]}>
              {NAV_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <Col key={card.path} xs={24} sm={12}>
                    <Card
                      hoverable
                      className={`nav-card stagger-in ${card.delay}`}
                      style={{
                        textAlign: 'center',
                        cursor: 'pointer',
                        borderTop: `3px solid ${card.accentColor}`,
                        borderRadius: 12,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        overflow: 'hidden',
                      }}
                      bodyStyle={{
                        padding: '28px 20px',
                        background: `linear-gradient(135deg, ${card.accentColor}15 0%, transparent 60%)`,
                      }}
                      onClick={() => navigate(card.path)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = `0 12px 32px ${card.accentColor}30`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = '';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                      }}
                    >
                      <div
                        className="icon-circle"
                        style={{
                          backgroundColor: card.iconBg,
                          boxShadow: `0 4px 12px ${card.iconColor}30`,
                        }}
                      >
                        <Icon style={{ fontSize: 28, color: card.iconColor }} />
                      </div>
                      <Title level={5} style={{ margin: 0, marginBottom: 4, fontSize: 15, fontWeight: 600 }}>
                        {card.title}
                      </Title>
                      <Text style={{ fontSize: 12, color: '#8c8c8c' }}>
                        {card.desc}
                      </Text>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Col>
        </Row>
      </Content>

      <Footer style={{ textAlign: 'center', background: 'transparent', color: '#bfbfbf', fontSize: 11, padding: '16px 24px' }}>
        University Management System © 2026 — UAMD Grupi 2
      </Footer>
    </Layout>
  );
}
