export type RespondRequestBody = {
  message: string;
  chatId?: string;
  userId?: string;
  userMessageId: string;
  currentModel: string;
};

export type CancelRequestBody = {
  userMessageId: string;
};

export type TitleRequestBody = {
  message: string;
};

export type llmRequestBody = {
  message: string;
  chatId: string;
  userId: string;
  userMessageId: string;
  currentModel: string;
  file?: Express.Multer.File;
};
