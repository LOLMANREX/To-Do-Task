const nodemailer = require('nodemailer');

function getTransporter() {
    const host = process.env.SMTP_HOST || 'mailpit';
    const port = parseInt(process.env.SMTP_PORT || '1025', 10);
    const secure = process.env.SMTP_SECURE !== undefined
        ? (process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === '1')
        : (port === 465);

    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : '';

    const config = {
        host,
        port,
        secure,
        tls: {
            rejectUnauthorized: false
        }
    };

    if (user && pass) {
        config.auth = {
            user,
            pass
        };
    }

    return nodemailer.createTransport(config);
}

async function sendPasswordResetEmail({ to, code, resetUrl }) {
    const transporter = getTransporter();
    const fromAddress = process.env.SMTP_FROM || `"To-Do Task" <${process.env.SMTP_USER || 'noreply@to-do-task.local'}>`;

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Réinitialisation de mot de passe</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background-color: #09090b;
                color: #f4f4f5;
                margin: 0;
                padding: 40px 16px;
            }
            .container {
                max-width: 520px;
                margin: 0 auto;
                background-color: #18181b;
                border: 1px solid #27272a;
                border-radius: 12px;
                padding: 32px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.5);
            }
            .brand {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 24px;
            }
            .logo-icon {
                width: 32px;
                height: 32px;
                background-color: #f4f4f5;
                color: #09090b;
                border-radius: 8px;
                display: inline-block;
                text-align: center;
                line-height: 32px;
                font-weight: 800;
                font-size: 16px;
            }
            .brand-name {
                font-size: 18px;
                font-weight: 700;
                color: #f4f4f5;
                letter-spacing: -0.5px;
            }
            h1 {
                font-size: 20px;
                font-weight: 700;
                color: #ffffff;
                margin: 0 0 14px 0;
            }
            p {
                font-size: 14px;
                line-height: 1.6;
                color: #a1a1aa;
                margin: 0 0 18px 0;
            }
            .code-box {
                background: #09090b;
                border: 1px solid #3f3f46;
                border-radius: 8px;
                padding: 16px;
                text-align: center;
                font-size: 32px;
                font-weight: 700;
                letter-spacing: 8px;
                color: #38bdf8;
                font-family: 'Courier New', Courier, monospace;
                margin: 22px 0;
            }
            .btn {
                display: inline-block;
                background-color: #f4f4f5;
                color: #09090b !important;
                padding: 12px 28px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                font-size: 14px;
                margin-top: 10px;
                margin-bottom: 20px;
            }
            .divider {
                height: 1px;
                background-color: #27272a;
                margin: 24px 0;
            }
            .footer {
                font-size: 12px;
                color: #71717a;
                line-height: 1.5;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="brand">
                <span class="logo-icon">T</span>
                <span class="brand-name">To-Do Task</span>
            </div>
            <h1>Réinitialisation de votre mot de passe</h1>
            <p>Bonjour,</p>
            <p>Une demande de réinitialisation de mot de passe a été initiée pour votre compte <strong>To-Do Task</strong>. Vous pouvez utiliser le code de sécurité à 6 chiffres ci-dessous ou cliquer directement sur le bouton :</p>
            
            <div class="code-box">${code}</div>

            <div style="text-align: center;">
                <a href="${resetUrl}" class="btn" target="_blank">Réinitialiser mon mot de passe</a>
            </div>

            <p style="font-size: 12px; color: #71717a; text-align: center; margin-top: 5px;">
                Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br/>
                <a href="${resetUrl}" style="color: #38bdf8; word-break: break-all;">${resetUrl}</a>
            </p>

            <div class="divider"></div>
            <div class="footer">
                Ce code et ce lien sont valables pendant <strong>15 minutes</strong>.<br/>
                Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité. Votre mot de passe actuel restera inchangé.
            </div>
        </div>
    </body>
    </html>
    `;

    const textContent = `Bonjour,\n\nUne demande de réinitialisation de mot de passe a été initiée pour votre compte To-Do Task.\n\nVotre code de vérification : ${code}\n\nOu cliquez sur ce lien pour réinitialiser directement votre mot de passe :\n${resetUrl}\n\nCe lien et ce code expirent dans 15 minutes.\nSi vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.`;

    try {
        const info = await transporter.sendMail({
            from: fromAddress,
            to,
            subject: `[To-Do Task] Code de réinitialisation : ${code}`,
            text: textContent,
            html: htmlContent
        });
        console.log(`[SMTP] E-mail envoyé avec succès à ${to} (ID: ${info.messageId})`);
        return info;
    } catch (err) {
        console.error(`[SMTP Erreur] Échec de l'envoi pour ${to}:`, err.message);
        throw new Error(`Erreur du serveur SMTP : ${err.message}`);
    }
}

module.exports = {
    getTransporter,
    sendPasswordResetEmail
};
