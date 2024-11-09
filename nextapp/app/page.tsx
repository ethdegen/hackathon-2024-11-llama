"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const languages = [
    "English",
    "Hindi",
    "Chinese",
    "Spanish",
    "French",
    "German",
    "Italian",
    "Portuguese",
    "Russian",
    "Japanese",
    "Korean",
    "Arabic",
    "Turkish",
    "Dutch",
    "Polish",
    "Swedish",
    "Norwegian",
    "Danish",
    "Finnish",
    "Greek",
    "Hebrew",
    "Hungarian",
    "Indonesian",
    "Malay",
    "Thai",
    "Vietnamese",
    "Czech",
    "Slovak",
    "Ukrainian",
    "Romanian",
    "Bulgarian",
    "Croatian",
    "Serbian",
    "Slovenian",
    "Lithuanian",
    "Latvian",
    "Estonian",
    "Filipino",
];

export default function Home() {
    const router = useRouter();
    const [repoUrl, setRepoUrl] = useState("");
    const [originalLang, setOriginalLang] = useState("");
    const [targetLang, setTargetLang] = useState("");
    const [instructions, setInstructions] = useState("");

    const handleTranslate = () => {
        const url = `/translator?repoUrl=${encodeURIComponent(repoUrl)}&originalLang=${encodeURIComponent(originalLang)}&targetLang=${encodeURIComponent(targetLang)}&instructions=${encodeURIComponent(instructions)}`;
        router.push(url);
    };

    return (
        <main className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">
                Developer Resource Translator AI with Meta Llama
            </h1>
            <p className="text-lg text-center mb-6">
                Accelerating Multilingual Developer Support with AI Translation. Translate your GitHub repository
                documentation to any language with Meta Llama, make your developer resources accessible to a global
                audience.
            </p>
            <form
                className="space-y-6"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleTranslate();
                }}
            >
                <div className="space-y-2">
                    <Label htmlFor="repo-url">GitHub Repository URL</Label>
                    <Input
                        required
                        id="repo-url"
                        placeholder="https://github.com/username/repo"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="original-lang">Original Language</Label>
                        <Select required value={originalLang} onValueChange={setOriginalLang}>
                            <SelectTrigger id="original-lang">
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                                {languages.map((lang) => (
                                    <SelectItem key={lang} value={lang.toLowerCase()}>
                                        {lang}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="target-lang">Target Language</Label>
                        <Select required value={targetLang} onValueChange={setTargetLang}>
                            <SelectTrigger id="target-lang">
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                                {languages.map((lang) => (
                                    <SelectItem key={lang} value={lang.toLowerCase()}>
                                        {lang}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="instructions">Additional Instructions</Label>
                    <Input
                        id="instructions"
                        placeholder="Any specific translation instructions..."
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                    />
                </div>
                <div>
                    <Button className="w-full" type="submit">
                        Translate
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </form>
        </main>
    );
}
