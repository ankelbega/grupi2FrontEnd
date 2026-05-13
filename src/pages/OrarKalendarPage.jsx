import { useState, useEffect, useCallback } from 'react';
import {
  Layout,
  Card,
  Select,
  Button,
  Tag,
  Drawer,
  Spin,
  Empty,
  Popconfirm,
  Typography,
  Space,
  Row,
  Col,
  Statistic,
  Divider,
  message,
  Avatar,
  Switch,
} from 'antd';
import {
  CalendarOutlined,
  UserOutlined,
  HomeOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseOutlined,
  LogoutOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { TIME_SLOTS, DAYS, SALLET, LLOJI_COLORS } from '../config/constants';
import axiosInstance from '../api/axiosInstance';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

function getSallaName(id) {
  const found = SALLET.find((s) => s.id === Number(id));
  return found ? found.name : `Salla ${id}`;
}

function getTodayDita() {
  const jsDay = new Date().getDay(); // 0=Sunday, 1=Monday, ...
  if (jsDay === 0 || jsDay === 6) return null;
  return jsDay; // 1=Hene ... 5=Premte
}

export default function OrarKalendarPage() {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [pedagoget, setPedag] = useState([]);
  const [programet, setProg] = useState([]);
  const [oraret, setOraret] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    pedagog_id: null,
    program_id: null,
    viti: null,
    salla_id: null,
    semestri: null,
  });
  const [activeFilters, setActiveFilters] = useState({});

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrar, setSelectedOrar] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [hoveredCell, setHoveredCell] = useState(null);

  const fullName = `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim();
  const avatarLetter = user?.first_name?.[0]?.toUpperCase() ?? '?';

  useEffect(() => {
    fetchPedag();
    fetchProg();
  }, []);

  useEffect(() => {
    fetchOraret(activeFilters);
  }, [activeFilters]);

  async function fetchPedag() {
    try {
      const response = await axiosInstance.get('/pedagoget');
      const data = response.data?.data ?? response.data;
      setPedag(Array.isArray(data) ? data : []);
    } catch {
      setPedag([]);
    }
  }

  async function fetchProg() {
    try {
      const response = await axiosInstance.get('/programe');
      const data = response.data?.data ?? response.data;
      setProg(Array.isArray(data) ? data : []);
    } catch {
      setProg([]);
    }
  }

  const fetchOraret = useCallback(async (f = {}) => {
    setLoading(true);
    try {
      const params = {};
      if (f.pedagog_id) params.ped_id = f.pedagog_id;
      if (f.program_id) params.prog_id = f.program_id;
      if (f.viti) params.viti = f.viti;
      if (f.salla_id) params.salle_id = f.salla_id;
      if (f.semestri) params.semestri = f.semestri;
      const response = await axiosInstance.get('/orare', { params });
      const data = response.data?.data ?? response.data;
      setOraret(Array.isArray(data) ? data : []);
    } catch {
      setOraret([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleSearch() {
    setActiveFilters({ ...filters });
  }

  function handleClear() {
    const empty = { pedagog_id: null, program_id: null, viti: null, salla_id: null, semestri: null };
    setFilters(empty);
    setActiveFilters({});
  }

  function getOraretForCell(dita, timeSlot) {
    return oraret.filter((o) => {
      const ditaMatch = String(o.ORAR_DITA ?? o.dita ?? o.DITA) === String(dita);
      const oraFill = o.ORAR_ORA_FILL ?? o.ora_fill ?? o.ORA_FILL ?? '';
      const slotMatch = oraFill.substring(0, 5) === timeSlot;
      return ditaMatch && slotMatch;
    });
  }

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      await axiosInstance.delete(`/orare/${id}`);
      message.success('Orari u fshi me sukses');
      setDrawerOpen(false);
      setSelectedOrar(null);
      fetchOraret(activeFilters);
    } catch {
      message.error('Gabim gjatë fshirjes');
    } finally {
      setDeletingId(null);
    }
  }

  function openDrawer(orar) {
    setSelectedOrar(orar);
    setDrawerOpen(true);
  }

  function handleEmptyCellClick(dita, timeSlot) {
    if (!isAdmin) return;
    navigate(`/orare/shto?dita=${dita}&ora_fill=${encodeURIComponent(timeSlot)}`);
  }

  // Stats
  const totalOrare = oraret.length;
  const uniquePedag = new Set(oraret.map((o) => o.seksioni?.PED_ID ?? o.pedagog_id ?? o.PEDAGOG_ID)).size;
  const uniqueSalla = new Set(oraret.map((o) => o.SALLE_ID ?? o.salla_id ?? o.SALLA_ID)).size;
  const todayDita = getTodayDita();
  const orareSOt = todayDita
    ? oraret.filter((o) => String(o.ORAR_DITA ?? o.dita ?? o.DITA) === String(todayDita)).length
    : 0;

  // Helper to get field value case-insensitively
  function f(orar, lower, upper) {
    return orar[lower] ?? orar[upper] ?? '';
  }

  function getLloji(orar) {
    return (f(orar, 'orar_lloji', 'ORAR_LLOJI') || '').toLowerCase();
  }

  const cellStyle = {
    border: '1px solid #f0f0f0',
    minHeight: 80,
    padding: 4,
    verticalAlign: 'top',
    position: 'relative',
    background: '#fff',
  };

  const headerCellStyle = {
    background: '#1e3a5f',
    border: '1px solid #162d4a',
    padding: '10px 12px',
    textAlign: 'center',
    fontWeight: 700,
    fontSize: 13,
    color: '#fff',
    minWidth: 130,
  };

  const timeCellStyle = {
    background: '#fafafa',
    border: '1px solid #f0f0f0',
    padding: '8px 10px',
    fontWeight: 700,
    fontSize: 12,
    color: '#595959',
    whiteSpace: 'nowrap',
    width: 70,
    textAlign: 'center',
    verticalAlign: 'middle',
  };

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
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <Title level={4} style={{ color: '#fff', margin: 0 }}>
            Kalendari i Orareve
          </Title>
        </Space>
        <Space>
          <Switch
            checked={isDark}
            onChange={toggleTheme}
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
          />
          <Button type="link" style={{ color: '#aaa' }} onClick={() => navigate('/dashboard')}>
            Dashboard
          </Button>
          <Avatar style={{ backgroundColor: '#1677ff' }}>{avatarLetter}</Avatar>
          <Text style={{ color: '#fff' }}>{fullName}</Text>
          <Button
            type="text"
            danger
            icon={<LogoutOutlined />}
            onClick={logout}
            style={{ color: '#ff4d4f' }}
          >
            Dil
          </Button>
        </Space>
      </Header>

      <Content style={{ padding: '24px' }}>
        {/* FILTER BAR */}
        <Card
          style={{
            marginBottom: 16,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #f8faff 0%, #eef2f8 100%)',
            border: '1px solid #d0d9e8',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
          bodyStyle={{ padding: '16px 20px' }}
        >
          <Row gutter={[12, 12]} align="middle">
            <Col>
              <Select
                placeholder="Pedagog"
                style={{ width: 180 }}
                allowClear
                value={filters.pedagog_id}
                onChange={(v) => setFilters((p) => ({ ...p, pedagog_id: v ?? null }))}
                showSearch
                optionFilterProp="children"
                getPopupContainer={(trigger) => trigger.parentElement}
              >
                {pedagoget.map((ped) => (
                  <Option key={ped.PED_ID ?? ped.id ?? ped.ID} value={ped.PED_ID ?? ped.id ?? ped.ID}>
                    {`${ped.PERD_EMER ?? ped.perd_emer ?? ''} ${ped.PERD_MBIEMER ?? ped.perd_mbiemer ?? ''}`.trim()}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col>
              <Select
                placeholder="Programi Studimor"
                style={{ width: 200 }}
                allowClear
                value={filters.program_id}
                onChange={(v) => setFilters((p) => ({ ...p, program_id: v ?? null }))}
                showSearch
                optionFilterProp="children"
                getPopupContainer={(trigger) => trigger.parentElement}
              >
                {programet.map((prog) => (
                  <Option key={prog.PROG_ID ?? prog.id ?? prog.ID} value={prog.PROG_ID ?? prog.id ?? prog.ID}>
                    {prog.PROG_EM ?? prog.prog_em ?? prog.emri ?? ''}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col>
              <Select
                placeholder="Viti"
                style={{ width: 100 }}
                allowClear
                value={filters.viti}
                onChange={(v) => setFilters((p) => ({ ...p, viti: v ?? null }))}
                getPopupContainer={(trigger) => trigger.parentElement}
              >
                {[1, 2, 3, 4].map((v) => (
                  <Option key={v} value={v}>
                    Viti {v}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col>
              <Select
                placeholder="Salla"
                style={{ width: 150 }}
                allowClear
                value={filters.salla_id}
                onChange={(v) => setFilters((p) => ({ ...p, salla_id: v ?? null }))}
                getPopupContainer={(trigger) => trigger.parentElement}
              >
                {SALLET.map((s) => (
                  <Option key={s.id} value={s.id}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col>
              <Select
                placeholder="Semestri"
                style={{ width: 120 }}
                allowClear
                value={filters.semestri}
                onChange={(v) => setFilters((p) => ({ ...p, semestri: v ?? null }))}
                getPopupContainer={(trigger) => trigger.parentElement}
              >
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <Option key={s} value={s}>
                    Semestri {s}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col>
              <Button type="primary" onClick={handleSearch} icon={<CalendarOutlined />}>
                Kërko
              </Button>
            </Col>
            <Col>
              <Button onClick={handleClear}>Pastro</Button>
            </Col>
          </Row>
        </Card>

        {/* CALENDAR GRID */}
        <Card style={{ borderRadius: 12, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} bodyStyle={{ padding: 0, overflowX: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 80 }}>
              <Spin size="large" tip="Duke ngarkuar oraret..." />
            </div>
          ) : oraret.length === 0 && Object.values(activeFilters).some(Boolean) ? (
            <div style={{ padding: 60 }}>
              <Empty description="Nuk u gjetën orare për filtrat e zgjedhur" />
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: 70 }} />
                {DAYS.map((d) => (
                  <col key={d.key} style={{ minWidth: 130 }} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  <th style={{ ...timeCellStyle, background: '#162d4a', border: '1px solid #162d4a', color: '#fff' }}></th>
                  {DAYS.map((d) => (
                    <th key={d.key} style={headerCellStyle}>
                      {d.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((slot) => (
                  <tr key={slot}>
                    <td style={timeCellStyle}>{slot}</td>
                    {DAYS.map((d) => {
                      const entries = getOraretForCell(d.key, slot);
                      const cellKey = `${d.key}-${slot}`;
                      const isHovered = hoveredCell === cellKey;
                      return (
                        <td
                          key={d.key}
                          style={{
                            ...cellStyle,
                            background: isAdmin && isHovered && entries.length === 0 ? '#f0f7ff' : '#fff',
                            cursor: isAdmin && entries.length === 0 ? 'pointer' : 'default',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={() => setHoveredCell(cellKey)}
                          onMouseLeave={() => setHoveredCell(null)}
                          onClick={() => {
                            if (entries.length === 0) handleEmptyCellClick(d.key, slot);
                          }}
                        >
                          {isAdmin && entries.length === 0 && isHovered && (
                            <div
                              style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                color: '#bfbfbf',
                                fontSize: 20,
                                pointerEvents: 'none',
                              }}
                            >
                              <PlusOutlined />
                            </div>
                          )}
                          {entries.map((orar) => {
                            const lloji = getLloji(orar);
                            const colors = LLOJI_COLORS[lloji] ?? LLOJI_COLORS.ligjerata;
                            const lendaName =
                              orar.lenda_em ||
                              f(orar, 'lenda_name', 'LENDA_NAME') ||
                              f(orar, 'lenda_emri', 'LENDA_EMRI') ||
                              (orar.lenda
                                ? orar.lenda.LENDA_EM ?? orar.lenda.emri ?? ''
                                : '');
                            const pedagName =
                              orar.pedagog_em ||
                              f(orar, 'pedagog_name', 'PEDAGOG_NAME') ||
                              (orar.pedagog
                                ? `${orar.pedagog.PERD_EMER ?? ''} ${orar.pedagog.PERD_MBIEMER ?? ''}`.trim()
                                : '');
                            const sallaId = orar.SALLE_ID ?? f(orar, 'salla_id', 'SALLA_ID');
                            const sallaName =
                              orar.salla_em ||
                              f(orar, 'salla_name', 'SALLA_NAME') ||
                              getSallaName(sallaId);
                            const rawOraFill = orar.ORAR_ORA_FILL ?? f(orar, 'ora_fill', 'ORA_FILL');
                            const rawOraMba = orar.ORAR_ORA_MBA ?? f(orar, 'ora_mba', 'ORA_MBA');
                            const oraFill = rawOraFill ? rawOraFill.substring(0, 5) : '';
                            const oraMba = rawOraMba ? rawOraMba.substring(0, 5) : '';

                            return (
                              <div
                                key={orar.ORAR_ID ?? orar.id ?? orar.ID}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDrawer(orar);
                                }}
                                style={{
                                  background: colors.bg,
                                  border: `1.5px solid ${colors.border}`,
                                  borderRadius: 6,
                                  padding: '5px 8px',
                                  marginBottom: 4,
                                  cursor: 'pointer',
                                  position: 'relative',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                  transition: 'box-shadow 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
                                }}
                              >
                                <div style={{ position: 'absolute', top: 4, right: 4 }}>
                                  <Tag
                                    color={colors.tagColor}
                                    style={{ fontSize: 10, padding: '0 4px', margin: 0, lineHeight: '16px' }}
                                  >
                                    {colors.label}
                                  </Tag>
                                </div>
                                <div
                                  style={{
                                    fontWeight: 700,
                                    fontSize: 11,
                                    color: '#262626',
                                    paddingRight: 28,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {lendaName || '—'}
                                </div>
                                <div style={{ fontSize: 10, color: '#8c8c8c', marginTop: 1 }}>
                                  {pedagName || '—'}
                                </div>
                                <div style={{ fontSize: 10, color: '#8c8c8c' }}>{sallaName}</div>
                                {(oraFill || oraMba) && (
                                  <div style={{ fontSize: 10, color: '#8c8c8c' }}>
                                    {oraFill} – {oraMba}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        {/* STATS BAR */}
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Card
              style={{ borderRadius: 12, textAlign: 'center', background: 'linear-gradient(135deg, #1677ff, #4096ff)', border: 'none', boxShadow: '0 4px 12px rgba(22,119,255,0.3)' }}
              bodyStyle={{ padding: '20px' }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>Totali i Orareve</span>}
                value={totalOrare}
                prefix={<CalendarOutlined style={{ color: '#fff' }} />}
                valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              style={{ borderRadius: 12, textAlign: 'center', background: 'linear-gradient(135deg, #52c41a, #73d13d)', border: 'none', boxShadow: '0 4px 12px rgba(82,196,26,0.3)' }}
              bodyStyle={{ padding: '20px' }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>Pedagogët Aktivë</span>}
                value={uniquePedag}
                prefix={<UserOutlined style={{ color: '#fff' }} />}
                valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              style={{ borderRadius: 12, textAlign: 'center', background: 'linear-gradient(135deg, #fa8c16, #ffa940)', border: 'none', boxShadow: '0 4px 12px rgba(250,140,22,0.3)' }}
              bodyStyle={{ padding: '20px' }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>Sallet në Përdorim</span>}
                value={uniqueSalla}
                prefix={<HomeOutlined style={{ color: '#fff' }} />}
                valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              style={{ borderRadius: 12, textAlign: 'center', background: 'linear-gradient(135deg, #eb2f96, #ff85c2)', border: 'none', boxShadow: '0 4px 12px rgba(235,47,150,0.3)' }}
              bodyStyle={{ padding: '20px' }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>Orare Sot</span>}
                value={orareSOt}
                prefix={<ClockCircleOutlined style={{ color: '#fff' }} />}
                valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 700 }}
              />
            </Card>
          </Col>
        </Row>
      </Content>

      {/* DRAWER */}
      <Drawer
        title={
          <Space>
            <CalendarOutlined style={{ color: '#1677ff' }} />
            <span>Detajet e Orarit</span>
          </Space>
        }
        placement="right"
        width={380}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        extra={
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={() => setDrawerOpen(false)}
          />
        }
      >
        {selectedOrar && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {(() => {
              const orar = selectedOrar;
              const lloji = getLloji(orar);
              const colors = LLOJI_COLORS[lloji] ?? LLOJI_COLORS.ligjerata;

              const lendaName =
                orar.lenda_em ||
                f(orar, 'lenda_name', 'LENDA_NAME') ||
                f(orar, 'lenda_emri', 'LENDA_EMRI') ||
                (orar.lenda ? orar.lenda.LENDA_EM ?? orar.lenda.emri ?? '' : '');
              const pedagName =
                orar.pedagog_em ||
                f(orar, 'pedagog_name', 'PEDAGOG_NAME') ||
                (orar.pedagog
                  ? `${orar.pedagog.PERD_EMER ?? ''} ${orar.pedagog.PERD_MBIEMER ?? ''}`.trim()
                  : '');
              const sallaId = orar.SALLE_ID ?? f(orar, 'salla_id', 'SALLA_ID');
              const sallaName =
                orar.salla_em || f(orar, 'salla_name', 'SALLA_NAME') || getSallaName(sallaId);
              const ditaRaw = orar.ORAR_DITA ?? f(orar, 'dita', 'DITA');
              const dita = Number(ditaRaw);
              const ditaLabel = DAYS.find((d) => d.key === dita)?.label ?? ditaRaw;
              const rawOraFill = orar.ORAR_ORA_FILL ?? f(orar, 'ora_fill', 'ORA_FILL');
              const rawOraMba = orar.ORAR_ORA_MBA ?? f(orar, 'ora_mba', 'ORA_MBA');
              const oraFill = rawOraFill ? rawOraFill.substring(0, 5) : '';
              const oraMba = rawOraMba ? rawOraMba.substring(0, 5) : '';
              const semestri = orar.seksioni?.SEM_ID ?? f(orar, 'semestri', 'SEMESTRI');
              const viti = f(orar, 'viti', 'VITI');

              return (
                <>
                  <div
                    style={{
                      background: colors.bg,
                      border: `1.5px solid ${colors.border}`,
                      borderRadius: 8,
                      padding: '12px 16px',
                    }}
                  >
                    <Space>
                      <Tag color={colors.tagColor}>{colors.label === 'L' ? 'Ligjëratë' : colors.label === 'S' ? 'Seminar' : 'Laborator'}</Tag>
                    </Space>
                    <Title level={5} style={{ margin: '8px 0 0' }}>
                      {lendaName || '—'}
                    </Title>
                  </div>

                  <Card size="small" style={{ borderRadius: 8 }}>
                    <Space direction="vertical" size={6} style={{ width: '100%' }}>
                      <Row>
                        <Col span={10}>
                          <Text type="secondary">
                            <UserOutlined /> Pedagog
                          </Text>
                        </Col>
                        <Col span={14}>
                          <Text strong>{pedagName || '—'}</Text>
                        </Col>
                      </Row>
                      <Divider style={{ margin: '4px 0' }} />
                      <Row>
                        <Col span={10}>
                          <Text type="secondary">
                            <HomeOutlined /> Salla
                          </Text>
                        </Col>
                        <Col span={14}>
                          <Text strong>{sallaName}</Text>
                        </Col>
                      </Row>
                      <Divider style={{ margin: '4px 0' }} />
                      <Row>
                        <Col span={10}>
                          <Text type="secondary">
                            <CalendarOutlined /> Dita
                          </Text>
                        </Col>
                        <Col span={14}>
                          <Text strong>{ditaLabel}</Text>
                        </Col>
                      </Row>
                      <Divider style={{ margin: '4px 0' }} />
                      <Row>
                        <Col span={10}>
                          <Text type="secondary">
                            <ClockCircleOutlined /> Ora
                          </Text>
                        </Col>
                        <Col span={14}>
                          <Text strong>
                            {oraFill} – {oraMba}
                          </Text>
                        </Col>
                      </Row>
                      {(semestri || viti) && (
                        <>
                          <Divider style={{ margin: '4px 0' }} />
                          <Row>
                            <Col span={10}>
                              <Text type="secondary">Semestri / Viti</Text>
                            </Col>
                            <Col span={14}>
                              <Text strong>
                                {semestri ? `Sem. ${semestri}` : ''}{semestri && viti ? ' / ' : ''}{viti ? `Viti ${viti}` : ''}
                              </Text>
                            </Col>
                          </Row>
                        </>
                      )}
                    </Space>
                  </Card>

                  <Divider />

                  <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                    {isAdmin && (
                      <Button
                        icon={<EditOutlined />}
                        type="primary"
                        onClick={() => navigate(`/orare/edito/${orar.ORAR_ID ?? orar.id ?? orar.ID}`)}
                      >
                        Edito
                      </Button>
                    )}
                    {isAdmin && (
                      <Popconfirm
                        title="Fshi Orarin"
                        description="A jeni i sigurt që doni të fshini këtë orar?"
                        okText="Po, fshi"
                        cancelText="Anulo"
                        okButtonProps={{ danger: true, loading: deletingId === (orar.ORAR_ID ?? orar.id ?? orar.ID) }}
                        onConfirm={() => handleDelete(orar.ORAR_ID ?? orar.id ?? orar.ID)}
                      >
                        <Button danger icon={<DeleteOutlined />}>
                          Fshi
                        </Button>
                      </Popconfirm>
                    )}
                    <Button icon={<CloseOutlined />} onClick={() => setDrawerOpen(false)}>
                      Mbyll
                    </Button>
                  </Space>
                </>
              );
            })()}
          </Space>
        )}
      </Drawer>
    </Layout>
  );
}
