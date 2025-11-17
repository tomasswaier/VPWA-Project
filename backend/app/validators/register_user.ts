import vine from "@vinejs/vine";
const registerUserValidator = vine.compile(vine.object({
  email: vine.string().email().unique({ table: "users", column: "email" }),
  password: vine.string().minLength(8).confirmed(),
}));
