export default function Terms() {
  return (
    <div className="page-wrap" style={{ maxWidth: 720 }}>
      <div className="section-tag">Legal</div>
      <h1 style={{ fontSize: 26, marginBottom: 6 }}>Termos de Uso</h1>
      <p style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 28 }}>Versao 1.0 - vigente a partir de 01/05/2025</p>

      {[
        {
          title: '1. Aceitacao dos Termos',
          text: 'Ao utilizar o sistema de agendamento da Barbearia Prime, voce concorda com estes Termos de Uso. Se nao concordar, nao utilize o servico.',
        },
        {
          title: '2. Descricao do Servico',
          text: 'A Barbearia Prime oferece um sistema online para agendamento de servicos de barbearia. O sistema permite escolher servicos, barbeiros, datas e horarios disponiveis.',
        },
        {
          title: '3. Cadastro e Conta',
          text: 'Para agendar, e necessario possuir uma conta autenticada no sistema. Voce e responsavel pela veracidade e atualizacao das informacoes fornecidas.',
        },
        {
          title: '4. Agendamentos',
          text: 'Os agendamentos sao confirmados automaticamente quando o horario esta disponivel. O cliente pode cancelar pelo proprio sistema enquanto o agendamento estiver ativo.',
        },
        {
          title: '5. Comunicacoes',
          text: 'Esta versao do sistema nao envia lembretes automaticos por WhatsApp, SMS ou e-mail. Quando necessario, a barbearia pode entrar em contato manualmente pelos canais oficiais para tratar cancelamento, reagendamento ou confirmacoes operacionais.',
        },
        {
          title: '6. Cancelamentos e Faltas',
          text: 'Cancelamentos devem ser feitos com antecedencia pelo proprio sistema. Faltas recorrentes sem cancelamento poderao resultar em restricao de acesso ao sistema.',
        },
        {
          title: '7. Responsabilidades',
          text: 'A Barbearia Prime se compromete a realizar os servicos agendados nos horarios confirmados, salvo casos de forca maior. Nos reservamos o direito de reagendar em situacoes excepcionais, comunicando o cliente quando necessario.',
        },
        {
          title: '8. Privacidade',
          text: 'O tratamento dos seus dados pessoais e regido pela nossa Politica de Privacidade, disponivel neste site. Nao vendemos ou compartilhamos seus dados com terceiros para fins comerciais.',
        },
        {
          title: '9. Alteracoes nos Termos',
          text: 'Podemos atualizar estes termos periodicamente. A versao vigente estara sempre disponivel nesta pagina. O uso continuado do servico apos alteracoes implica aceitacao dos novos termos.',
        },
        {
          title: '10. Contato',
          text: 'Duvidas sobre estes termos? Entre em contato via WhatsApp ou pelo endereco da barbearia.',
        },
      ].map(section => (
        <div key={section.title} style={{ marginBottom: 22 }}>
          <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600, color: 'var(--t1)', marginBottom: 6 }}>{section.title}</h3>
          <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.8 }}>{section.text}</p>
        </div>
      ))}
    </div>
  )
}
