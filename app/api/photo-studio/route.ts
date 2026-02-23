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

    console.log("Image size:", image.size);
    console.log("Base64 length:", base64Image.length);

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
          "image": dataUrl,
          "size": "2048x2048"
        }),
      }
    );

    const responseText = await response.text();
    console.log("API response status:", response.status);
    console.log("API response text:", responseText.substring(0, 500));

    if (!response.ok) {
      console.error("Qwen API error:", responseText);
      console.error("API Key:", apiKey ? "present" : "missing");
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

    const imageUrl = data[0].url;

    return NextResponse.json({ image: imageUrl });
  } catch (error) {
    console.error("Photo studio error:", error);
    return NextResponse.json(
      { error: "生成失败，请重试" },
      { status: 500 }
    );
  }
}
