import { useState, useEffect } from 'react';
import {
  Layout, Card, Typography, Table, Button, Space, Modal, Form,
  Input, Select, Tag, Popconfirm, message, Row, Col, Divider, List, Avatar, Tooltip, Badge,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, ClearOutlined,
  EyeOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined, BankOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getLende, getLendeById, createLende, updateLende, deleteLende, getPedagogetELendes } from '../api/lendeApi';
import { VITET } from '../config/constants';

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

const depName = (id) => DEPARTAMENTET.find((d) => d.id === Number(id))?.name ?? `Dep ${id}`;

export default function LendePage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [lende, setLende] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [filterDep, setFilterDep]       = useState(null);
  const [filterViti, setFilterViti]     = useState(null);
  const [filterSem, setFilterSem]       = useState(null);
  const [filterLloji, setFilterLloji]   = useState(null);
  const [filterEmri, setFilterEmri]     = useState('');

  // Modals
  const [modalFormOpen, setModalFormOpen]   = useState(false);
  const [modalViewOpen, setModalViewOpen]   = useState(false);
  const [editRecord, setEditRecord]         = useState(null);   // null = create
  const [viewRecord, setViewRecord]         = useState(null);
  const [pedagoget, setPedagoget]           = useState([]);
  const [pedagogetLoading, setPedagogetLoading] = useState(false);

  const [form] = Form.useForm();

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchLende = async (filters = {}) => {
    setLoading(true);
    try {
      const res = await getLende(filters);
      const data = res.data?.data ?? res.data ?? [];
      setLende(Array.isArray(data) ? data : []);
    } catch {
      message.error('Gabim gjatë ngarkimit të lëndëve');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLende(); }, []);

  // ── Filter actions ─────────────────────────────────────────────────────────
  const handleKerko = () => {
    const filters = {};
    if (filterDep)  filters.dep_id   = filterDep;
    if (filterViti) filters.viti     = filterViti;
    if (filterSem)  filters.semestri = filterSem;
    // Send zgjedhore to API only when LP_ZGJEDHORE is not present in current data
    const hasZgj = lende.length > 0 && 'LP_ZGJEDHORE' in lende[0];
    if (filterLloji && filterLloji !== 'te_gjitha' && !hasZgj) {
      filters.zgjedhore = filterLloji === 'obligative' ? 0 : 1;
    }
    fetchLende(filters);
  };

  const handlePastro = () => {
    setFilterDep(null);
    setFilterViti(null);
    setFilterSem(null);
    setFilterLloji(null);
    setFilterEmri('');
    fetchLende();
  };

  // LP_ZGJEDHORE present in data → filter lloji client-side; otherwise API handled it
  const hasZgjedhoreField = lende.length > 0 && 'LP_ZGJEDHORE' in lende[0];

  const displayLende = lende.filter((l) => {
    if (filterEmri && !(l.LEN_EM ?? '').toLowerCase().includes(filterEmri.toLowerCase())) return false;
    if (filterLloji && filterLloji !== 'te_gjitha' && hasZgjedhoreField) {
      if (filterLloji === 'obligative' && !(l.LP_ZGJEDHORE === false || l.LP_ZGJEDHORE === 0)) return false;
      if (filterLloji === 'zgjedhore'  && !(l.LP_ZGJEDHORE === true  || l.LP_ZGJEDHORE === 1)) return false;
    }
    return true;
  });

  // ── View modal ─────────────────────────────────────────────────────────────
  const handleShiko = async (record) => {
    setViewRecord(record);
    setModalViewOpen(true);
    setPedagogetLoading(true);
    try {
      const res = await getPedagogetELendes(record.id ?? record.LEN_ID);
      const data = res.data?.data ?? res.data ?? [];
      setPedagoget(Array.isArray(data) ? data : []);
    } catch {
      setPedagoget([]);
    } finally {
      setPedagogetLoading(false);
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
      LEN_EM:  record.LEN_EM  ?? record.emri,
      LEN_KOD: record.LEN_KOD ?? record.kodi,
      DEP_ID:  record.DEP_ID  ?? record.dep_id,
    });
    setModalFormOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editRecord) {
        await updateLende(editRecord.id ?? editRecord.LEN_ID, values);
        message.success('Lënda u përditësua me sukses');
      } else {
        await createLende(values);
        message.success('Lënda u shtua me sukses');
      }
      setModalFormOpen(false);
      fetchLende();
    } catch (err) {
      if (err?.errorFields) return; // form validation
      message.error('Gabim gjatë ruajtjes së lëndës');
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleFshi = async (record) => {
    try {
      await deleteLende(record.id ?? record.LEN_ID);
      message.success('Lënda u fshi me sukses');
      fetchLende();
    } catch (err) {
      if (err?.response?.status === 409) {
        message.error('Kjo lëndë ka seksione aktive');
      } else {
        message.error('Gabim gjatë fshirjes së lëndës');
      }
    }
  };

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns = [
    {
      title: 'Kodi',
      dataIndex: 'LEN_KOD',
      key: 'LEN_KOD',
      render: (val, rec) => val ?? rec.kodi ?? '-',
    },
    {
      title: 'Emri',
      dataIndex: 'LEN_EM',
      key: 'LEN_EM',
      render: (val, rec) => val ?? rec.emri ?? '-',
    },
    {
      title: 'Departamenti',
      dataIndex: 'DEP_ID',
      key: 'DEP_ID',
      render: (val, rec) => {
        const id = val ?? rec.dep_id;
        return id ? <Tag color="blue">{depName(id)}</Tag> : '-';
      },
    },
    {
      title: 'Veprime',
      key: 'veprime',
      render: (_, record) => (
        <Space>
          <Tooltip title="Shiko">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleShiko(record)}
            />
          </Tooltip>
          {isAdmin && (
            <Tooltip title="Edito">
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEdito(record)}
              />
            </Tooltip>
          )}
          {isAdmin && (
            <Popconfirm
              title="A jeni i sigurt që doni të fshini këtë lëndë?"
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
            Menaxhimi i Lëndëve
          </Title>
        </Space>
      </Header>

      <Content style={{ padding: '24px' }}>
        {/* Filter bar */}
        <Card style={{ marginBottom: 16, borderRadius: 12, background: 'linear-gradient(135deg, #f8faff 0%, #eef2f8 100%)', border: '1px solid #d0d9e8', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="Departamenti"
                allowClear
                style={{ width: '100%' }}
                value={filterDep}
                onChange={setFilterDep}
                options={DEPARTAMENTET.map((d) => ({ value: d.id, label: d.name }))}
              />
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Select
                placeholder="Viti"
                allowClear
                style={{ width: '100%' }}
                value={filterViti}
                onChange={setFilterViti}
                options={VITET.map((v) => ({ value: v, label: `Viti ${v}` }))}
              />
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Select
                placeholder="Semestri"
                allowClear
                style={{ width: '100%' }}
                value={filterSem}
                onChange={setFilterSem}
                options={[1, 2, 3, 4, 5, 6, 7, 8].map((s) => ({ value: s, label: `Semestri ${s}` }))}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="Lloji"
                allowClear
                style={{ width: '100%' }}
                value={filterLloji}
                onChange={setFilterLloji}
                options={[
                  { value: 'te_gjitha',  label: 'Të gjitha' },
                  { value: 'obligative', label: 'Obligative' },
                  { value: 'zgjedhore',  label: 'Zgjedhore' },
                ]}
              />
            </Col>
            <Col xs={24} sm={12} md={5}>
              <Input
                placeholder="Kërko lëndën me emër..."
                allowClear
                style={{ width: '100%' }}
                value={filterEmri}
                onChange={(e) => setFilterEmri(e.target.value)}
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
                  Shto Lëndë të Re
                </Button>
              </Col>
            )}
          </Row>
        </Card>

        {/* Table */}
        <Card
          title={
            <Space>
              <span style={{ fontWeight: 600 }}>Lëndët</span>
              <Badge count={displayLende.length} showZero style={{ backgroundColor: '#1e3a5f' }} />
            </Space>
          }
          style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        >
          <Table
            className="uni-table"
            rowKey={(r) => r.id ?? r.LEN_ID ?? r.LEN_KOD}
            dataSource={displayLende}
            columns={columns}
            loading={loading}
            pagination={{ pageSize: 10, showSizeChanger: true }}
            locale={{ emptyText: 'Nuk u gjetën lëndë' }}
          />
        </Card>
      </Content>

      {/* Create / Edit Modal */}
      <Modal
        className="uni-modal"
        title={editRecord ? 'Edito Lëndën' : 'Shto Lëndë të Re'}
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
            label="Emri i Lëndës"
            name="LEN_EM"
            rules={[{ required: true, message: 'Ju lutem shkruani emrin e lëndës' }]}
          >
            <Input placeholder="p.sh. Programim i Avancuar" />
          </Form.Item>
          <Form.Item
            label="Kodi i Lëndës"
            name="LEN_KOD"
            rules={[{ required: true, message: 'Ju lutem shkruani kodin e lëndës' }]}
          >
            <Input placeholder="p.sh. INF301" />
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
        title="Detajet e Lëndës"
        open={modalViewOpen}
        onCancel={() => setModalViewOpen(false)}
        footer={[
          <Button key="mbyll" onClick={() => setModalViewOpen(false)}>
            Mbyll
          </Button>,
        ]}
        width={600}
        destroyOnClose
      >
        {viewRecord && (
          <>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text><strong>Emri:</strong> {viewRecord.LEN_EM ?? viewRecord.emri ?? '-'}</Text>
              <Text><strong>Kodi:</strong> {viewRecord.LEN_KOD ?? viewRecord.kodi ?? '-'}</Text>
              <Text>
                <strong>Departamenti:</strong>{' '}
                {depName(viewRecord.DEP_ID ?? viewRecord.dep_id)}
              </Text>
            </Space>
            <Divider>Pedagogët që japin këtë lëndë</Divider>
            <List
              loading={pedagogetLoading}
              dataSource={pedagoget}
              locale={{ emptyText: 'Nuk ka pedagogë të regjistruar' }}
              renderItem={(p) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{ backgroundColor: '#1677ff' }}>
                        {(p.first_name?.[0] ?? p.emri?.[0] ?? 'P').toUpperCase()}
                      </Avatar>
                    }
                    title={`${p.first_name ?? p.emri ?? ''} ${p.last_name ?? p.mbiemri ?? ''}`.trim() || 'Pedagog'}
                    description={p.email ?? ''}
                  />
                </List.Item>
              )}
            />
          </>
        )}
      </Modal>
    </Layout>
  );
}
