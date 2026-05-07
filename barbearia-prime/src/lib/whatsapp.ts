/** Abre WhatsApp da BARBEARIA (nunca do barbeiro) */
export function openBarberiaWhatsApp(config: { whatsapp: string }, message?: string): void {
  const num = config.whatsapp.replace(/\D/g, '')
  const url = message
    ? `https://wa.me/${num}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${num}`
  window.open(url, '_blank', 'noopener')
}

export function buildBookingMessage(data: {
  clientName: string; serviceName: string; barberName: string
  date: string; time: string; price: number
}): string {
  return `Olá! Sou *${data.clientName}* e acabei de confirmar meu agendamento na *Barbearia Prime*:\n\n✂ *${data.serviceName}*\n👤 Barbeiro: ${data.barberName}\n📅 ${data.date} às ${data.time}\n💰 R$ ${data.price.toFixed(2)}\n\nAté lá!`
}
