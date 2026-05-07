export default function Terms() {
  return (
    <div className="page-wrap" style={{ maxWidth: 720 }}>
      <div className="section-tag">Legal</div>
      <h1 style={{ fontSize: 26, marginBottom: 6 }}>Termos de Uso</h1>
      <p style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 28 }}>Versão 1.0 — vigente a partir de 01/05/2025</p>

      {[
        {
          title: '1. Aceitação dos Termos',
          text: 'Ao utilizar o sistema de agendamento da Barbearia Prime, você concorda com estes Termos de Uso. Se não concordar, não utilize o serviço.',
        },
        {
          title: '2. Descrição do Serviço',
          text: 'A Barbearia Prime oferece um sistema online para agendamento de serviços de barbearia. O sistema permite escolher serviços, barbeiros, datas e horários disponíveis.',
        },
        {
          title: '3. Cadastro e Conta',
          text: 'Para agendar, você precisará informar nome completo e WhatsApp. O e-mail é opcional. Você é responsável pela veracidade das informações fornecidas.',
        },
        {
          title: '4. Agendamentos',
          text: 'Os agendamentos são confirmados automaticamente quando o horário está disponível. O cliente pode cancelar até o horário marcado. Em caso de cancelamento pela barbearia, o cliente será notificado via WhatsApp.',
        },
        {
          title: '5. Cancelamentos e Faltas',
          text: 'Cancelamentos devem ser feitos com antecedência pelo próprio sistema. Faltas recorrentes sem cancelamento poderão resultar em restrição de acesso ao sistema.',
        },
        {
          title: '6. Responsabilidades',
          text: 'A Barbearia Prime se compromete a realizar os serviços agendados nos horários confirmados, salvo casos de força maior. Nos reservamos o direito de reagendar em situações excepcionais, comunicando o cliente com antecedência.',
        },
        {
          title: '7. Privacidade',
          text: 'O tratamento dos seus dados pessoais é regido pela nossa Política de Privacidade, disponível neste site. Não vendemos ou compartilhamos seus dados com terceiros para fins comerciais.',
        },
        {
          title: '8. Alterações nos Termos',
          text: 'Podemos atualizar estes termos periodicamente. A versão vigente estará sempre disponível nesta página. O uso continuado do serviço após alterações implica aceitação dos novos termos.',
        },
        {
          title: '9. Contato',
          text: 'Dúvidas sobre estes termos? Entre em contato via WhatsApp ou pelo endereço da barbearia.',
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
