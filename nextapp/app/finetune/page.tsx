"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function FineTune() {
    const [fineTuneData, setFineTuneData] = useState([
        {
            id: 1,
            title: "fine",
            originalSnippet: "I am fine",
            translatedSnippet: "मैं ठीक हूँ।",
        },
        {
            id: 2,
            title: "lost",
            originalSnippet: "I am lost",
            translatedSnippet: "मैं रास्ता भूल गया ।",
        },
    ]);
    const [newData, setNewData] = useState({ title: "", originalSnippet: "", translatedSnippet: "" });
    const [isOpen, setIsOpen] = useState(false);

    const handleSave = () => {
        setFineTuneData([...fineTuneData, { id: Date.now(), ...newData }]);
        setNewData({ title: "", originalSnippet: "", translatedSnippet: "" });
        setIsOpen(false);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Fine-tune Translations</h1>
            <div className="mb-4">
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Fine-tune Data
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add Fine-tune Data</DialogTitle>
                            <DialogDescription>
                                Add original and translated snippets to improve translation quality.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="title" className="text-right">
                                    Title
                                </Label>
                                <Input
                                    id="title"
                                    value={newData.title}
                                    onChange={(e) => setNewData({ ...newData, title: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="original" className="text-right">
                                    Original
                                </Label>
                                <Textarea
                                    id="original"
                                    value={newData.originalSnippet}
                                    onChange={(e) => setNewData({ ...newData, originalSnippet: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="translated" className="text-right">
                                    Translated
                                </Label>
                                <Textarea
                                    id="translated"
                                    value={newData.translatedSnippet}
                                    onChange={(e) => setNewData({ ...newData, translatedSnippet: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" onClick={handleSave}>
                                Save
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="space-y-4">
                {fineTuneData.map((item) => (
                    <div key={item.id} className="border p-4 rounded-md">
                        <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-medium mb-1">Original:</h4>
                                <p className="text-sm">{item.originalSnippet}</p>
                            </div>
                            <div>
                                <h4 className="font-medium mb-1">Translated:</h4>
                                <p className="text-sm">{item.translatedSnippet}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
