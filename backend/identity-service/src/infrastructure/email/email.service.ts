import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendVerificationEmail(to: string, name: string, token: string): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: '"Meraki" <noreply@basilisk.dev.br>',
        to,
        subject: 'Verificação de Email — Meraki',
        html: `
          <div style="font-family: monospace; background: #0a0a0a; color: #d4d4d8; padding: 32px; max-width: 500px;">
            <h2 style="color: #55ca7c; margin-bottom: 24px;">MERAKI // VERIFY_EMAIL</h2>
            <p>Olá <strong style="color: #fff;">${name}</strong>,</p>
            <p>Clique no botão abaixo para verificar seu email e ativar sua conta.</p>
            <p style="margin: 24px 0;">
              <a href="${verifyUrl}"
                 style="background: #55ca7c; color: #0a0a0a; padding: 12px 24px; text-decoration: none; font-weight: bold; font-family: monospace; display: inline-block;">
                VERIFICAR_EMAIL()
              </a>
            </p>
            <p style="font-size: 11px; color: #71717a;">
              Se você não criou esta conta, ignore este email.
            </p>
            <hr style="border-color: #27272a; margin: 24px 0;" />
            <p style="font-size: 10px; color: #3f3f46;">Meraki Platform</p>
          </div>
        `,
      });
      this.logger.log(`Email de verificação enviado para ${to}`);
    } catch (err) {
      this.logger.error(`Falha ao enviar email de verificação para ${to}: ${err.message}`);
      throw err;
    }
  }

  async sendPasswordResetEmail(to: string, name: string, token: string): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: '"Meraki" <noreply@basilisk.dev.br>',
        to,
        subject: 'Redefinição de Senha — Meraki',
        html: `
          <div style="font-family: monospace; background: #0a0a0a; color: #d4d4d8; padding: 32px; max-width: 500px;">
            <h2 style="color: #55ca7c; margin-bottom: 24px;">MERAKI // RESET_PASSWORD</h2>
            <p>Olá <strong style="color: #fff;">${name}</strong>,</p>
            <p>Recebemos uma solicitação para redefinir sua senha.</p>
            <p style="margin: 24px 0;">
              <a href="${resetUrl}"
                 style="background: #55ca7c; color: #0a0a0a; padding: 12px 24px; text-decoration: none; font-weight: bold; font-family: monospace; display: inline-block;">
                REDEFINIR_SENHA()
              </a>
            </p>
            <p style="font-size: 11px; color: #71717a;">
              Este link expira em 1 hora. Se você não solicitou, ignore este email.
            </p>
            <hr style="border-color: #27272a; margin: 24px 0;" />
            <p style="font-size: 10px; color: #3f3f46;">Meraki Platform</p>
          </div>
        `,
      });
      this.logger.log(`Email de reset enviado para ${to}`);
    } catch (err) {
      this.logger.error(`Falha ao enviar email para ${to}: ${err.message}`);
      throw err;
    }
  }
}
