"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function InputField({
  id,
  label,
  value,
  onChange,
  placeholder,
}: InputFieldProps) {
  return (
    <div className="flex flex-col space-y-1">
      <Label htmlFor={id} className="text-gray-700 font-medium">
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 border-gray-300 focus:border-teal-500 focus:ring-teal-500 rounded-lg"
      />
    </div>
  );
}
