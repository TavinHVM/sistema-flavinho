import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Header from "../components/Header";
import RelatoriosDevolucao from "../components/RelatoriosDevolucao";
import PainelAdminButton from "@/components/PainelAdminButton";

export default function Devolucoes() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
            setIsLoggedIn(false);
            router.replace("/login");
            return;
        }
        setIsLoggedIn(true);
    }, [router]);

    if (isLoggedIn === null) {
        return null;
    }

    if (!isLoggedIn) {
        return (
            <main className="min-h-screen flex flex-col justify-center items-center bg-[rgb(26,34,49)] text-white px-2">
                <div className="mt-10 text-center text-lg text-yellow-400">
                    {"Você precisa estar logado para acessar esta página."}
                </div>
            </main>
        );
    }

    return (
        <>
            <Header />
            <main className="p-2 sm:p-4 max-w-full lg:max-w-7xl mx-auto bg-[rgb(26,34,49)] text-white rounded-lg shadow-lg mt-4 mb-4">
                <div className="mb-4">
                    <PainelAdminButton />
                </div>
                <RelatoriosDevolucao />
            </main>
        </>
    );
}
