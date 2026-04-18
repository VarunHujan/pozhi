import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { uploadImage } from "@/services/uploadService";

interface ImageUploadProps {
    label: string;
    onUploadComplete: (uploadId: string, url: string) => void;
    onClear?: () => void;
    externalPreview?: string | null;
}

export default function ImageUpload({ label, onUploadComplete, onClear, externalPreview }: ImageUploadProps) {
    const [upload, setUpload] = useState<{ preview: string; uploading: boolean; error: string | null }>({
        preview: "",
        uploading: false,
        error: null,
    });

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Create preview
        const preview = URL.createObjectURL(file);
        setUpload({ preview, uploading: true, error: null });

        try {
            const result = await uploadImage(file);
            setUpload({ preview, uploading: false, error: null });
            onUploadComplete(result.id, result.url);
        } catch (err: any) {
            setUpload({ preview, uploading: false, error: err.message });
        }
    };

    const clear = () => {
        if (upload.preview) URL.revokeObjectURL(upload.preview);
        setUpload({ preview: "", uploading: false, error: null });
        onClear?.();
    };

    // If we have a preview, show it
    const displayPreview = externalPreview || upload.preview;

    if (displayPreview) {
        return (
            <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">{label}</p>
                <div className="relative rounded-xl border overflow-hidden">
                    <img src={displayPreview} alt="Preview" className="w-full aspect-[4/3] object-cover" />
                    {upload.uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                            Uploading...
                        </div>
                    )}
                    {upload.error && (
                        <div className="absolute inset-0 bg-red-500/50 flex flex-col items-center justify-center gap-2 text-white p-4">
                            <p className="text-sm">{upload.error}</p>
                            <button onClick={clear} className="px-4 py-2 bg-white text-black rounded">
                                Try Again
                            </button>
                        </div>
                    )}
                    {!upload.uploading && !upload.error && (
                        <button
                            onClick={clear}
                            className="absolute top-2 right-2 w-8 h-8 bg-black/70 text-white rounded-full flex items-center justify-center hover:bg-black"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Otherwise show the upload button
    return (
        <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase">{label}</p>
            <label className="block w-full aspect-[4/3] border-2 border-dashed rounded-xl hover:border-primary/40 bg-muted/40 hover:bg-accent/30 cursor-pointer">
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold">Click to upload</p>
                        <p className="text-xs text-muted-foreground">or drag and drop</p>
                    </div>
                </div>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                />
            </label>
        </div>
    );
}
