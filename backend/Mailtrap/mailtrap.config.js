import { MailtrapClient } from "mailtrap";
const TOKEN = "83b274a55d69a4408c3beb7274813c45";
const ENDPOINT = "https://send.api.mailtrap.io/";

export const MailtrapClients = new MailtrapClient({ endpoint: ENDPOINT, token: TOKEN });

export const sender = {
  email: "mailtrap@demomailtrap.com",
  name: "Sujal",
};


