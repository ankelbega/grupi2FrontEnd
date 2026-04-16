import { Link } from 'react-router-dom';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Divider,
  List,
  Progress,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import {
  BellOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const statCards = [
  {
    title: 'Studentë Aktivë',
    value: 1842,
    prefix: <TeamOutlined />,
    color: '#1f4ea8',
  },
  {
    title: 'Prezenca Sot',
    value: 93,
    suffix: '%',
    prefix: <CheckCircleOutlined />,
    color: '#2563eb',
  },
  {
    title: 'Provime Javore',
    value: 18,
    prefix: <BookOutlined />,
    color: '#1d4ed8',
  },
];

const classColumns = [
  { title: 'Lënda', dataIndex: 'course', key: 'course' },
  { title: 'Pedagogu', dataIndex: 'teacher', key: 'teacher' },
  { title: 'Salla', dataIndex: 'room', key: 'room' },
  { title: 'Ora', dataIndex: 'time', key: 'time' },
  {
    title: 'Statusi',
    dataIndex: 'status',
    key: 'status',
    render: (value) => <Tag color={value === 'Konfirmuar' ? 'blue' : 'geekblue'}>{value}</Tag>,
  },
];

const classData = [
  {
    key: '1',
    course: 'Algoritme dhe Struktura të Dhënash',
    teacher: 'Prof. Drita Hoxha',
    room: 'Lab 2',
    time: '09:00 - 10:30',
    status: 'Konfirmuar',
  },
  {
    key: '2',
    course: 'Arkitektura e Kompjuterëve',
    teacher: 'Dr. Arben Kola',
    room: 'A3-14',
    time: '11:00 - 12:30',
    status: 'Konfirmuar',
  },
  {
    key: '3',
    course: 'Inxhinieri Softuerike',
    teacher: 'Prof. Mira Zeneli',
    room: 'B2-07',
    time: '14:00 - 15:30',
    status: 'Në pritje',
  },
];

const notifications = [
  {
    title: 'Afati i regjistrimit të provimeve mbyllet të premten.',
    time: 'Sot, 10:45',
  },
  {
    title: 'Orari i semestrit pranveror është përditësuar.',
    time: 'Dje, 18:20',
  },
  {
    title: 'Njoftim nga sekretaria për pagesat e semestrit.',
    time: 'Dje, 09:10',
  },
];

export default function UiKit() {
  return (
    <div className="page-layer">
      <div className="section-wrap">
        <section className="hero-band stagger-in">
          <Space direction="vertical" size={8}>
            <Badge color="#cfe1ff" text="Future-Ready UI" />
            <Title level={2} style={{ margin: 0, color: '#f7fffb' }}>
              Dizajne gati për çdo modul të sistemit universitar
            </Title>
            <Paragraph style={{ margin: 0, color: 'rgba(247,255,251,0.86)', maxWidth: 780 }}>
              Kjo faqe është showcase: mund të kopjosh blloqe të gatshme për dashboard, orar,
              rezultate, njoftime dhe menaxhim përdoruesish pa nisur nga zero.
            </Paragraph>
            <Space wrap>
              <Link to="/login">
                <Button size="large" type="primary" style={{ background: '#2563eb', borderColor: '#2563eb' }}>
                  Kthehu te Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="large">Kthehu te Register</Button>
              </Link>
            </Space>
          </Space>
        </section>

        <Row gutter={[16, 16]} style={{ marginTop: 18 }}>
          {statCards.map((item, index) => (
            <Col xs={24} md={8} key={item.title}>
              <Card className={`glass-card stagger-in delay-${Math.min(index + 1, 3)}`}>
                <Statistic
                  title={item.title}
                  value={item.value}
                  suffix={item.suffix}
                  prefix={item.prefix}
                  valueStyle={{ color: item.color, fontWeight: 700 }}
                />
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 2 }}>
          <Col xs={24} lg={16}>
            <Card className="glass-card stagger-in delay-1" title="Template: Tabela e Orarit">
              <Table
                columns={classColumns}
                dataSource={classData}
                pagination={false}
                size="middle"
                scroll={{ x: 680 }}
              />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card className="glass-card stagger-in delay-2" title="Template: Njoftime të Fundit">
              <List
                itemLayout="horizontal"
                dataSource={notifications}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar style={{ backgroundColor: '#1f4ea8' }} icon={<BellOutlined />} />}
                      title={<Text style={{ color: '#12243f' }}>{item.title}</Text>}
                      description={<Text type="secondary">{item.time}</Text>}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 2 }}>
          <Col xs={24} md={12}>
            <Card className="glass-card stagger-in delay-2" title="Template: Progresi i Studentit">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text>Lëndë të përfunduara</Text>
                <Progress percent={74} strokeColor="#1f4ea8" />
                <Divider style={{ margin: '10px 0' }} />
                <Text>Prani mesatare</Text>
                <Progress percent={91} strokeColor="#3b82f6" />
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card className="glass-card stagger-in delay-3" title="Template: Header i Modulëve">
              <Space direction="vertical" style={{ width: '100%' }} size={14}>
                <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                  <Space>
                    <Avatar style={{ backgroundColor: '#1f4ea8' }} icon={<CalendarOutlined />} />
                    <div>
                      <Text strong style={{ display: 'block', color: '#12243f' }}>Moduli: Orari</Text>
                      <Text type="secondary">Semestri pranveror 2025-2026</Text>
                    </div>
                  </Space>
                  <Tag color="blue">Aktiv</Tag>
                </Space>
                <Button type="default" style={{ width: '100%' }}>Veprimi Kryesor</Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
