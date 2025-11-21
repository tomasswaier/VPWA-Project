import vine from "@vinejs/vine";

export const logInValidator = vine.compile(vine.object({
  name: vine.string().minLength(3).maxLength(64),
  password: vine.string().minLength(3).confirmed(),
}));
export const registerValidator = vine.compile(vine.object({
  name: vine.string().minLength(3).maxLength(64),
  email: vine.string().email().unique({ table: "users", column: "email" }),
  password: vine.string().minLength(3).confirmed(),
}));
