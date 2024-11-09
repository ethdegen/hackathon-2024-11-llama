"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2, Settings } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import FileExplorer from "@/components/app/FileExplorer";
import config from "@/config";
import { useQuery } from "@tanstack/react-query";
import { AppLoader } from "../AppLoader";
import ArticleContent from "./ArticleContent";

async function fetchArticle(url: string) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return response.json();
}

export default function Result() {
    const [loading, setLoading] = useState(false);
    const [showTranslated, setShowTranslated] = useState(true);
    const [selectedFile, setSelectedFile] = useState({
        name: "",
        currentPath: "",
    });

    const toggleTranslation = () => {
        setLoading(true);
        setShowTranslated(!showTranslated);
        setTimeout(() => setLoading(false), 2000); // Simulate loading
    };

    const searchParams = new URLSearchParams(window.location.search);
    const repoUrl = searchParams.get("repoUrl");
    const originalLang = searchParams.get("originalLang");
    const targetLang = searchParams.get("targetLang");
    const instructions = searchParams.get("instructions");

    const { data, error, isPending } = useQuery({
        queryKey: ["parse", repoUrl, originalLang, targetLang, instructions],
        queryFn: async () => {
            const result = await fetchArticle(
                `${config.apiURL}/parse?repoUrl=${decodeURIComponent(repoUrl as string)}&originalLang=${decodeURIComponent(originalLang as string)}&targetLang=${decodeURIComponent(targetLang as string)}&instructions=${decodeURIComponent(instructions as string)}`
            );
            if (!selectedFile.currentPath) {
                setSelectedFile({
                    name: result.content.title,
                    currentPath: "/",
                });
            }
            return result;
        },
    });

    if (isPending) {
        return <AppLoader />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/4 md:border-r md:pr-4">
                    <FileExplorer
                        header={data.details.repo}
                        activeFile={selectedFile.name}
                        files={data.files}
                        updateActiveFile={setSelectedFile}
                    />
                </div>
                <div className="w-full md:w-3/4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-4 md:space-y-0">
                        <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold mb-2">{selectedFile.name}</h3>
                        </div>
                        <div className="space-x-2">
                            <Button variant="outline" size="sm">
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </Button>
                            <Link href="/finetune">
                                <Button variant="outline" size="sm">
                                    <Settings className="mr-2 h-4 w-4" />
                                    Fine-tune
                                </Button>
                            </Link>
                        </div>
                    </div>
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <ArticleContent
                            articleName={selectedFile.name}
                            articlePath={
                                data.details.identifier_dir +
                                selectedFile.currentPath.replace("/root", "").replace(`/${selectedFile.name}`, "")
                            }
                            articleContentDefault={data.content.content}
                            languageFrom={originalLang || "English"}
                            languageTo={targetLang || "Hindi"}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
