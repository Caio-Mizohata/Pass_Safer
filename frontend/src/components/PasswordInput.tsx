import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PasswordInputProps {
    id: string;
    label?: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    autoComplete?: string;
    required?: boolean;
}

export function PasswordInput({
    id,
    label = "Senha",
    placeholder = "••••••••",
    value,
    onChange,
    autoComplete = "current-password",
    required = true,
}: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="space-y-2">
            {label && <Label htmlFor={id}>{label}</Label>}
            <div className="relative">
                <Input
                    id={id}
                    type={showPassword ? "text" : "password"}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required={required}
                    autoComplete={autoComplete}
                    className="pr-10 [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>
        </div>
    );
}
