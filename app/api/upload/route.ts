import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json({ error: "请上传图片" }, { status: 400 });
    }

    // 生成唯一文件名
    const ext = image.name.split(".").pop() || "jpg";
    const filename = `${randomUUID()}.${ext}`;
    const uploadDir = join(process.cwd(), "public", "uploads");

    // 确保上传目录存在
    await mkdir(uploadDir, { recursive: true });

    // 保存文件
    const buffer = await image.arrayBuffer();
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, Buffer.from(buffer));

    // 返回可访问的URL
    const url = `/uploads/${filename}`;
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}
