import vine from "@vinejs/vine";

export const logInValidator = vine.compile(vine.object({
  username: vine.string().trim().minLength(3).maxLength(64),
  password: vine.string().minLength(3),
}));
export const registerValidator = vine.compile(vine.object({
  username: vine.string().trim().minLength(3).maxLength(64),
  password: vine.string().minLength(3),
}));
