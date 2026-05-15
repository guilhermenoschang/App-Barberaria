export default function Privacy() {
  return (
    <div className="page-wrap" style={{ maxWidth: 720 }}>
      <div className="section-tag">Legal</div>
      <h1 style={{ fontSize: 26, marginBottom: 6 }}>Politica de Privacidade</h1>
      <p style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 28 }}>Versao 1.0 - vigente a partir de 01/05/2025 - Em conformidade com a LGPD (Lei 13.709/2018)</p>

      {[
        {
          title: '1. Dados Coletados',
          text: 'Coletamos apenas os dados necessarios para o funcionamento do agendamento: nome completo, numero de WhatsApp, endereco de e-mail da conta, servico escolhido, barbeiro escolhido, data e horario do agendamento, historico de atendimentos e registro de consentimento. Nao coletamos CPF, dados de saude, biometria, dados financeiros, religiao, orientacao politica ou qualquer dado sensivel.',
        },
        {
          title: '2. Finalidade do Tratamento',
          text: 'Seus dados sao utilizados exclusivamente para cadastro e identificacao no sistema, confirmacao e gestao de agendamentos, contato manual da barbearia quando necessario para cancelamento, reagendamento ou confirmacao operacional, e organizacao interna da agenda.',
        },
        {
          title: '3. Base Legal',
          text: 'O tratamento e realizado com base no consentimento explicito do titular (Art. 7, I da LGPD) e na execucao de contrato de prestacao de servicos (Art. 7, V da LGPD).',
        },
        {
          title: '4. Compartilhamento de Dados',
          text: 'Seus dados nao sao vendidos, alugados ou compartilhados com terceiros para fins comerciais. Podem ser compartilhados apenas com prestadores de servico essenciais ao funcionamento do sistema, sempre sob obrigacao de confidencialidade.',
        },
        {
          title: '5. Seus Direitos (LGPD)',
          text: 'Voce tem direito a confirmar a existencia de tratamento dos seus dados, acessar seus dados, solicitar correcao de dados incompletos ou desatualizados, solicitar exclusao dos dados, revogar o consentimento a qualquer momento e solicitar portabilidade. Para exercer esses direitos, entre em contato via WhatsApp.',
        },
        {
          title: '6. Seguranca',
          text: 'Adotamos medidas tecnicas e organizacionais para proteger seus dados contra acesso nao autorizado, perda ou divulgacao indevida. Dados pessoais sao acessiveis apenas por administradores autenticados e pelo proprio titular autenticado dentro da sua conta.',
        },
        {
          title: '7. Retencao de Dados',
          text: 'Seus dados sao mantidos enquanto voce utiliza o servico ou conforme exigido por lei. Apos solicitacao de exclusao, os dados sao removidos em ate 30 dias, exceto quando a retencao for obrigatoria por lei.',
        },
        {
          title: '8. Cookies',
          text: 'Este sistema utiliza apenas armazenamento local de sessao para manter voce autenticado. Nao utilizamos cookies de rastreamento ou publicidade.',
        },
        {
          title: '9. Comunicacoes',
          text: 'Esta versao do sistema nao dispara lembretes automaticos por WhatsApp, SMS ou e-mail. Qualquer contato da barbearia ocorre de forma manual pelos canais oficiais.',
        },
        {
          title: '10. Contato do Responsavel',
          text: 'Duvidas, solicitacoes ou reclamacoes sobre privacidade: entre em contato com o responsavel pelo tratamento de dados via WhatsApp ou presencialmente na barbearia.',
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
