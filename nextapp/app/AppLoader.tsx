import { Loader2 } from "lucide-react";

export function AppLoader() {
    return (
        <div className="flex justify-center items-center h-64">
            <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="text-center">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                    <p className="mt-4 text-lg font-semibold">Loading...</p>
                </div>
            </div>
        </div>
    );
}
