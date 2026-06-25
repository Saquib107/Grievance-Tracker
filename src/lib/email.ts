import nodemailer from "nodemailer"

// Create a transporter using environment variables. 
// In production, configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({ to, subject, text, html }: { to: string; subject: string; text: string; html?: string }) {
  try {
    // If credentials aren't provided, fallback to the previous console mock
    if (!process.env.SMTP_USER) {
      console.log("====================================")
      console.log(`[MOCK EMAIL SENT TO ${to}] (No SMTP credentials found)`)
      console.log(`Subject: ${subject}`)
      console.log(`Body: ${text}`)
      console.log("====================================")
      return
    }

    const info = await transporter.sendMail({
      from: `"GrievanceHub Admin" <${process.env.SMTP_USER}>`, 
      to,
      subject,
      text,
      html: html || text.replace(/\n/g, '<br>'), // Basic HTML fallback
    })

    console.log("Message sent: %s", info.messageId)
  } catch (error) {
    console.error("Failed to send email:", error)
  }
}
