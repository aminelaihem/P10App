import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { signup } from "@/features/auth/api/authApi";

interface ApiError {
  message: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, firstname, lastname, avatarId } = body;

    if (!email || !password || !firstname || !lastname || !avatarId) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    const { token, user } = await signup(email, password, firstname, lastname, avatarId);

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ user });
  } catch (error) {
    const apiError = error as ApiError;
    return NextResponse.json(
      { error: apiError.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}