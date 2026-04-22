import { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Table,
  Button,
  Select,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  DatePicker,
  Popconfirm,
  message,
  Typography,
  List,
  Descriptions,
  Divider,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ClearOutlined,
  LogoutOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';
import {
  getPedagoget,
  getPedagogLende,
  getPedagogOrari,
  createPedagog,
  updatePedagog,
  deletePedagog,
} from '../api/pedagogApi';
import { SEMESTRAT } from '../config/constants';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const DEPARTAMENTET = [
  { id: 1, emri: 'Departamenti i Informatikës' },
  { id: 2, emri: 'Departamenti i Matematikës' },
  { id: 3, emri: 'Departamenti i Fizikës' },
  { id: 4, emri: 'Departamenti i Kimisë' },
  { id: 5, emri: 'Departamenti i Biologjisë' },
  { id: 6, emri: 'Departamenti i Ekonomiksit' },
];

const DITET = [
  { nr: 1, emri: 'E Hënë' },
  { nr: 2, emri: 'E Martë' },
  { nr: 3, emri: 'E Mërkurë' },
  { nr: 4, emri: 'E Enjte' },
  { nr: 5, emri: 'E Premte' },
];

function getDepartamentEmri(dep_id) {
  const dep = DEPARTAMENTET.find((d) => d.id === Number(dep_id));
  return dep ? dep.emri : dep_id ?? '—';
}

export default function PedagogPage() {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const avatarLetter = user?.first_name?.[0]?.toUpperCase() ?? '?';
  const fullName = `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim();

  // Filter state
  const [filterDep, setFilterDep] = useState(null);
  const [filterKontrata, setFilterKontrata] = useState(null);

  // Table state
  const [pedagoget, setPedagoget] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  // Detail modal state
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedPedagog, setSelectedPedagog] = useState(null);
  const [semId, setSemId] = useState(null);
  const [lende, setLende] = useState([]);
  const [lendeLoading, setLendeLoading] = useState(false);
  const [orari, setOrari] = useState([]);
  const [orariLoading, setOrariLoading] = useState(false);
  const [orariVisible, setOrariVisible] = useState(false);

  // Create/Edit modal state
  const [formVisible, setFormVisible] = useState(false);
  const [editingPedagog, setEditingPedagog] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPedagoget();
  }, []);

  async function fetchPedagoget(filters = {}) {
    setTableLoading(true);
    try {
      const res = await getPedagoget(filters);
      const data = res.data?.data ?? res.data ?? [];
      setPedagoget(Array.isArray(data) ? data : []);
    } catch {
      message.error('Gabim gjatë ngarkimit të pedagogëve.');
    } finally {
      setTableLoading(false);
    }
  }

  function handleKerko() {
    const filters = {};
    if (filterDep) filters.dep_id = filterDep;
    if (filterKontrata) filters.kontrata = filterKontrata;
    fetchPedagoget(filters);
  }

  function handlePastro() {
    setFilterDep(null);
    setFilterKontrata(null);
    fetchPedagoget();
  }

  // Detail modal
  function openDetail(record) {
    setSelectedPedagog(record);
    setLende([]);
    setOrari([]);
    setSemId(null);
    setOrariVisible(false);
    setDetailVisible(true);
  }

  async function handleNgarkoLende() {
    if (!semId) {
      message.warning('Zgjidhni semestrin para se të ngarkoni lëndet.');
      return;
    }
    setLendeLoading(true);
    try {
      const res = await getPedagogLende(selectedPedagog.PED_ID ?? selectedPedagog.id, semId);
      const data = res.data?.data ?? res.data ?? [];
      setLende(Array.isArray(data) ? data : []);
      setOrariVisible(false);
    } catch {
      message.error('Gabim gjatë ngarkimit të lëndëve.');
    } finally {
      setLendeLoading(false);
    }
  }

  async function handleShikoOrarin() {
    setOrariLoading(true);
    try {
      const res = await getPedagogOrari(selectedPedagog.PED_ID ?? selectedPedagog.id, semId);
      const data = res.data?.data ?? res.data ?? [];
      setOrari(Array.isArray(data) ? data : []);
      setOrariVisible(true);
    } catch {
      message.error('Gabim gjatë ngarkimit të orarit.');
    } finally {
      setOrariLoading(false);
    }
  }

  // Build orari weekly grid: rows = days, cells = list of entries
  function buildOrariGrid() {
    const grid = {};
    DITET.forEach((d) => { grid[d.nr] = []; });
    orari.forEach((entry) => {
      const day = entry.ORA_DITA ?? entry.dita;
      if (grid[day] !== undefined) {
        grid[day].push(entry);
      }
    });
    return grid;
  }

  // Create/Edit modal
  function openCreate() {
    setEditingPedagog(null);
    form.resetFields();
    setFormVisible(true);
  }

  function openEdit(record) {
    setEditingPedagog(record);
    form.setFieldsValue({
      PERD_EMER: record.PERD_EMER ?? '',
      PERD_MBIEMER: record.PERD_MBIEMER ?? '',
      PERD_EMAIL: record.PERD_EMAIL ?? '',
      DEP_ID: record.DEP_ID ?? record.dep_id,
      PED_KOD: record.PED_KOD,
      PED_SPECIALIZIM: record.PED_SPECIALIZIM,
      PED_LLOJ_KONTRATE: record.PED_LLOJ_KONTRATE,
      PED_DATA_PUNESIMIT: record.PED_DATA_PUNESIMIT ? dayjs(record.PED_DATA_PUNESIMIT) : null,
    });
    setFormVisible(true);
  }

  async function handleFormSubmit() {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    const payload = {
      ...values,
      PERD_ID: null,
      PED_DATA_PUNESIMIT: values.PED_DATA_PUNESIMIT
        ? values.PED_DATA_PUNESIMIT.format('YYYY-MM-DD')
        : undefined,
    };
    if (editingPedagog) {
      delete payload.PERD_FJKALIM;
    }
    setFormLoading(true);
    try {
      if (editingPedagog) {
        await updatePedagog(editingPedagog.PED_ID ?? editingPedagog.id, payload);
        message.success('Pedagogu u përditësua me sukses.');
      } else {
        await createPedagog(payload);
        message.success('Pedagogu u shtua me sukses.');
      }
      setFormVisible(false);
      fetchPedagoget();
    } catch {
      message.error('Gabim gjatë ruajtjes së pedagogut.');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(record) {
    try {
      await deletePedagog(record.PED_ID ?? record.id);
      message.success('Pedagogu u fshi me sukses.');
      fetchPedagoget();
    } catch (err) {
      if (err?.response?.status === 409) {
        message.error('Ky pedagog ka seksione aktive.');
      } else {
        message.error('Gabim gjatë fshirjes së pedagogut.');
      }
    }
  }

  const columns = [
    {
      title: 'Kodi',
      dataIndex: 'PED_KOD',
      key: 'PED_KOD',
      width: 100,
    },
    {
      title: 'Emri i Plotë',
      key: 'emri',
      render: (_, r) =>
        r.PERD_EMER
          ? `${r.PERD_EMER} ${r.PERD_MBIEMER ?? ''}`.trim()
          : r.PED_KOD ?? '—',
    },
    {
      title: 'Specializimi',
      dataIndex: 'PED_SPECIALIZIM',
      key: 'PED_SPECIALIZIM',
    },
    {
      title: 'Departamenti',
      key: 'departamenti',
      render: (_, r) => getDepartamentEmri(r.DEP_ID ?? r.dep_id),
    },
    {
      title: 'Kontrata',
      key: 'kontrata',
      render: (_, r) => {
        const k = r.PED_LLOJ_KONTRATE;
        if (!k) return '—';
        const color = k === 'kohe-plote' ? 'green' : 'orange';
        const label = k === 'kohe-plote' ? 'Kohë-plote' : 'Kohë-pjesshme';
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'Veprime',
      key: 'veprime',
      width: 260,
      render: (_, record) => (
        <Space size="small">
          <Button size="small" onClick={() => openDetail(record)}>
            Shiko Detajet
          </Button>
          {isAdmin && (
            <Button size="small" type="primary" ghost onClick={() => openEdit(record)}>
              Edito
            </Button>
          )}
          {isAdmin && (
            <Popconfirm
              title="A jeni i sigurt që doni të fshini këtë pedagog?"
              okText="Po, fshi"
              cancelText="Anulo"
              onConfirm={() => handleDelete(record)}
            >
              <Button size="small" danger>
                Fshi
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const orariGrid = buildOrariGrid();

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
        <Space>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/dashboard')}
            style={{ color: '#fff' }}
          />
          <Title level={4} style={{ color: '#fff', margin: 0 }}>
            Menaxhimi i Pedagogëve
          </Title>
        </Space>
        <Space>
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

      <Content style={{ padding: '24px' }}>
        {/* Filter Bar */}
        <Card style={{ marginBottom: 16 }}>
          <Space wrap>
            <Select
              placeholder="Filtro sipas Departamentit"
              style={{ width: 260 }}
              allowClear
              value={filterDep}
              onChange={setFilterDep}
            >
              {DEPARTAMENTET.map((d) => (
                <Option key={d.id} value={d.id}>
                  {d.emri}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Filtro sipas Kontratës"
              style={{ width: 200 }}
              allowClear
              value={filterKontrata}
              onChange={setFilterKontrata}
            >
              <Option value="">Të gjitha</Option>
              <Option value="kohe-plote">Kohë-plote</Option>
              <Option value="kohe-pjesshme">Kohë-pjesshme</Option>
            </Select>

            <Button type="primary" icon={<SearchOutlined />} onClick={handleKerko}>
              Kërko
            </Button>
            <Button icon={<ClearOutlined />} onClick={handlePastro}>
              Pastro Filtrat
            </Button>
          </Space>
        </Card>

        {/* Table Card */}
        <Card
          title={<Title level={5} style={{ margin: 0 }}>Lista e Pedagogëve</Title>}
          extra={
            isAdmin && (
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                Shto Pedagog të Ri
              </Button>
            )
          }
        >
          <Table
            rowKey={(r) => r.PED_ID ?? r.id ?? r.PED_KOD}
            columns={columns}
            dataSource={pedagoget}
            loading={tableLoading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 800 }}
          />
        </Card>
      </Content>

      {/* ── Detail Modal ── */}
      <Modal
        title="Detajet e Pedagogut"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={760}
      >
        {selectedPedagog && (
          <>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Kodi">
                {selectedPedagog.PED_KOD}
              </Descriptions.Item>
              <Descriptions.Item label="Emri i Plotë">
                {`${selectedPedagog.PERD_EMER ?? selectedPedagog.emri ?? ''} ${selectedPedagog.PERD_MBIEMER ?? selectedPedagog.mbiemer ?? ''}`.trim()}
              </Descriptions.Item>
              <Descriptions.Item label="Specializimi">
                {selectedPedagog.PED_SPECIALIZIM}
              </Descriptions.Item>
              <Descriptions.Item label="Departamenti">
                {getDepartamentEmri(selectedPedagog.DEP_ID ?? selectedPedagog.dep_id)}
              </Descriptions.Item>
              <Descriptions.Item label="Kontrata">
                {selectedPedagog.PED_LLOJ_KONTRATE === 'kohe-plote' ? (
                  <Tag color="green">Kohë-plote</Tag>
                ) : selectedPedagog.PED_LLOJ_KONTRATE === 'kohe-pjesshme' ? (
                  <Tag color="orange">Kohë-pjesshme</Tag>
                ) : (
                  '—'
                )}
              </Descriptions.Item>
            </Descriptions>

            <Divider>Lëndët sipas Semestrit</Divider>
            <Space style={{ marginBottom: 12 }}>
              <Select
                placeholder="Zgjidhni Semestrin"
                style={{ width: 180 }}
                value={semId}
                onChange={setSemId}
              >
                {SEMESTRAT.map((s) => (
                  <Option key={s.SEM_ID} value={s.SEM_ID}>
                    {s.SEM_EM}
                  </Option>
                ))}
              </Select>
              <Button type="primary" loading={lendeLoading} onClick={handleNgarkoLende}>
                Ngarko Lëndët
              </Button>
            </Space>

            {lende.length > 0 && (
              <List
                size="small"
                bordered
                dataSource={lende}
                renderItem={(item) => (
                  <List.Item>
                    <Space>
                      <Tag color="blue">{item.LEN_KOD}</Tag>
                      <Text strong>{item.LEN_EM}</Text>
                      {item.SEK_KOD && <Text type="secondary">Seksioni: {item.SEK_KOD}</Text>}
                      {item.SEK_MENYRE && <Tag>{item.SEK_MENYRE}</Tag>}
                    </Space>
                  </List.Item>
                )}
                style={{ marginBottom: 12 }}
              />
            )}

            {lende.length > 0 && (
              <Button loading={orariLoading} onClick={handleShikoOrarin} style={{ marginBottom: 16 }}>
                Shiko Orarin
              </Button>
            )}

            {orariVisible && (
              <>
                <Divider>Orari Javor</Divider>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: 13,
                  }}
                >
                  <thead>
                    <tr style={{ background: '#f0f2f5' }}>
                      <th style={{ border: '1px solid #d9d9d9', padding: '6px 10px', width: 110 }}>
                        Dita
                      </th>
                      <th style={{ border: '1px solid #d9d9d9', padding: '6px 10px' }}>
                        Orët dhe Lëndët
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {DITET.map((d) => (
                      <tr key={d.nr}>
                        <td
                          style={{
                            border: '1px solid #d9d9d9',
                            padding: '6px 10px',
                            fontWeight: 600,
                            verticalAlign: 'top',
                          }}
                        >
                          {d.emri}
                        </td>
                        <td style={{ border: '1px solid #d9d9d9', padding: '6px 10px' }}>
                          {orariGrid[d.nr].length === 0 ? (
                            <Text type="secondary">—</Text>
                          ) : (
                            <Space direction="vertical" size={2}>
                              {orariGrid[d.nr].map((entry, idx) => (
                                <div key={idx}>
                                  <Text strong>{entry.LEN_EM ?? entry.lenda ?? '—'}</Text>
                                  {' · '}
                                  <Text type="secondary">
                                    Salla: {entry.SAL_KOD ?? entry.salla ?? '—'}
                                  </Text>
                                  {' · '}
                                  <Text>
                                    {entry.ORA_FILL ?? entry.ora_fill ?? ''}–
                                    {entry.ORA_MBA ?? entry.ora_mba ?? ''}
                                  </Text>
                                </div>
                              ))}
                            </Space>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </>
        )}
      </Modal>

      {/* ── Create / Edit Modal ── */}
      <Modal
        title={editingPedagog ? 'Edito Pedagogun' : 'Shto Pedagog të Ri'}
        open={formVisible}
        onCancel={() => setFormVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          style={{ marginTop: 8 }}
        >
          <Divider orientation="left" orientationMargin={0}>
            Te dhenat e llogarise
          </Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="PERD_EMER"
                label="Emri"
                rules={[{ required: true, message: 'Emri është i detyrueshëm.' }]}
              >
                <Input placeholder="p.sh. Arben" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="PERD_MBIEMER"
                label="Mbiemri"
                rules={[{ required: true, message: 'Mbiemri është i detyrueshëm.' }]}
              >
                <Input placeholder="p.sh. Krasniqi" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="PERD_EMAIL"
                label="Email"
                rules={[
                  { required: true, message: 'Email është i detyrueshëm.' },
                  { type: 'email', message: 'Vendosni një email të vlefshëm.' },
                ]}
              >
                <Input placeholder="p.sh. arben@email.com" />
              </Form.Item>
            </Col>
            {!editingPedagog && (
              <Col span={12}>
                <Form.Item
                  name="PERD_FJKALIM"
                  label="Fjalekalimi"
                  rules={[
                    { required: true, message: 'Fjalëkalimi është i detyrueshëm.' },
                    { min: 6, message: 'Fjalëkalimi duhet të ketë të paktën 6 karaktere.' },
                  ]}
                >
                  <Input.Password placeholder="Min. 6 karaktere" />
                </Form.Item>
              </Col>
            )}
          </Row>

          <Divider orientation="left" orientationMargin={0}>
            Te dhenat e pedagogut
          </Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="DEP_ID"
                label="Departamenti"
                rules={[{ required: true, message: 'Zgjidhni departamentin.' }]}
              >
                <Select placeholder="Zgjidhni Departamentin">
                  {DEPARTAMENTET.map((d) => (
                    <Option key={d.id} value={d.id}>
                      {d.emri}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="PED_KOD"
                label="Kodi i Pedagogut"
                rules={[{ required: true, message: 'Kodi është i detyrueshëm.' }]}
              >
                <Input placeholder="p.sh. PED001" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="PED_SPECIALIZIM"
                label="Specializimi"
                rules={[{ required: true, message: 'Specializimi është i detyrueshëm.' }]}
              >
                <Input placeholder="p.sh. Inteligjencë Artificiale" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="PED_LLOJ_KONTRATE"
                label="Lloji i Kontratës"
                rules={[{ required: true, message: 'Zgjidhni llojin e kontratës.' }]}
              >
                <Select placeholder="Zgjidhni kontratën">
                  <Option value="kohe-plote">Kohë-plote</Option>
                  <Option value="kohe-pjesshme">Kohë-pjesshme</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="PED_DATA_PUNESIMIT"
                label="Data e Punësimit"
                rules={[{ required: true, message: 'Data e punësimit është e detyrueshme.' }]}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => setFormVisible(false)}>Anulo</Button>
            <Button type="primary" htmlType="submit" loading={formLoading}>
              Ruaj
            </Button>
          </Space>
        </Form>
      </Modal>
    </Layout>
  );
}
