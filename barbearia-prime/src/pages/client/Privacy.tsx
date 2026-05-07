export default function Privacy() {
  return (
    <div className="page-wrap" style={{ maxWidth: 720 }}>
      <div className="section-tag">Legal</div>
      <h1 style={{ fontSize: 26, marginBottom: 6 }}>Política de Privacidade</h1>
      <p style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 28 }}>Versão 1.0 — vigente a partir de 01/05/2025 · Em conformidade com a LGPD (Lei 13.709/2018)</p>

      {[
        {
          title: '1. Dados Coletados',
          text: 'Coletamos apenas os dados necessários para o funcionamento do agendamento: nome completo, número de WhatsApp (obrigatório), endereço de e-mail (opcional), serviço escolhido, barbeiro escolhido, data e horário do agendamento, histórico de atendimentos e registro de consentimento. Não coletamos CPF, dados de saúde, biometria, dados financeiros, religião, orientação política ou qualquer dado sensível.',
        },
        {
          title: '2. Finalidade do Tratamento',
          text: 'Seus dados são utilizados exclusivamente para: cadastro e identificação no sistema, confirmação e gestão de agendamentos, contato via WhatsApp para confirmação, lembrete, cancelamento ou reagendamento, e organização interna da agenda da barbearia.',
        },
        {
          title: '3. Base Legal',
          text: 'O tratamento é realizado com base no consentimento explícito do titular (Art. 7º, I da LGPD) e na execução de contrato de prestação de serviços (Art. 7º, V da LGPD).',
        },
        {
          title: '4. Compartilhamento de Dados',
          text: 'Seus dados não são vendidos, alugados ou compartilhados com terceiros para fins comerciais. Podem ser compartilhados apenas com prestadores de serviço essenciais ao funcionamento do sistema (ex: plataforma de hospedagem), sempre sob obrigação de confidencialidade.',
        },
        {
          title: '5. Seus Direitos (LGPD)',
          text: 'Você tem direito a: confirmar a existência de tratamento dos seus dados, acessar seus dados, solicitar correção de dados incompletos ou desatualizados, solicitar exclusão dos dados, revogar o consentimento a qualquer momento, e solicitar portabilidade. Para exercer esses direitos, entre em contato via WhatsApp.',
        },
        {
          title: '6. Segurança',
          text: 'Adotamos medidas técnicas e organizacionais para proteger seus dados contra acesso não autorizado, perda ou divulgação indevida. Dados pessoais são acessíveis apenas por administradores autenticados.',
        },
        {
          title: '7. Retenção de Dados',
          text: 'Seus dados são mantidos enquanto você utiliza o serviço ou conforme exigido por lei. Após solicitação de exclusão, os dados são removidos em até 30 dias, exceto quando a retenção for obrigatória por lei.',
        },
        {
          title: '8. Cookies',
          text: 'Este sistema utiliza apenas armazenamento local de sessão para manter você autenticado. Não utilizamos cookies de rastreamento ou publicidade.',
        },
        {
          title: '9. Contato do Responsável',
          text: 'Dúvidas, solicitações ou reclamações sobre privacidade: entre em contato com o responsável pelo tratamento de dados via WhatsApp ou presencialmente na barbearia.',
        },
      ].map(s => (
        <div key={s.title} style={{ marginBottom: 22 }}>
          <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600, color: 'var(--t1)', marginBottom: 6 }}>{s.title}</h3>
          <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.8 }}>{s.text}</p>
        </div>
      ))}
    </div>
  )
}
