import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, File, Folder } from "lucide-react";
import React, { useState } from "react";

interface FileStructure {
    name: string;
    type: "file" | "directory";
    children?: FileStructure[];
}

type FileExplorerProps = {
    header: string;
    files: FileStructure;
    activeFile: string;
    updateActiveFile: (file: { name: string; currentPath: string }) => void;
};

const FileExplorer: React.FC<Omit<FileExplorerProps, "header">> = ({ files, activeFile, updateActiveFile }) => {
    const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({
        "/root": true, // Open root by default
    });

    const toggleExpand = (name: string) => {
        setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));
    };

    const renderTree = (item: FileStructure, path: string = "", level: number = 0) => {
        const currentPath = `${path}/${item.name}`;

        if (item.type === "file") {
            return (
                <div
                    key={`${currentPath}-${item.name}-${activeFile}`}
                    className={`flex items-center py-1 cursor-pointer ${
                        item.name === activeFile ? "bg-accent" : "hover:bg-accent"
                    }`}
                    style={{ paddingLeft: `${level * 20}px` }}
                    onClick={() =>
                        updateActiveFile({
                            name: item.name,
                            currentPath,
                        })
                    }
                >
                    <File className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                </div>
            );
        }

        return (
            <div key={currentPath}>
                <Button
                    variant="ghost"
                    className="w-full justify-start px-2 hover:bg-accent"
                    onClick={() => toggleExpand(currentPath)}
                    style={{ paddingLeft: `${level * 20}px` }}
                >
                    {expanded[currentPath] ? (
                        <ChevronDown className="h-4 w-4 mr-2 flex-shrink-0" />
                    ) : (
                        <ChevronRight className="h-4 w-4 mr-2 flex-shrink-0" />
                    )}
                    <Folder className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                </Button>
                {expanded[currentPath] && item.children && (
                    <div>{item.children.map((child) => renderTree(child, currentPath, level + 1))}</div>
                )}
            </div>
        );
    };

    return <div className="p-4">{renderTree(files)}</div>;
};

export default function Component({ files, activeFile, updateActiveFile, header }: FileExplorerProps) {
    return (
        <div className="max-w-2xl mx-auto border rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold p-4 border-b">{header}</h2>
            <div className="max-h-[80vh] overflow-y-auto">
                <FileExplorer files={files} activeFile={activeFile} updateActiveFile={updateActiveFile} />
            </div>
        </div>
    );
}
