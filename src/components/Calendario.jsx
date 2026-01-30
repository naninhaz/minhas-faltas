import React, { useState, useEffect } from 'react';

export default function Calendario({ disciplinas }) {
  const [mesAtual, setMesAtual] = useState(new Date());
  const [atividades, setAtividades] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState(null);
  const [descricaoAtividade, setDescricaoAtividade] = useState('');
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState('');

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

  // Verificar se é dia de aula para alguma disciplina
  const temDiaDeAulaHoje = (dia) => {
    const data = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), dia);
    const diadasemana = data.getDay();
    return disciplinas.some(d => d.diasAula && d.diasAula.includes(diadasemana === 0 ? 6 : diadasemana - 1));
  };

  // Carregar atividades do localStorage
  useEffect(() => {
    const atividadesSalvas = localStorage.getItem('atividades-calendario');
    if (atividadesSalvas) {
      setAtividades(JSON.parse(atividadesSalvas));
    }
  }, []);

  // Salvar atividades no localStorage
  useEffect(() => {
    if (atividades.length > 0 || localStorage.getItem('atividades-calendario')) {
      localStorage.setItem('atividades-calendario', JSON.stringify(atividades));
    }
  }, [atividades]);
  
  // Coletar todas as datas com faltas
  const datasComFaltas = new Set();
  disciplinas.forEach(disciplina => {
    disciplina.faltas.forEach(falta => {
      const [dia, mes, ano] = falta.data.split('/').map(Number);
      const dataKey = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      datasComFaltas.add(dataKey);
    });
  });

  const getDiasDoMes = (data) => {
    return new Date(data.getFullYear(), data.getMonth() + 1, 0).getDate();
  };

  const getPrimeiroDiaDoMes = (data) => {
    return new Date(data.getFullYear(), data.getMonth(), 1).getDay();
  };

  const temFaltaNaData = (dia) => {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth() + 1;
    const dataKey = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    return datasComFaltas.has(dataKey);
  };

  const temAtividadeNaData = (dia) => {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth() + 1;
    const dataKey = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    return atividades.some(a => a.data === dataKey);
  };

  const gerarDiasDoCalendario = () => {
    const diasDoMes = getDiasDoMes(mesAtual);
    const primeiroDia = getPrimeiroDiaDoMes(mesAtual);
    const dias = [];

    for (let i = 0; i < primeiroDia; i++) {
      dias.push(null);
    }

    for (let i = 1; i <= diasDoMes; i++) {
      dias.push(i);
    }

    return dias;
  };

  const mudarMes = (incremento) => {
    const novoMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + incremento, 1);
    setMesAtual(novoMes);
  };

  const abrirModalAtividade = (dia) => {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth() + 1;
    const dataKey = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    setDataSelecionada(dataKey);
    setDescricaoAtividade('');
    setDisciplinaSelecionada('');
    setModalAberto(true);
  };

  const adicionarAtividade = () => {
    if (!descricaoAtividade.trim() || !disciplinaSelecionada) {
      alert('Por favor, preencha a descrição e selecione uma matéria!');
      return;
    }

    const novaAtividade = {
      id: Date.now(),
      data: dataSelecionada,
      descricao: descricaoAtividade.trim(),
      disciplina: disciplinaSelecionada
    };

    setAtividades([...atividades, novaAtividade]);
    setModalAberto(false);
    setDataSelecionada(null);
    setDescricaoAtividade('');
    setDisciplinaSelecionada('');
  };

  const removerAtividade = (id) => {
    setAtividades(atividades.filter(a => a.id !== id));
  };

  const diasDoCalendario = gerarDiasDoCalendario();
  const nomeMes = mesAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      padding: '30px',
      boxShadow: '0 10px 30px rgba(200, 150, 220, 0.1)',
      marginBottom: '30px',
      animation: 'slideIn 0.6s ease-out 0.4s backwards'
    }}>
      <h2 style={{
        fontSize: '1.3rem',
        fontWeight: '700',
        marginBottom: '20px',
        color: '#6B4C8A',
        textAlign: 'center'
      }}>
        📅 Calendário de Atividades
      </h2>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        gap: '15px'
      }}>
        <button
          onClick={() => mudarMes(-1)}
          style={{
            background: 'linear-gradient(135deg, #D4ABDD 0%, #E8D5F2 100%)',
            border: '2px solid #D4ABDD',
            padding: '10px 18px',
            borderRadius: '10px',
            fontSize: '0.9rem',
            fontWeight: '700',
            cursor: 'pointer',
            color: 'white',
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(180, 120, 200, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(180, 120, 200, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(180, 120, 200, 0.2)';
          }}
        >
          ◀ Anterior
        </button>
        
        <h3 style={{
          fontSize: '1.1rem',
          fontWeight: '700',
          color: '#6B4C8A',
          margin: 0,
          textTransform: 'capitalize',
          minWidth: '150px',
          textAlign: 'center'
        }}>
          {nomeMes}
        </h3>

        <button
          onClick={() => mudarMes(1)}
          style={{
            background: 'linear-gradient(135deg, #D4ABDD 0%, #E8D5F2 100%)',
            border: '2px solid #D4ABDD',
            padding: '10px 18px',
            borderRadius: '10px',
            fontSize: '0.9rem',
            fontWeight: '700',
            cursor: 'pointer',
            color: 'white',
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(180, 120, 200, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(180, 120, 200, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(180, 120, 200, 0.2)';
          }}
        >
          Próximo ▶
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '8px',
        marginBottom: '20px'
      }}>
        {diasSemana.map(dia => (
          <div
            key={dia}
            style={{
              textAlign: 'center',
              fontWeight: '700',
              fontSize: '0.85rem',
              color: '#9B7FB3',
              padding: '10px 5px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            {dia}
          </div>
        ))}

        {diasDoCalendario.map((dia, index) => (
          <div
            key={index}
            onClick={() => dia !== null && abrirModalAtividade(dia)}
            style={{
              aspectRatio: '1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              borderRadius: '12px',
              fontSize: '0.95rem',
              fontWeight: '600',
              background: dia === null ? 'transparent' : 
                         temFaltaNaData(dia) && temAtividadeNaData(dia) ? '#FFD4D4' :
                         temFaltaNaData(dia) ? '#FFE8E8' :
                         temAtividadeNaData(dia) ? '#E8F0F5' :
                         temDiaDeAulaHoje(dia) ? '#F5E8F0' : '#F0E8F5',
              color: dia === null ? 'transparent' : temFaltaNaData(dia) ? '#C85A5A' : '#6B4C8A',
              border: temAtividadeNaData(dia) ? '2px solid #7CB9D4' : 
                     temFaltaNaData(dia) ? '1px solid #E8A4A4' : 
                     temDiaDeAulaHoje(dia) ? '2px solid #D4ABDD' : '1px solid #E8D5F2',
              cursor: dia === null ? 'default' : 'pointer',
              transition: 'all 0.2s',
              position: 'relative',
              padding: '4px',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (dia !== null) {
                e.currentTarget.style.background = temFaltaNaData(dia) ? '#FFB8B8' : '#E8D5F2';
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (dia !== null) {
                e.currentTarget.style.background = dia === null ? 'transparent' : 
                         temFaltaNaData(dia) && temAtividadeNaData(dia) ? '#FFD4D4' :
                         temFaltaNaData(dia) ? '#FFE8E8' :
                         temAtividadeNaData(dia) ? '#E8F0F5' : '#F0E8F5';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            {dia !== null && (
              <>
                <span style={{ marginBottom: '2px' }}>{dia}</span>
                <div style={{ display: 'flex', gap: '2px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {temFaltaNaData(dia) && <span style={{ fontSize: '0.8rem' }}>•</span>}
                  {temAtividadeNaData(dia) && <span style={{ fontSize: '0.8rem', color: '#7CB9D4' }}>✓</span>}
                  {temDiaDeAulaHoje(dia) && <span style={{ fontSize: '0.8rem', color: '#D4ABDD' }}>📅</span>}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div style={{
        display: 'flex',
        gap: '20px',
        fontSize: '0.9rem',
        justifyContent: 'center',
        paddingTop: '15px',
        borderTop: '1px solid #E8D5F2',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '6px',
              background: '#F0E8F5',
              border: '1px solid #E8D5F2'
            }}
          />
          <span style={{ color: '#6B4C8A' }}>Sem atividades</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '6px',
              background: '#E8F0F5',
              border: '2px solid #7CB9D4'
            }}
          />
          <span style={{ color: '#6B4C8A' }}>Com atividades</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '6px',
              background: '#FFD4D4',
              border: '2px solid #E8A4A4'
            }}
          />
          <span style={{ color: '#6B4C8A' }}>Com faltas</span>
        </div>
      </div>

      {modalAberto && (
        <div
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
            zIndex: 999,
            padding: '20px'
          }}
          onClick={() => setModalAberto(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '30px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(200, 150, 220, 0.2)',
              animation: 'slideIn 0.3s ease-out'
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
                Adicionar Atividade
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

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#6B4C8A',
                marginBottom: '8px'
              }}>
                Data: {dataSelecionada && new Date(dataSelecionada + 'T00:00').toLocaleDateString('pt-BR')}
              </label>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#6B4C8A',
                marginBottom: '8px'
              }}>
                Matéria *
              </label>
              <select
                value={disciplinaSelecionada}
                onChange={(e) => setDisciplinaSelecionada(e.target.value)}
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
                <option value="">Selecione uma matéria</option>
                {disciplinas.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.nome} ({d.instituicao})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#6B4C8A',
                marginBottom: '8px'
              }}>
                Descrição da Atividade *
              </label>
              <textarea
                placeholder="Ex: Entrega de trabalho, prova, projeto..."
                value={descricaoAtividade}
                onChange={(e) => setDescricaoAtividade(e.target.value)}
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
                onFocus={(e) => e.target.style.borderColor = '#D4ABDD'}
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
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#F0E8F5';
                  e.target.style.borderColor = '#D4ABDD';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.borderColor = '#E8D5F2';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                ✕ Cancelar
              </button>
              <button
                onClick={adicionarAtividade}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'linear-gradient(135deg, #D4ABDD 0%, #E8D5F2 100%)',
                  color: 'white',
                  border: '2px solid #D4ABDD',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 6px 16px rgba(180, 120, 200, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 8px 20px rgba(180, 120, 200, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 6px 16px rgba(180, 120, 200, 0.3)';
                }}
              >
                ✓ Adicionar Atividade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mostrar atividades do mês */}
      {atividades.length > 0 && (
        <div style={{
          marginTop: '25px',
          paddingTop: '20px',
          borderTop: '2px solid #E8D5F2'
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '700',
            color: '#6B4C8A',
            marginBottom: '15px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Atividades do Mês
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {atividades
              .filter(a => a.data.startsWith(mesAtual.getFullYear() + '-' + String(mesAtual.getMonth() + 1).padStart(2, '0')))
              .sort((a, b) => new Date(a.data) - new Date(b.data))
              .map(atividade => {
                const disciplina = disciplinas.find(d => d.id === parseInt(atividade.disciplina));
                return (
                  <div
                    key={atividade.id}
                    style={{
                      background: '#E8F0F5',
                      borderRadius: '10px',
                      padding: '12px 15px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '2px solid #7CB9D4'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: '#6B4C8A',
                        marginBottom: '4px'
                      }}>
                        {new Date(atividade.data + 'T00:00').toLocaleDateString('pt-BR')} - {disciplina?.nome}
                      </div>
                      <div style={{
                        fontSize: '0.9rem',
                        color: '#6B4C8A'
                      }}>
                        {atividade.descricao}
                      </div>
                    </div>
                    <button
                      onClick={() => removerAtividade(atividade.id)}
                      style={{
                        background: '#FFD4D4',
                        border: '1px solid #FFB8B8',
                        color: '#C85A5A',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.75rem',
                        transition: 'all 0.2s',
                        marginLeft: '10px',
                        whiteSpace: 'nowrap'
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
                      Apagar
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
