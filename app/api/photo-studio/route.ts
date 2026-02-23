import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

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

    // 将图片转换为base64
    const arrayBuffer = await image.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = image.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    // 根据性别选择提示词
    const malePrompt = `Convert the uploaded portrait into an American-style professional headshot in corporate photography style, while preserving the original person's facial features and identity. Requirements: half-body portrait, blue textured studio background, soft natural studio lighting, high-definition clarity, realistic skin tones, clean and elegant composition. The person should wear business casual shirt, minimalist and elegant design, modern and professional style, paired with simple tie. Expression should be relaxed, confident, and natural with bright, engaging eyes and a genuine smile. Keep sharp focus on the face, with a slightly blurred background for depth. overall polished and professional.`;

    const femalePrompt = `Convert the uploaded portrait into an American-style professional headshot in corporate photography style, while preserving the original person's facial features and identity. Requirements: half-body portrait, blue textured studio background, soft natural studio lighting, high-definition clarity, realistic skin tones, clean and elegant composition. The person should wear a sleeveless black dress, minimalist and elegant design, modern and professional style, paired with simple gold jewelry. Expression should be relaxed, confident, and natural with bright, engaging eyes and a genuine smile. Keep sharp focus on the face, with a slightly blurred background for depth, overall polished and professional.`;

    const prompt = gender === "male" ? malePrompt : femalePrompt;

    // 调用硅基流动图像编辑API
    const apiKey = process.env.AI_API_KEY;
    const apiBase = process.env.AI_API_BASE_URL || "https://api.siliconflow.cn/v1";

    if (!apiKey) {
      return NextResponse.json({ error: "API配置错误，请联系管理员" }, { status: 500 });
    }

    const response = await fetch(
      `${apiBase}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "Qwen/Qwen-Image-Edit-2509",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: dataUrl } },
              ],
            },
          ],
          stream: false,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Qwen API error:", errorText);
      return NextResponse.json({ error: "图像生成失败，请重试" }, { status: 500 });
    }

    const result = await response.json();

    // 解析返回的图像
    const content = result.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "未获取到生成的图像" }, { status: 500 });
    }

    // 提取图像URL（可能是base64或URL）
    let imageUrl = "";
    try {
      const parsedContent = typeof content === "string" ? JSON.parse(content) : content;
      imageUrl = parsedContent.image || parsedContent.url || parsedContent;
    } catch {
      imageUrl = content;
    }

    // 如果是相对URL，添加前缀
    if (imageUrl.startsWith("/") || imageUrl.startsWith("http")) {
      // 已经是完整URL
    } else {
      // 可能是base64数据
      if (!imageUrl.startsWith("data:") && !imageUrl.startsWith("http")) {
        imageUrl = `data:image/jpeg;base64,${imageUrl}`;
      }
    }

    return NextResponse.json({ image: imageUrl });
  } catch (error) {
    console.error("Photo studio error:", error);
    return NextResponse.json(
      { error: "生成失败，请重试" },
      { status: 500 }
    );
  }
}
