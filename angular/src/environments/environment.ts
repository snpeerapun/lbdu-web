export const environment = {
  production: true,
  baseUrl:location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : ''),
  recaptcha :{
    siteKey: '' // Development test key
  },
  otp: {
    maxAttempts: 1,
    lockoutMinutes: 2
  },
  facebookAppId: '1138552409819756', // Replace with your real Facebook App ID from developers.facebook.com
  googleClientId:"",
  openai: {
    apiKey: 's' // ใส่ OpenAI API Key ของคุณที่นี่ (ขึ้นต้นด้วย sk-)
  }
};
