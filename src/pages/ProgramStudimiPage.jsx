import { useState, useEffect } from 'react';
import {
  Layout, Card, Typography, Table, Button, Space, Modal, Form,
  Input, InputNumber, Select, Tag, Popconfirm, message, Row, Col, Divider, List, Tooltip, Badge,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, ClearOutlined,
  EyeOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined, BankOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getPrograme, getProgramiById, createProgram, updateProgram,
  deleteProgram, getLendeProgramit,
} from '../api/programStudimiApi';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const DEPARTAMENTET = [
  { id: 1, name: 'Informatikë' },
  { id: 2, name: 'Matematikë' },
  { id: 3, name: 'Fizikë' },
  { id: 4, name: 'Kimi' },
  { id: 5, name: 'Biologji' },
  { id: 6, name: 'Ekonomi' },
];

const NIVELET = [
  { value: 'Bachelor',    label: 'Bachelor',    color: 'blue' },
  { value: 'Master',      label: 'Master',      color: 'green' },
  { value: 'Doktorature', label: 'Doktoraturë', color: 'purple' },
];

const niveliColor     = (niv) => NIVELET.find((n) => n.value === niv)?.color ?? 'default';
const niveliLabel     = (niv) => NIVELET.find((n) => n.value === niv)?.label ?? niv ?? '-';
const depName         = (id)  => DEPARTAMENTET.find((d) => d.id === Number(id))?.name ?? `Dep ${id}`;
const niveliClassName = (niv) => {
  if (niv === 'Bachelor')    return 'tag-bachelor';
  if (niv === 'Master')      return 'tag-master';
  if (niv === 'Doktorature') return 'tag-doktorature';
  return '';
};

// Group lende list by viti then semestri
function groupLende(lende) {
  const groups = {};
  (lende ?? []).forEach((l) => {
    const viti = l.viti ?? l.VITI ?? '?';
    const sem  = l.semestri ?? l.SEMESTRI ?? '?';
    const key  = `Viti ${viti} — Semestri ${sem}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(l);
  });
  return groups;
}

export default function ProgramStudimiPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [programe, setPrograme] = useState([]);
  const [loading, setLoading]   = useState(false);

  // Filters
  const [filterDep,    setFilterDep]    = useState(null);
  const [filterNiveli, setFilterNiveli] = useState(null);

  // Modals
  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [modalViewOpen, setModalViewOpen] = useState(false);
  const [editRecord,    setEditRecord]    = useState(null);
  const [viewRecord,    setViewRecord]    = useState(null);
  const [lendeProg,     setLendeProg]     = useState([]);
  const [lendeLoading,  setLendeLoading]  = useState(false);

  const [form] = Form.useForm();

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchPrograme = async (filters = {}) => {
    setLoading(true);
    try {
      const res  = await getPrograme(filters);
      const data = res.data?.data ?? res.data ?? [];
      setPrograme(Array.isArray(data) ? data : []);
    } catch {
      message.error('Gabim gjatë ngarkimit të programeve');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrograme(); }, []);

  // ── Filter actions ─────────────────────────────────────────────────────────
  const handleKerko = () => {
    const filters = {};
    if (filterDep)                              filters.dep_id = filterDep;
    if (filterNiveli && filterNiveli !== 'te_gjitha') filters.niveli = filterNiveli;
    fetchPrograme(filters);
  };

  const handlePastro = () => {
    setFilterDep(null);
    setFilterNiveli(null);
    fetchPrograme();
  };

  // ── View modal ─────────────────────────────────────────────────────────────
  const handleShiko = async (record) => {
    setViewRecord(record);
    setModalViewOpen(true);
    setLendeLoading(true);
    try {
      const res  = await getLendeProgramit(record.id ?? record.PROG_ID);
      const data = res.data?.data ?? res.data ?? [];
      setLendeProg(Array.isArray(data) ? data : []);
    } catch {
      setLendeProg([]);
    } finally {
      setLendeLoading(false);
    }
  };

  // ── Create / Edit modal ────────────────────────────────────────────────────
  const handleShto = () => {
    setEditRecord(null);
    form.resetFields();
    setModalFormOpen(true);
  };

  const handleEdito = (record) => {
    setEditRecord(record);
    form.setFieldsValue({
      PROG_EM:  record.PROG_EM  ?? record.emri,
      PROG_NIV: record.PROG_NIV ?? record.niveli,
      PROG_KRD: record.PROG_KRD ?? record.kredite,
      DEP_ID:   record.DEP_ID   ?? record.dep_id,
    });
    setModalFormOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editRecord) {
        await updateProgram(editRecord.id ?? editRecord.PROG_ID, values);
        message.success('Programi u përditësua me sukses');
      } else {
        await createProgram(values);
        message.success('Programi u shtua me sukses');
      }
      setModalFormOpen(false);
      fetchPrograme();
    } catch (err) {
      if (err?.errorFields) return;
      message.error('Gabim gjatë ruajtjes së programit');
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleFshi = async (record) => {
    try {
      await deleteProgram(record.id ?? record.PROG_ID);
      message.success('Programi u fshi me sukses');
      fetchPrograme();
    } catch (err) {
      if (err?.response?.status === 409) {
        message.error('Ky program ka të dhëna aktive');
      } else {
        message.error('Gabim gjatë fshirjes së programit');
      }
    }
  };

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns = [
    {
      title: 'Emri Programit',
      dataIndex: 'PROG_EM',
      key: 'PROG_EM',
      render: (val, rec) => val ?? rec.emri ?? '-',
    },
    {
      title: 'Niveli',
      dataIndex: 'PROG_NIV',
      key: 'PROG_NIV',
      render: (val, rec) => {
        const niv = val ?? rec.niveli;
        return <Tag color={niveliColor(niv)} className={niveliClassName(niv)}>{niveliLabel(niv)}</Tag>;
      },
    },
    {
      title: 'Kredite',
      dataIndex: 'PROG_KRD',
      key: 'PROG_KRD',
      render: (val, rec) => val ?? rec.kredite ?? '-',
    },
    {
      title: 'Veprime',
      key: 'veprime',
      render: (_, record) => (
        <Space>
          <Tooltip title="Shiko">
            <Button size="small" icon={<EyeOutlined />} onClick={() => handleShiko(record)} />
          </Tooltip>
          {isAdmin && (
            <Tooltip title="Edito">
              <Button size="small" icon={<EditOutlined />} onClick={() => handleEdito(record)} />
            </Tooltip>
          )}
          {isAdmin && (
            <Popconfirm
              title="A jeni i sigurt që doni të fshini këtë program?"
              onConfirm={() => handleFshi(record)}
              okText="Po, fshi"
              cancelText="Anulo"
            >
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  const lendeGroups = groupLende(lendeProg);

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
        }}
      >
        <Space align="center" size={10}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            style={{ color: '#fff' }}
            onClick={() => navigate('/dashboard')}
          />
          <div style={{ width: 32, height: 32, borderRadius: 7, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BankOutlined style={{ color: '#fff', fontSize: 18 }} />
          </div>
          <Title level={4} style={{ color: '#fff', margin: 0 }}>
            Menaxhimi i Programeve të Studimit
          </Title>
        </Space>
      </Header>

      <Content style={{ padding: '24px' }}>
        {/* Filter bar */}
        <Card style={{ marginBottom: 16, borderRadius: 12, background: 'linear-gradient(135deg, #f8faff 0%, #eef2f8 100%)', border: '1px solid #d0d9e8', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} sm={12} md={5}>
              <Select
                placeholder="Departamenti"
                allowClear
                style={{ width: '100%' }}
                value={filterDep}
                onChange={setFilterDep}
                options={DEPARTAMENTET.map((d) => ({ value: d.id, label: d.name }))}
              />
            </Col>
            <Col xs={24} sm={12} md={5}>
              <Select
                placeholder="Niveli"
                allowClear
                style={{ width: '100%' }}
                value={filterNiveli}
                onChange={setFilterNiveli}
                options={[
                  { value: 'te_gjitha',  label: 'Të gjitha' },
                  { value: 'Bachelor',   label: 'Bachelor' },
                  { value: 'Master',     label: 'Master' },
                  { value: 'Doktorature', label: 'Doktoraturë' },
                ]}
              />
            </Col>
            <Col>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleKerko}>
                  Kërko
                </Button>
                <Button icon={<ClearOutlined />} onClick={handlePastro}>
                  Pastro Filtrat
                </Button>
              </Space>
            </Col>
            {isAdmin && (
              <Col flex="auto" style={{ textAlign: 'right' }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleShto}>
                  Shto Program të Ri
                </Button>
              </Col>
            )}
          </Row>
        </Card>

        {/* Table */}
        <Card
          title={
            <Space>
              <span style={{ fontWeight: 600 }}>Programet e Studimit</span>
              <Badge count={programe.length} showZero style={{ backgroundColor: '#1e3a5f' }} />
            </Space>
          }
          style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        >
          <Table
            className="uni-table"
            rowKey={(r) => r.id ?? r.PROG_ID ?? r.PROG_EM}
            dataSource={programe}
            columns={columns}
            loading={loading}
            pagination={{ pageSize: 10, showSizeChanger: true }}
            locale={{ emptyText: 'Nuk u gjetën programe' }}
          />
        </Card>
      </Content>

      {/* Create / Edit Modal */}
      <Modal
        className="uni-modal"
        title={editRecord ? 'Edito Programin' : 'Shto Program të Ri'}
        open={modalFormOpen}
        onCancel={() => setModalFormOpen(false)}
        footer={[
          <Button key="anulo" onClick={() => setModalFormOpen(false)}>
            Anulo
          </Button>,
          <Button key="ruaj" type="primary" onClick={handleSave}>
            Ruaj
          </Button>,
        ]}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="Emri i Programit"
            name="PROG_EM"
            rules={[{ required: true, message: 'Ju lutem shkruani emrin e programit' }]}
          >
            <Input placeholder="p.sh. Informatikë e Aplikuar" />
          </Form.Item>
          <Form.Item
            label="Niveli"
            name="PROG_NIV"
            rules={[{ required: true, message: 'Ju lutem zgjidhni nivelin' }]}
          >
            <Select
              placeholder="Zgjidhni nivelin"
              options={NIVELET.map((n) => ({ value: n.value, label: n.label }))}
            />
          </Form.Item>
          <Form.Item
            label="Kredite (ECTS)"
            name="PROG_KRD"
            rules={[{ required: true, message: 'Ju lutem shkruani numrin e krediteve' }]}
          >
            <InputNumber min={1} max={360} style={{ width: '100%' }} placeholder="p.sh. 180" />
          </Form.Item>
          <Form.Item
            label="Departamenti"
            name="DEP_ID"
            rules={[{ required: true, message: 'Ju lutem zgjidhni departamentin' }]}
          >
            <Select
              placeholder="Zgjidhni departamentin"
              options={DEPARTAMENTET.map((d) => ({ value: d.id, label: d.name }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        className="uni-modal"
        title="Detajet e Programit"
        open={modalViewOpen}
        onCancel={() => setModalViewOpen(false)}
        footer={[
          <Button key="mbyll" onClick={() => setModalViewOpen(false)}>
            Mbyll
          </Button>,
        ]}
        width={680}
        destroyOnClose
      >
        {viewRecord && (
          <>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text><strong>Emri:</strong> {viewRecord.PROG_EM ?? viewRecord.emri ?? '-'}</Text>
              <Text>
                <strong>Niveli:</strong>{' '}
                <Tag
                  color={niveliColor(viewRecord.PROG_NIV ?? viewRecord.niveli)}
                  className={niveliClassName(viewRecord.PROG_NIV ?? viewRecord.niveli)}
                >
                  {niveliLabel(viewRecord.PROG_NIV ?? viewRecord.niveli)}
                </Tag>
              </Text>
              <Text><strong>Kredite:</strong> {viewRecord.PROG_KRD ?? viewRecord.kredite ?? '-'}</Text>
              <Text><strong>Departamenti:</strong> {depName(viewRecord.DEP_ID ?? viewRecord.dep_id)}</Text>
            </Space>

            <Divider>Lëndët e Programit</Divider>

            {lendeLoading ? (
              <Text>Duke ngarkuar lëndët...</Text>
            ) : Object.keys(lendeGroups).length === 0 ? (
              <Text type="secondary">Nuk ka lëndë të regjistruara për këtë program</Text>
            ) : (
              Object.entries(lendeGroups).map(([group, items]) => (
                <div key={group} style={{ marginBottom: 16 }}>
                  <Title level={5} style={{ marginBottom: 8 }}>{group}</Title>
                  <List
                    size="small"
                    bordered
                    dataSource={items}
                    renderItem={(l) => (
                      <List.Item>
                        <Space>
                          <Tag>{l.LEN_KOD ?? l.kodi ?? '—'}</Tag>
                          <Text>{l.LEN_EM ?? l.emri ?? '-'}</Text>
                        </Space>
                      </List.Item>
                    )}
                  />
                </div>
              ))
            )}
          </>
        )}
      </Modal>
    </Layout>
  );
}
