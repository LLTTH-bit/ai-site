import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(8, "密码至少需要 8 个字符"),
  name: z.string().min(1, "请输入姓名").optional(),
});

export const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(1, "请输入密码"),
});

export const chatSchema = z.object({
  conversationId: z.string().min(1, "会话 ID 不能为空"),
  message: z.string().min(1, "消息不能为空").max(10000, "消息过长"),
  model: z.string().optional(),
});

export const createConversationSchema = z.object({
  title: z.string().optional(),
  model: z.string().optional(),
});

export const updateConversationSchema = z.object({
  title: z.string().min(1, "标题不能为空").optional(),
});

export const whitelistSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  note: z.string().optional(),
});

export const updateUserSchema = z.object({
  role: z.enum(["USER", "ADMIN"]).optional(),
  status: z.enum(["ACTIVE", "DISABLED"]).optional(),
  name: z.string().optional(),
});
