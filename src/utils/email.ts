
// export const sendVerifyEmail = async (toAddress: string, subject: string, body: string) => {
//   const sendEmailCommand = createSendEmailCommand({
//     fromAddress: 
//   })
// }

// export const sendVerifyRegisterEmail = async (
//   toAddress: string,
//   emailVerifyToken: string,
//   template: string = verifyEmailTemplate
// ) => {
//   return sendVerifyEmail(
//     toAddress,
//     'Verify your email',
//     template
//       .replace('{{title}}', 'Please verify your email')
//       .replace('{{content}}', 'Please click the button below to verify your email address.')
//       .replace('{{link}}', `${process.env.CLIENT_URL}/verify-email?token=${emailVerifyToken}`)
//       .replace('{{titleLink}}', 'Verify Email')
//   )
// }
