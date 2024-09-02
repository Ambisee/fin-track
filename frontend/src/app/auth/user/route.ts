import { sbServer } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";


export async function DELETE(request: NextRequest) {
    const cookieStore = cookies()
    const supabase = sbServer(cookieStore)

    const userReq = await supabase.auth.getUser()
    if (userReq.error !== null) {
        return NextResponse.json(userReq.error, {status: userReq.error.status})
    }

    const deleteReq = await supabase.auth.admin.deleteUser(userReq.data.user.id)
    if (deleteReq.error !== null) {
        return NextResponse.json(deleteReq.error, {status: deleteReq.error.status})
    }

    return NextResponse.json({message: "The account has been successfully deleted"}, {status: 200})
}