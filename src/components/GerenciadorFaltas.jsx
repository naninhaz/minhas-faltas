import React, { useState, useEffect } from 'react';
import Calendario from './Calendario';

// Simple storage implementation for browser
const storage = {
  get: async (key) => {
    const value = localStorage.getItem(key);
    return value ? { value } : null;
  },
  set: async (key, value) => {
    localStorage.setItem(key, value);
  },
  delete: async (key) => {
    localStorage.removeItem(key);
  }
};

// Make storage available globally for the component
if (typeof window !== 'undefined') {
  window.storage = storage;
}

export default function GerenciadorFaltas() {
  const [disciplinas, setDisciplinas] = useState([]);
  const [novaDisciplina, setNovaDisciplina] = useState('');
  const [totalHoras, setTotalHoras] = useState('');
  const [instituicao, setInstituicao] = useState('SENAI');
  const [diasAula, setDiasAula] = useState([]);
  const [loading, setLoading] = useState(true);

  const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const diasSemanaAbrev = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
  
  // Modal de adicionar falta
  const [modalAberto, setModalAberto] = useState(false);
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState(null);
  const [numeroFaltas, setNumeroFaltas] = useState('');
  const [justificativa, setJustificativa] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (!loading && disciplinas.length > 0) {
      salvarDados();
    }
  }, [disciplinas, loading]);

  const carregarDados = async () => {
    try {
      const resultado = await window.storage.get('disciplinas-faltas-v3');
      if (resultado && resultado.value) {
        setDisciplinas(JSON.parse(resultado.value));
      }
    } catch (error) {
      console.log('Nenhum dado anterior encontrado');
    } finally {
      setLoading(false);
    }
  };

  const salvarDados = async () => {
    try {
      await window.storage.set('disciplinas-faltas-v3', JSON.stringify(disciplinas));
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  // Calcula horas por falta baseado na instituição e total de horas
  const calcularHorasPorFalta = (instituicao, totalHoras) => {
    if (instituicao === 'SENAI') return 4;
    if (instituicao === 'UFBA' && totalHoras >= 60) return 4;
    if (instituicao === 'UFBA' && totalHoras < 60) return 2;
    return 4; // padrão
  };

  const adicionarDisciplina = () => {
    if (novaDisciplina.trim() && totalHoras) {
      const total = parseFloat(totalHoras);
      const horasPorFalta = calcularHorasPorFalta(instituicao, total);
      
      const nova = {
        id: Date.now(),
        nome: novaDisciplina.trim(),
        totalHoras: total,
        horasFaltadas: 0,
        instituicao: instituicao,
        horasPorFalta: horasPorFalta,
        diasAula: diasAula,
        faltas: []
      };
      setDisciplinas([...disciplinas, nova]);
      setNovaDisciplina('');
      setTotalHoras('');
      setDiasAula([]);
    }
  };

  const abrirModalFalta = (disciplina) => {
    setDisciplinaSelecionada(disciplina);
    setNumeroFaltas('');
    setJustificativa('');
    setModalAberto(true);
  };

  const adicionarFalta = () => {
    if (!numeroFaltas || !justificativa.trim()) {
      alert('Por favor, preencha o número de faltas e a justificativa!');
      return;
    }

    const numFaltas = parseInt(numeroFaltas);
    const horasEquivalentes = numFaltas * disciplinaSelecionada.horasPorFalta;
    
    setDisciplinas(disciplinas.map(d => {
      if (d.id === disciplinaSelecionada.id) {
        const novaFalta = {
          id: Date.now(),
          numeroFaltas: numFaltas,
          horas: horasEquivalentes,
          justificativa: justificativa.trim(),
          data: new Date().toLocaleDateString('pt-BR')
        };
        return {
          ...d,
          horasFaltadas: d.horasFaltadas + horasEquivalentes,
          faltas: [...d.faltas, novaFalta]
        };
      }
      return d;
    }));

    setModalAberto(false);
    setDisciplinaSelecionada(null);
    setNumeroFaltas('');
    setJustificativa('');
  };

  const removerFalta = (disciplinaId, faltaId) => {
    setDisciplinas(disciplinas.map(d => {
      if (d.id === disciplinaId) {
        const falta = d.faltas.find(f => f.id === faltaId);
        return {
          ...d,
          horasFaltadas: d.horasFaltadas - falta.horas,
          faltas: d.faltas.filter(f => f.id !== faltaId)
        };
      }
      return d;
    }));
  };

  const removerDisciplina = (id) => {
    if (confirm('Tem certeza que deseja remover esta disciplina?')) {
      setDisciplinas(disciplinas.filter(d => d.id !== id));
    }
  };

  const calcularPercentual = (horasFaltadas, totalHoras) => {
    return ((horasFaltadas / totalHoras) * 100).toFixed(1);
  };

  const calcularStatus = (horasFaltadas, totalHoras) => {
    const percentual = (horasFaltadas / totalHoras) * 100;
    const limite = 25;
    const horasRestantes = (totalHoras * limite / 100) - horasFaltadas;
    
    if (percentual >= limite) return { status: 'crítico', texto: 'REPROVADO!', restantes: 0 };
    if (percentual >= limite * 0.8) return { status: 'alerta', texto: 'ATENÇÃO!', restantes: horasRestantes.toFixed(1) };
    return { status: 'ok', texto: 'Dentro do limite', restantes: horasRestantes.toFixed(1) };
  };

  const limparTudo = async () => {
    if (confirm('Tem certeza que deseja apagar todos os dados?')) {
      try {
        await window.storage.delete('disciplinas-faltas-v3');
        setDisciplinas([]);
      } catch (error) {
        console.error('Erro ao limpar dados:', error);
      }
    }
  };

  const configs = {
    SENAI: {
      cor: '#7CB9D4',
      corClara: '#D4E8F0',
      gradiente: 'linear-gradient(135deg, #7CB9D4 0%, #A8D4E8 100%)',
      nome: 'SENAI'
    },
    UFBA: {
      cor: '#E8B4D0',
      corClara: '#F5E0ED',
      gradiente: 'linear-gradient(135deg, #E8B4D0 0%, #F0D4E8 100%)',
      nome: 'UFBA'
    }
  };

  const disciplinasSENAI = disciplinas.filter(d => d.instituicao === 'SENAI');
  const disciplinasUFBA = disciplinas.filter(d => d.instituicao === 'UFBA');

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: '"Space Mono", monospace',
        fontSize: '1.2rem'
      }}>
        Carregando...
      </div>
    );
  }

  const renderDisciplina = (disciplina) => {
    const percentual = calcularPercentual(disciplina.horasFaltadas, disciplina.totalHoras);
    const { status, texto, restantes } = calcularStatus(disciplina.horasFaltadas, disciplina.totalHoras);
    const config = configs[disciplina.instituicao];
    const faltasRestantes = restantes > 0 ? Math.floor(parseFloat(restantes) / disciplina.horasPorFalta) : 0;
    
    return (
      <div
        key={disciplina.id}
        className={`card-disciplina ${status === 'crítico' ? 'status-critico' : ''}`}
        style={{
          background: 'white',
          borderRadius: '20px',
          padding: '25px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          border: `3px solid ${config.cor}`,
          animation: 'slideIn 0.4s ease-out'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'inline-block',
              background: config.gradiente,
              color: 'white',
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '700',
              marginBottom: '8px',
              letterSpacing: '0.5px'
            }}>
              {config.nome} • 1 falta = {disciplina.horasPorFalta}h
            </div>
            <h3 style={{
              fontSize: '1.4rem',
              fontWeight: '700',
              margin: '0 0 8px 0',
              color: '#2d3748'
            }}>
              {disciplina.nome}
            </h3>
            <div style={{
              display: 'flex',
              gap: '15px',
              fontSize: '0.9rem',
              color: '#718096',
              flexWrap: 'wrap',
              marginBottom: '10px'
            }}>
              <span>Total: {disciplina.totalHoras}h</span>
              <span>•</span>
              <span>Faltadas: {disciplina.horasFaltadas.toFixed(1)}h</span>
              <span>•</span>
              <span>{percentual}% de ausência</span>
            </div>
            {disciplina.diasAula && disciplina.diasAula.length > 0 && (
              <div style={{
                fontSize: '0.85rem',
                color: '#6B4C8A',
                fontWeight: '600',
                background: '#F0E8F5',
                padding: '8px 12px',
                borderRadius: '6px',
                display: 'inline-block'
              }}>
                📅 {disciplina.diasAula.map(d => diasSemanaAbrev[d]).join(', ')}
              </div>
            )}
          </div>
          
          <button
            onClick={() => removerDisciplina(disciplina.id)}
            style={{
              background: '#FFD4D4',
              border: '2px solid #FFB8B8',
              color: '#C85A5A',
              padding: '8px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#FFB8B8';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#FFD4D4';
              e.target.style.transform = 'scale(1)';
            }}
          >
            🗑️ Deletar
          </button>
        </div>

        <div style={{
          background: '#f7fafc',
          borderRadius: '12px',
          height: '12px',
          overflow: 'hidden',
          marginBottom: '20px'
        }}>
          <div style={{
            width: `${Math.min(percentual, 100)}%`,
            height: '100%',
            background: status === 'crítico' ? '#fc8181' : 
                       status === 'alerta' ? '#f6ad55' : '#48bb78',
            transition: 'width 0.3s ease',
            borderRadius: '12px'
          }} />
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: disciplina.faltas.length > 0 ? '20px' : '0'
        }}>
          <div>
            <div style={{
              fontSize: '0.85rem',
              fontWeight: '600',
              color: status === 'crítico' ? '#fc8181' : 
                     status === 'alerta' ? '#f6ad55' : '#48bb78',
              marginBottom: '4px'
            }}>
              {texto}
            </div>
            {restantes > 0 && (
              <div style={{
                fontSize: '0.8rem',
                color: '#a0aec0'
              }}>
                Você pode faltar mais {faltasRestantes} {faltasRestantes === 1 ? 'vez' : 'vezes'} ({restantes}h)
              </div>
            )}
          </div>

          <button
            onClick={() => abrirModalFalta(disciplina)}
            className="btn-acao"
            style={{
              padding: '12px 20px',
              background: config.gradiente,
              color: 'white',
              border: '2px solid ' + config.cor,
              borderRadius: '10px',
              fontSize: '0.95rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: `0 6px 16px ${config.cor}50`,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = `0 8px 20px ${config.cor}60`;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = `0 6px 16px ${config.cor}50`;
            }}
          >
            📝 Registrar Falta
          </button>
        </div>

        {disciplina.faltas.length > 0 && (
          <div style={{
            marginTop: '20px',
            borderTop: '2px solid #f7fafc',
            paddingTop: '20px'
          }}>
            <h4 style={{
              fontSize: '0.9rem',
              fontWeight: '700',
              color: '#4a5568',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Histórico de Faltas ({disciplina.faltas.length})
            </h4>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              {disciplina.faltas.map(falta => (
                <div
                  key={falta.id}
                  style={{
                    background: config.corClara,
                    borderRadius: '10px',
                    padding: '12px 15px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: `1px solid ${config.cor}30`
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      color: '#2d3748',
                      marginBottom: '4px'
                    }}>
                      {falta.numeroFaltas} {falta.numeroFaltas === 1 ? 'falta' : 'faltas'} = {falta.horas}h • {falta.data}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#718096',
                      fontStyle: 'italic'
                    }}>
                      "{falta.justificativa}"
                    </div>
                  </div>
                  <button
                    onClick={() => removerFalta(disciplina.id, falta.id)}
                    style={{
                      background: '#FFE8E8',
                      border: '1px solid #FFD4D4',
                      color: '#C85A5A',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.75rem',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#FFD4D4';
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#FFE8E8';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    Apagar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F3E5F5 0%, #E8D5F2 50%, #FCE4EC 100%)',
      padding: '20px',
      fontFamily: '"DM Sans", -apple-system, sans-serif'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Mono:wght@700&display=swap');
        
        * {
          box-sizing: border-box;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .card-disciplina {
          animation: slideIn 0.4s ease-out;
        }
        
        .btn-acao:hover {
          transform: translateY(-2px);
        }
        
        .btn-acao:active {
          transform: translateY(0);
        }
        
        .status-critico {
          animation: pulse 2s infinite;
        }

        .modal-overlay {
          animation: fadeIn 0.2s ease-out;
        }

        .modal-content {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '40px',
          animation: 'slideIn 0.6s ease-out'
        }}>
          <h1 style={{
            fontFamily: '"Space Mono", monospace',
            fontSize: '3rem',
            fontWeight: '700',
            color: '#6B4C8A',
            margin: '0 0 10px 0',
            letterSpacing: '-2px'
          }}>
            📚 MINHAS FALTAS
          </h1>
          <p style={{
            color: '#9B7FB3',
            fontSize: '1.1rem',
            margin: 0,
            fontWeight: '500'
          }}>
            Controle suas ausências e atividades
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 10px 30px rgba(200, 150, 220, 0.1)',
          animation: 'slideIn 0.6s ease-out 0.1s backwards'
        }}>
          <h2 style={{
            fontSize: '1.3rem',
            fontWeight: '700',
            marginBottom: '20px',
            color: '#6B4C8A'
          }}>
            Adicionar Disciplina
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr auto',
            gap: '12px',
            alignItems: 'end'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: '600',
                color: '#6B4C8A',
                marginBottom: '6px'
              }}>
                Nome da Disciplina
              </label>
              <input
                type="text"
                placeholder="Ex: Matemática"
                value={novaDisciplina}
                onChange={(e) => setNovaDisciplina(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && adicionarDisciplina()}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  border: '2px solid #E8D5F2',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => e.target.style.borderColor = '#D4ABDD'}
                onBlur={(e) => e.target.style.borderColor = '#E8D5F2'}
              />
            </div>
            
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: '600',
                color: '#6B4C8A',
                marginBottom: '6px'
              }}>
                Total de Horas
              </label>
              <input
                type="number"
                step="1"
                placeholder="Ex: 60"
                value={totalHoras}
                onChange={(e) => setTotalHoras(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && adicionarDisciplina()}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  border: '2px solid #E8D5F2',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => e.target.style.borderColor = '#D4ABDD'}
                onBlur={(e) => e.target.style.borderColor = '#E8D5F2'}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: '600',
                color: '#6B4C8A',
                marginBottom: '6px'
              }}>
                Instituição
              </label>
              <select
                value={instituicao}
                onChange={(e) => setInstituicao(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  border: '2px solid #E8D5F2',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  background: 'white'
                }}
                onFocus={(e) => e.target.style.borderColor = '#D4ABDD'}
                onBlur={(e) => e.target.style.borderColor = '#E8D5F2'}
              >
                <option value="SENAI">SENAI</option>
                <option value="UFBA">UFBA</option>
              </select>
            </div>
            
            <button
              onClick={adicionarDisciplina}
              className="btn-acao"
              style={{
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #D4ABDD 0%, #E8D5F2 100%)',
                color: '#FFF',
                border: '2px solid #D4ABDD',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 6px 20px rgba(180, 120, 200, 0.3)',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 8px 25px rgba(180, 120, 200, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 20px rgba(180, 120, 200, 0.3)';
              }}
            >
              ➕ Adicionar Disciplina
            </button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: '#6B4C8A',
              marginBottom: '10px'
            }}>
              Dias de Aula (opcional)
            </label>
            <div style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              {diasSemana.map((dia, index) => (
                <label
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 15px',
                    background: diasAula.includes(index) ? 'linear-gradient(135deg, #D4ABDD 0%, #E8D5F2 100%)' : '#F0E8F5',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: '2px solid ' + (diasAula.includes(index) ? '#D4ABDD' : '#E8D5F2')
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#DCC0E8'}
                  onMouseLeave={(e) => e.currentTarget.style.background = diasAula.includes(index) ? 'linear-gradient(135deg, #D4ABDD 0%, #E8D5F2 100%)' : '#F0E8F5'}
                >
                  <input
                    type="checkbox"
                    checked={diasAula.includes(index)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setDiasAula([...diasAula, index]);
                      } else {
                        setDiasAula(diasAula.filter(d => d !== index));
                      }
                    }}
                    style={{
                      cursor: 'pointer',
                      width: '16px',
                      height: '16px'
                    }}
                  />
                  <span style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: diasAula.includes(index) ? 'white' : '#6B4C8A'
                  }}>
                    {diasSemanaAbrev[index]}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {(disciplinasSENAI.length > 0 || disciplinasUFBA.length === 0) && (
          <div style={{
            marginBottom: '40px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              marginBottom: '20px',
              animation: 'slideIn 0.6s ease-out 0.2s backwards'
            }}>
              <div style={{
                background: configs.SENAI.gradiente,
                color: 'white',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '1.2rem',
                fontWeight: '700',
                letterSpacing: '1px',
                boxShadow: '0 4px 12px rgba(124, 185, 212, 0.3)'
              }}>
                SENAI
              </div>
              <div style={{
                flex: 1,
                height: '3px',
                background: `linear-gradient(to right, ${configs.SENAI.cor}, transparent)`,
                borderRadius: '3px'
              }} />
            </div>
            
            {disciplinasSENAI.length === 0 ? (
              <div style={{
                background: 'rgba(244, 230, 245, 0.6)',
                borderRadius: '16px',
                padding: '40px',
                textAlign: 'center',
                color: '#6B4C8A',
                backdropFilter: 'blur(10px)',
                border: `2px dashed ${configs.SENAI.cor}`
              }}>
                <p style={{
                  fontSize: '1rem',
                  margin: 0,
                  opacity: 0.8
                }}>
                  Nenhuma disciplina do SENAI cadastrada
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gap: '20px'
              }}>
                {disciplinasSENAI.map(renderDisciplina)}
              </div>
            )}
          </div>
        )}

        {(disciplinasUFBA.length > 0 || disciplinasSENAI.length === 0) && (
          <div style={{
            marginBottom: '40px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              marginBottom: '20px',
              animation: 'slideIn 0.6s ease-out 0.3s backwards'
            }}>
              <div style={{
                background: configs.UFBA.gradiente,
                color: 'white',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '1.2rem',
                fontWeight: '700',
                letterSpacing: '1px',
                boxShadow: '0 4px 12px rgba(232, 180, 208, 0.3)'
              }}>
                UFBA
              </div>
              <div style={{
                flex: 1,
                height: '3px',
                background: `linear-gradient(to right, ${configs.UFBA.cor}, transparent)`,
                borderRadius: '3px'
              }} />
            </div>
            
            {disciplinasUFBA.length === 0 ? (
              <div style={{
                background: 'rgba(244, 230, 245, 0.6)',
                borderRadius: '16px',
                padding: '40px',
                textAlign: 'center',
                color: '#6B4C8A',
                backdropFilter: 'blur(10px)',
                border: `2px dashed ${configs.UFBA.cor}`
              }}>
                <p style={{
                  fontSize: '1rem',
                  margin: 0,
                  opacity: 0.8
                }}>
                  Nenhuma disciplina da UFBA cadastrada
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gap: '20px'
              }}>
                {disciplinasUFBA.map(renderDisciplina)}
              </div>
            )}
          </div>
        )}

        {disciplinas.length > 0 && (
          <div style={{
            marginTop: '30px',
            textAlign: 'center'
          }}>
            <button
              onClick={limparTudo}
              style={{
                padding: '12px 24px',
                background: '#FFD4D4',
                color: '#C85A5A',
                border: '2px solid #FFB8B8',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#FFB8B8';
                e.target.style.borderColor = '#FFA0A0';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#FFD4D4';
                e.target.style.borderColor = '#FFB8B8';
              }}
            >
              🗑️ Limpar Todos os Dados
            </button>
          </div>
        )}

        <Calendario disciplinas={disciplinas} />
      </div>

      {modalAberto && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(107, 76, 138, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setModalAberto(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '30px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(200, 150, 220, 0.2)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '25px'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#6B4C8A',
                margin: 0
              }}>
                Registrar Falta
              </h2>
              <button
                onClick={() => setModalAberto(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '2rem',
                  color: '#DCC0E8',
                  cursor: 'pointer',
                  padding: '0',
                  lineHeight: '1',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#D4ABDD'}
                onMouseLeave={(e) => e.target.style.color = '#DCC0E8'}
              >
                ×
              </button>
            </div>

            <div style={{
              background: configs[disciplinaSelecionada.instituicao].corClara,
              padding: '15px',
              borderRadius: '12px',
              marginBottom: '25px',
              border: `2px solid ${configs[disciplinaSelecionada.instituicao].cor}30`
            }}>
              <div style={{
                fontSize: '0.8rem',
                color: '#6B4C8A',
                marginBottom: '4px',
                textTransform: 'uppercase',
                fontWeight: '600',
                letterSpacing: '0.5px'
              }}>
                {configs[disciplinaSelecionada.instituicao].nome}
              </div>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: '700',
                color: '#6B4C8A',
                marginBottom: '6px'
              }}>
                {disciplinaSelecionada.nome}
              </div>
              <div style={{
                fontSize: '0.85rem',
                color: configs[disciplinaSelecionada.instituicao].cor,
                fontWeight: '600'
              }}>
                1 falta = {disciplinaSelecionada.horasPorFalta}h aula
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#6B4C8A',
                marginBottom: '8px'
              }}>
                Número de Faltas *
              </label>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="Ex: 1"
                value={numeroFaltas}
                onChange={(e) => setNumeroFaltas(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  border: '2px solid #E8D5F2',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => e.target.style.borderColor = configs[disciplinaSelecionada.instituicao].cor}
                onBlur={(e) => e.target.style.borderColor = '#E8D5F2'}
              />
              {numeroFaltas && (
                <div style={{
                  marginTop: '8px',
                  fontSize: '0.85rem',
                  color: configs[disciplinaSelecionada.instituicao].cor,
                  fontWeight: '600'
                }}>
                  = {parseInt(numeroFaltas || 0) * disciplinaSelecionada.horasPorFalta}h de aula
                </div>
              )}
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#6B4C8A',
                marginBottom: '8px'
              }}>
                Justificativa *
              </label>
              <textarea
                placeholder="Ex: Consulta médica"
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  border: '2px solid #E8D5F2',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
                onFocus={(e) => e.target.style.borderColor = configs[disciplinaSelecionada.instituicao].cor}
                onBlur={(e) => e.target.style.borderColor = '#E8D5F2'}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={() => setModalAberto(false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'white',
                  color: '#9B7FB3',
                  border: '2px solid #E8D5F2',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#F0E8F5';
                  e.target.style.borderColor = '#D4ABDD';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.borderColor = '#E8D5F2';
                }}
              >
                Cancelar
              </button>
              <button
                onClick={adicionarFalta}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: configs[disciplinaSelecionada.instituicao].gradiente,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: `0 4px 12px ${configs[disciplinaSelecionada.instituicao].cor}40`
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                Confirmar Falta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
