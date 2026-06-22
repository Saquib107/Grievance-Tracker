export async function sendEmail({ to, subject, text }: { to: string; subject: string; text: string }) {
  // In a real application, you would use SendGrid, Resend, or AWS SES here
  console.log("====================================")
  console.log(`[MOCK EMAIL SENT TO ${to}]`)
  console.log(`Subject: ${subject}`)
  console.log(`Body: ${text}`)
  console.log("====================================")
  
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 500))
}
