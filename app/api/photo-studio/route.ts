import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    // 检查登录状态
    const session = await getSession();

    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const formData = await request.formData();
    const image = formData.get("image") as File;
    const gender = formData.get("gender") as "male" | "female";

    if (!image) {
      return NextResponse.json({ error: "请上传图片" }, { status: 400 });
    }

    if (!gender || !["male", "female"].includes(gender)) {
      return NextResponse.json({ error: "请选择性别" }, { status: 400 });
    }

    // 直接保存图片到服务器
    const ext = image.name.split(".").pop() || "jpg";
    const filename = `${randomUUID()}.${ext}`;
    const uploadDir = join(process.cwd(), "public", "uploads");

    await mkdir(uploadDir, { recursive: true });

    const buffer = await image.arrayBuffer();
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, Buffer.from(buffer));

    // 保存上传记录到数据库
    await prisma.uploadedFile.create({
      data: {
        userId: user.id,
        filename: filename,
        originalName: image.name,
        fileSize: image.size,
        mimeType: image.type || "image/jpeg",
      },
    });

    // 限制每个用户最多10张照片，删除最老的
    const userFiles = await prisma.uploadedFile.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    if (userFiles.length > 10) {
      const filesToDelete = userFiles.slice(0, userFiles.length - 10);
      for (const file of filesToDelete) {
        try {
          await unlink(join(uploadDir, file.filename));
          await prisma.uploadedFile.delete({ where: { id: file.id } });
        } catch (e) {
          console.error("Delete file error:", e);
        }
      }
    }

    // 获取服务器地址
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const fullImageUrl = `${protocol}://${host}/uploads/${filename}`;

    console.log("Uploaded image URL:", fullImageUrl);

    // 根据性别选择提示词
    const malePrompt = `Convert the uploaded portrait into an American-style professional headshot in corporate photography style, while preserving the original person's facial features and identity. Requirements: half-body portrait, blue textured studio background, soft natural studio lighting, high-definition clarity, realistic skin tones, clean and elegant composition. The person should wear business casual shirt, minimalist and elegant design, modern and professional style, paired with simple tie. Expression should be relaxed, confident, and natural with bright, engaging eyes and a genuine smile. Keep sharp focus on the face, with a slightly blurred background for depth. overall polished and professional.`;

    const femalePrompt = `Convert the uploaded portrait into an American-style professional headshot in corporate photography style, while preserving the original person's facial features and identity. Requirements: half-body portrait, blue textured studio background, soft natural studio lighting, high-definition clarity, realistic skin tones, clean and elegant composition. The person should wear a sleeveless black dress, minimalist and elegant design, modern and professional style, paired with simple gold jewelry. Expression should be relaxed, confident, and natural with bright, engaging eyes and a genuine smile. Keep sharp focus on the face, with a slightly blurred background for depth, overall polished and professional.`;

    const prompt = gender === "male" ? malePrompt : femalePrompt;

    // 调用豆包图像生成API
    const apiKey = process.env.DOUBAO_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API配置错误，请联系管理员" }, { status: 500 });
    }

    const response = await fetch(
      "https://ark.cn-beijing.volces.com/api/v3/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          "model": "doubao-seedream-4-5-251128",
          "prompt": prompt,
          "image_url": fullImageUrl,
          "size": "2048x2048"
        }),
      }
    );

    const responseText = await response.text();
    console.log("API response status:", response.status);
    console.log("API response text:", responseText.substring(0, 500));

    if (!response.ok) {
      console.error("API error:", responseText);
      return NextResponse.json({ error: `图像生成失败: ${responseText}` }, { status: 500 });
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      console.error("JSON parse error:", e);
      return NextResponse.json({ error: `响应解析失败: ${responseText.substring(0, 100)}` }, { status: 500 });
    }

    // 解析返回的图像
    const data = result.data;
    if (!data || !data[0] || !data[0].url) {
      console.error("API response:", result);
      return NextResponse.json({ error: "未获取到生成的图像" }, { status: 500 });
    }

    const generatedImageUrl = data[0].url;

    return NextResponse.json({ image: generatedImageUrl });
  } catch (error) {
    console.error("Photo studio error:", error);
    return NextResponse.json(
      { error: "生成失败，请重试" },
      { status: 500 }
    );
  }
}
