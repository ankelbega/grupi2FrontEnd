import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout, Table, Select, Button, Tag, Card, Row, Col,
  Typography, Space, Modal, message, Spin, Divider,
} from 'antd';
import { PlusOutlined, LogoutOutlined } from '@ant-design/icons';
import { getOrare, deleteOrar } from '../api/orarApi';
import { SALLET_LIST } from '../api/salleApi';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const DITET = [
  { value: 1, label: 'E Hene' },
  { value: 2, label: 'E Marte' },
  { value: 3, label: 'E Merkure' },
  { value: 4, label: 'E Enjte' },
  { value: 5, label: 'E Premte' },
];

const TIME_SLOTS = ['08:00', '09:30', '11:00', '12:30', '14:00', '15:30'];

const SEMESTRAT = [1, 2, 3, 4, 5, 6].map((i) => ({
  SEM_ID: i,
  SEM_EM: `Semestri ${i}`,
}));

const LLOJI_COLORS = {
  Ligjerate: 'blue',
  Seminar: 'green',
  Laborator: 'orange',
};

const LLOJI_BG = {
  Ligjerate: '#e6f4ff',
  Seminar: '#f6ffed',
  Laborator: '#fff7e6',
};

const LLOJI_BORDER = {
  Ligjerate: '#91caff',
  Seminar: '#b7eb8f',
  Laborator: '#ffd591',
};

function normalizeTime(t) {
  if (!t) return '';
  return String(t).substring(0, 5);
}

function getDitaLabel(val) {
  return DITET.find((d) => d.value === Number(val))?.label || String(val);
}

function getLendaName(o) {
  return (
    o?.seksioni?.lenda?.LEN_EM ||
    o?.seksioni?.LEN_EM ||
    o?.LEN_EM ||
    '—'
  );
}

function getPedagogName(o) {
  const em =
    o?.seksioni?.pedagog?.PED_EMER ||
    o?.seksioni?.PED_EMER ||
    o?.PED_EMER ||
    '';
  const mb =
    o?.seksioni?.pedagog?.PED_MBIEMER ||
    o?.seksioni?.PED_MBIEMER ||
    o?.PED_MBIEMER ||
    '';
  return `${em} ${mb}`.trim() || '—';
}

function getSallaName(o) {
  if (o?.salla?.SALLE_EMRI) return o.salla.SALLE_EMRI;
  const found = SALLET_LIST.find((s) => s.SALLE_ID === o.SALLE_ID);
  return found?.SALLE_EMRI || `Salla ${o.SALLE_ID}`;
}

export default function OrarePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [orare, setOrare] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pedagoget, setPedagoget] = useState([]);

  // Filters
  const [filterPed, setFilterPed] = useState(null);
  const [filterSalle, setFilterSalle] = useState(null);
  const [filterDita, setFilterDita] = useState(null);
  const [filterSem, setFilterSem] = useState(null);

  const fetchPedagoget = useCallback(() => {
    api
      .get('http://localhost:8000/api/pedagoget')
      .then((res) => setPedagoget(res.data?.data || res.data || []))
      .catch(() => {});
  }, []);

  const fetchOrare = useCallback(
    (filters = {}) => {
      setLoading(true);
      getOrare(filters)
        .then((res) => setOrare(res.data?.data || res.data || []))
        .catch(() => message.error('Gabim gjate ngarkimit te orareve'))
        .finally(() => setLoading(false));
    },
    []
  );

  useEffect(() => {
    fetchOrare();
    fetchPedagoget();
  }, [fetchOrare, fetchPedagoget]);

  function handleKerko() {
    const filters = {};
    if (filterPed)   filters.ped_id   = filterPed;
    if (filterSalle) filters.salle_id = filterSalle;
    if (filterDita)  filters.dita     = filterDita;
    if (filterSem)   filters.sem_id   = filterSem;
    fetchOrare(filters);
  }

  function handlePastro() {
    setFilterPed(null);
    setFilterSalle(null);
    setFilterDita(null);
    setFilterSem(null);
    fetchOrare();
  }

  function handleDelete(orar) {
    Modal.confirm({
      title: 'Konfirmo fshirjen',
      content: `A jeni i sigurt qe doni te fshini kete orar?`,
      okText: 'Fshi',
      okType: 'danger',
      cancelText: 'Anulo',
      onOk: async () => {
        try {
          await deleteOrar(orar.ORAR_ID);
          message.success('Orari u fshi me sukses');
          handleKerko();
        } catch {
          message.error('Ndodhi nje gabim gjate fshirjes');
        }
      },
    });
  }

  // ── Weekly calendar columns ──
  const calendarColumns = [
    {
      title: 'Dita',
      dataIndex: 'dita',
      width: 100,
      render: (val) => <Text strong>{getDitaLabel(val)}</Text>,
    },
    ...TIME_SLOTS.map((slot) => ({
      title: slot,
      dataIndex: slot,
      width: 160,
      render: (_, row) => {
        const cells = orare.filter(
          (o) =>
            Number(o.ORAR_DITA) === row.dita &&
            normalizeTime(o.ORAR_ORA_FILL) === slot
        );
        if (cells.length === 0) return null;
        return (
          <>
            {cells.map((o) => (
              <Card
                key={o.ORAR_ID}
                size="small"
                style={{
                  marginBottom: 4,
                  background: LLOJI_BG[o.ORAR_LLOJI] || '#fafafa',
                  borderColor: LLOJI_BORDER[o.ORAR_LLOJI] || '#d9d9d9',
                }}
                bodyStyle={{ padding: '4px 8px' }}
              >
                <Text strong style={{ fontSize: 12, display: 'block' }}>
                  {getLendaName(o)}
                </Text>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {getSallaName(o)}
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {getPedagogName(o)}
                </Text>
              </Card>
            ))}
          </>
        );
      },
    })),
  ];

  const calendarData = DITET.map((d) => ({ key: d.value, dita: d.value }));

  // ── List table columns ──
  const listColumns = [
    {
      title: 'Dita',
      dataIndex: 'ORAR_DITA',
      render: (v) => getDitaLabel(v),
    },
    {
      title: 'Ora',
      render: (_, o) =>
        `${normalizeTime(o.ORAR_ORA_FILL)} - ${normalizeTime(o.ORAR_ORA_MBA)}`,
    },
    {
      title: 'Lenda',
      render: (_, o) => getLendaName(o),
    },
    {
      title: 'Pedagog',
      render: (_, o) => getPedagogName(o),
    },
    {
      title: 'Salla',
      render: (_, o) => getSallaName(o),
    },
    {
      title: 'Lloji',
      dataIndex: 'ORAR_LLOJI',
      render: (v) => <Tag color={LLOJI_COLORS[v] || 'default'}>{v}</Tag>,
    },
    {
      title: 'Veprime',
      render: (_, o) => (
        <Space>
          <Button
            size="small"
            onClick={() => navigate(`/orare/${o.ORAR_ID}/edito`)}
          >
            Edito
          </Button>
          <Button size="small" danger onClick={() => handleDelete(o)}>
            Fshi
          </Button>
        </Space>
      ),
    },
  ];

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
          Menaxhimi i Orareve
        </Title>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/orare/shto')}
          >
            Shto Orar te Ri
          </Button>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            danger
            onClick={logout}
            style={{ color: '#ff4d4f' }}
          >
            Logout
          </Button>
        </Space>
      </Header>

      <Content style={{ padding: '24px' }}>
        {/* Filter bar */}
        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} sm={12} md={5}>
              <Select
                placeholder="Filtro per Pedagog"
                style={{ width: '100%' }}
                allowClear
                value={filterPed}
                onChange={setFilterPed}
                showSearch
                optionFilterProp="children"
              >
                {pedagoget.map((p) => (
                  <Option key={p.PED_ID} value={p.PED_ID}>
                    {p.PED_EMER} {p.PED_MBIEMER}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={5}>
              <Select
                placeholder="Filtro per Salle"
                style={{ width: '100%' }}
                allowClear
                value={filterSalle}
                onChange={setFilterSalle}
              >
                {SALLET_LIST.map((s) => (
                  <Option key={s.SALLE_ID} value={s.SALLE_ID}>
                    {s.SALLE_EMRI}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={5}>
              <Select
                placeholder="Filtro per Dite"
                style={{ width: '100%' }}
                allowClear
                value={filterDita}
                onChange={setFilterDita}
              >
                {DITET.map((d) => (
                  <Option key={d.value} value={d.value}>
                    {d.label}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={5}>
              <Select
                placeholder="Filtro per Semestri"
                style={{ width: '100%' }}
                allowClear
                value={filterSem}
                onChange={setFilterSem}
              >
                {SEMESTRAT.map((s) => (
                  <Option key={s.SEM_ID} value={s.SEM_ID}>
                    {s.SEM_EM}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={24} md={4}>
              <Space>
                <Button type="primary" onClick={handleKerko} loading={loading}>
                  Kerko
                </Button>
                <Button onClick={handlePastro}>Pastro</Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Weekly calendar */}
        <Card
          title="Kalendari Javor"
          style={{ marginBottom: 24 }}
          bodyStyle={{ padding: 0 }}
        >
          <Spin spinning={loading}>
            <Table
              columns={calendarColumns}
              dataSource={calendarData}
              pagination={false}
              bordered
              size="small"
              scroll={{ x: 'max-content' }}
            />
          </Spin>
        </Card>

        {/* List view */}
        <Card title="Lista e Orareve">
          <Table
            columns={listColumns}
            dataSource={orare}
            rowKey="ORAR_ID"
            loading={loading}
            pagination={{ pageSize: 10 }}
            bordered
            size="small"
            scroll={{ x: 'max-content' }}
          />
        </Card>
      </Content>
    </Layout>
  );
}
