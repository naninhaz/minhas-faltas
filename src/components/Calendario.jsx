import React, { useState } from 'react';

export default function Calendario({ disciplinas }) {
  const [mesAtual, setMesAtual] = useState(new Date());

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
  
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

  const gerarDiasDoCalendario = () => {
    const diasDoMes = getDiasDoMes(mesAtual);
    const primeiroDia = getPrimeiroDiaDoMes(mesAtual);
    const dias = [];

    // Preencher dias vazios no início
    for (let i = 0; i < primeiroDia; i++) {
      dias.push(null);
    }

    // Preencher com os dias do mês
    for (let i = 1; i <= diasDoMes; i++) {
      dias.push(i);
    }

    return dias;
  };

  const mudarMes = (incremento) => {
    const novoMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + incremento, 1);
    setMesAtual(novoMes);
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
        marginBottom: '20px'
      }}>
        <button
          onClick={() => mudarMes(-1)}
          style={{
            background: '#E8D5F2',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '10px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            color: '#6B4C8A',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = '#DCC0E8'}
          onMouseLeave={(e) => e.target.style.background = '#E8D5F2'}
        >
          ← Anterior
        </button>
        
        <h3 style={{
          fontSize: '1.1rem',
          fontWeight: '700',
          color: '#6B4C8A',
          margin: 0,
          textTransform: 'capitalize'
        }}>
          {nomeMes}
        </h3>

        <button
          onClick={() => mudarMes(1)}
          style={{
            background: '#E8D5F2',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '10px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            color: '#6B4C8A',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = '#DCC0E8'}
          onMouseLeave={(e) => e.target.style.background = '#E8D5F2'}
        >
          Próximo →
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
            style={{
              aspectRatio: '1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              fontSize: '0.95rem',
              fontWeight: '600',
              background: dia === null ? 'transparent' : temFaltaNaData(dia) ? '#FFD4D4' : '#F0E8F5',
              color: dia === null ? 'transparent' : temFaltaNaData(dia) ? '#C85A5A' : '#6B4C8A',
              border: temFaltaNaData(dia) ? '2px solid #E8A4A4' : '1px solid #E8D5F2',
              cursor: dia === null ? 'default' : 'pointer',
              transition: 'all 0.2s',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              if (dia !== null) {
                e.target.style.background = temFaltaNaData(dia) ? '#FFB8B8' : '#E8D5F2';
                e.target.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (dia !== null) {
                e.target.style.background = temFaltaNaData(dia) ? '#FFD4D4' : '#F0E8F5';
                e.target.style.transform = 'scale(1)';
              }
            }}
          >
            {dia !== null && (
              <>
                <span>{dia}</span>
                {temFaltaNaData(dia) && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '4px',
                      fontSize: '1.2rem'
                    }}
                  >
                    •
                  </span>
                )}
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
        borderTop: '1px solid #E8D5F2'
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
              background: '#FFD4D4',
              border: '2px solid #E8A4A4'
            }}
          />
          <span style={{ color: '#C85A5A' }}>Com faltas</span>
        </div>
      </div>
    </div>
  );
}
