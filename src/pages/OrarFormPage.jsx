import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout, Steps, Select, Button, Card, Alert, message,
  Row, Col, Typography, Space, Tag, TimePicker, Divider, Spin,
} from 'antd';
import {
  DesktopOutlined, TeamOutlined, ArrowLeftOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getSeksionet } from '../api/seksionApi';
import { kontrolloKonfliktet, createOrar } from '../api/orarApi';
import { SALLET_LIST } from '../api/salleApi';
import { useAuth } from '../context/AuthContext';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const SEMESTRAT = [1, 2, 3, 4, 5, 6].map((i) => ({
  SEM_ID: i,
  SEM_EM: `Semestri ${i}`,
}));

const DITET = [
  { value: 1, label: 'E Hene' },
  { value: 2, label: 'E Marte' },
  { value: 3, label: 'E Merkure' },
  { value: 4, label: 'E Enjte' },
  { value: 5, label: 'E Premte' },
];

const LLOJET = ['Ligjerate', 'Seminar', 'Laborator'];

const LLOJI_COLORS = {
  Ligjerate: 'blue',
  Seminar: 'green',
  Laborator: 'orange',
};

function getSeksionLabel(s) {
  const lenEm = s?.lenda?.LEN_EM || s?.LEN_EM || '—';
  const pedEm = s?.pedagog?.PED_EMER || s?.PED_EMER || '';
  const pedMb = s?.pedagog?.PED_MBIEMER || s?.PED_MBIEMER || '';
  return `${s.SEK_KOD} - ${lenEm} (${pedEm} ${pedMb})`;
}

function getDitaLabel(val) {
  return DITET.find((d) => d.value === val)?.label || String(val);
}

export default function OrarFormPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);

  // Step 1
  const [semId, setSemId] = useState(null);
  const [seksionet, setSeksionet] = useState([]);
  const [loadingSeks, setLoadingSeks] = useState(false);
  const [selectedSeksion, setSelectedSeksion] = useState(null);

  // Step 2
  const [selectedSalla, setSelectedSalla] = useState(null);

  // Step 3
  const [dita, setDita] = useState(null);
  const [oraFill, setOraFill] = useState(null);
  const [oraMba, setOraMba] = useState(null);
  const [lloji, setLloji] = useState(null);
  const [konfliktStatus, setKonfliktStatus] = useState(null); // null | 'ok' | 'error'
  const [konfliktet, setKonfliktet] = useState([]);
  const [checkingKonfliktet, setCheckingKonfliktet] = useState(false);

  // Step 4
  const [saving, setSaving] = useState(false);

  // Load seksionet when semester changes
  useEffect(() => {
    if (!semId) {
      setSeksionet([]);
      setSelectedSeksion(null);
      return;
    }
    setLoadingSeks(true);
    setSelectedSeksion(null);
    getSeksionet({ sem_id: semId })
      .then((res) => setSeksionet(res.data?.data || res.data || []))
      .catch(() => message.error('Gabim gjate ngarkimit te seksioneve'))
      .finally(() => setLoadingSeks(false));
  }, [semId]);

  // Reset conflict check when step-3 fields change
  function resetKonfliktet() {
    setKonfliktStatus(null);
    setKonfliktet([]);
  }

  async function handleKontrolloKonfliktet() {
    if (!dita || !oraFill || !oraMba || !lloji) {
      message.warning('Plotesoni te gjitha fushat para kontrollit');
      return;
    }
    setCheckingKonfliktet(true);
    try {
      const payload = {
        SEKS_ID: selectedSeksion.SEK_ID,
        SALLE_ID: selectedSalla.SALLE_ID,
        ORAR_DITA: dita,
        ORAR_ORA_FILL: oraFill.format('HH:mm'),
        ORAR_ORA_MBA: oraMba.format('HH:mm'),
        ORAR_LLOJI: lloji,
      };
      const res = await kontrolloKonfliktet(payload);
      const data = res.data;
      const conflicts = data?.conflicts || data?.konflikte || [];
      if (conflicts.length === 0) {
        setKonfliktStatus('ok');
        setKonfliktet([]);
      } else {
        setKonfliktStatus('error');
        setKonfliktet(conflicts);
      }
    } catch (err) {
      const conflicts =
        err.response?.data?.conflicts ||
        err.response?.data?.konflikte ||
        [];
      if (conflicts.length > 0) {
        setKonfliktStatus('error');
        setKonfliktet(conflicts);
      } else {
        message.error('Gabim gjate kontrollit te konflikteve');
      }
    } finally {
      setCheckingKonfliktet(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        SEKS_ID: selectedSeksion.SEK_ID,
        SALLE_ID: selectedSalla.SALLE_ID,
        ORAR_DITA: dita,
        ORAR_ORA_FILL: oraFill.format('HH:mm'),
        ORAR_ORA_MBA: oraMba.format('HH:mm'),
        ORAR_LLOJI: lloji,
      };
      await createOrar(payload);
      message.success('Orari u shtua me sukses');
      navigate('/orare');
    } catch (err) {
      if (err.response?.status === 409) {
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          'Konflikte te zbuluara';
        message.error(msg);
      } else {
        message.error('Ndodhi nje gabim');
      }
    } finally {
      setSaving(false);
    }
  }

  const step3AllFilled = dita && oraFill && oraMba && lloji;
  const step3Valid = step3AllFilled && konfliktStatus === 'ok';

  const steps = [
    { title: 'Semestri & Lenda' },
    { title: 'Salla' },
    { title: 'Dita & Ora' },
    { title: 'Konfirmo' },
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
        <Space>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            style={{ color: '#fff' }}
            onClick={() => navigate('/orare')}
          >
            Kthehu te Oraret
          </Button>
          <Title level={4} style={{ color: '#fff', margin: 0 }}>
            Shto Orar te Ri
          </Title>
        </Space>
        <Button type="text" danger onClick={logout} style={{ color: '#ff4d4f' }}>
          Logout
        </Button>
      </Header>

      <Content style={{ padding: '32px 48px' }}>
        <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />

        {/* ───── STEP 1 ───── */}
        {currentStep === 0 && (
          <Card title="Zgjidh Semestrin dhe Lenden" style={{ maxWidth: 640 }}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>Semestri</Text>
                <Select
                  placeholder="Zgjidh semestrin"
                  style={{ width: '100%', marginTop: 8 }}
                  value={semId}
                  onChange={(val) => setSemId(val)}
                >
                  {SEMESTRAT.map((s) => (
                    <Option key={s.SEM_ID} value={s.SEM_ID}>
                      {s.SEM_EM}
                    </Option>
                  ))}
                </Select>
              </div>

              {semId && (
                <div>
                  <Text strong>Seksioni</Text>
                  <Spin spinning={loadingSeks}>
                    <Select
                      placeholder="Zgjidh seksionin"
                      style={{ width: '100%', marginTop: 8 }}
                      value={selectedSeksion?.SEK_ID ?? null}
                      onChange={(val) => {
                        const obj = seksionet.find((s) => s.SEK_ID === val);
                        setSelectedSeksion(obj || null);
                      }}
                      showSearch
                      optionFilterProp="children"
                      notFoundContent={
                        loadingSeks ? <Spin size="small" /> : 'Nuk u gjet asnje seksion'
                      }
                    >
                      {seksionet.map((s) => (
                        <Option key={s.SEK_ID} value={s.SEK_ID}>
                          {getSeksionLabel(s)}
                        </Option>
                      ))}
                    </Select>
                  </Spin>
                </div>
              )}

              <Button
                type="primary"
                disabled={!selectedSeksion}
                onClick={() => setCurrentStep(1)}
              >
                Vazhdo
              </Button>
            </Space>
          </Card>
        )}

        {/* ───── STEP 2 ───── */}
        {currentStep === 1 && (
          <div style={{ maxWidth: 860 }}>
            <Title level={5} style={{ marginBottom: 16 }}>
              Zgjidh Sallen
            </Title>
            <Row gutter={[16, 16]}>
              {SALLET_LIST.map((salla) => {
                const isSelected = selectedSalla?.SALLE_ID === salla.SALLE_ID;
                return (
                  <Col xs={24} sm={12} md={8} key={salla.SALLE_ID}>
                    <Card
                      hoverable
                      onClick={() => setSelectedSalla(salla)}
                      style={{
                        borderColor: isSelected ? '#1677ff' : undefined,
                        borderWidth: isSelected ? 2 : 1,
                        background: isSelected ? '#e6f4ff' : undefined,
                        cursor: 'pointer',
                      }}
                    >
                      <Space direction="vertical" size={4} style={{ width: '100%' }}>
                        <Text strong>{salla.SALLE_EMRI}</Text>
                        <Space>
                          <TeamOutlined />
                          <Text type="secondary">Kapaciteti: {salla.SALLE_KAP}</Text>
                        </Space>
                        {salla.AUD_KA_PROJEKTOR === 1 && (
                          <Space>
                            <DesktopOutlined style={{ color: '#1677ff' }} />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Ka projektor
                            </Text>
                          </Space>
                        )}
                        {salla.is_laborator === 1 && (
                          <Tag color="purple">Laborator</Tag>
                        )}
                        {isSelected && (
                          <CheckCircleOutlined style={{ color: '#1677ff', fontSize: 16 }} />
                        )}
                      </Space>
                    </Card>
                  </Col>
                );
              })}
            </Row>
            <Space style={{ marginTop: 24 }}>
              <Button onClick={() => setCurrentStep(0)}>Kthehu</Button>
              <Button
                type="primary"
                disabled={!selectedSalla}
                onClick={() => setCurrentStep(2)}
              >
                Vazhdo
              </Button>
            </Space>
          </div>
        )}

        {/* ───── STEP 3 ───── */}
        {currentStep === 2 && (
          <Card title="Zgjidh Diten dhe Oren" style={{ maxWidth: 560 }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Text strong>Dita</Text>
                <Select
                  placeholder="Zgjidh diten"
                  style={{ width: '100%', marginTop: 8 }}
                  value={dita}
                  onChange={(val) => { setDita(val); resetKonfliktet(); }}
                >
                  {DITET.map((d) => (
                    <Option key={d.value} value={d.value}>
                      {d.label}
                    </Option>
                  ))}
                </Select>
              </div>

              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>Ora e fillimit</Text>
                  <br />
                  <TimePicker
                    format="HH:mm"
                    minuteStep={30}
                    style={{ width: '100%', marginTop: 8 }}
                    value={oraFill}
                    onChange={(val) => { setOraFill(val); resetKonfliktet(); }}
                    placeholder="08:00"
                  />
                </Col>
                <Col span={12}>
                  <Text strong>Ora e mbarimit</Text>
                  <br />
                  <TimePicker
                    format="HH:mm"
                    minuteStep={30}
                    style={{ width: '100%', marginTop: 8 }}
                    value={oraMba}
                    onChange={(val) => { setOraMba(val); resetKonfliktet(); }}
                    placeholder="09:30"
                    disabledTime={() => {
                      if (!oraFill) return {};
                      const fillHour = oraFill.hour();
                      const fillMin = oraFill.minute();
                      return {
                        disabledHours: () =>
                          Array.from({ length: fillHour }, (_, i) => i),
                        disabledMinutes: (h) =>
                          h === fillHour
                            ? Array.from({ length: fillMin + 1 }, (_, i) => i)
                            : [],
                      };
                    }}
                  />
                </Col>
              </Row>

              <div>
                <Text strong>Lloji i ores</Text>
                <Select
                  placeholder="Zgjidh llojin"
                  style={{ width: '100%', marginTop: 8 }}
                  value={lloji}
                  onChange={(val) => { setLloji(val); resetKonfliktet(); }}
                >
                  {LLOJET.map((l) => (
                    <Option key={l} value={l}>
                      <Tag color={LLOJI_COLORS[l]}>{l}</Tag>
                    </Option>
                  ))}
                </Select>
              </div>

              <Button
                onClick={handleKontrolloKonfliktet}
                loading={checkingKonfliktet}
                disabled={!step3AllFilled}
              >
                Kontrollo Konfliktet
              </Button>

              {konfliktStatus === 'ok' && (
                <Alert
                  type="success"
                  message="Nuk ka perplasje! Mund te vazhdoni."
                  showIcon
                />
              )}
              {konfliktStatus === 'error' && (
                <Alert
                  type="error"
                  message="Konflikte te zbuluara"
                  description={
                    <ul style={{ marginBottom: 0, paddingLeft: 16 }}>
                      {konfliktet.map((k, i) => (
                        <li key={i}>{typeof k === 'string' ? k : JSON.stringify(k)}</li>
                      ))}
                    </ul>
                  }
                  showIcon
                />
              )}

              <Space>
                <Button onClick={() => setCurrentStep(1)}>Kthehu</Button>
                <Button
                  type="primary"
                  disabled={!step3Valid}
                  onClick={() => setCurrentStep(3)}
                >
                  Vazhdo
                </Button>
              </Space>
            </Space>
          </Card>
        )}

        {/* ───── STEP 4 ───── */}
        {currentStep === 3 && (
          <Card title="Konfirmo dhe Ruaj" style={{ maxWidth: 560 }}>
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <Divider orientation="left" plain>
                Detajet e Orarit
              </Divider>

              <Row gutter={[8, 12]}>
                <Col span={8}><Text type="secondary">Seksioni:</Text></Col>
                <Col span={16}>
                  <Text strong>{getSeksionLabel(selectedSeksion)}</Text>
                </Col>

                <Col span={8}><Text type="secondary">Salla:</Text></Col>
                <Col span={16}>
                  <Text strong>
                    {selectedSalla?.SALLE_EMRI} — Kapaciteti: {selectedSalla?.SALLE_KAP}
                  </Text>
                </Col>

                <Col span={8}><Text type="secondary">Dita:</Text></Col>
                <Col span={16}>
                  <Text strong>{getDitaLabel(dita)}</Text>
                </Col>

                <Col span={8}><Text type="secondary">Ora:</Text></Col>
                <Col span={16}>
                  <Text strong>
                    {oraFill?.format('HH:mm')} — {oraMba?.format('HH:mm')}
                  </Text>
                </Col>

                <Col span={8}><Text type="secondary">Lloji:</Text></Col>
                <Col span={16}>
                  <Tag color={LLOJI_COLORS[lloji]}>{lloji}</Tag>
                </Col>
              </Row>

              <Divider />

              <Space>
                <Button onClick={() => setCurrentStep(2)}>Kthehu</Button>
                <Button
                  type="primary"
                  loading={saving}
                  onClick={handleSave}
                >
                  Ruaj Orarin
                </Button>
              </Space>
            </Space>
          </Card>
        )}
      </Content>
    </Layout>
  );
}
