import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Layout, Steps, Card, Button, Select, TimePicker, Form, Space,
  Typography, Spin, message, Tag, Descriptions, Alert, Row, Col,
} from 'antd';
import {
  CalendarOutlined, HomeOutlined, ClockCircleOutlined,
  ArrowLeftOutlined, CheckCircleOutlined, InfoCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getOrarById, createOrar, updateOrar } from '../api/orarApi';

const { Header, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const API_BASE = 'http://localhost:8000/api';

function authHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };
}

const DAYS = [
  { key: 1, label: 'E Hënë' },
  { key: 2, label: 'E Martë' },
  { key: 3, label: 'E Mërkurë' },
  { key: 4, label: 'E Enjte' },
  { key: 5, label: 'E Premte' },
];

const SALLET = [
  { id: 1, name: 'Salla A101' },
  { id: 2, name: 'Salla A102' },
  { id: 3, name: 'Salla A103' },
  { id: 4, name: 'Salla A104' },
  { id: 5, name: 'Salla B101' },
  { id: 6, name: 'Salla B102' },
  { id: 7, name: 'Salla B103' },
  { id: 8, name: 'Salla B104' },
];

const LLOJI_OPTIONS = [
  { value: 'ligjerata', label: 'Ligjëratë' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'laborator', label: 'Laborator' },
];

function getSeksLabel(s) {
  const lenda = s.lenda_em ?? s.lenda?.LEN_EM ?? s.lenda?.LENDA_EM ?? s.LEN_EM ?? '';
  const ped = s.pedagog_em ?? (s.pedagog ? `${s.pedagog.PERD_EMER ?? ''} ${s.pedagog.PERD_MBIEMER ?? ''}`.trim() : '');
  const kod = s.SEK_KOD ?? s.sek_kod ?? '';
  const parts = [kod, lenda, ped].filter(Boolean);
  return parts.join(' – ') || `Seksioni ${s.SEK_ID ?? s.id}`;
}

export default function OrarFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = !!id;

  const [currentStep, setCurrentStep] = useState(0);
  const [seksionet, setSeksionet] = useState([]);
  const [loadingSek, setLoadingSek] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [semestri, setSemestri] = useState(null);
  const [selectedSeksioni, setSelectedSeksioni] = useState(null);
  const [selectedSalla, setSelectedSalla] = useState(null);
  const [orarDita, setOrarDita] = useState(null);
  const [orarOraFill, setOrarOraFill] = useState(null);
  const [orarOraMba, setOrarOraMba] = useState(null);
  const [orarLloji, setOrarLloji] = useState(null);

  useEffect(() => {
    if (isEditMode && id) {
      loadOrarData();
    } else if (!isEditMode) {
      fetchSeksionet();
      const dita = searchParams.get('dita');
      const ora_fill = searchParams.get('ora_fill');
      if (dita) setOrarDita(Number(dita));
      if (ora_fill) setOrarOraFill(dayjs(ora_fill, 'HH:mm'));
    }
  }, [id, isEditMode]);

  async function fetchSeksionet(semId) {
    setLoadingSek(true);
    try {
      const url = semId ? `${API_BASE}/seksione?sem_id=${semId}` : `${API_BASE}/seksione`;
      const res = await fetch(url, { headers: authHeaders() });
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.data ?? [];
      setSeksionet(list);
      return list;
    } catch {
      setSeksionet([]);
      return [];
    } finally {
      setLoadingSek(false);
    }
  }

  async function loadOrarData() {
    setLoadingData(true);
    try {
      const data = await getOrarById(id);
      const sem_id = data.seksioni?.SEM_ID ?? data.seksioni?.sem_id;
      const sek_id = data.SEK_ID ?? data.sek_id ?? data.seksioni?.SEK_ID;
      const salle_id = data.SALLE_ID ?? data.salle_id;
      const dita = data.ORAR_DITA ?? data.orar_dita;
      const oraFillRaw = data.ORAR_ORA_FILL ?? data.orar_ora_fill ?? '';
      const oraMbaRaw = data.ORAR_ORA_MBA ?? data.orar_ora_mba ?? '';
      const lloji = (data.ORAR_LLOJI ?? data.orar_lloji ?? '').toLowerCase();

      if (sem_id) {
        setSemestri(sem_id);
        const list = await fetchSeksionet(sem_id);
        const matchedSek = list.find(s => String(s.SEK_ID ?? s.id) === String(sek_id));
        setSelectedSeksioni(matchedSek ? (matchedSek.SEK_ID ?? matchedSek.id) : sek_id ?? null);
      } else {
        setSelectedSeksioni(sek_id ?? null);
      }

      setSelectedSalla(salle_id ? Number(salle_id) : null);
      setOrarDita(dita ? Number(dita) : null);
      const fillShort = oraFillRaw.substring(0, 5);
      const mbaShort = oraMbaRaw.substring(0, 5);
      setOrarOraFill(fillShort ? dayjs(fillShort, 'HH:mm') : null);
      setOrarOraMba(mbaShort ? dayjs(mbaShort, 'HH:mm') : null);
      setOrarLloji(lloji || null);
    } catch {
      message.error('Gabim gjatë ngarkimit të të dhënave');
    } finally {
      setLoadingData(false);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const payload = {
        SEK_ID: Number(selectedSeksioni),
        SALLE_ID: Number(selectedSalla),
        ORAR_DITA: Number(orarDita),
        ORAR_ORA_FILL: orarOraFill ? orarOraFill.format('HH:mm') : null,
        ORAR_ORA_MBA: orarOraMba ? orarOraMba.format('HH:mm') : null,
        ORAR_LLOJI: orarLloji,
      };

      console.log('Submitting payload:', payload);

      if (isEditMode) {
        await updateOrar(id, payload);
        message.success('Orari u perditesua me sukses');
      } else {
        await createOrar(payload);
        message.success('Orari u shtua me sukses');
      }
      navigate('/orare/kalendar');
    } catch(err) {
      message.error(err.message ?? 'Gabim gjatë ruajtjes së orarit');
    } finally {
      setSubmitting(false);
    }
  }

  const STEPS_CONFIG = [
    { title: 'Seksioni', icon: <CalendarOutlined /> },
    { title: 'Salla', icon: <HomeOutlined /> },
    { title: 'Orari', icon: <ClockCircleOutlined /> },
    { title: 'Konfirmo', icon: <CheckCircleOutlined /> },
  ];

  const canProceedStep0 = !!selectedSeksioni;
  const canProceedStep1 = !!selectedSalla;
  const canProceedStep2 = !!orarDita && !!orarOraFill && !!orarOraMba && !!orarLloji;

  const selectedSeksObj = seksionet.find((s) => (s.SEK_ID ?? s.id) === selectedSeksioni);
  const selectedSallaObj = SALLET.find((s) => s.id === selectedSalla);
  const selectedDitaLabel = DAYS.find((d) => d.key === orarDita)?.label ?? '';
  const selectedLlojiLabel = LLOJI_OPTIONS.find((l) => l.value === orarLloji)?.label ?? '';

  if (loadingData) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f5f7fa', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" />
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#001529', padding: '0 24px' }}>
        <Space>
          <CalendarOutlined style={{ color: '#1677ff', fontSize: 20 }} />
          <Title level={4} style={{ color: '#fff', margin: 0 }}>
            {isEditMode ? 'Edito Orarin' : 'Shto Orar te Ri'}
          </Title>
        </Space>
        <Button type="link" icon={<ArrowLeftOutlined />} style={{ color: '#aaa' }} onClick={() => navigate('/orare/kalendar')}>
          Kthehu
        </Button>
      </Header>

      <Content style={{ padding: '32px 24px', maxWidth: 720, margin: '0 auto', width: '100%' }}>
        <Steps current={currentStep} items={STEPS_CONFIG} style={{ marginBottom: 32 }} />

        <Card style={{ borderRadius: 8 }}>
          {currentStep === 0 && (
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Title level={5}>Zgjidhni Seksionin</Title>
              {loadingSek ? (
                <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
              ) : (
                <Select style={{ width: '100%' }} placeholder="Kërko dhe zgjidhni seksionin..." value={selectedSeksioni} onChange={setSelectedSeksioni} showSearch optionFilterProp="label" size="large">
                  {seksionet.map((s) => {
                    const key = s.SEK_ID ?? s.id;
                    return <Option key={key} value={key} label={getSeksLabel(s)}>{getSeksLabel(s)}</Option>;
                  })}
                </Select>
              )}
              <div style={{ textAlign: 'right' }}>
                <Button type="primary" disabled={!canProceedStep0} onClick={() => setCurrentStep(1)}>Vazhdo</Button>
              </div>
            </Space>
          )}

          {currentStep === 1 && (
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Title level={5}>Zgjidhni Sallën</Title>
              <Select style={{ width: '100%' }} placeholder="Zgjidhni sallën..." value={selectedSalla} onChange={setSelectedSalla} size="large">
                {SALLET.map((s) => <Option key={s.id} value={s.id}>{s.name}</Option>)}
              </Select>
              <Row justify="space-between">
                <Button onClick={() => setCurrentStep(0)}>Prapa</Button>
                <Button type="primary" disabled={!canProceedStep1} onClick={() => setCurrentStep(2)}>Vazhdo</Button>
              </Row>
            </Space>
          )}

          {currentStep === 2 && (
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Title level={5}>Detajet e Orarit</Title>
              <Form layout="vertical" component="div">
                <Form.Item label="Dita e Javës" required>
                  <Select style={{ width: '100%' }} placeholder="Zgjidhni ditën..." value={orarDita} onChange={setOrarDita} size="large">
                    {DAYS.map((d) => <Option key={d.key} value={d.key}>{d.label}</Option>)}
                  </Select>
                </Form.Item>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Ora Fillimit" required>
                      <TimePicker style={{ width: '100%' }} format="HH:mm" minuteStep={30} value={orarOraFill} onChange={setOrarOraFill} size="large" placeholder="Ora e fillimit" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Ora Mbarimit" required>
                      <TimePicker style={{ width: '100%' }} format="HH:mm" minuteStep={30} value={orarOraMba} onChange={setOrarOraMba} size="large" placeholder="Ora e mbarimit" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item label="Lloji i Orës" required>
                  <Select style={{ width: '100%' }} placeholder="Zgjidhni llojin..." value={orarLloji} onChange={setOrarLloji} size="large">
                    {LLOJI_OPTIONS.map((l) => <Option key={l.value} value={l.value}>{l.label}</Option>)}
                  </Select>
                </Form.Item>
              </Form>
              <Row justify="space-between">
                <Button onClick={() => setCurrentStep(1)}>Prapa</Button>
                <Button type="primary" disabled={!canProceedStep2} onClick={() => setCurrentStep(3)}>Vazhdo</Button>
              </Row>
            </Space>
          )}

          {currentStep === 3 && (
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Title level={5}>Konfirmo dhe Ruaj</Title>
              {isEditMode && (
                <Alert type="info" icon={<InfoCircleOutlined />} showIcon message="Duke edituar orarin ekzistues" style={{ borderRadius: 6 }} />
              )}
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Seksioni">{selectedSeksObj ? getSeksLabel(selectedSeksObj) : `ID: ${selectedSeksioni}`}</Descriptions.Item>
                <Descriptions.Item label="Salla">{selectedSallaObj?.name ?? `ID: ${selectedSalla}`}</Descriptions.Item>
                <Descriptions.Item label="Dita">{selectedDitaLabel}</Descriptions.Item>
                <Descriptions.Item label="Ora Fillimit">{orarOraFill ? orarOraFill.format('HH:mm') : '—'}</Descriptions.Item>
                <Descriptions.Item label="Ora Mbarimit">{orarOraMba ? orarOraMba.format('HH:mm') : '—'}</Descriptions.Item>
                <Descriptions.Item label="Lloji">
                  <Tag color={orarLloji === 'ligjerata' ? 'blue' : orarLloji === 'seminar' ? 'green' : 'orange'}>{selectedLlojiLabel}</Tag>
                </Descriptions.Item>
              </Descriptions>
              <Row justify="space-between">
                <Button onClick={() => setCurrentStep(2)}>Prapa</Button>
                <Button type="primary" loading={submitting} onClick={handleSubmit}>Ruaj Orarin</Button>
              </Row>
            </Space>
          )}
        </Card>
      </Content>
    </Layout>
  );
}