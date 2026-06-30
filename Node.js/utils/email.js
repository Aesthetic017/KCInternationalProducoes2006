const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendPasswordResetEmail({ to, name, resetUrl }) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #050A14; color: #F8FAFC; border-radius: 16px;">
      <h2 style="color: #3B82F6; margin-bottom: 4px;">KC International Producoes</h2>
      <p style="color: #94A3B8; font-size: 13px; margin-bottom: 24px;">Password Reset Request</p>
      <p>Hi ${name},</p>
      <p>We received a request to reset your password. Click the button below to choose a new one. This link expires in 1 hour.</p>
      <div style="text-align:center; margin: 28px 0;">
        <a href="${resetUrl}" style="background:#2563EB; color:#fff; padding:12px 28px; border-radius:10px; text-decoration:none; font-weight:600; display:inline-block;">
          Reset Password
        </a>
      </div>
      <p style="font-size: 12px; color: #64748B;">If you didn't request this, you can safely ignore this email.</p>
      <p style="font-size: 12px; color: #334155; margin-top: 24px;">— KC International Producoes</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"KC International Producoes" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Reset your KC International password',
    html,
  });
}

const ANNOUNCE_COPY = {
  artist: {
    en: { emoji: '🎤', subject: name => `New artist alert: ${name} just joined KC International!`, intro: 'A new artist just joined our roster.' },
    pt: { emoji: '🎤', subject: name => `Novo artista: ${name} acabou de se juntar à KC International!`, intro: 'Um novo artista acabou de se juntar ao nosso elenco.' },
  },
  event: {
    en: { emoji: '🎉', subject: name => `Just announced: ${name}`, intro: "We've just announced a new event — don't miss out." },
    pt: { emoji: '🎉', subject: name => `Acabado de anunciar: ${name}`, intro: 'Acabámos de anunciar um novo evento — não perca.' },
  },
  product: {
    en: { emoji: '🛍️', subject: name => `New in the shop: ${name}`, intro: 'Fresh merch just landed in the KC International store.' },
    pt: { emoji: '🛍️', subject: name => `Novidade na loja: ${name}`, intro: 'Acabou de chegar nova mercadoria à loja KC International.' },
  },
  service: {
    en: { emoji: '✨', subject: name => `New service available: ${name}`, intro: "We've just added a new service to what we offer." },
    pt: { emoji: '✨', subject: name => `Novo serviço disponível: ${name}`, intro: 'Acabámos de adicionar um novo serviço.' },
  },
};

async function sendAnnouncementEmail({ to, name, country, type, itemName, itemDesc, unsubscribeUrl, siteUrl }) {
  const lang = country === 'ao' ? 'pt' : 'en';
  const copy = ANNOUNCE_COPY[type][lang];

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #050A14; color: #F8FAFC; border-radius: 16px;">
      <div style="font-size: 32px; margin-bottom: 8px;">${copy.emoji}</div>
      <h2 style="color: #3B82F6; margin-bottom: 4px;">KC International Producoes</h2>
      <p style="color: #94A3B8; font-size: 13px; margin-bottom: 24px;">${copy.intro}</p>
      <div style="background: rgba(37,99,235,0.08); border: 1px solid rgba(37,99,235,0.25); border-radius: 12px; padding: 18px 20px; margin-bottom: 24px;">
        <div style="font-size: 17px; font-weight: 700; color: #F8FAFC; margin-bottom: 6px;">${itemName}</div>
        ${itemDesc ? `<div style="font-size: 13px; color: #94A3B8; line-height: 1.6;">${itemDesc}</div>` : ''}
      </div>
      <div style="text-align:center; margin: 24px 0;">
        <a href="${siteUrl}" style="background:#2563EB; color:#fff; padding:12px 28px; border-radius:10px; text-decoration:none; font-weight:600; display:inline-block;">
          ${lang === 'pt' ? 'Ver agora' : 'Check it out'}
        </a>
      </div>
      <p style="font-size: 11px; color: #475569; margin-top: 28px; line-height: 1.6;">
        ${lang === 'pt' ? 'Recebeu este email porque está inscrito nas notificações da KC International.' : "You're receiving this because you're subscribed to KC International updates."}
        <br/>
        <a href="${unsubscribeUrl}" style="color: #64748B;">${lang === 'pt' ? 'Cancelar subscrição' : 'Unsubscribe'}</a>
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"KC International Producoes" <${process.env.GMAIL_USER}>`,
    to,
    subject: copy.subject(itemName),
    html,
  });
}

// Builds the shared HTML line-items table used in both payment and refund emails
function buildItemsTable(items, currency) {
  const rows = items.map(item => `
    <tr>
      <td style="padding: 8px 0; color: #E2E8F0; font-size: 13px;">${item.name} × ${item.qty}</td>
      <td style="padding: 8px 0; color: #94A3B8; font-size: 13px; text-align: right;">${currency}${(item.price * item.qty).toFixed(2)}</td>
    </tr>
  `).join('');
  return `<table style="width: 100%; border-collapse: collapse;">${rows}</table>`;
}

// Sent the moment a payment succeeds (triggered from the Stripe webhook)
async function sendPaymentConfirmationEmail({ to, name, country, items, total, currency, paymentIntentId, siteUrl }) {
  const isAo = country === 'ao';
  const itemsTable = buildItemsTable(items, currency);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #050A14; color: #F8FAFC; border-radius: 16px;">
      <div style="font-size: 32px; margin-bottom: 8px;">✅</div>
      <h2 style="color: #3B82F6; margin-bottom: 4px;">KC International Producoes</h2>
      <p style="color: #94A3B8; font-size: 13px; margin-bottom: 24px;">
        ${isAo ? 'Confirmação de pagamento' : 'Payment Confirmation'}
      </p>
      <p>${isAo ? `Olá ${name},` : `Hi ${name},`}</p>
      <p style="margin-bottom: 20px;">
        ${isAo ? 'O seu pagamento foi recebido com sucesso. Aqui está o resumo:' : "Your payment was received successfully. Here's a summary:"}
      </p>

      <div style="background: rgba(37,99,235,0.08); border: 1px solid rgba(37,99,235,0.25); border-radius: 12px; padding: 18px 20px; margin-bottom: 20px;">
        ${itemsTable}
        <div style="border-top: 1px solid rgba(148,163,184,0.2); margin-top: 10px; padding-top: 10px; display: flex; justify-content: space-between;">
          <span style="font-weight: 700; color: #F8FAFC; font-size: 14px;">${isAo ? 'Total' : 'Total'}</span>
          <span style="font-weight: 800; color: #3B82F6; font-size: 16px;">${currency}${total.toFixed(2)}</span>
        </div>
      </div>

      <p style="font-size: 12px; color: #64748B; margin-bottom: 4px;">
        ${isAo ? 'ID do pagamento' : 'Payment ID'}: <span style="color: #94A3B8; font-family: monospace;">${paymentIntentId}</span>
      </p>

      <div style="text-align:center; margin: 24px 0;">
        <a href="${siteUrl}" style="background:#2563EB; color:#fff; padding:12px 28px; border-radius:10px; text-decoration:none; font-weight:600; display:inline-block;">
          ${isAo ? 'Ver a minha conta' : 'View my account'}
        </a>
      </div>

      <p style="font-size: 12px; color: #334155; margin-top: 24px;">— KC International Producoes</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"KC International Producoes" <${process.env.GMAIL_USER}>`,
    to,
    subject: isAo ? `Pagamento confirmado — ${currency}${total.toFixed(2)}` : `Payment confirmed — ${currency}${total.toFixed(2)}`,
    html,
  });
}

// Sent the moment a refund is processed (triggered after admin approves a cancellation)
async function sendRefundConfirmationEmail({ to, name, country, items, total, currency, paymentIntentId, siteUrl }) {
  const isAo = country === 'ao';
  const itemsTable = buildItemsTable(items, currency);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #050A14; color: #F8FAFC; border-radius: 16px;">
      <div style="font-size: 32px; margin-bottom: 8px;">↩️</div>
      <h2 style="color: #3B82F6; margin-bottom: 4px;">KC International Producoes</h2>
      <p style="color: #94A3B8; font-size: 13px; margin-bottom: 24px;">
        ${isAo ? 'Confirmação de reembolso' : 'Refund Confirmation'}
      </p>
      <p>${isAo ? `Olá ${name},` : `Hi ${name},`}</p>
      <p style="margin-bottom: 20px;">
        ${isAo
          ? 'O seu pedido foi cancelado e o reembolso foi processado. O valor deve aparecer na sua conta dentro de 5 a 10 dias úteis.'
          : 'Your order has been cancelled and the refund has been processed. It should appear back in your account within 5–10 business days.'}
      </p>

      <div style="background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25); border-radius: 12px; padding: 18px 20px; margin-bottom: 20px;">
        ${itemsTable}
        <div style="border-top: 1px solid rgba(148,163,184,0.2); margin-top: 10px; padding-top: 10px; display: flex; justify-content: space-between;">
          <span style="font-weight: 700; color: #F8FAFC; font-size: 14px;">${isAo ? 'Valor reembolsado' : 'Refunded amount'}</span>
          <span style="font-weight: 800; color: #FCA5A5; font-size: 16px;">${currency}${total.toFixed(2)}</span>
        </div>
      </div>

      <p style="font-size: 12px; color: #64748B; margin-bottom: 4px;">
        ${isAo ? 'ID do pagamento' : 'Payment ID'}: <span style="color: #94A3B8; font-family: monospace;">${paymentIntentId}</span>
      </p>

      <div style="text-align:center; margin: 24px 0;">
        <a href="${siteUrl}" style="background:#2563EB; color:#fff; padding:12px 28px; border-radius:10px; text-decoration:none; font-weight:600; display:inline-block;">
          ${isAo ? 'Ver a minha conta' : 'View my account'}
        </a>
      </div>

      <p style="font-size: 12px; color: #334155; margin-top: 24px;">— KC International Producoes</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"KC International Producoes" <${process.env.GMAIL_USER}>`,
    to,
    subject: isAo ? `Reembolso processado — ${currency}${total.toFixed(2)}` : `Refund processed — ${currency}${total.toFixed(2)}`,
    html,
  });
}

module.exports = {
  sendPasswordResetEmail,
  sendAnnouncementEmail,
  sendPaymentConfirmationEmail,
  sendRefundConfirmationEmail,
};