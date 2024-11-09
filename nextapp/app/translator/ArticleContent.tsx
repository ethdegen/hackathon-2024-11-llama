import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import config from "@/config";
import { useQuery } from "@tanstack/react-query";
import { useContext, useState } from "react";
import ReactMarkdown from "react-markdown";
import Split from "react-split";
import { AppLoader } from "../AppLoader";
import { Username } from "../ClientProvider";
import "./article_content.css";

type ArticleContentProps = {
    articleName: string;
    articlePath: string;
    articleContentDefault: string;
    languageFrom: string;
    languageTo: string;
};

export default function ArticleContent({
    articleName,
    articlePath,
    articleContentDefault,
    languageFrom,
    languageTo,
}: ArticleContentProps) {
    const [isPreview, setIsPreview] = useState(true);
    const [editedTranslation, setEditedTranslation] = useState("");
    const username = useContext(Username);

    const { data: articleData, isPending } = useQuery({
        queryKey: ["article", articlePath, articleName],
        initialData: "",
        queryFn: async () => {
            // Fetch article content
            const url = `${config.apiURL}/article?identifier_dir=${articlePath}&filename=${articleName}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const content = await response.json();
            return content.content;
        },
    });

    const { data: translatedData } = useQuery({
        enabled: !isPending && !!articleData,
        queryKey: [articleData, languageFrom, languageTo, username],
        initialData: "",
        queryFn: async () => {
            const url = `${config.apiURL}/translate?language_from=${languageFrom}&language_to=${languageTo}`;
            let params: any = {
                method: "POST",
                body: articleData,
            };
            if (username) {
                params.headers = {
                    Authorization: `Bearer ${username}`,
                };
            }

            const response = await fetch(url, params);
            if (!response.ok) {
                return "Sorry, translation failed";
            }
            const content = await response.json();
            const result = content.result;

            setEditedTranslation(result);
            return result;
        },
    });

    if (isPending || !translatedData) {
        return <AppLoader />;
    }

    return (
        <div className="border rounded-md min-h-[300px] justify-between">
            <div className="flex flex-col">
                <div className="flex justify-end items-center p-4 border-b">
                    <div className="flex items-center space-x-2">
                        <Switch id="preview-mode" checked={isPreview} onCheckedChange={setIsPreview} />
                        <Label htmlFor="preview-mode">Preview</Label>
                    </div>
                </div>
                <Split
                    className="flex-1 flex max-h-[80vh] overflow-y-auto pb-2"
                    sizes={[50, 50]}
                    minSize={100}
                    expandToMin={false}
                    gutterSize={10}
                    gutterAlign="center"
                    snapOffset={30}
                    dragInterval={1}
                    direction="horizontal"
                    cursor="col-resize"
                >
                    <div className="overflow-auto p-4">
                        <ReactMarkdown className="markdown">{articleData}</ReactMarkdown>
                    </div>
                    <div className="overflow-auto p-4">
                        {isPreview ? (
                            <ReactMarkdown className="markdown">{translatedData}</ReactMarkdown>
                        ) : (
                            <Textarea
                                value={editedTranslation}
                                onChange={(e) => setEditedTranslation(e.target.value)}
                                className="w-full h-full min-h-[300px] font-mono"
                            />
                        )}
                    </div>
                </Split>
            </div>
        </div>
    );
}
