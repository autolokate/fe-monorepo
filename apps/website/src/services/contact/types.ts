export type ContactUsPayload = {
  name: string;
  number: string;
  email: string;
  message: string;
};

export type ContactUsResponse = {
  success?: boolean;
  message?: string;
};
