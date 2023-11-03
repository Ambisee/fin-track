"use client"

import { Metadata } from "next"
import { useRouter } from "next/navigation"

import { sbClient } from "@/supabase/supabase_client"

// export const metadata: Metadata = {
//     title: "FinTrack | Dashboard"
// }

export default function Dashboard() {
    const router = useRouter()

    return (
        <>
            This is the dashboard
            <button 
                style={{color: "white"}}
                onClick={() => {
                    sbClient.auth.signOut().then((value) => router.push("/") )
                }}
            >
                Sign out
            </button>
            <div>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Consectetur impedit, sapiente eos beatae tempora nobis veniam asperiores cumque alias neque? Cupiditate obcaecati laborum fugit, iusto unde placeat sunt, corrupti, est enim ea accusamus. Hic inventore ad quidem officia vero omnis quae. Nisi ut ex corporis earum ipsa odit eligendi magnam eos cum. Ipsa voluptas nihil tempore sequi sed a, eum sint numquam, quod nemo sapiente dicta reiciendis eius. Doloremque quasi nemo magni ullam beatae! Quo possimus, reiciendis atque cum beatae labore, voluptatem voluptate, rem accusamus neque ipsa laudantium nostrum quas eum quisquam delectus laborum. Dignissimos eveniet laborum at, et adipisci, incidunt, temporibus deleniti beatae tempora asperiores aperiam ducimus illo vitae qui voluptates porro architecto quibusdam vel eaque cumque officiis magnam. Nemo aperiam voluptates ex vero natus iure, mollitia ut error. Officiis error dignissimos, necessitatibus animi aliquid suscipit consequatur magnam accusantium, quas asperiores temporibus vero illo aperiam atque in sint ad porro eveniet! Error vel sequi aperiam optio aut perspiciatis, ipsa dolores autem reprehenderit velit, temporibus ut, alias laboriosam deleniti quos ipsam a incidunt! Obcaecati quis harum hic voluptates, explicabo sequi veniam non rerum unde est, aperiam sunt quisquam incidunt assumenda? Eius odio veniam aliquam voluptatem! Delectus illum repudiandae sit corporis mollitia cumque suscipit officiis natus architecto eius libero aut perspiciatis, nihil sunt, sapiente reprehenderit dignissimos impedit sed tempora repellat fugit quaerat! Explicabo, labore recusandae. Tenetur, doloribus ipsa. Ab exercitationem, neque consequatur dolorum natus dolor laboriosam dolore quidem eos nostrum, quo aliquam fugit dicta quaerat tempore libero fuga incidunt asperiores labore aperiam animi, sapiente vitae ratione numquam. Alias velit at quam? Distinctio repellat quibusdam dignissimos facere corporis ab eligendi, molestias sapiente repudiandae nemo nulla placeat voluptas. Debitis magni porro, ab officiis hic laboriosam ratione vitae aut saepe id nostrum doloribus, a quasi eum eligendi exercitationem earum ipsam cumque esse nesciunt ducimus autem incidunt. Aliquid magni voluptatibus dolor, suscipit repellat quidem, molestias laboriosam ratione velit nemo dolores, impedit quos in fugit. Dolor alias excepturi optio sed nihil sint eum eos eaque, aspernatur laudantium! Hic nihil ad totam debitis doloribus, explicabo iure! Adipisci libero nisi commodi, cum cupiditate mollitia corrupti magnam nemo a laboriosam dicta ea est culpa, repellendus ipsam sit voluptate velit! Soluta, dignissimos voluptates nesciunt nisi in perspiciatis eligendi facilis repudiandae iure expedita fuga laudantium qui unde iste ab similique impedit. Quisquam, eos? Iusto, at rerum quis laborum perferendis modi temporibus consequuntur eaque laudantium praesentium facere soluta. Architecto voluptas sunt ut, dicta aliquid atque non excepturi placeat recusandae sed doloremque laborum corporis voluptatem ipsam beatae aspernatur consequuntur facilis! Excepturi reiciendis ad commodi iste natus fugiat? Tempore id libero iusto. Esse officia eum vitae laboriosam neque explicabo omnis quidem autem, tenetur placeat quia corporis suscipit debitis dolor expedita quisquam eaque velit repudiandae exercitationem animi fuga aliquam! Ad officia iusto optio perferendis et obcaecati architecto eveniet, sequi, pariatur culpa quod praesentium consequuntur deserunt facilis quasi nobis expedita voluptatibus. Voluptate, omnis cumque soluta ullam deserunt excepturi. Aliquam magni consectetur rerum? Atque, odio minima, modi odit, autem eum repellat dolor asperiores distinctio quia quas cupiditate.
            </div>
        </>
    )
}